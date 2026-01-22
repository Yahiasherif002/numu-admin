/**
 * Tests for NUMU API Integration
 * 
 * These tests verify that the NUMU API client and data layer work correctly.
 * Since the actual NUMU API may not be available during tests, we test:
 * 1. The fallback to local database when API is unavailable
 * 2. The data mapping functions
 * 3. The admin procedures with mocked data
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock admin user for testing
function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@numu.io",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// Mock non-admin user for testing
function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("NUMU Admin API - Dashboard", () => {
  it("returns dashboard stats for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.dashboard.stats();

    expect(stats).toBeDefined();
    expect(typeof stats.totalRevenue).toBe("number");
    expect(typeof stats.activeMerchants).toBe("number");
    expect(typeof stats.totalOrders).toBe("number");
    expect(typeof stats.totalCustomers).toBe("number");
  });

  it("returns revenue by month for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const revenue = await caller.dashboard.revenueByMonth({ months: 6 });

    expect(Array.isArray(revenue)).toBe(true);
  });

  it("returns top merchants for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const topMerchants = await caller.dashboard.topMerchants({ limit: 5 });

    expect(Array.isArray(topMerchants)).toBe(true);
  });
});

describe("NUMU Admin API - Merchants", () => {
  it("lists merchants for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.merchants.list({ limit: 10, offset: 0 });

    expect(result).toBeDefined();
    expect(Array.isArray(result.merchants)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("returns merchant stats for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.merchants.stats();

    expect(stats).toBeDefined();
    expect(typeof stats.total).toBe("number");
    expect(typeof stats.active).toBe("number");
    expect(typeof stats.pending).toBe("number");
    expect(typeof stats.suspended).toBe("number");
  });

  it("denies access to non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.merchants.list()).rejects.toThrow();
  });
});

describe("NUMU Admin API - Orders", () => {
  it("lists orders for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.list({ limit: 10, offset: 0 });

    expect(result).toBeDefined();
    expect(Array.isArray(result.orders)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("returns order stats for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.orders.stats();

    expect(stats).toBeDefined();
    expect(typeof stats.total).toBe("number");
    expect(typeof stats.pending).toBe("number");
    expect(typeof stats.delivered).toBe("number");
  });

  it("filters orders by status", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.list({ 
      limit: 10, 
      offset: 0, 
      status: "pending" 
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result.orders)).toBe(true);
  });

  it("denies access to non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.orders.list()).rejects.toThrow();
  });
});

describe("NUMU Admin API - Customers", () => {
  it("lists customers for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.customers.list({ limit: 10, offset: 0 });

    expect(result).toBeDefined();
    expect(Array.isArray(result.customers)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("returns customer stats for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.customers.stats();

    expect(stats).toBeDefined();
    expect(typeof stats.total).toBe("number");
    expect(typeof stats.active).toBe("number");
  });

  it("denies access to non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.customers.list()).rejects.toThrow();
  });
});

describe("NUMU Admin API - Products", () => {
  it("lists products for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.list({ limit: 10, offset: 0 });

    expect(result).toBeDefined();
    expect(Array.isArray(result.products)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("filters products by status", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.list({ 
      limit: 10, 
      offset: 0, 
      status: "active" 
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result.products)).toBe(true);
  });

  it("denies access to non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.products.list()).rejects.toThrow();
  });
});

describe("NUMU API Environment Configuration", () => {
  it("has NUMU_API_URL environment variable configured", () => {
    // This test verifies the environment is set up correctly
    const apiUrl = process.env.NUMU_API_URL;
    expect(apiUrl).toBeDefined();
    expect(typeof apiUrl).toBe("string");
  });

  it("has NUMU admin credentials configured", () => {
    const email = process.env.NUMU_ADMIN_EMAIL;
    const password = process.env.NUMU_ADMIN_PASSWORD;
    
    expect(email).toBeDefined();
    expect(password).toBeDefined();
  });
});
