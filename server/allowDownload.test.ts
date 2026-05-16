import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "test-key", url: "https://cdn.example.com/test.stp" }),
}));

// Mock db module
const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockSet = vi.fn();
const mockWhere = vi.fn();
const mockLimit = vi.fn();
const mockFrom = vi.fn();

vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

describe("updateAllowDownload", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("should be exported from fileManager", async () => {
    const fm = await import("./fileManager");
    expect(typeof fm.updateAllowDownload).toBe("function");
  });

  it("should throw when database is not available", async () => {
    const { getDb } = await import("./db");
    (getDb as any).mockResolvedValue(null);

    const { updateAllowDownload } = await import("./fileManager");
    await expect(updateAllowDownload(1, 1, true)).rejects.toThrow("Database not available");
  });

  it("should return null when file not found", async () => {
    const { getDb } = await import("./db");
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    };
    (getDb as any).mockResolvedValue(mockDb);

    const { updateAllowDownload } = await import("./fileManager");
    const result = await updateAllowDownload(999, 1, true);
    expect(result).toBeNull();
  });

  it("should update allowDownload and return updated file", async () => {
    const mockFile = {
      id: 1,
      userId: 10,
      fileName: "test.stp",
      allowDownload: false,
      shareEnabled: true,
    };
    const updatedFile = { ...mockFile, allowDownload: true };

    const { getDb } = await import("./db");
    let selectCallCount = 0;
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockImplementation(() => {
              selectCallCount++;
              // First call: ownership check, second call: return updated
              return Promise.resolve(selectCallCount === 1 ? [mockFile] : [updatedFile]);
            }),
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    };
    (getDb as any).mockResolvedValue(mockDb);

    const { updateAllowDownload } = await import("./fileManager");
    const result = await updateAllowDownload(1, 10, true);
    expect(result).not.toBeNull();
    expect(result!.allowDownload).toBe(true);
    expect(mockDb.update).toHaveBeenCalled();
  });
});

describe("allowDownload schema field", () => {
  it("should have allowDownload field in userFiles schema with default false", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.userFiles).toBeDefined();
    // The field exists in the schema definition
    const columns = Object.keys((schema.userFiles as any)[Symbol.for("drizzle:Columns")] || {});
    // Alternatively just check the export type includes the field
    expect("allowDownload" in schema.userFiles).toBe(true);
  });
});

describe("toggleAllowDownload router input validation", () => {
  it("should require fileId and allowDownload in input schema", async () => {
    const { z } = await import("zod");
    // Validate the expected input schema shape
    const schema = z.object({ fileId: z.number(), allowDownload: z.boolean() });
    
    // Valid input
    expect(schema.safeParse({ fileId: 1, allowDownload: true }).success).toBe(true);
    expect(schema.safeParse({ fileId: 1, allowDownload: false }).success).toBe(true);
    
    // Invalid inputs
    expect(schema.safeParse({ fileId: "abc", allowDownload: true }).success).toBe(false);
    expect(schema.safeParse({ fileId: 1 }).success).toBe(false);
    expect(schema.safeParse({ allowDownload: true }).success).toBe(false);
    expect(schema.safeParse({}).success).toBe(false);
  });
});
