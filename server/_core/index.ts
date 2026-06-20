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
