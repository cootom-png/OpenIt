import { describe, it, expect } from "vitest";

const SUPPORTED_3D = ["stp", "step", "stl"];
const SUPPORTED_2D_DXF = ["dxf"];
const SUPPORTED_2D_DWG = ["dwg"];
const SUPPORTED_IMAGE = ["jpg", "jpeg", "png", "gif"];
const SUPPORTED_VIDEO = ["mp4", "mov", "webm", "avi", "mkv", "m4v", "3gp"];
const SUPPORTED_PDF = ["pdf"];
const SUPPORTED_WORD = ["doc", "docx"];
const SUPPORTED_EXCEL = ["xls", "xlsx"];
const SUPPORTED_ARCHIVE = ["zip", "rar"];
const ALL_SUPPORTED = [
  ...SUPPORTED_3D,
  ...SUPPORTED_2D_DXF,
  ...SUPPORTED_2D_DWG,
  ...SUPPORTED_IMAGE,
  ...SUPPORTED_VIDEO,
  ...SUPPORTED_PDF,
  ...SUPPORTED_WORD,
  ...SUPPORTED_EXCEL,
  ...SUPPORTED_ARCHIVE,
];

function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

function getCategory(ext: string): string {
  if (SUPPORTED_3D.includes(ext)) return "3d";
  if (SUPPORTED_2D_DXF.includes(ext) || SUPPORTED_2D_DWG.includes(ext)) return "cad";
  if (SUPPORTED_IMAGE.includes(ext)) return "image";
  if (SUPPORTED_VIDEO.includes(ext)) return "video";
  if (SUPPORTED_PDF.includes(ext) || SUPPORTED_WORD.includes(ext) || SUPPORTED_EXCEL.includes(ext)) return "document";
  if (SUPPORTED_ARCHIVE.includes(ext)) return "archive";
  return "unknown";
}

describe("Archive format support", () => {
  it("ZIP and RAR are in ALL_SUPPORTED", () => {
    expect(ALL_SUPPORTED).toContain("zip");
    expect(ALL_SUPPORTED).toContain("rar");
  });

  it("SUPPORTED_ARCHIVE contains zip and rar", () => {
    expect(SUPPORTED_ARCHIVE).toEqual(["zip", "rar"]);
  });

  it("getFileExtension extracts archive extensions correctly", () => {
    expect(getFileExtension("parts-assembly.zip")).toBe("zip");
    expect(getFileExtension("project-files.rar")).toBe("rar");
    expect(getFileExtension("my.archive.ZIP")).toBe("zip");
    expect(getFileExtension("backup.RAR")).toBe("rar");
  });

  it("getCategory returns 'archive' for zip and rar", () => {
    expect(getCategory("zip")).toBe("archive");
    expect(getCategory("rar")).toBe("archive");
  });

  it("getCategory returns correct categories for other formats", () => {
    expect(getCategory("stp")).toBe("3d");
    expect(getCategory("dxf")).toBe("cad");
    expect(getCategory("jpg")).toBe("image");
    expect(getCategory("mp4")).toBe("video");
    expect(getCategory("pdf")).toBe("document");
    expect(getCategory("xyz")).toBe("unknown");
  });

  it("ALL_SUPPORTED includes all expected formats", () => {
    // 3D: 3, DXF: 1, DWG: 1, Image: 4, Video: 7, PDF: 1, Word: 2, Excel: 2, Archive: 2 = 23
    expect(ALL_SUPPORTED.length).toBe(23);
  });
});

describe("JSZip library availability", () => {
  it("can import jszip", async () => {
    const JSZip = (await import("jszip")).default;
    expect(JSZip).toBeDefined();
    expect(typeof JSZip.loadAsync).toBe("function");
  });

  it("can create and read a simple zip", async () => {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    zip.file("hello.txt", "Hello World");
    zip.file("folder/nested.txt", "Nested content");

    const blob = await zip.generateAsync({ type: "arraybuffer" });
    const loaded = await JSZip.loadAsync(blob);

    const files: string[] = [];
    loaded.forEach((path) => {
      files.push(path);
    });

    expect(files).toContain("hello.txt");
    expect(files).toContain("folder/");
    expect(files).toContain("folder/nested.txt");
  });

  it("can read file sizes from zip entries", async () => {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const content = "A".repeat(1000);
    zip.file("large.txt", content);

    const blob = await zip.generateAsync({ type: "arraybuffer" });
    const loaded = await JSZip.loadAsync(blob);

    let foundSize = false;
    loaded.forEach((_path, entry) => {
      const internal = entry as any;
      if (_path === "large.txt" && internal._data) {
        expect(internal._data.uncompressedSize).toBe(1000);
        foundSize = true;
      }
    });
    expect(foundSize).toBe(true);
  });
});

describe("libarchive-wasm library availability", () => {
  it("can import libarchive-wasm", async () => {
    const lib = await import("libarchive-wasm");
    expect(lib.ArchiveReader).toBeDefined();
    expect(lib.libarchiveWasm).toBeDefined();
    expect(typeof lib.libarchiveWasm).toBe("function");
  });
});
