import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";

import { optimizeRouter } from "./controllers/optimizeController.js";
import { webhookRouter } from "./controllers/webhookController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_ROOT = path.resolve(__dirname, "..", "..");
const TMP_DIR = path.join(API_ROOT, "tmp");

async function ensureTmpDirs(): Promise<void> {
  await fs.mkdir(path.join(TMP_DIR, "uploads"), { recursive: true });
  await fs.mkdir(path.join(TMP_DIR, "optimized"), { recursive: true });
}

function getAllowedOrigins(): string[] {
  const defaults = ["http://localhost:8080", "http://localhost:5173", "http://localhost:3000"];

  const envOrigins = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  return Array.from(new Set([...defaults, ...envOrigins]));
}

async function main(): Promise<void> {
  await ensureTmpDirs();

  const app = express();

  const allowedOrigins = getAllowedOrigins();

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);

        return callback(new Error("Not allowed by CORS"));
      },
    }),
  );

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/webhooks", express.text({ type: "application/json" }), webhookRouter);

  app.use(express.json());
  app.use("/api", optimizeRouter);

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = err instanceof Error ? err.message : "Unexpected error";

    if (message.toLowerCase().includes("cors")) {
      return res.status(403).json({ status: "error", message });
    }

    return res.status(500).json({ status: "error", message });
  });

  const port = Number(process.env.PORT ?? 3001);
  app.listen(port, () => {
    console.log(`Optimization API listening on :${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
