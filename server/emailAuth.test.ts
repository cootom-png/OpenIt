import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type CookieCall = {
  name: string;
  value: string;
  options: Record<string, unknown>;
};

type ClearedCookieCall = {
  name: string;
  options: Record<string, unknown>;
};

function createPublicContext() {
  const setCookies: CookieCall[] = [];
  const clearedCookies: ClearedCookieCall[] = [];

  const ctx: TrpcContext = {
    user: null,
    emailUser: null,
    req: {
      protocol: "https",
      headers: {},
      ip: "127.0.0.1",
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookies.push({ name, value, options });
      },
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, setCookies, clearedCookies };
}

function createEmailUserContext(emailUser: TrpcContext["emailUser"]) {
  const setCookies: CookieCall[] = [];
  const clearedCookies: ClearedCookieCall[] = [];

  const ctx: TrpcContext = {
    user: null,
    emailUser,
    req: {
      protocol: "https",
      headers: {},
      ip: "127.0.0.1",
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookies.push({ name, value, options });
      },
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, setCookies, clearedCookies };
}

describe("emailAuth", () => {
  describe("emailAuth.me", () => {
    it("returns null when not logged in", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.emailAuth.me();
      expect(result).toBeNull();
    });

    it("returns user info when logged in", async () => {
      const emailUser = {
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
      };
      const { ctx } = createEmailUserContext(emailUser);
      const caller = appRouter.createCaller(ctx);
      const result = await caller.emailAuth.me();

      expect(result).not.toBeNull();
      expect(result!.email).toBe("test@example.com");
      expect(result!.nickname).toBe("Test");
      expect(result!.status).toBe("approved");
      expect(result!.role).toBe("user");
      expect(result!.fileCount).toBe(5);
      // Should not expose passwordHash
      expect((result as any).passwordHash).toBeUndefined();
    });
  });

  describe("emailAuth.logout", () => {
    it("clears both email session and OAuth session cookies", async () => {
      const { ctx, clearedCookies } = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.emailAuth.logout();

      expect(result).toEqual({ success: true });
      expect(clearedCookies).toHaveLength(2);
      // First clears email_session
      expect(clearedCookies[0]?.name).toBe("email_session");
      expect(clearedCookies[0]?.options).toMatchObject({
        maxAge: -1,
        httpOnly: true,
        path: "/",
      });
      // Then clears OAuth app_session_id
      expect(clearedCookies[1]?.name).toBe("app_session_id");
      expect(clearedCookies[1]?.options).toMatchObject({
        maxAge: -1,
        httpOnly: true,
        path: "/",
      });
    });
  });

  describe("emailAuth.register - validation", () => {
    it("rejects empty email", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.emailAuth.register({ email: "", password: "test123", nickname: "Test" })
      ).rejects.toThrow();
    });

    it("rejects invalid email format", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.emailAuth.register({ email: "not-an-email", password: "test123", nickname: "Test" })
      ).rejects.toThrow();
    });

    it("rejects short password", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.emailAuth.register({ email: "valid@email.com", password: "12345", nickname: "Test" })
      ).rejects.toThrow();
    });

    it("rejects empty nickname", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.emailAuth.register({ email: "valid@email.com", password: "test123", nickname: "" })
      ).rejects.toThrow();
    });
  });

  describe("emailAuth.login - validation", () => {
    it("rejects empty email", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.emailAuth.login({ email: "", password: "test123" })
      ).rejects.toThrow();
    });

    it("rejects empty password", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.emailAuth.login({ email: "valid@email.com", password: "" })
      ).rejects.toThrow();
    });
  });
});

describe("adminUsers - access control", () => {
  it("denies non-admin access to user list", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.adminUsers.list({ page: 1, pageSize: 20 })
    ).rejects.toThrow();
  });

  it("denies non-admin access to user stats", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.adminUsers.stats()).rejects.toThrow();
  });

  it("denies non-admin access to approve", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.adminUsers.approve({ userId: 1 })
    ).rejects.toThrow();
  });

  it("denies non-admin access to reject", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.adminUsers.reject({ userId: 1 })
    ).rejects.toThrow();
  });

  it("denies non-admin access to delete", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.adminUsers.delete({ userId: 1 })
    ).rejects.toThrow();
  });
});
