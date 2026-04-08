import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { validatePasswordStrength } from "./emailAuth";

// ─── Helpers ──────────────────────────────────────────────

function createPublicContext() {
  const setCookies: any[] = [];
  const clearedCookies: any[] = [];
  const ctx: TrpcContext = {
    user: null,
    emailUser: null,
    req: { protocol: "https", headers: {}, ip: "127.0.0.1" } as TrpcContext["req"],
    res: {
      cookie: (n: string, v: string, o: any) => setCookies.push({ name: n, value: v, options: o }),
      clearCookie: (n: string, o: any) => clearedCookies.push({ name: n, options: o }),
    } as TrpcContext["res"],
  };
  return { ctx, setCookies, clearedCookies };
}

function createEmailUserContext(overrides: Partial<NonNullable<TrpcContext["emailUser"]>> = {}) {
  const base = {
    id: 1,
    email: "test@example.com",
    passwordHash: "hashed",
    nickname: "Test",
    status: "approved" as const,
    role: "user" as const,
    fileCount: 5,
    totalFileSize: 1024,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    realName: "Test User",
    company: "Test Corp",
    phone: "13800138000",
  };
  const emailUser = { ...base, ...overrides };
  const setCookies: any[] = [];
  const clearedCookies: any[] = [];
  const ctx: TrpcContext = {
    user: null,
    emailUser,
    req: { protocol: "https", headers: {}, ip: "127.0.0.1" } as TrpcContext["req"],
    res: {
      cookie: (n: string, v: string, o: any) => setCookies.push({ name: n, value: v, options: o }),
      clearCookie: (n: string, o: any) => clearedCookies.push({ name: n, options: o }),
    } as TrpcContext["res"],
  };
  return { ctx, setCookies, clearedCookies };
}

function createAdminContext() {
  return createEmailUserContext({ role: "admin" });
}

// ─── Password Strength Validation ─────────────────────────

describe("validatePasswordStrength", () => {
  it("rejects passwords shorter than 8 characters", () => {
    expect(validatePasswordStrength("Ab1").ok).toBe(false);
    expect(validatePasswordStrength("Abc1234").ok).toBe(false);
  });

  it("rejects passwords without uppercase letters", () => {
    expect(validatePasswordStrength("abcdefg1").ok).toBe(false);
  });

  it("rejects passwords without lowercase letters", () => {
    expect(validatePasswordStrength("ABCDEFG1").ok).toBe(false);
  });

  it("rejects passwords without digits", () => {
    expect(validatePasswordStrength("Abcdefgh").ok).toBe(false);
  });

  it("accepts valid strong passwords", () => {
    expect(validatePasswordStrength("Abcdefg1").ok).toBe(true);
    expect(validatePasswordStrength("MyP@ssw0rd").ok).toBe(true);
    expect(validatePasswordStrength("Test123456").ok).toBe(true);
  });
});

// ─── Change Password ──────────────────────────────────────

describe("emailAuth.changePassword - validation", () => {
  it("rejects when not logged in", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.emailAuth.changePassword({
        currentPassword: "OldPass123",
        newPassword: "NewPass123",
      })
    ).rejects.toThrow();
  });

  it("rejects short new password", async () => {
    const { ctx } = createEmailUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.emailAuth.changePassword({
        currentPassword: "OldPass123",
        newPassword: "short",
      })
    ).rejects.toThrow();
  });

  it("rejects new password without required complexity", async () => {
    const { ctx } = createEmailUserContext();
    const caller = appRouter.createCaller(ctx);
    // No uppercase
    await expect(
      caller.emailAuth.changePassword({
        currentPassword: "OldPass123",
        newPassword: "alllowercase1",
      })
    ).rejects.toThrow();
  });
});

// ─── Request Password Reset ───────────────────────────────

describe("emailAuth.requestPasswordReset - validation", () => {
  it("rejects invalid email format", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.emailAuth.requestPasswordReset({ email: "not-an-email" })
    ).rejects.toThrow();
  });

  it("accepts valid email and returns success (even if email not found)", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    // Should not reveal whether email exists
    const result = await caller.emailAuth.requestPasswordReset({
      email: "nonexistent@example.com",
    });
    expect(result.success).toBe(true);
  });
});

// ─── Reset Password With Code ─────────────────────────────

describe("emailAuth.resetPasswordWithCode - validation", () => {
  it("rejects invalid email format", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.emailAuth.resetPasswordWithCode({
        email: "bad-email",
        resetCode: "123456",
        newPassword: "NewPass123",
      })
    ).rejects.toThrow();
  });

  it("rejects empty reset code", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.emailAuth.resetPasswordWithCode({
        email: "test@example.com",
        resetCode: "",
        newPassword: "NewPass123",
      })
    ).rejects.toThrow();
  });

  it("rejects short new password", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.emailAuth.resetPasswordWithCode({
        email: "test@example.com",
        resetCode: "123456",
        newPassword: "short",
      })
    ).rejects.toThrow();
  });
});

// ─── Admin Reset Code Generation ──────────────────────────

describe("adminUsers.generateResetCode - access control", () => {
  it("denies non-admin access", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.adminUsers.generateResetCode({ userId: 1 })
    ).rejects.toThrow();
  });

  it("denies regular user access", async () => {
    const { ctx } = createEmailUserContext({ role: "user" });
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.adminUsers.generateResetCode({ userId: 1 })
    ).rejects.toThrow();
  });
});

describe("adminUsers.pendingResetRequests - access control", () => {
  it("denies non-admin access", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.adminUsers.pendingResetRequests()).rejects.toThrow();
  });
});

// ─── 3D Parts Gallery ─────────────────────────────────────

describe("partsGallery", () => {
  describe("partsGallery.list", () => {
    it("is accessible without login (public)", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.partsGallery.list({ page: 1, pageSize: 20 });
      expect(result).toBeDefined();
      expect(result).toHaveProperty("records");
      expect(result).toHaveProperty("total");
      expect(Array.isArray(result.records)).toBe(true);
    });

    it("validates page parameter", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.partsGallery.list({ page: 0, pageSize: 20 })
      ).rejects.toThrow();
    });

    it("validates pageSize parameter", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.partsGallery.list({ page: 1, pageSize: 100 })
      ).rejects.toThrow();
    });
  });

  describe("partsGallery.getFileUrl", () => {
    it("denies access when not logged in", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.partsGallery.getFileUrl({ fileId: 1 })
      ).rejects.toThrow("请先登录");
    });

    it("denies access for pending users", async () => {
      const { ctx } = createEmailUserContext({ status: "pending" });
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.partsGallery.getFileUrl({ fileId: 1 })
      ).rejects.toThrow("账号尚未通过审核");
    });

    it("denies access for rejected users", async () => {
      const { ctx } = createEmailUserContext({ status: "rejected" });
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.partsGallery.getFileUrl({ fileId: 1 })
      ).rejects.toThrow("账号尚未通过审核");
    });
  });
});

// ─── Register with new fields ─────────────────────────────

describe("emailAuth.register - new fields validation", () => {
  it("accepts registration with all new fields", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    // This will fail at DB level but validates input schema accepts new fields
    try {
      await caller.emailAuth.register({
        email: "newuser@example.com",
        password: "TestPass123",
        nickname: "New User",
        realName: "张三",
        company: "测试公司",
        phone: "13800138000",
      });
    } catch (err: any) {
      // Should not be a validation error - it should be a DB error or duplicate email
      expect(err.message).not.toContain("Expected");
    }
  });

  it("accepts registration without optional fields", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.emailAuth.register({
        email: "newuser2@example.com",
        password: "TestPass123",
        nickname: "New User 2",
      });
    } catch (err: any) {
      // Should not be a validation error
      expect(err.message).not.toContain("Expected");
    }
  });
});

// ─── emailAuth.me returns new fields ──────────────────────

describe("emailAuth.me - new fields", () => {
  it("returns realName, company, phone when logged in", async () => {
    const { ctx } = createEmailUserContext({
      realName: "张三",
      company: "测试公司",
      phone: "13800138000",
    });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.emailAuth.me();
    expect(result).not.toBeNull();
    expect(result!.realName).toBe("张三");
    expect(result!.company).toBe("测试公司");
    expect(result!.phone).toBe("13800138000");
  });
});
