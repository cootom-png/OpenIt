import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "test-key", url: "https://cdn.example.com/test.stp" }),
}));

// Mock db module
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

describe("incrementViewCount", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("should be exported from fileManager", async () => {
    const fm = await import("./fileManager");
    expect(typeof fm.incrementViewCount).toBe("function");
  });

  it("should not throw when database is not available", async () => {
    const { getDb } = await import("./db");
    (getDb as any).mockResolvedValue(null);

    const { incrementViewCount } = await import("./fileManager");
    // Should not throw, just return silently
    await expect(incrementViewCount(1)).resolves.toBeUndefined();
  });

  it("should call update on the database", async () => {
    const { getDb } = await import("./db");
    const mockDb = {
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    };
    (getDb as any).mockResolvedValue(mockDb);

    const { incrementViewCount } = await import("./fileManager");
    await incrementViewCount(42);
    expect(mockDb.update).toHaveBeenCalled();
  });
});

describe("submitDownloadRequest", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("should be exported from fileManager", async () => {
    const fm = await import("./fileManager");
    expect(typeof fm.submitDownloadRequest).toBe("function");
  });

  it("should throw when database is not available", async () => {
    const { getDb } = await import("./db");
    (getDb as any).mockResolvedValue(null);

    const { submitDownloadRequest } = await import("./fileManager");
    await expect(
      submitDownloadRequest({
        fileId: 1,
        email: "test@example.com",
        phone: "13800138000",
        company: "Test Corp",
        realName: "张三",
      })
    ).rejects.toThrow("Database not available");
  });

  it("should throw when file does not exist", async () => {
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

    const { submitDownloadRequest } = await import("./fileManager");
    await expect(
      submitDownloadRequest({
        fileId: 999,
        email: "test@example.com",
        phone: "13800138000",
        company: "Test Corp",
        realName: "张三",
      })
    ).rejects.toThrow("文件不存在");
  });

  it("should insert request and increment downloadRequestCount", async () => {
    const { getDb } = await import("./db");
    const mockFile = { id: 1, fileName: "part.stp" };
    const mockRequest = {
      id: 1,
      fileId: 1,
      email: "test@example.com",
      phone: "13800138000",
      company: "Test Corp",
      realName: "张三",
      message: null,
      status: "pending",
      createdAt: new Date(),
    };

    let selectCallCount = 0;
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockImplementation(() => {
              selectCallCount++;
              // First call: file existence check, second call: return created request
              return Promise.resolve(selectCallCount === 1 ? [mockFile] : [mockRequest]);
            }),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    };
    (getDb as any).mockResolvedValue(mockDb);

    const { submitDownloadRequest } = await import("./fileManager");
    const result = await submitDownloadRequest({
      fileId: 1,
      email: "test@example.com",
      phone: "13800138000",
      company: "Test Corp",
      realName: "张三",
    });

    expect(result).toEqual(mockRequest);
    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.update).toHaveBeenCalled();
  });
});

describe("adminListDownloadRequests", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("should be exported from fileManager", async () => {
    const fm = await import("./fileManager");
    expect(typeof fm.adminListDownloadRequests).toBe("function");
  });

  it("should return empty when database is not available", async () => {
    const { getDb } = await import("./db");
    (getDb as any).mockResolvedValue(null);

    const { adminListDownloadRequests } = await import("./fileManager");
    const result = await adminListDownloadRequests({ page: 1, pageSize: 20 });
    expect(result).toEqual({ records: [], total: 0 });
  });
});

describe("getDownloadRequestStats", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("should be exported from fileManager", async () => {
    const fm = await import("./fileManager");
    expect(typeof fm.getDownloadRequestStats).toBe("function");
  });

  it("should return zeros when database is not available", async () => {
    const { getDb } = await import("./db");
    (getDb as any).mockResolvedValue(null);

    const { getDownloadRequestStats } = await import("./fileManager");
    const result = await getDownloadRequestStats();
    expect(result).toEqual({ total: 0, pending: 0, approved: 0, rejected: 0 });
  });
});

describe("updateDownloadRequestStatus", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("should be exported from fileManager", async () => {
    const fm = await import("./fileManager");
    expect(typeof fm.updateDownloadRequestStatus).toBe("function");
  });

  it("should throw when database is not available", async () => {
    const { getDb } = await import("./db");
    (getDb as any).mockResolvedValue(null);

    const { updateDownloadRequestStatus } = await import("./fileManager");
    await expect(updateDownloadRequestStatus(1, "approved")).rejects.toThrow("Database not available");
  });

  it("should call update with correct status", async () => {
    const { getDb } = await import("./db");
    const mockDb = {
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    };
    (getDb as any).mockResolvedValue(mockDb);

    const { updateDownloadRequestStatus } = await import("./fileManager");
    const result = await updateDownloadRequestStatus(1, "approved");
    expect(result).toBe(true);
    expect(mockDb.update).toHaveBeenCalled();
  });
});

describe("downloadRequests schema", () => {
  it("should have downloadRequests table in schema", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.downloadRequests).toBeDefined();
  });

  it("should have viewCount and downloadRequestCount fields in userFiles", async () => {
    const schema = await import("../drizzle/schema");
    expect("viewCount" in schema.userFiles).toBe(true);
    expect("downloadRequestCount" in schema.userFiles).toBe(true);
  });
});

describe("requestDownload input validation", () => {
  it("should validate required fields", async () => {
    const { z } = await import("zod");
    const schema = z.object({
      fileId: z.number(),
      email: z.string().email(),
      phone: z.string().min(1).max(32),
      company: z.string().min(1).max(256),
      realName: z.string().min(1).max(128),
      message: z.string().max(500).optional(),
    });

    // Valid input
    expect(schema.safeParse({
      fileId: 1,
      email: "test@example.com",
      phone: "13800138000",
      company: "Test Corp",
      realName: "张三",
    }).success).toBe(true);

    // With optional message
    expect(schema.safeParse({
      fileId: 1,
      email: "test@example.com",
      phone: "13800138000",
      company: "Test Corp",
      realName: "张三",
      message: "需要用于项目评估",
    }).success).toBe(true);

    // Invalid: missing email
    expect(schema.safeParse({
      fileId: 1,
      phone: "13800138000",
      company: "Test Corp",
      realName: "张三",
    }).success).toBe(false);

    // Invalid: empty phone
    expect(schema.safeParse({
      fileId: 1,
      email: "test@example.com",
      phone: "",
      company: "Test Corp",
      realName: "张三",
    }).success).toBe(false);

    // Invalid: empty company
    expect(schema.safeParse({
      fileId: 1,
      email: "test@example.com",
      phone: "13800138000",
      company: "",
      realName: "张三",
    }).success).toBe(false);

    // Invalid: invalid email
    expect(schema.safeParse({
      fileId: 1,
      email: "not-an-email",
      phone: "13800138000",
      company: "Test Corp",
      realName: "张三",
    }).success).toBe(false);
  });
});
