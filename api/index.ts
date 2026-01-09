import cors from "cors";
import express from "express";
import fs from "node:fs/promises";
import { optimizeRouter } from "./src/controllers/optimizeController.js";
import { webhookRouter } from "./src/controllers/webhookController.js";

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
  res.json({ status: "ok", version: "2.0.0" });
});

app.use("/api/webhooks", express.text({ type: "application/json" }), webhookRouter);
app.use(express.json());
app.use("/api", optimizeRouter);

export default app;
