import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const API_ROOT = path.resolve(__dirname, "..", "..", "..");
const TMP_DIR = process.env.VERCEL ? "/tmp" : path.join(API_ROOT, "tmp");
const OPTIMIZED_DIR = path.join(TMP_DIR, "optimized");

const R2_CONFIGURED = Boolean(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY
);

let r2Client: S3Client | null = null;

function getR2(): S3Client | null {
  if (!R2_CONFIGURED) return null;
  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }
  return r2Client;
}

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "glob-models";

export async function uploadToR2(key: string, buffer: Buffer, contentType: string = "model/gltf-binary") {
  const r2 = getR2();
  if (!r2) {
    const localPath = path.join(OPTIMIZED_DIR, key);
    await fs.writeFile(localPath, buffer);
    return;
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await r2.send(command);
}

export async function getUploadUrl(key: string, expiresIn: number = 3600) {
  const r2 = getR2();
  if (!r2) {
    return `/api/local-upload/${key}`;
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: "model/gltf-binary",
  });

  return await getSignedUrl(r2, command, { expiresIn });
}

export async function getFromR2(key: string): Promise<Buffer> {
  const r2 = getR2();
  if (!r2) {
    const localPath = path.join(OPTIMIZED_DIR, key);
    return await fs.readFile(localPath);
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const response = await r2.send(command);
  const arrayBuffer = await response.Body?.transformToByteArray();
  if (!arrayBuffer) throw new Error("Failed to download from R2");
  return Buffer.from(arrayBuffer);
}

export async function getDownloadUrl(key: string, expiresIn: number = 3600) {
  const r2 = getR2();
  if (!r2) {
    return `/api/local-download/${key}`;
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(r2, command, { expiresIn });
}

export async function deleteFromR2(key: string) {
  const r2 = getR2();
  if (!r2) {
    const localPath = path.join(OPTIMIZED_DIR, key);
    await fs.unlink(localPath).catch(() => undefined);
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await r2.send(command);
}
