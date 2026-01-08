import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Request, Response } from "express";
import express from "express";
import multer from "multer";
import { z } from "zod";

import { processGlb } from "../services/gltfService.js";
import { getAccessLevel } from "../services/entitlementService.js";
import { saveOptimization, getOptimizations } from "../services/dbService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_ROOT = path.resolve(__dirname, "..", "..", "..");
const TMP_DIR = path.join(API_ROOT, "tmp");

const UPLOAD_DIR = path.join(TMP_DIR, "uploads");
const OPTIMIZED_DIR = path.join(TMP_DIR, "optimized");

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

optimizeRouter.get("/history", async (req: Request, res: Response) => {
  const memberId = req.headers["x-member-id"] as string;
  if (!memberId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const history = await getOptimizations(memberId);
    return res.json(history);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch history" });
  }
});

setInterval(async () => {
  try {
    const files = await fs.readdir(OPTIMIZED_DIR);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const metaPath = path.join(OPTIMIZED_DIR, file);
      const glbPath = path.join(OPTIMIZED_DIR, file.replace('.json', '.glb'));
      
      try {
        const metaContent = await fs.readFile(metaPath, 'utf-8');
        const metadata = JSON.parse(metaContent);
        if (metadata.expiresAt && new Date(metadata.expiresAt) < new Date()) {
          await fs.unlink(metaPath).catch(() => undefined);
          await fs.unlink(glbPath).catch(() => undefined);
        }
      } catch {
      }
    }
  } catch {
  }
}, 60 * 60 * 1000); 

optimizeRouter.post("/optimize", upload.single("file"), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ status: "error", message: "Missing file" });
  }

  const memberId = req.headers["x-member-id"] as string;
  const access = await getAccessLevel(memberId);
  const expirationMs = access.hasAccess ? 48 * 60 * 60 * 1000 : 60 * 60 * 1000;

  const originalSize = req.file.size;
  const sizeLimit = access.hasAccess ? 500 * 1024 * 1024 : 50 * 1024 * 1024;

  if (originalSize > sizeLimit) {
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

  const inputPath = req.file.path;

  try {
    const buffer = await fs.readFile(inputPath);

    const { optimizedBuffer, stats } = await processGlb(buffer, settings);

    const jobId = randomUUID();
    const outPath = path.join(OPTIMIZED_DIR, `${jobId}.glb`);

    await fs.writeFile(outPath, optimizedBuffer);
    
    const metadata = {
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + expirationMs).toISOString(), 
      originalSize,
      optimizedSize: optimizedBuffer.byteLength,
      stats
    };
    await fs.writeFile(path.join(OPTIMIZED_DIR, `${jobId}.json`), JSON.stringify(metadata));

    const downloadUrl = `${req.protocol}://${req.get("host")}/api/download/${jobId}`;

    if (memberId && req.file) {
      await saveOptimization({
        userId: memberId,
        originalName: req.file.originalname,
        originalSize,
        optimizedSize: optimizedBuffer.byteLength,
        stats,
        downloadUrl
      });
    }

    return res.json({
      status: "success",
      originalSize,
      optimizedSize: optimizedBuffer.byteLength,
      downloadUrl,
      stats,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Optimization failed";
    const statusCode = getStatusCode(err);
    return res.status(statusCode).json({ status: "error", message });
  } finally {
    await fs.unlink(inputPath).catch(() => undefined);
  }
});

optimizeRouter.get("/download/:id", async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return res.status(400).json({ status: "error", message: "Invalid download id" });
  }

  const filePath = path.join(OPTIMIZED_DIR, `${id}.glb`);
  const metaPath = path.join(OPTIMIZED_DIR, `${id}.json`);

  try {
    await fs.access(filePath);
    
    try {
      const metaContent = await fs.readFile(metaPath, 'utf-8');
      const metadata = JSON.parse(metaContent);
      if (metadata.expiresAt && new Date(metadata.expiresAt) < new Date()) {
        await fs.unlink(filePath).catch(() => undefined);
        await fs.unlink(metaPath).catch(() => undefined);
        return res.status(410).json({ status: "error", message: "File expired" });
      }
    } catch {
    }
  } catch {
    return res.status(404).json({ status: "error", message: "File not found" });
  }

  return res.download(filePath, `optimized-${id}.glb`, (err) => {
    if (err) {
      res.status(500).json({ status: "error", message: "Failed to download file" });
      return;
    }

    fs.unlink(filePath).catch(() => undefined);
  });
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
