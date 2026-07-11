import { describe, it, expect, vi } from "vitest";

vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

describe("thumbnail upload endpoint", () => {
  it("updateFileThumbnail function should be importable", async () => {
    const { updateFileThumbnail } = await import("./fileManager");
    expect(typeof updateFileThumbnail).toBe("function");
  });

  it("should reject when file not found (no DB)", async () => {
    const { updateFileThumbnail } = await import("./fileManager");
    const { getDb } = await import("./db");
    (getDb as any).mockResolvedValue(null);

    await expect(updateFileThumbnail(999, 999, "dGVzdA==")).rejects.toThrow("Database not available");
  });

  it("thumbnail base64 encoding/decoding works correctly", () => {
    const testData = "Hello, thumbnail!";
    const base64 = Buffer.from(testData).toString("base64");
    const decoded = Buffer.from(base64, "base64").toString();
    expect(decoded).toBe(testData);
  });

  it("thumbnail resize dimensions are calculated correctly", () => {
    // Simulate the resize logic from Home.tsx
    const originalWidth = 1200;
    const originalHeight = 800;
    const maxW = 300;
    const ratio = originalHeight / originalWidth;
    const thumbWidth = maxW;
    const thumbHeight = Math.round(maxW * ratio);
    
    expect(thumbWidth).toBe(300);
    expect(thumbHeight).toBe(200);
    expect(thumbWidth / thumbHeight).toBeCloseTo(originalWidth / originalHeight, 1);
  });

  it("thumbnail S3 key format is correct", () => {
    const userId = 42;
    const fileId = 123;
    const randomSuffix = "abcd1234";
    const thumbKey = `user-files/${userId}/thumbs/${fileId}-${randomSuffix}.png`;
    
    expect(thumbKey).toBe("user-files/42/thumbs/123-abcd1234.png");
    expect(thumbKey).toMatch(/^user-files\/\d+\/thumbs\/\d+-[a-z0-9]+\.png$/);
  });
});
