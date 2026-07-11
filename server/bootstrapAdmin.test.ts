import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  getDb: vi.fn(),
  getEmailUserByEmail: vi.fn(),
  createEmailUser: vi.fn(),
  updateEmailUserRole: vi.fn(),
  updateEmailUserStatus: vi.fn(),
}));

vi.mock("./_core/env", () => ({
  ENV: {
    adminUsername: "admin",
    adminPassword: "Admin123456789",
  },
}));

describe("ensureDefaultAdminAccount", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("creates the default admin account when missing", async () => {
    const db = await import("./db");
    (db.getDb as any).mockResolvedValue({});
    (db.getEmailUserByEmail as any).mockResolvedValue(null);
    (db.createEmailUser as any).mockResolvedValue(42);

    const { ensureDefaultAdminAccount } = await import("./bootstrapAdmin");
    await ensureDefaultAdminAccount();

    expect(db.createEmailUser).toHaveBeenCalledWith({
      email: "admin",
      passwordHash: expect.any(String),
      nickname: "Admin",
    });
    expect(db.updateEmailUserRole).toHaveBeenCalledWith(42, "admin");
    expect(db.updateEmailUserStatus).toHaveBeenCalledWith(42, "approved");
  });

  it("upgrades an existing default account to admin and approved", async () => {
    const db = await import("./db");
    (db.getDb as any).mockResolvedValue({});
    (db.getEmailUserByEmail as any).mockResolvedValue({
      id: 7,
      role: "user",
      status: "pending",
      email: "admin",
    });
    (db.createEmailUser as any).mockResolvedValue(7);

    const { ensureDefaultAdminAccount } = await import("./bootstrapAdmin");
    await ensureDefaultAdminAccount();

    expect(db.createEmailUser).toHaveBeenCalled();
    expect(db.updateEmailUserRole).toHaveBeenCalledWith(7, "admin");
    expect(db.updateEmailUserStatus).toHaveBeenCalledWith(7, "approved");
  });
});
