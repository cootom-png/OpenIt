import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  recordFileUpload, updateFileUploadPreview, getFileUploads, getFileUploadStats,
  listEmailUsers, updateEmailUserStatus, updateEmailUserRole, deleteEmailUser, getEmailUserStats,
  getEmailUserById,
  addFavorite, removeFavorite, getUserFavorites, getUserFavoriteFileIds,
} from "./db";
import { registerEmailUser, loginEmailUser, createEmailSessionToken, EMAIL_COOKIE_NAME, validatePasswordStrength, changePassword, resetPasswordWithCode } from "./emailAuth";
import {
  getUserQuota, checkQuota, uploadUserFile, listUserFiles, deleteUserFile,
  toggleFileShare, renewFileShare, getFileByShareToken,
  adminListFiles, adminDeleteFile, adminGetFileStats,
  updateEmailUserNickname, updateFileThumbnail,
  listPublic3DParts, updateAllowDownload,
  incrementViewCount, submitDownloadRequest, listDownloadRequestsByFile,
  adminListDownloadRequests, getDownloadRequestStats, updateDownloadRequestStatus,
} from "./fileManager";
import { createPasswordResetToken, getPendingResetRequests } from "./db";
import { notifyOwner } from "./_core/notification";
import crypto from "crypto";
import { TRPCError } from "@trpc/server";
import { cleanupGuestUploadRecords } from "./cleanup";
import { initTRPC } from "@trpc/server";
import type { TrpcContext } from "./_core/context";
import { archiveRouter } from "./routers/archive";

// --- Email user middleware (approved users only) ---
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
  archive: archiveRouter,
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

  // --- Email Auth ---
  emailAuth: router({
    register: publicProcedure
      .input(z.object({
        email: z.string().email("请输入有效的邮箱地址"),
        password: z.string().min(8, "密码至少 8 位").max(64, "密码最长 64 位"),
        nickname: z.string().min(1, "请输入昵称").max(50, "昵称最长 50 个字符"),
        realName: z.string().min(1, "请输入姓名").max(50, "姓名最长 50 个字符").optional(),
        company: z.string().min(1, "请输入公司名称").max(100, "公司名称最长 100 个字符").optional(),
        phone: z.string().min(1, "请输入电话号码").max(20, "电话号码最长 20 位").optional(),
      }))
      .mutation(async ({ input }) => {
        // Validate password strength
        const strength = validatePasswordStrength(input.password);
        if (!strength.ok) {
          throw new TRPCError({ code: "BAD_REQUEST", message: strength.message! });
        }
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
        realName: ctx.emailUser.realName,
        company: ctx.emailUser.company,
        phone: ctx.emailUser.phone,
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
      // Clear both email session and OAuth session cookies to ensure full logout
      ctx.res.clearCookie(EMAIL_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
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

    /** Change password (logged-in user) */
    changePassword: publicProcedure
      .input(z.object({
        oldPassword: z.string().min(1, "请输入原密码"),
        newPassword: z.string().min(8, "新密码至少 8 位").max(64),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.emailUser) throw new TRPCError({ code: "UNAUTHORIZED", message: "请先登录" });
        try {
          await changePassword(ctx.emailUser.id, input.oldPassword, input.newPassword);
          return { success: true, message: "密码修改成功" };
        } catch (error: any) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message || "密码修改失败" });
        }
      }),

    /** Request password reset (public, sends notification to admin) */
    requestPasswordReset: publicProcedure
      .input(z.object({
        email: z.string().email("请输入有效的邮箱地址"),
      }))
      .mutation(async ({ input }) => {
        // Always return success to prevent email enumeration
        try {
          const user = await import("./db").then(m => m.getEmailUserByEmail(input.email));
          if (user) {
            // Notify admin about the reset request
            await notifyOwner({
              title: "密码重置请求",
              content: `用户 ${user.nickname}（${user.email}）请求重置密码。\n请在管理后台用户管理页面为该用户生成重置码。`,
            });
          }
        } catch (err) {
          console.warn("Password reset request notification failed:", err);
        }
        return { success: true, message: "如果该邮箱已注册，管理员将收到您的重置请求。请联系管理员获取重置码。" };
      }),

    /** Reset password with code (public) */
    resetPasswordWithCode: publicProcedure
      .input(z.object({
        email: z.string().email("请输入有效的邮箱地址"),
        resetCode: z.string().min(1, "请输入重置码"),
        newPassword: z.string().min(8, "新密码至少 8 位").max(64),
      }))
      .mutation(async ({ input }) => {
        try {
          await resetPasswordWithCode(input.email, input.resetCode, input.newPassword);
          return { success: true, message: "密码重置成功，请使用新密码登录" };
        } catch (error: any) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message || "密码重置失败" });
        }
      }),
  }),

  // --- User Files (requires approved email user) ---
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

        // 服务端二次验证，防止绕过前端检测。
        const { validateFileHeader } = await import("./encryptionValidator");
        const validation = validateFileHeader(fileBuffer, input.fileExt);
        if (!validation.isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: validation.reason || "检测到文件可能已被加密软件加密，无法保存。请先解密后再上传。",
          });
        }

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
        search: z.string().optional(),
        category: z.string().optional(),
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

    /** Upload thumbnail for a file */
    uploadThumbnail: publicProcedure
      .input(z.object({
        fileId: z.number(),
        thumbnailBase64: z.string(), // base64 encoded PNG
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.emailUser) throw new TRPCError({ code: "UNAUTHORIZED", message: "请先登录" });
        const url = await updateFileThumbnail(input.fileId, ctx.emailUser.id, input.thumbnailBase64);
        if (!url) throw new TRPCError({ code: "NOT_FOUND", message: "文件不存在或无权操作" });
        return { success: true, thumbnailUrl: url };
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

    /** Renew share - reset expiry to 7 days from now */
    renewShare: publicProcedure
      .input(z.object({ fileId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.emailUser) throw new TRPCError({ code: "UNAUTHORIZED", message: "请先登录" });
        if (ctx.emailUser.status !== "approved") throw new TRPCError({ code: "FORBIDDEN", message: "账号尚未通过审核" });
        const file = await renewFileShare(input.fileId, ctx.emailUser.id);
        if (!file) throw new TRPCError({ code: "NOT_FOUND", message: "文件不存在或无权操作" });
        return { success: true, file };
      }),

    /** Toggle allow download on shared link */
    toggleAllowDownload: publicProcedure
      .input(z.object({ fileId: z.number(), allowDownload: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.emailUser) throw new TRPCError({ code: "UNAUTHORIZED", message: "请先登录" });
        if (ctx.emailUser.status !== "approved") throw new TRPCError({ code: "FORBIDDEN", message: "账号尚未通过审核" });
        const file = await updateAllowDownload(input.fileId, ctx.emailUser.id, input.allowDownload);
        if (!file) throw new TRPCError({ code: "NOT_FOUND", message: "文件不存在或无权操作" });
        return { success: true, file };
      }),
  }),

  // --- Share (public access) ---
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

  // --- Public 3D Parts Gallery ---
  partsGallery: router({
    /** Public list of 3D parts with thumbnails */
    list: publicProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(50).default(20),
        search: z.string().optional(),
        fileExt: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return listPublic3DParts(input);
      }),

    /** Increment view count for a 3D part (public, called on preview) */
    recordView: publicProcedure
      .input(z.object({ fileId: z.number() }))
      .mutation(async ({ input }) => {
        await incrementViewCount(input.fileId);
        return { success: true };
      }),

    /** Submit a download request (registered users only) */
    requestDownload: publicProcedure
      .input(z.object({
        fileId: z.number(),
        email: z.string().email("请输入有效的邮箱地址"),
        phone: z.string().min(1, "请输入电话号码").max(32),
        company: z.string().min(1, "请输入公司名称").max(256),
        realName: z.string().min(1, "请输入姓名").max(128),
        message: z.string().max(500).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.emailUser) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "请先注册或登录后再申请下载" });
        }
        const request = await submitDownloadRequest(input);
        return { success: true, request };
      }),

    /** List download requests for a specific file (file owner or admin) */
    downloadRequests: publicProcedure
      .input(z.object({
        fileId: z.number(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ input, ctx }) => {
        // Require login
        if (!ctx.emailUser) throw new TRPCError({ code: "UNAUTHORIZED", message: "请先登录" });
        // Verify ownership or admin
        if (ctx.emailUser.role !== "admin") {
          const db = (await import("./db")).getDb;
          const dbInstance = await db();
          if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
          const { userFiles } = await import("../drizzle/schema");
          const { eq, and } = await import("drizzle-orm");
          const file = await dbInstance.select().from(userFiles).where(and(eq(userFiles.id, input.fileId), eq(userFiles.userId, ctx.emailUser.id))).limit(1);
          if (!file.length) throw new TRPCError({ code: "FORBIDDEN", message: "无权查看" });
        }
        return listDownloadRequestsByFile(input.fileId, { page: input.page, pageSize: input.pageSize });
      }),

    /** Get 3D file URL for preview (public) */
    getFileUrl: publicProcedure
      .input(z.object({ fileId: z.number() }))
      .query(async ({ input }) => {
        const db = (await import("./db")).getDb;
        const dbInstance = await db();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { userFiles } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const file = await dbInstance
          .select({ id: userFiles.id, s3Url: userFiles.s3Url, fileName: userFiles.fileName, fileExt: userFiles.fileExt, category: userFiles.category })
          .from(userFiles)
          .where(eq(userFiles.id, input.fileId))
          .limit(1);
        if (!file.length || file[0].category !== "3d") {
          throw new TRPCError({ code: "NOT_FOUND", message: "文件不存在" });
        }
        return { s3Url: file[0].s3Url, fileName: file[0].fileName, fileExt: file[0].fileExt };
      }),
  }),

  // --- Favorites ---
  favorites: router({
    /** Toggle favorite on a 3D part (requires approved email user) */
    toggle: publicProcedure
      .input(z.object({ fileId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.emailUser) throw new TRPCError({ code: "UNAUTHORIZED", message: "请先登录" });
        if (ctx.emailUser.status !== "approved") throw new TRPCError({ code: "FORBIDDEN", message: "账号尚未通过审核" });
        // Check if already favorited
        const existingIds = await getUserFavoriteFileIds(ctx.emailUser.id);
        const isFavorited = existingIds.includes(input.fileId);
        if (isFavorited) {
          await removeFavorite(ctx.emailUser.id, input.fileId);
          return { favorited: false };
        } else {
          await addFavorite(ctx.emailUser.id, input.fileId);
          return { favorited: true };
        }
      }),

    /** Get user's favorite file IDs (for UI state) */
    myIds: publicProcedure
      .query(async ({ ctx }) => {
        if (!ctx.emailUser) return { ids: [] };
        const ids = await getUserFavoriteFileIds(ctx.emailUser.id);
        return { ids };
      }),

    /** Get user's favorite parts list with file details */
    myList: publicProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(50).default(20),
        search: z.string().optional(),
        category: z.string().optional(),
      }))
      .query(async ({ input, ctx }) => {
        if (!ctx.emailUser) throw new TRPCError({ code: "UNAUTHORIZED", message: "请先登录" });
        return getUserFavorites(ctx.emailUser.id, input);
      }),
  }),

  // --- Admin: User Management ---
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

    /** Generate a password reset code for a user */
    generateResetCode: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        const user = await getEmailUserById(input.userId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "用户不存在" });

        // Generate a 6-digit reset code
        const resetCode = crypto.randomInt(100000, 999999).toString();
        // Expires in 24 hours
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await createPasswordResetToken({
          userId: user.id,
          email: user.email,
          resetCode,
          expiresAt,
        });

        return {
          success: true,
          resetCode,
          email: user.email,
          nickname: user.nickname,
          expiresAt: expiresAt.toISOString(),
        };
      }),

    /** List pending password reset requests */
    pendingResetRequests: adminProcedure
      .query(async () => {
        return getPendingResetRequests();
      }),
  }),

  // --- Admin: File Management ---
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

  // --- File Upload Tracking ---
  fileUpload: router({
    record: publicProcedure
      .input(z.object({
        fileName: z.string(),
        fileExt: z.string(),
        fileSize: z.number(),
        mimeType: z.string().optional(),
        category: z.string(),
        isSupported: z.boolean(),
        isEncrypted: z.boolean().optional(),
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
        isEncrypted: z.boolean().optional(),
      }))
      .query(async ({ input }) => {
        return getFileUploads(input);
      }),

    stats: adminProcedure
      .query(async () => {
        return getFileUploadStats();
      }),
  }),

  // --- Admin: Download Requests ---
  adminDownloadRequests: router({
    list: adminProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
        status: z.string().optional(),
        search: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return adminListDownloadRequests(input);
      }),

    stats: adminProcedure.query(async () => {
      return getDownloadRequestStats();
    }),

    updateStatus: adminProcedure
      .input(z.object({
        requestId: z.number(),
        status: z.enum(["approved", "rejected"]),
      }))
      .mutation(async ({ input }) => {
        await updateDownloadRequestStatus(input.requestId, input.status);
        return { success: true };
      }),
  }),

  // --- Admin: Cleanup ---
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


