import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Request, Response } from "express";
import express from "express";
import multer from "multer";
import { z } from "zod";

import { processGlb } from "../services/gltfService.js";
import { getAccessLevel, getStorageUsage } from "../services/entitlementService.js";
import { saveOptimization, getOptimizations, deleteOptimization, decrementStorageUsage } from "../services/dbService.js";
import { uploadToR2, getDownloadUrl, deleteFromR2, getUploadUrl, getFromR2, isR2Configured } from "../services/r2Service.js";
import { ingestOptimization } from "../services/polarService.js";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/authMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_ROOT = path.resolve(__dirname, "..", "..", "..");
const TMP_DIR = process.env.VERCEL ? "/tmp" : path.join(API_ROOT, "tmp");
const UPLOAD_DIR = path.join(TMP_DIR, "uploads");
const OPTIMIZED_DIR = path.join(TMP_DIR, "optimized");
const METADATA_PREFIX = "optimized";

const getMetadataKey = (id: string) => `${METADATA_PREFIX}/${id}.json`;
const getMetadataPath = (id: string) => path.join(OPTIMIZED_DIR, `${id}.json`);

async function readMetadata(id: string): Promise<Record<string, any> | null> {
  if (isR2Configured()) {
    try {
      const buffer = await getFromR2(getMetadataKey(id));
      return JSON.parse(buffer.toString("utf-8"));
    } catch {
      return null;
    }
  }

  try {
    const metaContent = await fs.readFile(getMetadataPath(id), "utf-8");
    return JSON.parse(metaContent);
  } catch {
    return null;
  }
}

async function writeMetadata(id: string, metadata: Record<string, any>) {
  if (isR2Configured()) {
    await uploadToR2(getMetadataKey(id), Buffer.from(JSON.stringify(metadata)), "application/json");
    return;
  }

  await fs.writeFile(getMetadataPath(id), JSON.stringify(metadata));
}

async function deleteMetadata(id: string) {
  if (isR2Configured()) {
    await deleteFromR2(getMetadataKey(id)).catch(() => undefined);
    return;
  }

  await fs.unlink(getMetadataPath(id)).catch(() => undefined);
}


const SettingsSchema = z.object({
  decimateRatio: z.number().min(0).max(1),
  dracoLevel: z.number().int().min(0).max(10),
  textureQuality: z.number().int().positive().optional(),
  weld: z.boolean().optional(),
  quantize: z.boolean().optional(),
  draco: z.boolean().optional(),
});

type OptimizeSettings = z.infer<typeof SettingsSchema>;

function getStatusCode(err: unknown): number {
  if (typeof err !== "object" || err === null || !("statusCode" in err)) return 500;
  const statusCode = (err as Record<string, unknown>).statusCode;
  return typeof statusCode === "number" && Number.isFinite(statusCode) ? statusCode : 500;
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || ".glb";
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".glb" && ext !== ".gltf") {
      return cb(new Error("Only .glb and .gltf files are supported."));
    }
    return cb(null, true);
  },
  limits: {
    fileSize: Infinity,
  },
});

export const optimizeRouter = express.Router();

optimizeRouter.get("/get-upload-url", async (req: Request, res: Response) => {
  try {
    const filename = req.query.filename as string || "model.glb";
    let ext = path.extname(filename).toLowerCase();
    
    // Strict whitelist for extensions to prevent XSS/other attacks
    if (ext !== ".glb" && ext !== ".gltf") {
        ext = ".glb";
    }
    
    const jobId = randomUUID();
    const key = `uploads/${jobId}${ext}`;
    const uploadUrl = await getUploadUrl(key);
    
    return res.json({ uploadUrl, key });
  } catch (error) {
    return res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

optimizeRouter.get("/history", authMiddleware, async (req: Request, res: Response) => {
  const memberId = (req as any).memberId;

  try {
    const history = await getOptimizations(memberId);
    return res.json(history);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch history" });
  }
});

optimizeRouter.get("/usage", authMiddleware, async (req: Request, res: Response) => {
  const memberId = (req as any).memberId;

  try {
    const usage = await getStorageUsage(memberId);
    return res.json({ used: usage, total: 1024 * 1024 * 1024 });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch usage" });
  }
});

optimizeRouter.delete("/history/:id", authMiddleware, async (req: Request, res: Response) => {
  const memberId = (req as any).memberId;
  const id = req.params.id;

  try {
    const record = await deleteOptimization(id, memberId);
    
    const downloadUrl = record.download_url;
    const jobId = downloadUrl.split('/').pop();

    if (jobId) {
       const metaPath = path.join(OPTIMIZED_DIR, `${jobId}.json`);
       try {
         const metaContent = await fs.readFile(metaPath, 'utf-8');
         const metadata = JSON.parse(metaContent);
         if (metadata.storageKey) {
            await deleteFromR2(metadata.storageKey).catch(() => undefined);
         }
         await fs.unlink(metaPath).catch(() => undefined);
       } catch {
         // Metadata might be gone already, ignore
       }
    }

    await decrementStorageUsage(memberId, record.optimized_size);
    
    return res.json({ status: "success" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete optimization" });
  }
});

setInterval(async () => {
  try {
    const files = await fs.readdir(OPTIMIZED_DIR);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const metaPath = path.join(OPTIMIZED_DIR, file);
      
      try {
        const metaContent = await fs.readFile(metaPath, 'utf-8');
        const metadata = JSON.parse(metaContent);
        
        const now = new Date();
        const expiresAt = metadata.expiresAt ? new Date(metadata.expiresAt) : null;
        const createdAt = metadata.createdAt ? new Date(metadata.createdAt) : null;
        
        const isExpired = expiresAt && expiresAt < now;
        const isSafetyPurge = createdAt && (now.getTime() - createdAt.getTime()) > 2 * 24 * 60 * 60 * 1000;

        if (isExpired || isSafetyPurge) {
          if (metadata.storageKey) {
            await deleteFromR2(metadata.storageKey).catch(() => undefined);
          }
          await fs.unlink(metaPath).catch(() => undefined);
        }
      } catch {
      }
    }
  } catch {
  }
}, 60 * 60 * 1000); 

optimizeRouter.post("/optimize", optionalAuthMiddleware, upload.single("file"), async (req: Request, res: Response) => {
  const storageKey = req.body.storageKey as string;
  
  if (!req.file && !storageKey) {
    return res.status(400).json({ status: "error", message: "Missing file or storage key" });
  }

  // Validate storageKey to prevent path traversal
  if (storageKey) {
    if (storageKey.includes("..") || path.isAbsolute(storageKey) || !/^[a-zA-Z0-9_\-\.\/]+$/.test(storageKey)) {
        return res.status(400).json({ status: "error", message: "Invalid storage key" });
    }
  }

  const memberId = (req as any).memberId;
  const access = await getAccessLevel(memberId);
  
  const fileSize = req.file ? req.file.size : 0;

  if (req.file && access.hasAccess && memberId) {
    const currentUsage = await getStorageUsage(memberId);
    const estimatedNewTotal = currentUsage + req.file.size;
    const STORAGE_QUOTA = 1024 * 1024 * 1024;

    if (estimatedNewTotal > STORAGE_QUOTA) {
      await fs.unlink(req.file.path).catch(() => undefined);
      return res.status(413).json({
        status: "error",
        message: "Storage quota exceeded (1GB). Delete old files to free up space."
      });
    }
  }

  const expirationMs = access.hasAccess ? 2 * 24 * 60 * 60 * 1000 : 10 * 60 * 1000;

  const originalSize = req.file ? req.file.size : 0;
  const sizeLimit = access.hasAccess ? 500 * 1024 * 1024 : 300 * 1024 * 1024;

  if (req.file && originalSize > sizeLimit) {
    await fs.unlink(req.file.path).catch(() => undefined);
    return res.status(413).json({ 
      status: "error", 
      message: `File too large for your current plan (${access.hasAccess ? '500MB' : '50MB'} limit)` 
    });
  }

  let settings: OptimizeSettings;
  try {
    const settingsString = req.body.settings;
    if (!settingsString || typeof settingsString !== 'string') {
      settings = { decimateRatio: 0.8, dracoLevel: 5 };
    } else {
      settings = SettingsSchema.parse(JSON.parse(settingsString));
    }
  } catch (err) {
    return res.status(400).json({ status: "error", message: "Invalid settings JSON" });
  }

  const inputPath = req.file?.path;
  let streamStarted = false;

  const startStream = () => {
    if (streamStarted) return;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Transfer-Encoding", "chunked");
    if (typeof res.flushHeaders === "function") {
      res.flushHeaders();
    }
    streamStarted = true;
  };

  const sendProgress = (progress: number, message?: string) => {
    startStream();
    res.write(JSON.stringify({ type: "progress", progress, message }) + "\n");
  };

  const sendResult = (payload: Record<string, unknown>) => {
    startStream();
    res.write(JSON.stringify({ type: "result", ...payload }) + "\n");
    res.end();
  };
 
  try {
    const buffer = storageKey 
      ? await getFromR2(storageKey)
      : await fs.readFile(inputPath!);

    const actualOriginalSize = buffer.byteLength;
    sendProgress(5, "reading file");

    const { optimizedBuffer, stats } = await processGlb(buffer, settings, (progress, message) => {
      sendProgress(progress, message);
    });

    const jobId = randomUUID();
    const resultKey = `optimized/${jobId}.glb`;

    await uploadToR2(resultKey, optimizedBuffer);
    sendProgress(95, "uploading result");
    
    const metadata = {
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + expirationMs).toISOString(), 
      originalSize: actualOriginalSize,
      optimizedSize: optimizedBuffer.byteLength,
      stats,
      storageKey: resultKey
    };
    await writeMetadata(jobId, metadata);
    sendProgress(98, "writing metadata");

    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const downloadUrl = `${protocol}://${req.get("host")}/api/download/${jobId}`;

    if (memberId && access.hasAccess) {
      await saveOptimization({
        userId: memberId,
        originalName: req.body.originalName || req.file?.originalname || "model.glb",
        originalSize: actualOriginalSize,
        optimizedSize: optimizedBuffer.byteLength,
        stats,
        downloadUrl
      });
    }

    if (memberId) {
      await ingestOptimization(memberId).catch(() => undefined);
    }

    if (storageKey) {
      await deleteFromR2(storageKey).catch(() => undefined);
    }

    sendProgress(100, "complete");
    return sendResult({
      status: "success",
      originalSize: actualOriginalSize,
      optimizedSize: optimizedBuffer.byteLength,
      downloadUrl,
      stats,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Optimization failed";
    const statusCode = getStatusCode(err);
    if (streamStarted) {
      return sendResult({ status: "error", message, statusCode });
    }
    return res.status(statusCode).json({ status: "error", message });
  } finally {
    if (inputPath) {
      await fs.unlink(inputPath).catch(() => undefined);
    }
  }
});

optimizeRouter.get("/download/:id", async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return res.status(400).json({ status: "error", message: "Invalid download id" });
  }

  const metadata = await readMetadata(id);

  if (!metadata) {
    if (isR2Configured()) {
      const fallbackKey = `${METADATA_PREFIX}/${id}.glb`;
      try {
        const fileBuffer = await getFromR2(fallbackKey);
        res.setHeader("Content-Type", "model/gltf-binary");
        res.setHeader("Content-Disposition", `attachment; filename="${id}.glb"`);
        return res.send(fileBuffer);
      } catch {
        return res.status(404).json({ status: "error", message: "File not found" });
      }
    }
    return res.status(404).json({ status: "error", message: "File not found" });
  }

  if (metadata.expiresAt && new Date(metadata.expiresAt) < new Date()) {
    if (metadata.storageKey) {
      await deleteFromR2(metadata.storageKey).catch(() => undefined);
    }
    await deleteMetadata(id);
    return res.status(410).json({ status: "error", message: "File expired" });
  }

  if (isR2Configured()) {
    try {
      const fileBuffer = await getFromR2(metadata.storageKey);
      res.setHeader("Content-Type", "model/gltf-binary");
      res.setHeader("Content-Disposition", `attachment; filename="${metadata.storageKey}"`);
      return res.send(fileBuffer);
    } catch {
      return res.status(404).json({ status: "error", message: "File not found" });
    }
  }

  const downloadUrl = await getDownloadUrl(metadata.storageKey);

  if (downloadUrl.startsWith("/api/local-download/")) {
    const localPath = path.join(OPTIMIZED_DIR, metadata.storageKey);
    res.setHeader("Content-Type", "model/gltf-binary");
    res.setHeader("Content-Disposition", `attachment; filename="${metadata.storageKey}"`);
    const fileBuffer = await fs.readFile(localPath);
    return res.send(fileBuffer);
  }

  return res.redirect(downloadUrl);
});

optimizeRouter.get("/local-download/:key", async (req: Request, res: Response) => {
  const key = req.params.key;
  
  // Validate key to prevent path traversal
  if (key.includes("..") || path.isAbsolute(key) || !/^[a-zA-Z0-9_\-\.]+$/.test(key)) {
     return res.status(400).json({ status: "error", message: "Invalid file key" });
  }

  const filePath = path.join(OPTIMIZED_DIR, key);

  try {
    await fs.access(filePath);
    res.setHeader("Content-Type", "model/gltf-binary");
    res.setHeader("Content-Disposition", `attachment; filename="${key}"`);
    const fileBuffer = await fs.readFile(filePath);
    return res.send(fileBuffer);
  } catch {
    return res.status(404).json({ status: "error", message: "File not found" });
  }
});

optimizeRouter.post("/activate-share/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
      return res.status(400).json({ status: "error", message: "Invalid id" });
  }

  const metadata = await readMetadata(id);

  if (!metadata) {
    return res.status(404).json({ status: "error", message: "Asset not found" });
  }

  const newExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  metadata.expiresAt = newExpiresAt;

  await writeMetadata(id, metadata);
  return res.json({ status: "success", expiresAt: newExpiresAt });
});

optimizeRouter.use((err: unknown, _req: Request, res: Response, _next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ status: "error", message: "File too large." });
    }
    return res.status(400).json({ status: "error", message: err.message });
  }

  if (err instanceof Error) {
    return res.status(400).json({ status: "error", message: err.message });
  }

  return res.status(500).json({ status: "error", message: "Unexpected error" });
});
