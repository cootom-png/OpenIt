import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { ENV } from "./_core/env";
import { createEmailUser, getEmailUserByEmail, getEmailUserById, updateEmailUserLastSignedIn } from "./db";
import type { EmailUser } from "../drizzle/schema";

const EMAIL_COOKIE_NAME = "email_session";
const SALT_ROUNDS = 10;
const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

function getSessionSecret() {
  return new TextEncoder().encode(ENV.cookieSecret);
}

/**
 * Hash a plaintext password with bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plaintext password against a bcrypt hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Register a new email user. Returns the new user ID.
 * Throws if email already exists.
 */
export async function registerEmailUser(data: {
  email: string;
  password: string;
  nickname: string;
}): Promise<number> {
  // Check if email already exists
  const existing = await getEmailUserByEmail(data.email);
  if (existing) {
    throw new Error("该邮箱已被注册");
  }

  const passwordHash = await hashPassword(data.password);
  return createEmailUser({
    email: data.email,
    passwordHash,
    nickname: data.nickname,
  });
}

/**
 * Authenticate an email user by email + password.
 * Returns the user if successful, throws on failure.
 */
export async function loginEmailUser(email: string, password: string): Promise<EmailUser> {
  const user = await getEmailUserByEmail(email);
  if (!user) {
    throw new Error("邮箱或密码错误");
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new Error("邮箱或密码错误");
  }

  // Update last signed in
  await updateEmailUserLastSignedIn(user.id);

  return user;
}

/**
 * Create a JWT session token for an email user.
 */
export async function createEmailSessionToken(user: EmailUser): Promise<string> {
  const secretKey = getSessionSecret();
  const issuedAt = Date.now();
  const expirationSeconds = Math.floor((issuedAt + ONE_YEAR_MS) / 1000);

  return new SignJWT({
    emailUserId: user.id,
    email: user.email,
    nickname: user.nickname,
    type: "email",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);
}

/**
 * Verify an email session from the request cookie.
 * Returns the EmailUser or null.
 */
export async function verifyEmailSession(req: Request): Promise<EmailUser | null> {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const cookies = parseCookieHeader(cookieHeader);
  const token = cookies[EMAIL_COOKIE_NAME];
  if (!token) return null;

  try {
    const secretKey = getSessionSecret();
    const { payload } = await jwtVerify(token, secretKey, { algorithms: ["HS256"] });

    if (payload.type !== "email" || typeof payload.emailUserId !== "number") {
      return null;
    }

    const user = await getEmailUserById(payload.emailUserId);
    return user || null;
  } catch (error) {
    return null;
  }
}

export { EMAIL_COOKIE_NAME };
