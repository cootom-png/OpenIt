import { Router } from "express";
import multer from "multer";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });
const OFFICE_EXTS = new Set(["ppt", "pptx"]);

function getOfficeBinary(): string | null {
  const candidates = [
    process.env.SOFFICE_PATH,
    process.env.LIBREOFFICE_PATH,
    "soffice",
    "libreoffice",
  ].filter(Boolean) as string[];
  return candidates[0] || null;
}

async function fetchRemoteFile(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch source file (${response.status})`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function convertOfficeToPdf(params: {
  fileName: string;
  fileBuffer?: Buffer;
  sourceUrl?: string;
}): Promise<Buffer> {
  const binary = getOfficeBinary();
  if (!binary) {
    throw new Error("LibreOffice is not installed on the server");
  }

  const ext = params.fileName.split(".").pop()?.toLowerCase() || "";
  if (!OFFICE_EXTS.has(ext)) {
    throw new Error("Unsupported Office format");
  }

  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), "openit-office-"));
  const outDir = path.join(workDir, "out");
  await fs.mkdir(outDir, { recursive: true });

  try {
    const inputPath = path.join(workDir, params.fileName);
    const inputBuffer = params.fileBuffer || (params.sourceUrl ? await fetchRemoteFile(params.sourceUrl) : null);
    if (!inputBuffer) {
      throw new Error("Missing source file");
    }

    await fs.writeFile(inputPath, inputBuffer);

    const args = [
      "--headless",
      "--nologo",
      "--nodefault",
      "--nofirststartwizard",
      "--convert-to",
      "pdf",
      "--outdir",
      outDir,
      inputPath,
    ];

    await execFileAsync(binary, args, {
      timeout: 180_000,
      windowsHide: true,
      env: {
        ...process.env,
        HOME: workDir,
        TMPDIR: workDir,
      },
    });

    const pdfName = `${path.parse(params.fileName).name}.pdf`;
    const pdfPath = path.join(outDir, pdfName);
    return await fs.readFile(pdfPath);
  } finally {
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

export function createOfficePreviewRouter(): Router {
  const r = Router();

  r.post("/api/convert-office", upload.single("file"), async (req, res) => {
    try {
      const fileName = typeof req.body.fileName === "string" ? req.body.fileName : "";
      const sourceUrl = typeof req.body.sourceUrl === "string" ? req.body.sourceUrl : "";
      const fileBuffer = req.file?.buffer;

      if (!fileName) {
        return res.status(400).json({ error: "Missing fileName" });
      }

      const pdfBuffer = await convertOfficeToPdf({
        fileName,
        fileBuffer,
        sourceUrl: sourceUrl || undefined,
      });

      return res.json({
        success: true,
        pdfBase64: pdfBuffer.toString("base64"),
        fileName: `${fileName.replace(/\.[^.]+$/, "")}.pdf`,
      });
    } catch (error: any) {
      console.error("[convert-office] Error:", error);
      return res.status(500).json({
        error: error?.message || "Office conversion failed",
      });
    }
  });

  return r;
}

