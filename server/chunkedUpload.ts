/**
 * Chunked file upload — Express routes for large-file upload.
 *
 * Flow:
 *   1. POST /api/upload/init      → create upload session, return uploadId
 *   2. POST /api/upload/chunk     → upload one chunk (multipart/form-data)
 *   3. POST /api/upload/complete  → merge chunks, upload to S3, create DB record
 *   4. GET  /api/upload/status    → query which chunks are already uploaded (for resume)
 */
import { Router } from "express";
import multer from "multer";
import crypto from "crypto";
import { storagePut } from "./storage";
import { getUserQuota, checkQuota, MAX_SINGLE_FILE_BYTES } from "./fileManager";
import { getDb } from "./db";
import { userFiles, emailUsers } from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";

// ─── In-memory upload session store ───
interface UploadSession {
  userId: number;
  fileName: string;
  fileExt: string;
  fileSize: number;
  mimeType: string;
  category: string;
  totalChunks: number;
  chunks: Map<number, Buffer>; // chunkIndex → data
  createdAt: number;
}

const sessions = new Map<string, UploadSession>();

// Clean up stale sessions every 30 minutes (sessions older than 2 hours)
setInterval(() => {
  const now = Date.now();
  const ids = Array.from(sessions.keys());
  for (const id of ids) {
    const session = sessions.get(id);
    if (session && now - session.createdAt > 2 * 60 * 60 * 1000) {
      sessions.delete(id);
    }
  }
}, 30 * 60 * 1000);

// Multer: store in memory, max 3MB per chunk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
});

function generateShareToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function createChunkedUploadRouter(): Router {
  const r = Router();

  // ─── 1. Init upload session ───
  r.post("/api/upload/init", async (req, res) => {
    try {
      const { userId, fileName, fileExt, fileSize, mimeType, category, totalChunks } = req.body;

      if (!userId || !fileName || !fileSize || !totalChunks) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (fileSize > MAX_SINGLE_FILE_BYTES) {
        return res.status(400).json({ error: `文件大小超过 ${MAX_SINGLE_FILE_BYTES / (1024 * 1024)}MB 限制` });
      }

      // Check user quota
      const quota = await getUserQuota(userId);
      const check = checkQuota(quota, fileSize);
      if (!check.ok) {
        return res.status(400).json({ error: check.reason });
      }

      const uploadId = crypto.randomBytes(16).toString("hex");
      sessions.set(uploadId, {
        userId,
        fileName,
        fileExt: fileExt || "",
        fileSize,
        mimeType: mimeType || "application/octet-stream",
        category: category || "unknown",
        totalChunks,
        chunks: new Map(),
        createdAt: Date.now(),
      });

      res.json({ uploadId, totalChunks });
    } catch (err: any) {
      console.error("[ChunkedUpload] Init error:", err);
      res.status(500).json({ error: err.message || "Init failed" });
    }
  });

  // ─── 2. Upload a single chunk ───
  r.post("/api/upload/chunk", upload.single("chunk"), async (req, res) => {
    try {
      const { uploadId, chunkIndex } = req.body;
      const file = req.file;

      if (!uploadId || chunkIndex === undefined || !file) {
        return res.status(400).json({ error: "Missing uploadId, chunkIndex, or chunk data" });
      }

      const session = sessions.get(uploadId);
      if (!session) {
        return res.status(404).json({ error: "Upload session not found or expired" });
      }

      const idx = parseInt(chunkIndex, 10);
      if (isNaN(idx) || idx < 0 || idx >= session.totalChunks) {
        return res.status(400).json({ error: "Invalid chunk index" });
      }

      session.chunks.set(idx, file.buffer);

      res.json({
        success: true,
        chunkIndex: idx,
        uploadedChunks: session.chunks.size,
        totalChunks: session.totalChunks,
      });
    } catch (err: any) {
      console.error("[ChunkedUpload] Chunk error:", err);
      res.status(500).json({ error: err.message || "Chunk upload failed" });
    }
  });

  // ─── 3. Complete: merge chunks and upload to S3 ───
  r.post("/api/upload/complete", async (req, res) => {
    try {
      const { uploadId } = req.body;

      const session = sessions.get(uploadId);
      if (!session) {
        return res.status(404).json({ error: "Upload session not found or expired" });
      }

      // Verify all chunks received
      if (session.chunks.size !== session.totalChunks) {
        return res.status(400).json({
          error: `Missing chunks: received ${session.chunks.size}/${session.totalChunks}`,
          uploadedChunks: Array.from(session.chunks.keys()),
        });
      }

      // Merge chunks in order
      const orderedBuffers: Buffer[] = [];
      for (let i = 0; i < session.totalChunks; i++) {
        const chunk = session.chunks.get(i);
        if (!chunk) {
          return res.status(400).json({ error: `Missing chunk ${i}` });
        }
        orderedBuffers.push(chunk);
      }
      const fileBuffer = Buffer.concat(orderedBuffers);

      // Upload to S3
      const randomSuffix = crypto.randomBytes(4).toString("hex");
      const s3Key = `user-files/${session.userId}/${Date.now()}-${randomSuffix}.${session.fileExt}`;
      const { url: s3Url } = await storagePut(s3Key, fileBuffer, session.mimeType);

      // Generate share token
      const shareToken = generateShareToken();

      // For image files, use S3 URL as thumbnail
      const isImage = ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(session.fileExt.toLowerCase());

      // Insert DB record
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(userFiles).values({
        userId: session.userId,
        fileName: session.fileName,
        fileExt: session.fileExt,
        fileSize: session.fileSize,
        mimeType: session.mimeType,
        category: session.category,
        s3Key,
        s3Url,
        shareToken,
        shareEnabled: false,
        thumbnailUrl: isImage ? s3Url : null,
      });

      // Update user quota counters
      await db
        .update(emailUsers)
        .set({
          fileCount: sql`${emailUsers.fileCount} + 1`,
          totalFileSize: sql`${emailUsers.totalFileSize} + ${session.fileSize}`,
        })
        .where(eq(emailUsers.id, session.userId));

      // Fetch inserted record
      const inserted = await db
        .select()
        .from(userFiles)
        .where(eq(userFiles.id, result[0].insertId))
        .limit(1);

      // Clean up session
      sessions.delete(uploadId);

      res.json({ success: true, file: inserted[0] });
    } catch (err: any) {
      console.error("[ChunkedUpload] Complete error:", err);
      res.status(500).json({ error: err.message || "Complete failed" });
    }
  });

  // ─── 4. Query upload status (for resume) ───
  r.get("/api/upload/status", (req, res) => {
    const uploadId = req.query.uploadId as string;
    if (!uploadId) {
      return res.status(400).json({ error: "Missing uploadId" });
    }

    const session = sessions.get(uploadId);
    if (!session) {
      return res.status(404).json({ error: "Upload session not found or expired" });
    }

    res.json({
      uploadId,
      totalChunks: session.totalChunks,
      uploadedChunks: Array.from(session.chunks.keys()).sort((a, b) => a - b),
      fileName: session.fileName,
      fileSize: session.fileSize,
    });
  });

  return r;
}
