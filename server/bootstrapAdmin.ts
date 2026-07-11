import bcrypt from "bcryptjs";
import { ENV } from "./_core/env";
import { createEmailUser, getDb, getEmailUserByEmail, updateEmailUserRole, updateEmailUserStatus } from "./db";

export async function ensureDefaultAdminAccount(): Promise<void> {
  const db = await getDb();
  if (!db) {
    return;
  }

  const username = ENV.adminUsername.trim() || "admin";
  const password = ENV.adminPassword;
  const existing = await getEmailUserByEmail(username);

  if (existing) {
    if (existing.role !== "admin") {
      await updateEmailUserRole(existing.id, "admin");
    }
    if (existing.status !== "approved") {
      await updateEmailUserStatus(existing.id, "approved");
    }
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = await createEmailUser({
    email: username,
    passwordHash,
    nickname: "Admin",
  });
  await updateEmailUserRole(userId, "admin");
  await updateEmailUserStatus(userId, "approved");
}
