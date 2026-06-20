import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("favorites", () => {
  describe("favorites.myIds", () => {
    it("returns empty ids when not logged in", async () => {
      const caller = appRouter.createCaller({ user: null, emailUser: null, req: {} as any, res: {} as any });
      const result = await caller.favorites.myIds();
      expect(result).toEqual({ ids: [] });
    });
  });

  describe("favorites.toggle", () => {
    it("throws UNAUTHORIZED when not logged in", async () => {
      const caller = appRouter.createCaller({ user: null, emailUser: null, req: {} as any, res: {} as any });
      await expect(caller.favorites.toggle({ fileId: 1 })).rejects.toThrow("请先登录");
    });

    it("throws FORBIDDEN when user is not approved", async () => {
      const caller = appRouter.createCaller({
        user: null,
        emailUser: { id: 1, email: "test@test.com", nickname: "test", status: "pending", role: "user" } as any,
        req: {} as any,
        res: {} as any,
      });
      await expect(caller.favorites.toggle({ fileId: 1 })).rejects.toThrow("账号尚未通过审核");
    });
  });

  describe("favorites.myList", () => {
    it("throws UNAUTHORIZED when not logged in", async () => {
      const caller = appRouter.createCaller({ user: null, emailUser: null, req: {} as any, res: {} as any });
      await expect(caller.favorites.myList({ page: 1, pageSize: 20 })).rejects.toThrow("请先登录");
    });
  });
});
