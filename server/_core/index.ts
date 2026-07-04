import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { createChunkedUploadRouter } from "../chunkedUpload";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { startCleanupScheduler } from "../cleanup";

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
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "110mb" }));
  app.use(express.urlencoded({ limit: "110mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Chunked file upload routes
  app.use(createChunkedUploadRouter());
  // RAR file parsing API (server-side WASM)
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
      const { ArchiveReader, libarchiveWasm } = await import("libarchive-wasm");
      const data = Buffer.from(buffer, "base64");
      const mod = await libarchiveWasm();
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
      return res.status(500).json({ error: err.message || "Failed to parse archive" });
    }
  });

  // Archive extraction API (public, no login required)
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
        // RAR/7z: use libarchive-wasm to extract files
        const { ArchiveReader, libarchiveWasm } = await import("libarchive-wasm");
        const mod = await libarchiveWasm();
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
      console.error("[extract-archive]", err);
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

startServer().catch(console.error);
