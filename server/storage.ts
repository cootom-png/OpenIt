// Preconfigured storage helpers for Manus WebDev templates
// Uses the Biz-provided storage proxy (Authorization: Bearer <token>)

import { ENV } from './_core/env';
import fs from "fs/promises";
import path from "path";

type StorageConfig = { baseUrl: string; apiKey: string };

// 默认超时时间（毫秒）
const UPLOAD_TIMEOUT_MS = 120_000; // 上传超时 2 分钟
const DOWNLOAD_TIMEOUT_MS = 30_000; // 下载 URL 获取超时 30 秒

function getStorageConfig(): StorageConfig {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

function hasStorageProxyConfig(): boolean {
  return Boolean(ENV.forgeApiUrl && ENV.forgeApiKey);
}

function getLocalUploadRoot(): string {
  return path.resolve(process.env.LOCAL_UPLOAD_DIR || path.join(process.cwd(), "uploads"));
}

function getLocalPublicUrl(key: string): string {
  return `/uploads/${normalizeKey(key)}`;
}

function resolveLocalUploadPath(relKey: string): string {
  const root = getLocalUploadRoot();
  const key = normalizeKey(relKey);
  const filePath = path.resolve(root, key);

  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    throw new Error("Invalid storage path");
  }

  return filePath;
}

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}

async function buildDownloadUrl(
  baseUrl: string,
  relKey: string,
  apiKey: string
): Promise<string> {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(downloadApiUrl, {
      method: "GET",
      headers: buildAuthHeaders(apiKey),
      signal: controller.signal,
    });
    return (await response.json()).url;
  } finally {
    clearTimeout(timeout);
  }
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function toFormData(
  data: Buffer | Uint8Array | string,
  contentType: string,
  fileName: string
): FormData {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}

function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);

  if (!hasStorageProxyConfig()) {
    const filePath = resolveLocalUploadPath(key);
    const payload =
      typeof data === "string"
        ? Buffer.from(data)
        : Buffer.from(data);

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, payload);
    return { key, url: getLocalPublicUrl(key) };
  }

  const { baseUrl, apiKey } = getStorageConfig();
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: buildAuthHeaders(apiKey),
      body: formData,
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText);
      throw new Error(
        `Storage upload failed (${response.status} ${response.statusText}): ${message}`
      );
    }
    const url = (await response.json()).url;
    return { key, url };
  } finally {
    clearTimeout(timeout);
  }
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string; }> {
  const key = normalizeKey(relKey);

  if (!hasStorageProxyConfig()) {
    return { key, url: getLocalPublicUrl(key) };
  }

  const { baseUrl, apiKey } = getStorageConfig();
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey),
  };
}
