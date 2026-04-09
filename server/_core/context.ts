import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User, EmailUser } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { verifyEmailSession } from "../emailAuth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  emailUser: EmailUser | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let emailUser: EmailUser | null = null;

  // Try Manus OAuth first
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // Always try email auth (user may have both OAuth and email sessions)
  try {
    emailUser = await verifyEmailSession(opts.req);
  } catch (error) {
    emailUser = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    emailUser,
  };
}
