import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import type { TrpcContext } from "./context";
import { validateCsrfToken } from "./csrf";

/** Tenant scoping context injected by adminProcedure. */
export type AdminContext = {
  user: User;
  /** "all" for super_admin, or an array of allowed merchant/store IDs. */
  allowedMerchantIds: string[] | "all";
};

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

/** CSRF validation middleware — only enforced on mutations. */
const requireCsrf = t.middleware(async opts => {
  const { ctx, next, type } = opts;

  if (type === "mutation") {
    if (!validateCsrfToken(ctx.req)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "CSRF validation failed" });
    }
  }

  return next({ ctx });
});

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireCsrf).use(requireUser);

const ADMIN_ROLES = new Set(["admin", "super_admin"]);

export const adminProcedure = t.procedure.use(requireCsrf).use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || !ADMIN_ROLES.has(ctx.user.role)) {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    let allowedMerchantIds: string[] | "all";

    if (ctx.user.role === "super_admin") {
      allowedMerchantIds = "all";
    } else {
      // Scoped admin — resolve assigned merchants
      allowedMerchantIds = await db.getMerchantAssignments(ctx.user.id);
      if (allowedMerchantIds.length === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No merchant assignments. Contact a super admin to get access.",
        });
      }
    }

    const adminCtx: AdminContext = {
      user: ctx.user,
      allowedMerchantIds,
    };

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
        adminCtx,
      },
    });
  }),
);
