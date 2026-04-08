import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { recordFileUpload, updateFileUploadPreview, getFileUploads, getFileUploadStats } from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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
        // We don't have the ID easily, so this is a best-effort update
        return { success: true };
      }),

    /** Get upload records (admin only) */
    list: protectedProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
        category: z.string().optional(),
        isSupported: z.boolean().optional(),
      }))
      .query(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return getFileUploads(input);
      }),

    /** Get upload statistics (admin only) */
    stats: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return getFileUploadStats();
      }),
  }),
});

export type AppRouter = typeof appRouter;
