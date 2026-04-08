import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  recordFileUpload, updateFileUploadPreview, getFileUploads, getFileUploadStats,
  listEmailUsers, updateEmailUserStatus, updateEmailUserRole, deleteEmailUser, getEmailUserStats,
  getEmailUserById,
} from "./db";
import { registerEmailUser, loginEmailUser, createEmailSessionToken, EMAIL_COOKIE_NAME } from "./emailAuth";
import {
  getUserQuota, checkQuota, uploadUserFile, listUserFiles, deleteUserFile,
  toggleFileShare, getFileByShareToken,
  adminListFiles, adminDeleteFile, adminGetFileStats,
  updateEmailUserNickname,
} from "./fileManager";
import { TRPCError } from "@trpc/server";
import { cleanupGuestUploadRecords } from "./cleanup";
import { initTRPC } from "@trpc/server";
import type { TrpcContext } from "./_core/context";

// ─── Email user middleware (approved users only) ───
const t = initTRPC.context<TrpcContext>().create();

const requireApprovedEmailUser = t.middleware(async ({ ctx, next }) => {
  if (!ctx.emailUser) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "请先登录" });
  }
  if (ctx.emailUser.status !== "approved") {
    throw new TRPCError({ code: "FORBIDDEN", message: "账号尚未通过审核" });
  }
  return next({ ctx: { ...ctx, emailUser: ctx.emailUser } });
});

// We can't use the t.procedure from the local initTRPC since routers use the one from _core/trpc.
// Instead, we'll inline the check in each procedure.

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ─── Email Auth ───
  emailAuth: router({
    register: publicProcedure
      .input(z.object({
        email: z.string().email("请输入有效的邮箱地址"),
        password: z.string().min(6, "密码至少6位").max(64, "密码最长64位"),
        nickname: z.string().min(1, "请输入昵称").max(50, "昵称最长50个字符"),
      }))
      .mutation(async ({ input }) => {
        try {
          const userId = await registerEmailUser(input);
          return { success: true, message: "注册成功，请等待管理员审核", userId };
        } catch (error: any) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message || "注册失败" });
        }
      }),

    login: publicProcedure
      .input(z.object({
        email: z.string().email("请输入有效的邮箱地址"),
        password: z.string().min(1, "请输入密码"),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const user = await loginEmailUser(input.email, input.password);
          const token = await createEmailSessionToken(user);
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(EMAIL_COOKIE_NAME, token, {
            ...cookieOptions,
            maxAge: 1000 * 60 * 60 * 24 * 365,
          });
          return {
            success: true,
            user: { id: user.id, email: user.email, nickname: user.nickname, status: user.status, role: user.role },
          };
        } catch (error: any) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: error.message || "登录失败" });
        }
      }),

    me: publicProcedure.query(({ ctx }) => {
      if (!ctx.emailUser) return null;
      return {
        id: ctx.emailUser.id,
        email: ctx.emailUser.email,
        nickname: ctx.emailUser.nickname,
        status: ctx.emailUser.status,
        role: ctx.emailUser.role,
        fileCount: ctx.emailUser.fileCount,
        totalFileSize: ctx.emailUser.totalFileSize,
        createdAt: ctx.emailUser.createdAt,
        lastSignedIn: ctx.emailUser.lastSignedIn,
      };
    }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(EMAIL_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),

    /** Update nickname */
    updateNickname: publicProcedure
      .input(z.object({ nickname: z.string().min(1).max(50) }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.emailUser) throw new TRPCError({ code: "UNAUTHORIZED", message: "请先登录" });
        await updateEmailUserNickname(ctx.emailUser.id, input.nickname);
        return { success: true };
      }),
  }),

  // ─── User Files (requires approved email user) ───
  userFiles: router({
    /** Get current user's quota */
    quota: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.emailUser) return null;
      return getUserQuota(ctx.emailUser.id);
    }),

    /** Upload a file (approved users only) */
    upload: publicProcedure
      .input(z.object({
        fileName: z.string(),
        fileExt: z.string(),
        fileSize: z.number(),
        mimeType: z.string().optional(),
        category: z.string(),
        fileBase64: z.string(), // base64 encoded file content
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.emailUser) throw new TRPCError({ code: "UNAUTHORIZED", message: "请先登录" });
        if (ctx.emailUser.status !== "approved") throw new TRPCError({ code: "FORBIDDEN", message: "账号尚未通过审核，无法保存文件" });

        // Check quota
        const quota = await getUserQuota(ctx.emailUser.id);
        const check = checkQuota(quota, input.fileSize);
        if (!check.ok) {
          throw new TRPCError({ code: "BAD_REQUEST", message: check.reason! });
        }

        // Decode base64
        const fileBuffer = Buffer.from(input.fileBase64, "base64");

        const file = await uploadUserFile({
          userId: ctx.emailUser.id,
          fileName: input.fileName,
          fileExt: input.fileExt,
          fileSize: input.fileSize,
          mimeType: input.mimeType || "application/octet-stream",
          category: input.category,
          fileBuffer,
        });

        return { success: true, file };
      }),

    /** List current user's files */
    list: publicProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ input, ctx }) => {
        if (!ctx.emailUser) return { records: [], total: 0 };
        return listUserFiles(ctx.emailUser.id, input);
      }),

    /** Delete a file */
    delete: publicProcedure
      .input(z.object({ fileId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.emailUser) throw new TRPCError({ code: "UNAUTHORIZED", message: "请先登录" });
        const ok = await deleteUserFile(input.fileId, ctx.emailUser.id);
        if (!ok) throw new TRPCError({ code: "NOT_FOUND", message: "文件不存在或无权删除" });
        return { success: true };
      }),

    /** Toggle file sharing */
    toggleShare: publicProcedure
      .input(z.object({ fileId: z.number(), enabled: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.emailUser) throw new TRPCError({ code: "UNAUTHORIZED", message: "请先登录" });
        if (ctx.emailUser.status !== "approved") throw new TRPCError({ code: "FORBIDDEN", message: "账号尚未通过审核" });
        const file = await toggleFileShare(input.fileId, ctx.emailUser.id, input.enabled);
        if (!file) throw new TRPCError({ code: "NOT_FOUND", message: "文件不存在或无权操作" });
        return { success: true, file };
      }),
  }),

  // ─── Share (public access) ───
  share: router({
    /** Get shared file by token */
    getByToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const file = await getFileByShareToken(input.token);
        if (!file) throw new TRPCError({ code: "NOT_FOUND", message: "分享链接无效或已关闭" });
        return file;
      }),
  }),

  // ─── Admin: User Management ───
  adminUsers: router({
    list: adminProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
        status: z.enum(["pending", "approved", "rejected"]).optional(),
        search: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return listEmailUsers(input);
      }),

    stats: adminProcedure.query(async () => {
      return getEmailUserStats();
    }),

    approve: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        await updateEmailUserStatus(input.userId, "approved");
        return { success: true };
      }),

    reject: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        await updateEmailUserStatus(input.userId, "rejected");
        return { success: true };
      }),

    updateRole: adminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["user", "admin"]),
      }))
      .mutation(async ({ input }) => {
        await updateEmailUserRole(input.userId, input.role);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteEmailUser(input.userId);
        return { success: true };
      }),

    getById: adminProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const user = await getEmailUserById(input.userId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "用户不存在" });
        const { passwordHash, ...safeUser } = user;
        return safeUser;
      }),
  }),

  // ─── Admin: File Management ───
  adminFiles: router({
    list: adminProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        userId: z.number().optional(),
        category: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return adminListFiles(input);
      }),

    stats: adminProcedure.query(async () => {
      return adminGetFileStats();
    }),

    delete: adminProcedure
      .input(z.object({ fileId: z.number() }))
      .mutation(async ({ input }) => {
        const ok = await adminDeleteFile(input.fileId);
        if (!ok) throw new TRPCError({ code: "NOT_FOUND", message: "文件不存在" });
        return { success: true };
      }),
  }),

  // ─── File Upload Tracking ───
  fileUpload: router({
    record: publicProcedure
      .input(z.object({
        fileName: z.string(),
        fileExt: z.string(),
        fileSize: z.number(),
        mimeType: z.string().optional(),
        category: z.string(),
        isSupported: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        const userAgent = ctx.req.headers["user-agent"] || "";
        const ipAddress = (ctx.req.headers["x-forwarded-for"] as string || ctx.req.ip || "").split(",")[0].trim();
        const result = await recordFileUpload({
          ...input,
          userAgent,
          ipAddress,
          userId: ctx.user?.id || null,
          userName: ctx.user?.name || null,
        });
        return { success: true };
      }),

    updatePreview: publicProcedure
      .input(z.object({
        fileName: z.string(),
        fileExt: z.string(),
        previewSuccess: z.boolean(),
        errorMessage: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return { success: true };
      }),

    list: adminProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
        category: z.string().optional(),
        isSupported: z.boolean().optional(),
      }))
      .query(async ({ input }) => {
        return getFileUploads(input);
      }),

    stats: adminProcedure
      .query(async () => {
        return getFileUploadStats();
      }),
  }),

  // ─── Admin: Cleanup ───
  adminCleanup: router({
    /** Manually trigger guest upload records cleanup */
    runGuestCleanup: adminProcedure
      .input(z.object({
        olderThanDays: z.number().min(1).max(365).default(7),
      }))
      .mutation(async ({ input }) => {
        const result = await cleanupGuestUploadRecords(input.olderThanDays);
        return result;
      }),
  }),
});

export type AppRouter = typeof appRouter;
