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
import { TRPCError } from "@trpc/server";

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
    /** Register a new email user */
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
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message || "注册失败",
          });
        }
      }),

    /** Login with email and password */
    login: publicProcedure
      .input(z.object({
        email: z.string().email("请输入有效的邮箱地址"),
        password: z.string().min(1, "请输入密码"),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const user = await loginEmailUser(input.email, input.password);
          const token = await createEmailSessionToken(user);

          // Set cookie
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(EMAIL_COOKIE_NAME, token, {
            ...cookieOptions,
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
          });

          return {
            success: true,
            user: {
              id: user.id,
              email: user.email,
              nickname: user.nickname,
              status: user.status,
              role: user.role,
            },
          };
        } catch (error: any) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: error.message || "登录失败",
          });
        }
      }),

    /** Get current email user info */
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

    /** Logout email user */
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(EMAIL_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
  }),

  // ─── Admin: User Management ───
  adminUsers: router({
    /** List all email users (admin only) */
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

    /** Get user stats (admin only) */
    stats: adminProcedure.query(async () => {
      return getEmailUserStats();
    }),

    /** Approve a user (admin only) */
    approve: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        await updateEmailUserStatus(input.userId, "approved");
        return { success: true };
      }),

    /** Reject a user (admin only) */
    reject: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        await updateEmailUserStatus(input.userId, "rejected");
        return { success: true };
      }),

    /** Update user role (admin only) */
    updateRole: adminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["user", "admin"]),
      }))
      .mutation(async ({ input }) => {
        await updateEmailUserRole(input.userId, input.role);
        return { success: true };
      }),

    /** Delete a user (admin only) */
    delete: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteEmailUser(input.userId);
        return { success: true };
      }),

    /** Get single user detail (admin only) */
    getById: adminProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const user = await getEmailUserById(input.userId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "用户不存在" });
        const { passwordHash, ...safeUser } = user;
        return safeUser;
      }),
  }),

  // ─── File Upload Tracking ───
  fileUpload: router({
    /** Record a file upload event (public - no login required) */
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

    /** Update preview result for a recorded upload */
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

    /** Get upload records (admin only) */
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

    /** Get upload statistics (admin only) */
    stats: adminProcedure
      .query(async () => {
        return getFileUploadStats();
      }),
  }),
});

export type AppRouter = typeof appRouter;
