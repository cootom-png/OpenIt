/**
 * Client-side chunked file upload with:
 *  - Image compression before upload
 *  - File slicing into 2MB chunks
 *  - Per-chunk retry (max 3 attempts)
 *  - 429 (server busy) auto-retry with countdown
 *  - Cancel support via AbortController
 *  - Resume support: saves uploadId to localStorage on cancel, resumes from last chunk
 *  - Progress callback
 */

const CHUNK_SIZE = 2 * 1024 * 1024; // 2 MB per chunk
const MAX_RETRIES = 3;
const MAX_IMAGE_DIMENSION = 2000;
const IMAGE_QUALITY = 0.85;

// 429 重试配置
const MAX_429_RETRIES = 5; // 最多重试 5 次
const INITIAL_429_WAIT_MS = 5000; // 首次等待 5 秒
const MAX_429_WAIT_MS = 30000; // 最长等待 30 秒

// 断点续传缓存 key
const RESUME_CACHE_KEY = "chunked-upload-resume-cache";
// 缓存过期时间（2小时，与服务端 session 保留时间一致）
const RESUME_CACHE_TTL_MS = 2 * 60 * 60 * 1000;

export interface UploadProgress {
  phase: "compressing" | "uploading" | "completing" | "waiting" | "resuming";
  percent: number; // 0-100
  uploadedChunks: number;
  totalChunks: number;
  speed?: string; // e.g. "1.2 MB/s"
  waitMessage?: string; // 429 等待时的提示信息
  waitSeconds?: number; // 剩余等待秒数
}

export interface ChunkedUploadResult {
  success: boolean;
  file?: any;
  error?: string;
  cancelled?: boolean; // 是否被用户取消
}

// ─── 断点续传缓存管理 ───

interface ResumeEntry {
  uploadId: string;
  userId: number;
  fileName: string;
  fileSize: number;
  totalChunks: number;
  createdAt: number;
}

/** 生成文件指纹（基于文件名+大小+用户ID） */
function getFileFingerprint(fileName: string, fileSize: number, userId: number): string {
  return `${userId}:${fileName}:${fileSize}`;
}

/** 从 localStorage 获取续传缓存 */
function getResumeCache(): Record<string, ResumeEntry> {
  try {
    const raw = localStorage.getItem(RESUME_CACHE_KEY);
    if (!raw) return {};
    const cache = JSON.parse(raw) as Record<string, ResumeEntry>;
    // 清理过期条目
    const now = Date.now();
    const cleaned: Record<string, ResumeEntry> = {};
    for (const [key, entry] of Object.entries(cache)) {
      if (now - entry.createdAt < RESUME_CACHE_TTL_MS) {
        cleaned[key] = entry;
      }
    }
    return cleaned;
  } catch {
    return {};
  }
}

/** 保存续传信息到 localStorage */
function saveResumeEntry(fingerprint: string, entry: ResumeEntry): void {
  try {
    const cache = getResumeCache();
    cache[fingerprint] = entry;
    localStorage.setItem(RESUME_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage 不可用时静默失败
  }
}

/** 删除续传缓存条目 */
function removeResumeEntry(fingerprint: string): void {
  try {
    const cache = getResumeCache();
    delete cache[fingerprint];
    localStorage.setItem(RESUME_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // 静默失败
  }
}

/** 查找续传缓存条目 */
function findResumeEntry(fingerprint: string): ResumeEntry | null {
  const cache = getResumeCache();
  return cache[fingerprint] || null;
}

// ─── 取消错误类 ───

class UploadCancelledError extends Error {
  constructor() {
    super("用户取消了上传");
    this.name = "UploadCancelledError";
  }
}

// ─── 可取消的 sleep ───

function cancellableSleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new UploadCancelledError());
      return;
    }
    const timer = setTimeout(resolve, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new UploadCancelledError());
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

// ─── 429 等待辅助函数 ───

/**
 * 等待指定毫秒数，期间通过 onProgress 回调显示倒计时
 * 支持通过 AbortSignal 取消
 */
async function waitWithCountdown(
  waitMs: number,
  message: string,
  currentProgress: Omit<UploadProgress, "phase" | "waitMessage" | "waitSeconds">,
  onProgress?: (progress: UploadProgress) => void,
  signal?: AbortSignal
): Promise<void> {
  const totalSeconds = Math.ceil(waitMs / 1000);
  for (let remaining = totalSeconds; remaining > 0; remaining--) {
    if (signal?.aborted) {
      throw new UploadCancelledError();
    }
    onProgress?.({
      ...currentProgress,
      phase: "waiting",
      waitMessage: `${message}${remaining}秒后自动重试...`,
      waitSeconds: remaining,
    });
    await cancellableSleep(1000, signal);
  }
}

/**
 * 带 429 重试的 fetch 封装
 * 当服务器返回 429 时自动等待并重试
 * 支持通过 AbortSignal 取消
 */
async function fetchWith429Retry(
  url: string,
  options: RequestInit,
  currentProgress: Omit<UploadProgress, "phase" | "waitMessage" | "waitSeconds">,
  onProgress?: (progress: UploadProgress) => void,
  signal?: AbortSignal
): Promise<Response> {
  let waitMs = INITIAL_429_WAIT_MS;

  for (let attempt = 0; attempt <= MAX_429_RETRIES; attempt++) {
    if (signal?.aborted) {
      throw new UploadCancelledError();
    }

    const resp = await fetch(url, { ...options, signal });

    if (resp.status === 429) {
      if (attempt === MAX_429_RETRIES) {
        // 超过最大重试次数
        return resp;
      }

      // 从响应中获取等待时间（如果服务器提供了 Retry-After 头）
      const retryAfter = resp.headers.get("Retry-After");
      if (retryAfter) {
        const seconds = parseInt(retryAfter, 10);
        if (!isNaN(seconds)) {
          waitMs = seconds * 1000;
        }
      }

      // 显示倒计时并等待（可取消）
      await waitWithCountdown(
        waitMs,
        "服务器繁忙，",
        currentProgress,
        onProgress,
        signal
      );

      // 指数退避：每次等待时间增加 50%，但不超过最大值
      waitMs = Math.min(waitMs * 1.5, MAX_429_WAIT_MS);
      continue;
    }

    return resp;
  }

  // 不应该到达这里，但为了类型安全
  throw new Error("服务器持续繁忙，请稍后再试");
}

// ─── Image Compression ───

function isCompressibleImage(ext: string): boolean {
  return ["jpg", "jpeg", "png", "webp", "bmp"].includes(ext.toLowerCase());
}

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Only downscale if larger than max dimension
      if (width <= MAX_IMAGE_DIMENSION && height <= MAX_IMAGE_DIMENSION) {
        // Still re-encode to reduce quality
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(file); return; }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              // Compression didn't help, use original
              resolve(file);
            } else {
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            }
          },
          "image/jpeg",
          IMAGE_QUALITY
        );
        return;
      }

      // Scale down
      const ratio = Math.min(MAX_IMAGE_DIMENSION / width, MAX_IMAGE_DIMENSION / height);
      const newWidth = Math.round(width * ratio);
      const newHeight = Math.round(height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        IMAGE_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      // If image can't be loaded, use original
      resolve(file);
    };

    img.src = url;
  });
}

// ─── Chunk Upload with Retry (including 429 handling) ───

async function uploadChunkWithRetry(
  uploadId: string,
  chunkIndex: number,
  chunkBlob: Blob,
  currentProgress: Omit<UploadProgress, "phase" | "waitMessage" | "waitSeconds">,
  onProgress?: (progress: UploadProgress) => void,
  signal?: AbortSignal,
  retries: number = MAX_RETRIES
): Promise<void> {
  for (let attempt = 0; attempt < retries; attempt++) {
    if (signal?.aborted) {
      throw new UploadCancelledError();
    }

    try {
      const formData = new FormData();
      formData.append("uploadId", uploadId);
      formData.append("chunkIndex", String(chunkIndex));
      formData.append("chunk", chunkBlob, `chunk-${chunkIndex}`);

      const resp = await fetchWith429Retry(
        "/api/upload/chunk",
        { method: "POST", body: formData },
        currentProgress,
        onProgress,
        signal
      );

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ error: resp.statusText }));
        if (resp.status === 429) {
          throw new Error(body.error || "服务器繁忙，请稍后再试");
        }
        throw new Error(body.error || `HTTP ${resp.status}`);
      }

      return; // success
    } catch (err: any) {
      if (err instanceof UploadCancelledError || err.name === "AbortError") {
        throw new UploadCancelledError();
      }
      if (attempt === retries - 1) {
        throw err; // final attempt failed
      }
      // Wait before retry: 1s, 2s, 4s (exponential backoff)
      await cancellableSleep(1000 * Math.pow(2, attempt), signal);
    }
  }
}

// ─── Main Upload Function ───

export async function chunkedUpload(
  file: File,
  userId: number,
  category: string,
  onProgress?: (progress: UploadProgress) => void,
  signal?: AbortSignal
): Promise<ChunkedUploadResult> {
  const fingerprint = getFileFingerprint(file.name, file.size, userId);

  try {
    const result = await _doChunkedUpload(file, userId, category, fingerprint, onProgress, signal);
    if (result.success) {
      // 上传成功，清除续传缓存
      removeResumeEntry(fingerprint);
    }
    return result;
  } catch (err: any) {
    if (err instanceof UploadCancelledError || err.name === "AbortError") {
      return { success: false, error: "上传已取消", cancelled: true };
    }
    throw err;
  }
}

async function _doChunkedUpload(
  file: File,
  userId: number,
  category: string,
  fingerprint: string,
  onProgress?: (progress: UploadProgress) => void,
  signal?: AbortSignal
): Promise<ChunkedUploadResult> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";

  // Check cancel before start
  if (signal?.aborted) {
    return { success: false, error: "上传已取消", cancelled: true };
  }

  // Step 1: Compress image if applicable
  let uploadFile = file;
  if (isCompressibleImage(ext)) {
    onProgress?.({
      phase: "compressing",
      percent: 0,
      uploadedChunks: 0,
      totalChunks: 0,
    });

    try {
      uploadFile = await compressImage(file);
      console.log(
        `[Upload] Image compressed: ${(file.size / 1024).toFixed(0)}KB → ${(uploadFile.size / 1024).toFixed(0)}KB`
      );
    } catch (err) {
      console.warn("[Upload] Image compression failed, using original:", err);
      uploadFile = file;
    }
  }

  const totalChunks = Math.ceil(uploadFile.size / CHUNK_SIZE);

  // Step 2: Check for resume cache
  const resumeEntry = findResumeEntry(fingerprint);
  const resumeId = resumeEntry?.uploadId || undefined;

  if (resumeId) {
    onProgress?.({
      phase: "resuming",
      percent: 0,
      uploadedChunks: 0,
      totalChunks,
      waitMessage: "检测到上次未完成的上传，正在继续...",
    });
    console.log(`[Upload] Found resume cache for ${file.name}, trying to resume uploadId: ${resumeId}`);
  } else {
    onProgress?.({
      phase: "uploading",
      percent: 0,
      uploadedChunks: 0,
      totalChunks,
    });
  }

  const initProgress = { percent: 0, uploadedChunks: 0, totalChunks };

  const initResp = await fetchWith429Retry(
    "/api/upload/init",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        fileName: file.name, // original name
        fileExt: ext,
        fileSize: uploadFile.size,
        mimeType: isCompressibleImage(ext) ? "image/jpeg" : file.type || "application/octet-stream",
        category,
        totalChunks,
        resumeId, // 传入续传 ID（如果有）
      }),
    },
    initProgress,
    onProgress,
    signal
  );

  if (!initResp.ok) {
    const body = await initResp.json().catch(() => ({ error: initResp.statusText }));
    if (initResp.status === 429) {
      return { success: false, error: "服务器当前繁忙，请等待几分钟后再试" };
    }
    return { success: false, error: body.error || "初始化上传失败" };
  }

  const initData = await initResp.json();
  const uploadId = initData.uploadId;
  const resumed = initData.resumed === true;

  // 保存当前 uploadId 到续传缓存（无论是新建还是恢复）
  saveResumeEntry(fingerprint, {
    uploadId,
    userId,
    fileName: file.name,
    fileSize: uploadFile.size,
    totalChunks,
    createdAt: Date.now(),
  });

  // Step 3: Determine already-uploaded chunks
  let uploadedSet = new Set<number>();

  if (resumed && initData.uploadedChunks) {
    // 服务端直接返回了已上传分片列表
    uploadedSet = new Set(initData.uploadedChunks);
    console.log(`[Upload] Resumed: ${uploadedSet.size}/${totalChunks} chunks already uploaded`);
  } else {
    // 查询服务器获取已上传分片（兼容旧逻辑）
    try {
      const statusResp = await fetch(`/api/upload/status?uploadId=${uploadId}`, { signal });
      if (statusResp.ok) {
        const statusData = await statusResp.json();
        uploadedSet = new Set(statusData.uploadedChunks || []);
      }
    } catch (err: any) {
      if (err instanceof UploadCancelledError || err.name === "AbortError") {
        return { success: false, error: "上传已取消", cancelled: true };
      }
      // Ignore other errors — fresh upload
    }
  }

  // 如果有已上传的分片，更新进度显示
  if (uploadedSet.size > 0) {
    onProgress?.({
      phase: "uploading",
      percent: Math.round((uploadedSet.size / totalChunks) * 100),
      uploadedChunks: uploadedSet.size,
      totalChunks,
      waitMessage: resumed ? `已恢复 ${uploadedSet.size}/${totalChunks} 个分片，继续上传...` : undefined,
    });
  }

  // Step 4: Upload chunks with progress tracking
  const startTime = Date.now();
  let uploadedBytes = uploadedSet.size * CHUNK_SIZE;

  for (let i = 0; i < totalChunks; i++) {
    if (signal?.aborted) {
      return { success: false, error: "上传已取消", cancelled: true };
    }

    if (uploadedSet.has(i)) {
      // Already uploaded (resume)
      continue;
    }

    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, uploadFile.size);
    const chunkBlob = uploadFile.slice(start, end);

    const chunkProgress = {
      percent: Math.round((i / totalChunks) * 100),
      uploadedChunks: i,
      totalChunks,
    };

    try {
      await uploadChunkWithRetry(uploadId, i, chunkBlob, chunkProgress, onProgress, signal);
    } catch (err: any) {
      if (err instanceof UploadCancelledError || err.name === "AbortError") {
        // 取消时不删除缓存，保留供下次续传
        return { success: false, error: "上传已取消", cancelled: true };
      }
      return {
        success: false,
        error: `分片 ${i + 1}/${totalChunks} 上传失败: ${err.message}`,
      };
    }

    uploadedBytes += (end - start);
    const elapsed = (Date.now() - startTime) / 1000;
    const speedBps = elapsed > 0 ? uploadedBytes / elapsed : 0;
    const speedStr =
      speedBps > 1024 * 1024
        ? `${(speedBps / (1024 * 1024)).toFixed(1)} MB/s`
        : `${(speedBps / 1024).toFixed(0)} KB/s`;

    onProgress?.({
      phase: "uploading",
      percent: Math.round(((i + 1) / totalChunks) * 100),
      uploadedChunks: i + 1,
      totalChunks,
      speed: speedStr,
    });
  }

  // Step 5: Complete — merge and save
  if (signal?.aborted) {
    return { success: false, error: "上传已取消", cancelled: true };
  }

  onProgress?.({
    phase: "completing",
    percent: 100,
    uploadedChunks: totalChunks,
    totalChunks,
  });

  const completeResp = await fetch("/api/upload/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uploadId }),
    signal,
  });

  if (!completeResp.ok) {
    const body = await completeResp.json().catch(() => ({ error: completeResp.statusText }));
    return { success: false, error: body.error || "合并文件失败" };
  }

  const result = await completeResp.json();
  // 上传成功，清除续传缓存
  removeResumeEntry(fingerprint);
  return { success: true, file: result.file };
}
