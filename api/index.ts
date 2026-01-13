import cors from "cors";
import express from "express";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { optimizeRouter } from "./src/controllers/optimizeController.js";
import { checkoutRouter } from "./src/controllers/checkoutController.js";
import { webhookRouter } from "./src/controllers/webhookController.js";
import { getUploadUrl } from "./src/services/r2Service.js";
import path from "node:path";

const app = express();

const TMP_DIR = "/tmp";
const dirsReady = Promise.all([
  fs.mkdir(`${TMP_DIR}/uploads`, { recursive: true }),
  fs.mkdir(`${TMP_DIR}/optimized`, { recursive: true })
]);

const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://glob.micr.dev"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith(".micr.dev")) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
  }),
);

app.use(async (_req, _res, next) => {
  await dirsReady;
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", version: "3.0.0", timestamp: Date.now() });
});

app.get("/api/get-upload-url", async (req, res) => {
  try {
    const filename = (req.query.filename as string) || "model.glb";
    const ext = path.extname(filename).toLowerCase() || ".glb";
    const jobId = randomUUID();
    const key = `uploads/${jobId}${ext}`;
    const uploadUrl = await getUploadUrl(key);
    
    return res.json({ uploadUrl, key });
  } catch (error) {
    console.error("get-upload-url error:", error);
    return res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

app.use("/api/webhooks", express.text({ type: "application/json" }), webhookRouter);
app.use("/api/checkout", checkoutRouter);
app.use(express.json());
app.use("/api", optimizeRouter);

export default app;
