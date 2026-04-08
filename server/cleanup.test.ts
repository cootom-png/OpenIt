import { describe, it, expect } from "vitest";
import { cleanupGuestUploadRecords } from "./cleanup";

describe("cleanup module", () => {
  it("cleanupGuestUploadRecords returns expected shape", async () => {
    const result = await cleanupGuestUploadRecords(7);
    expect(result).toHaveProperty("deletedCount");
    expect(result).toHaveProperty("timestamp");
    expect(typeof result.deletedCount).toBe("number");
    expect(result.deletedCount).toBeGreaterThanOrEqual(0);
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it("cleanupGuestUploadRecords with custom days parameter", async () => {
    const result = await cleanupGuestUploadRecords(30);
    expect(result).toHaveProperty("deletedCount");
    expect(result.deletedCount).toBeGreaterThanOrEqual(0);
  });

  it("cleanupGuestUploadRecords with 1 day parameter", async () => {
    const result = await cleanupGuestUploadRecords(1);
    expect(result).toHaveProperty("deletedCount");
    expect(result.deletedCount).toBeGreaterThanOrEqual(0);
  });
});
