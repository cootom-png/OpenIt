import "dotenv/config";
import express from "express";
import { createServer } from "http";
import dns from "dns/promises";
import net from "net";
import { Readable } from "stream";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { createChunkedUploadRouter } from "../chunkedUpload";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { startCleanupScheduler } from "../cleanup";

// ═══════════════════════════════════════════════════════════════
// 全局异常处理 — 防止未捕获错误导致进程退出
// ═══════════════════════════════════════════════════════════════

process.on("uncaughtException", (err) => {
  console.error("[FATAL] Uncaught Exception:", err);
  // 记录错误但不立即退出，让 PM2 决定是否重启
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[FATAL] Unhandled Rejection at:", promise, "reason:", reason);
});

// 优雅关闭：收到 SIGTERM 时清理资源后退出
process.on("SIGTERM", () => {
  console.log("[Server] Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("[Server] Received SIGINT, shutting down...");
  process.exit(0);
});

// ═══════════════════════════════════════════════════════════════
// libarchive-wasm 单例缓存 — 避免每次请求重新初始化 WASM 模块
// ═══════════════════════════════════════════════════════════════

let _libarchiveMod: any = null;
let _ArchiveReader: any = null;

const PROXY_MAX_BYTES = 100 * 1024 * 1024;
const PROXY_TIMEOUT_MS = 30_000;

function isPrivateHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized.endsWith(".localhost")
  );
}

function isPrivateIp(address: string): boolean {
  if (net.isIPv4(address)) {
    const parts = address.split(".").map(Number);
    return (
      parts[0] === 10 ||
      parts[0] === 127 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      (parts[0] === 169 && parts[1] === 254)
    );
  }

  if (net.isIPv6(address)) {
    const normalized = address.toLowerCase();
    return (
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80:")
    );
  }

  return true;
}

async function validateProxyUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https URLs are supported");
  }

  if (isPrivateHostname(parsed.hostname)) {
    throw new Error("Private hosts are not allowed");
  }

  const addresses = await dns.lookup(parsed.hostname, { all: true });
  if (addresses.length === 0 || addresses.some((entry) => isPrivateIp(entry.address))) {
    throw new Error("Private network targets are not allowed");
  }

  return parsed;
}

async function getLibarchive() {
  if (!_libarchiveMod) {
    const { ArchiveReader, libarchiveWasm } = await import("libarchive-wasm");
    _libarchiveMod = await libarchiveWasm();
    _ArchiveReader = ArchiveReader;
  }
  return { mod: _libarchiveMod, ArchiveReader: _ArchiveReader };
}

// ═══════════════════════════════════════════════════════════════
// 服务器启动
// ═══════════════════════════════════════════════════════════════

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ─── Body parser: 降低 limit 到 10MB ───
  // 大文件已通过分块上传 (chunkedUpload) 处理，不需要超大 JSON body
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  app.get("/healthz", (_req, res) => {
    res.status(200).json({ ok: true, service: "cloudparts" });
  });

  app.get("/api/proxy-file", async (req, res) => {
    const rawUrl = typeof req.query.url === "string" ? req.query.url : "";
    if (!rawUrl) {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

    try {
      const targetUrl = await validateProxyUrl(rawUrl);
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "CloudpartsFileProxy/1.0",
        },
        redirect: "follow",
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        return res.status(response.status || 502).json({
          error: `Remote file request failed (${response.status})`,
        });
      }

      const lengthHeader = response.headers.get("content-length");
      const contentLength = lengthHeader ? Number(lengthHeader) : 0;
      if (contentLength > PROXY_MAX_BYTES) {
        return res.status(413).json({ error: "Remote file is too large" });
      }

      res.setHeader("Content-Type", response.headers.get("content-type") || "application/octet-stream");
      res.setHeader("Cache-Control", "public, max-age=3600");
      if (contentLength > 0) {
        res.setHeader("Content-Length", String(contentLength));
      }

      let streamedBytes = 0;
      const stream = Readable.fromWeb(response.body as any);
      stream.on("data", (chunk: Buffer) => {
        streamedBytes += chunk.length;
        if (streamedBytes > PROXY_MAX_BYTES) {
          stream.destroy(new Error("Remote file is too large"));
        }
      });
      stream.on("error", (error) => {
        if (!res.headersSent) {
          res.status(502).json({ error: error.message || "Remote file proxy failed" });
        } else {
          res.destroy(error);
        }
      });
      stream.pipe(res);
    } catch (err: any) {
      const message = err?.name === "AbortError" ? "Remote file request timed out" : err?.message || "Remote file proxy failed";
      const status = message.includes("Private") || message.includes("Invalid") || message.includes("Only")
        ? 400
        : 502;
      return res.status(status).json({ error: message });
    } finally {
      clearTimeout(timeout);
    }
  });

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Chunked file upload routes
  app.use(createChunkedUploadRouter());

  // ─── RAR/7z 文件解析 API（使用缓存的 WASM 单例）───
  app.post("/api/parse-archive", async (req, res) => {
    try {
      const { buffer, filename } = req.body;
      if (!buffer || !filename) {
        return res.status(400).json({ error: "Missing buffer or filename" });
      }
      const ext = filename.split(".").pop()?.toLowerCase() || "";
      if (ext !== "rar" && ext !== "zip" && ext !== "7z") {
        return res.status(400).json({ error: "Unsupported format" });
      }

      const { mod, ArchiveReader } = await getLibarchive();
      const data = Buffer.from(buffer, "base64");
      const reader = new ArchiveReader(mod, new Int8Array(data));
      const entries: Array<{ path: string; name: string; size: number; isDir: boolean }> = [];
      for (const entry of reader.entries()) {
        const pathStr = entry.getPathname();
        const size = entry.getSize();
        const isDir = pathStr.endsWith("/");
        const name = pathStr.replace(/\/$/, "").split(/[\/\\]/).filter(Boolean).pop() || pathStr;
        entries.push({ path: pathStr, name, size: size || 0, isDir });
      }
      reader.free();
      return res.json({ entries });
    } catch (err: any) {
      console.error("[parse-archive] Error:", err.message);
      return res.status(500).json({ error: err.message || "Failed to parse archive" });
    }
  });

  // ─── 压缩包解压 API（使用缓存的 WASM 单例）───
  app.post("/api/extract-archive", async (req, res) => {
    try {
      const { buffer, filename } = req.body;
      if (!buffer || !filename) {
        return res.status(400).json({ error: "Missing buffer or filename" });
      }
      const ext = filename.split(".").pop()?.toLowerCase() || "";
      if (!['zip', 'rar', '7z'].includes(ext)) {
        return res.status(400).json({ error: "Unsupported format" });
      }
      const fileBuffer = Buffer.from(buffer, "base64");

      if (ext === 'zip') {
        const { extractAndRepackZip } = await import("../archiveExtractor");
        const baseName = filename.replace(/\.[^.]+$/, "");
        const timestamp = Date.now();
        const rootFolderName = `${baseName}_${timestamp}`;
        const repacked = await extractAndRepackZip(fileBuffer, rootFolderName);
        const base64 = repacked.toString("base64");
        const newFileName = `${baseName}_extracted_${timestamp}.zip`;
        return res.json({ success: true, base64, fileName: newFileName });
      } else {
        // RAR/7z: use cached libarchive-wasm singleton
        const { mod, ArchiveReader } = await getLibarchive();
        const reader = new ArchiveReader(mod, new Int8Array(fileBuffer));
        const files: Array<{ name: string; data: string }> = [];
        for (const entry of reader.entries()) {
          const pathStr = entry.getPathname();
          if (pathStr.endsWith('/')) continue; // skip directories
          const fileData = entry.readData();
          if (fileData) {
            const fileName = pathStr.split(/[\/\\]/).filter(Boolean).pop() || pathStr;
            files.push({
              name: fileName,
              data: Buffer.from(fileData).toString('base64')
            });
          }
        }
        reader.free();
        return res.json({ success: true, files });
      }
    } catch (err: any) {
      console.error("[extract-archive] Error:", err.message);
      return res.status(500).json({ error: err.message || "Extraction failed" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    // Start weekly guest file cleanup scheduler
    startCleanupScheduler();
  });
}

startServer().catch((err) => {
  console.error("[Server] Failed to start:", err);
  process.exit(1);
});
