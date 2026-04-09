/**
 * Client-side chunked file upload with:
 *  - Image compression before upload
 *  - File slicing into 2MB chunks
 *  - Per-chunk retry (max 3 attempts)
 *  - Resume support (query server for already-uploaded chunks)
 *  - Progress callback
 */

const CHUNK_SIZE = 2 * 1024 * 1024; // 2 MB per chunk
const MAX_RETRIES = 3;
const MAX_IMAGE_DIMENSION = 2000;
const IMAGE_QUALITY = 0.85;

export interface UploadProgress {
  phase: "compressing" | "uploading" | "completing";
  percent: number; // 0-100
  uploadedChunks: number;
  totalChunks: number;
  speed?: string; // e.g. "1.2 MB/s"
}

export interface ChunkedUploadResult {
  success: boolean;
  file?: any;
  error?: string;
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

// ─── Chunk Upload with Retry ───

async function uploadChunkWithRetry(
  uploadId: string,
  chunkIndex: number,
  chunkBlob: Blob,
  retries: number = MAX_RETRIES
): Promise<void> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const formData = new FormData();
      formData.append("uploadId", uploadId);
      formData.append("chunkIndex", String(chunkIndex));
      formData.append("chunk", chunkBlob, `chunk-${chunkIndex}`);

      const resp = await fetch("/api/upload/chunk", {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ error: resp.statusText }));
        throw new Error(body.error || `HTTP ${resp.status}`);
      }

      return; // success
    } catch (err) {
      if (attempt === retries - 1) {
        throw err; // final attempt failed
      }
      // Wait before retry: 1s, 2s, 4s (exponential backoff)
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }
}

// ─── Main Upload Function ───

export async function chunkedUpload(
  file: File,
  userId: number,
  category: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<ChunkedUploadResult> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";

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

  // Step 2: Init upload session
  onProgress?.({
    phase: "uploading",
    percent: 0,
    uploadedChunks: 0,
    totalChunks,
  });

  const initResp = await fetch("/api/upload/init", {
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
    }),
  });

  if (!initResp.ok) {
    const body = await initResp.json().catch(() => ({ error: initResp.statusText }));
    return { success: false, error: body.error || "初始化上传失败" };
  }

  const { uploadId } = await initResp.json();

  // Step 3: Check for already-uploaded chunks (resume support)
  let uploadedSet = new Set<number>();
  try {
    const statusResp = await fetch(`/api/upload/status?uploadId=${uploadId}`);
    if (statusResp.ok) {
      const statusData = await statusResp.json();
      uploadedSet = new Set(statusData.uploadedChunks || []);
    }
  } catch {
    // Ignore — fresh upload
  }

  // Step 4: Upload chunks with progress tracking
  const startTime = Date.now();
  let uploadedBytes = uploadedSet.size * CHUNK_SIZE;

  for (let i = 0; i < totalChunks; i++) {
    if (uploadedSet.has(i)) {
      // Already uploaded (resume)
      continue;
    }

    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, uploadFile.size);
    const chunkBlob = uploadFile.slice(start, end);

    try {
      await uploadChunkWithRetry(uploadId, i, chunkBlob);
    } catch (err: any) {
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
  });

  if (!completeResp.ok) {
    const body = await completeResp.json().catch(() => ({ error: completeResp.statusText }));
    return { success: false, error: body.error || "合并文件失败" };
  }

  const result = await completeResp.json();
  return { success: true, file: result.file };
}
