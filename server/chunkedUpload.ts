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

// ═══════════════════════════════════════════════════════════════
// 内存限制配置
// ═══════════════════════════════════════════════════════════════

// 所有上传会话的总内存上限（500MB）
const MAX_TOTAL_MEMORY_BYTES = 500 * 1024 * 1024;
// 最大并发上传会话数
const MAX_CONCURRENT_SESSIONS = 10;

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
  memoryUsed: number; // 当前会话已使用的内存（字节）
}

const sessions = new Map<string, UploadSession>();

/** 计算所有会话当前占用的总内存 */
function getTotalMemoryUsage(): number {
  let total = 0;
  for (const session of sessions.values()) {
    total += session.memoryUsed;
  }
  return total;
}

// Clean up stale sessions every 30 minutes (sessions older than 2 hours)
setInterval(() => {
  const now = Date.now();
  const ids = Array.from(sessions.keys());
  for (const id of ids) {
    const session = sessions.get(id);
    if (session && now - session.createdAt > 2 * 60 * 60 * 1000) {
      sessions.delete(id);
      console.log(`[ChunkedUpload] Cleaned up stale session: ${id} (${(session.memoryUsed / 1024 / 1024).toFixed(1)}MB freed)`);
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

  // ─── 1. Init upload session (supports resume via resumeId) ───
  r.post("/api/upload/init", async (req, res) => {
    try {
      const { userId, fileName, fileExt, fileSize, mimeType, category, totalChunks, resumeId } = req.body;

      if (!userId || !fileName || !fileSize || !totalChunks) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (fileSize > MAX_SINGLE_FILE_BYTES) {
        return res.status(400).json({ error: `文件大小超过 ${MAX_SINGLE_FILE_BYTES / (1024 * 1024)}MB 限制` });
      }

      // 断点续传：如果前端传入 resumeId，尝试恢复已有会话
      if (resumeId) {
        const existingSession = sessions.get(resumeId);
        if (
          existingSession &&
          existingSession.userId === userId &&
          existingSession.fileName === fileName &&
          existingSession.fileSize === fileSize &&
          existingSession.totalChunks === totalChunks
        ) {
          // 会话匹配，返回已有 uploadId 和已上传分片信息
          console.log(`[ChunkedUpload] Resuming session: ${resumeId} (${existingSession.chunks.size}/${totalChunks} chunks)`);
          return res.json({
            uploadId: resumeId,
            totalChunks,
            resumed: true,
            uploadedChunks: Array.from(existingSession.chunks.keys()).sort((a, b) => a - b),
          });
        }
        // resumeId 无效或不匹配，继续创建新会话
        console.log(`[ChunkedUpload] Resume failed for ${resumeId}, creating new session`);
      }

      // 检查并发会话数限制
      if (sessions.size >= MAX_CONCURRENT_SESSIONS) {
        return res.status(429).json({ error: "服务器繁忙，请稍后再试（上传队列已满）" });
      }

      // 检查总内存限制
      const currentMemory = getTotalMemoryUsage();
      if (currentMemory + fileSize > MAX_TOTAL_MEMORY_BYTES) {
        return res.status(429).json({ error: "服务器内存不足，请稍后再试" });
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
        memoryUsed: 0,
      });

      res.json({ uploadId, totalChunks, resumed: false });
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

      // 如果是重传的 chunk，先减去旧 chunk 的内存
      const oldChunk = session.chunks.get(idx);
      if (oldChunk) {
        session.memoryUsed -= oldChunk.length;
      }

      session.chunks.set(idx, file.buffer);
      session.memoryUsed += file.buffer.length;

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

      // Clean up session (释放内存)
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

  // ─── 5. Proxy video for thumbnail generation (avoid CORS) ───
  r.get("/api/proxy-video", async (req, res) => {
    const videoUrl = req.query.url as string;
    if (!videoUrl) {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    try {
      // Only allow proxying S3/storage URLs for security
      const parsed = new URL(videoUrl);
      // Allow common S3/storage domains
      const allowedPatterns = [
        "s3.amazonaws.com",
        "s3.",
        "storage.googleapis.com",
        "googleapis.com",
        "blob.core.windows.net",
        "cloudfront.net",
        "forge",
        "manus",
      ];
      const isAllowed = allowedPatterns.some(p => parsed.hostname.includes(p));
      if (!isAllowed) {
        return res.status(403).json({ error: "URL not allowed for proxying" });
      }

      // Forward Range header from browser if present, otherwise fetch full file
      const headers: Record<string, string> = {};
      if (req.headers.range) {
        headers["Range"] = req.headers.range;
      }

      // 添加 60 秒超时
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60_000);

      const upstream = await fetch(videoUrl, {
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      // Forward response headers
      const contentType = upstream.headers.get("content-type") || "video/mp4";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Access-Control-Allow-Origin", "*");
      if (upstream.headers.get("content-length")) {
        res.setHeader("Content-Length", upstream.headers.get("content-length")!);
      }
      if (upstream.headers.get("content-range")) {
        res.setHeader("Content-Range", upstream.headers.get("content-range")!);
      }
      if (upstream.headers.get("accept-ranges")) {
        res.setHeader("Accept-Ranges", upstream.headers.get("accept-ranges")!);
      }
      res.status(upstream.status);

      // Stream the response
      if (upstream.body) {
        const reader = (upstream.body as any).getReader();
        const pump = async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(Buffer.from(value));
          }
          res.end();
        };
        pump().catch(() => res.end());
      } else {
        const buffer = await upstream.arrayBuffer();
        res.send(Buffer.from(buffer));
      }
    } catch (err: any) {
      console.error("[ProxyVideo] Error:", err.message);
      res.status(500).json({ error: "Failed to proxy video" });
    }
  });

  return r;
}
