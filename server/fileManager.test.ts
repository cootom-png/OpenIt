import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "test-key", url: "https://cdn.example.com/test.stp" }),
}));

// Mock db module
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

describe("fileManager constants", () => {
  it("should have correct quota limits", async () => {
    const { MAX_FILES_PER_USER, MAX_TOTAL_SIZE_BYTES, MAX_SINGLE_FILE_BYTES } = await import("./fileManager");
    expect(MAX_FILES_PER_USER).toBe(50);
    expect(MAX_TOTAL_SIZE_BYTES).toBe(500 * 1024 * 1024); // 500MB
    expect(MAX_SINGLE_FILE_BYTES).toBe(100 * 1024 * 1024); // 100MB
  });
});

describe("checkQuota", () => {
  it("should reject files exceeding single file size limit", async () => {
    const { checkQuota, MAX_SINGLE_FILE_BYTES } = await import("./fileManager");
    const quota = {
      fileCount: 0,
      totalSize: 0,
      maxFiles: 50,
      maxTotalSize: 500 * 1024 * 1024,
      maxSingleFile: MAX_SINGLE_FILE_BYTES,
    };
    const result = checkQuota(quota, MAX_SINGLE_FILE_BYTES + 1);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("100");
  });

  it("should reject when file count limit reached", async () => {
    const { checkQuota, MAX_SINGLE_FILE_BYTES } = await import("./fileManager");
    const quota = {
      fileCount: 50,
      totalSize: 0,
      maxFiles: 50,
      maxTotalSize: 500 * 1024 * 1024,
      maxSingleFile: MAX_SINGLE_FILE_BYTES,
    };
    const result = checkQuota(quota, 1024);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("50");
  });

  it("should reject when total size would be exceeded", async () => {
    const { checkQuota, MAX_SINGLE_FILE_BYTES, MAX_TOTAL_SIZE_BYTES } = await import("./fileManager");
    const quota = {
      fileCount: 1,
      totalSize: MAX_TOTAL_SIZE_BYTES - 100,
      maxFiles: 50,
      maxTotalSize: MAX_TOTAL_SIZE_BYTES,
      maxSingleFile: MAX_SINGLE_FILE_BYTES,
    };
    const result = checkQuota(quota, 200);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("500");
  });

  it("should allow upload within limits", async () => {
    const { checkQuota, MAX_SINGLE_FILE_BYTES, MAX_TOTAL_SIZE_BYTES } = await import("./fileManager");
    const quota = {
      fileCount: 10,
      totalSize: 100 * 1024 * 1024,
      maxFiles: 50,
      maxTotalSize: MAX_TOTAL_SIZE_BYTES,
      maxSingleFile: MAX_SINGLE_FILE_BYTES,
    };
    const result = checkQuota(quota, 5 * 1024 * 1024);
    expect(result.ok).toBe(true);
    expect(result.reason).toBeUndefined();
  });
});

describe("file category detection", () => {
  it("should correctly categorize file extensions", () => {
    const getCategory = (ext: string) => {
      if (["stp", "step", "stl"].includes(ext)) return "3d";
      if (["dxf", "dwg"].includes(ext)) return "cad";
      if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "image";
      if (["mp4", "mov", "webm", "avi", "mkv", "m4v", "3gp"].includes(ext)) return "video";
      if (["pdf", "doc", "docx", "xls", "xlsx"].includes(ext)) return "document";
      return "unknown";
    };

    expect(getCategory("stp")).toBe("3d");
    expect(getCategory("step")).toBe("3d");
    expect(getCategory("stl")).toBe("3d");
    expect(getCategory("dxf")).toBe("cad");
    expect(getCategory("dwg")).toBe("cad");
    expect(getCategory("jpg")).toBe("image");
    expect(getCategory("png")).toBe("image");
    expect(getCategory("mp4")).toBe("video");
    expect(getCategory("pdf")).toBe("document");
    expect(getCategory("docx")).toBe("document");
    expect(getCategory("xlsx")).toBe("document");
    expect(getCategory("abc")).toBe("unknown");
  });
});
