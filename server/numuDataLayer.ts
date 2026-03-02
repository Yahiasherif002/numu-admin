/**
 * NUMU Data Layer
 *
 * Provides a unified data layer that fetches all data from the NUMU backend API.
 * Handles authentication, caching, error propagation, and tenant scoping.
 *
 * Every data function accepts a `scope` parameter:
 *   - "all"       → super_admin, no filtering
 *   - string[]    → scoped admin, only return data for these merchant/store IDs
 */

import { TRPCError } from "@trpc/server";
import { numuApi, NuMUProduct, NuMUCustomer, NuMUOrder } from "./numuApi";

// ============================================================================
// Tenant Scoping Helpers
// ============================================================================

export type ScopeFilter = string[] | "all";

function isAllowed(merchantId: string, scope: ScopeFilter): boolean {
  return scope === "all" || scope.includes(merchantId);
}

/**
 * Returns a single store_id to pass to the API when the scope is exactly 1 store,
 * or undefined when the scope is "all" or multi-store (in which case we filter in-memory).
 */
function singleStoreId(scope: ScopeFilter): string | undefined {
  return Array.isArray(scope) && scope.length === 1 ? scope[0] : undefined;
}

/**
 * Fetches all pages from a paginated NUMU API endpoint.
 * Used by scoped-admin stats to avoid the 200-item cap.
 * Caps at MAX_PAGES to prevent runaway requests.
 */
const MAX_PAGES = 10;
const PAGE_SIZE = 100;

async function fetchAllPages<T>(
  fetcher: (page: number, limit: number) => Promise<{ items: T[]; total: number; total_pages: number }>,
): Promise<T[]> {
  const first = await fetcher(1, PAGE_SIZE);
  const all = [...first.items];
  const pages = Math.min(first.total_pages, MAX_PAGES);

  if (pages > 1) {
    const rest = await Promise.all(
      Array.from({ length: pages - 1 }, (_, i) => fetcher(i + 2, PAGE_SIZE))
    );
    for (const r of rest) all.push(...r.items);
  }

  return all;
}

// ============================================================================
// API Auth / Availability (unchanged)
// ============================================================================

let apiAvailable: boolean | null = null;
let lastApiCheck = 0;
const API_CHECK_INTERVAL = 60000;
let adminTokenExpiry = 0;

async function isApiAvailable(): Promise<boolean> {
  const now = Date.now();
  if (apiAvailable !== null && now - lastApiCheck < API_CHECK_INTERVAL) {
    return apiAvailable;
  }
  try {
    apiAvailable = await numuApi.healthCheck();
    lastApiCheck = now;
    if (apiAvailable) console.log("[NUMU Data Layer] API is available");
    else console.warn("[NUMU Data Layer] API is not available");
    return apiAvailable;
  } catch {
    apiAvailable = false;
    lastApiCheck = now;
    console.warn("[NUMU Data Layer] API check failed");
    return false;
  }
}

async function ensureAuthenticated(): Promise<boolean> {
  const now = Date.now();
  if (adminTokenExpiry > now) return true;

  const email = process.env.NUMU_ADMIN_EMAIL;
  const password = process.env.NUMU_ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("[NUMU Data Layer] Admin credentials not configured");
    return false;
  }

  try {
    await numuApi.authenticate(email, password);
    adminTokenExpiry = now + 3600000;
    console.log("[NUMU Data Layer] Admin authentication successful");
    return true;
  } catch (error) {
    console.error("[NUMU Data Layer] Admin authentication failed:", error);
    return false;
  }
}

async function requireApi(): Promise<void> {
  if (!(await isApiAvailable())) throw new Error("NUMU API is not available");
  if (!(await ensureAuthenticated())) throw new Error("NUMU API authentication failed");
}

// ============================================================================
// Merchants (Stores in NUMU API)
// ============================================================================

export interface Merchant {
  id: number;
  merchantId: string;
  name: string;
  email: string;
  domain: string | null;
  logoUrl: string | null;
  plan: string;
  status: "active" | "pending_approval" | "suspended" | "inactive";
  country: string | null;
  category: string | null;
  totalRevenue: number | null;
  totalOrders: number | null;
  totalProducts: number | null;
  settings: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export async function getMerchants(
  params: { limit?: number; offset?: number; status?: string; search?: string },
  scope: ScopeFilter,
): Promise<{ merchants: Merchant[]; total: number }> {
  await requireApi();

  const page = Math.floor((params.offset || 0) / (params.limit || 20)) + 1;
  const result = await numuApi.listStoresAdmin({
    page,
    limit: params.limit,
    status: params.status,
    search: params.search,
  });

  let items = result.items.map((store, index) => ({
    id: (page - 1) * (params.limit || 20) + index + 1,
    merchantId: store.id,
    name: store.name,
    email: store.owner_email || `contact@${store.subdomain || store.slug}.com`,
    domain: store.subdomain ? `${store.subdomain}.numu.io` : null,
    logoUrl: store.logo_url,
    plan: store.plan || "free",
    status: store.status as Merchant["status"],
    country: null,
    category: null,
    totalRevenue: store.total_revenue ?? 0,
    totalOrders: store.total_orders ?? 0,
    totalProducts: 0,
    settings: null,
    createdAt: new Date(store.created_at),
    updatedAt: new Date(store.created_at),
  }));

  if (scope !== "all") {
    items = items.filter((m) => isAllowed(m.merchantId, scope));
  }

  return { merchants: items, total: scope === "all" ? result.total : items.length };
}

export async function getMerchantById(
  merchantId: string,
  scope: ScopeFilter,
): Promise<Merchant | null> {
  if (!isAllowed(merchantId, scope)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Access denied to this merchant" });
  }
  await requireApi();
  return null;
}

export async function updateMerchantStatus(
  merchantId: string,
  status: string,
  scope: ScopeFilter,
  reason?: string,
): Promise<boolean> {
  if (!isAllowed(merchantId, scope)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Access denied to this merchant" });
  }
  await requireApi();
  await numuApi.updateStoreStatus(merchantId, status, reason);
  return true;
}

export async function getMerchantStats(
  scope: ScopeFilter,
): Promise<{
  total: number;
  active: number;
  pending_approval: number;
  suspended: number;
  inactive: number;
}> {
  await requireApi();

  if (scope === "all") {
    return numuApi.getStoreStats();
  }

  // Scoped admin: fetch all stores and compute stats from their visible subset
  const allStores = await fetchAllPages((page, limit) => numuApi.listStoresAdmin({ page, limit }));
  const visible = allStores.filter((s) => isAllowed(s.id, scope));

  const stats = { total: 0, active: 0, pending_approval: 0, suspended: 0, inactive: 0 };
  for (const s of visible) {
    stats.total++;
    const st = s.status as keyof typeof stats;
    if (st in stats) stats[st]++;
  }
  return stats;
}

// ============================================================================
// Orders
// ============================================================================

export interface Order {
  id: number;
  orderId: string;
  merchantId: string;
  customerId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  paymentStatus: string;
  subtotal: number;
  tax: number | null;
  shipping: number | null;
  discount: number | null;
  total: number;
  currency: string | null;
  shippingAddress: unknown;
  billingAddress: unknown;
  items: unknown;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function mapNuMUOrder(order: NuMUOrder, index: number): Order {
  return {
    id: index + 1,
    orderId: order.id,
    merchantId: order.tenant_id || order.store_id,
    customerId: order.customer_id,
    customerName:
      order.customer_name ??
      (order.customer
        ? `${order.customer.first_name} ${order.customer.last_name}`
        : null),
    customerEmail: order.customer_email ?? order.customer?.email ?? null,
    status: order.status as Order["status"],
    paymentStatus: order.payment_status,
    subtotal: order.subtotal ?? 0,
    tax: order.tax_amount ?? 0,
    shipping: order.shipping_cost ?? 0,
    discount: order.discount_amount ?? 0,
    total: order.total,
    currency: order.currency,
    shippingAddress: order.shipping_address ?? null,
    billingAddress: order.billing_address ?? null,
    items: order.line_items ?? null,
    notes: order.notes ?? null,
    createdAt: new Date(order.created_at),
    updatedAt: new Date(order.updated_at),
  };
}

export async function getOrders(
  params: {
    limit?: number;
    offset?: number;
    status?: string;
    merchantId?: string;
    search?: string;
    startDate?: Date;
    endDate?: Date;
  },
  scope: ScopeFilter,
): Promise<{ orders: Order[]; total: number }> {
  await requireApi();

  const page = Math.floor((params.offset || 0) / (params.limit || 20)) + 1;
  const storeId = singleStoreId(scope);

  const result = await numuApi.listOrders({
    page,
    limit: params.limit,
    status: params.status,
    search: params.search,
    store_id: storeId,
  });

  let mapped = result.items.map(mapNuMUOrder);

  // Multi-store scoped admin: filter in-memory
  if (scope !== "all" && !storeId) {
    mapped = mapped.filter((o) => isAllowed(o.merchantId, scope));
  }

  return { orders: mapped, total: scope === "all" || storeId ? result.total : mapped.length };
}

export async function getOrderById(
  orderId: string,
  scope: ScopeFilter,
): Promise<Order | null> {
  await requireApi();
  const order = await numuApi.getOrder(orderId);
  const mapped = mapNuMUOrder(order, 0);

  if (!isAllowed(mapped.merchantId, scope)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Access denied to this order" });
  }

  return mapped;
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  scope: ScopeFilter,
): Promise<boolean> {
  // Verify ownership before mutating
  await getOrderById(orderId, scope);
  await numuApi.updateOrderStatus(orderId, status);
  return true;
}

export async function getOrderStats(
  scope: ScopeFilter,
): Promise<{
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}> {
  await requireApi();

  const storeId = singleStoreId(scope);
  const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
  const counts: Record<string, number> = {};

  const [allResult, ...statusResults] = await Promise.all([
    numuApi.listOrders({ page: 1, limit: 1, store_id: storeId }),
    ...statuses.map((s) => numuApi.listOrders({ status: s, page: 1, limit: 1, store_id: storeId })),
  ]);
  let total = allResult.total;

  statuses.forEach((s, i) => {
    counts[s] = statusResults[i].total;
  });

  // Multi-store scoped admin: fetch all orders and count from the filtered set
  if (scope !== "all" && !storeId) {
    const allOrders = await fetchAllPages((page, limit) => numuApi.listOrders({ page, limit }));
    const filtered = allOrders
      .map(mapNuMUOrder)
      .filter((o) => isAllowed(o.merchantId, scope));

    total = filtered.length;
    for (const s of statuses) counts[s] = 0;
    for (const o of filtered) {
      if (o.status in counts) counts[o.status]++;
    }
  }

  return {
    total,
    pending: counts.pending || 0,
    processing: counts.processing || 0,
    shipped: counts.shipped || 0,
    delivered: counts.delivered || 0,
    cancelled: counts.cancelled || 0,
  };
}

// ============================================================================
// Customers
// ============================================================================

export interface Customer {
  id: number;
  customerId: string;
  merchantId: string;
  name: string | null;
  email: string;
  phone: string | null;
  status: "active" | "inactive";
  totalOrders: number | null;
  totalSpent: number | null;
  defaultAddress: unknown;
  tags: unknown;
  createdAt: Date;
  updatedAt: Date;
}

function mapNuMUCustomer(customer: NuMUCustomer, index: number): Customer {
  return {
    id: index + 1,
    customerId: customer.id,
    merchantId: customer.tenant_id || customer.store_id,
    name: `${customer.first_name} ${customer.last_name}`,
    email: customer.email,
    phone: customer.phone,
    status: "active",
    totalOrders: customer.total_orders,
    totalSpent: customer.total_spent,
    defaultAddress: null,
    tags: customer.tags,
    createdAt: new Date(customer.created_at),
    updatedAt: new Date(customer.updated_at),
  };
}

export async function getCustomers(
  params: { limit?: number; offset?: number; merchantId?: string; search?: string },
  scope: ScopeFilter,
): Promise<{ customers: Customer[]; total: number }> {
  await requireApi();

  const page = Math.floor((params.offset || 0) / (params.limit || 20)) + 1;
  const storeId = singleStoreId(scope);

  const result = await numuApi.listCustomers({
    page,
    limit: params.limit,
    search: params.search,
    store_id: storeId,
  });

  let mapped = result.items.map(mapNuMUCustomer);

  if (scope !== "all" && !storeId) {
    mapped = mapped.filter((c) => isAllowed(c.merchantId, scope));
  }

  return {
    customers: mapped,
    total: scope === "all" || storeId ? result.total : mapped.length,
  };
}

export async function getCustomerStats(
  scope: ScopeFilter,
): Promise<{ total: number; active: number }> {
  await requireApi();

  const storeId = singleStoreId(scope);

  if (scope === "all" || storeId) {
    const result = await numuApi.listCustomers({ page: 1, limit: 1, store_id: storeId });
    return { total: result.total, active: result.total };
  }

  // Multi-store scoped admin: paginate all customers and filter
  const allCustomers = await fetchAllPages((page, limit) => numuApi.listCustomers({ page, limit }));
  const filtered = allCustomers
    .map(mapNuMUCustomer)
    .filter((c) => isAllowed(c.merchantId, scope));
  return { total: filtered.length, active: filtered.length };
}

// ============================================================================
// Products
// ============================================================================

export interface Product {
  id: number;
  productId: string;
  merchantId: string;
  name: string;
  description: string | null;
  sku: string | null;
  price: number;
  compareAtPrice: number | null;
  costPerItem: number | null;
  currency: string | null;
  status: "active" | "draft" | "archived";
  inventory: number | null;
  category: string | null;
  images: unknown;
  variants: unknown;
  tags: unknown;
  totalSales: number | null;
  createdAt: Date;
  updatedAt: Date;
}

function mapNuMUProduct(product: NuMUProduct, index: number): Product {
  return {
    id: index + 1,
    productId: product.id,
    merchantId: product.tenant_id || product.store_id,
    name: product.name,
    description: product.description,
    sku: product.sku,
    price: product.price_amount,
    compareAtPrice: product.compare_at_price,
    costPerItem: product.cost_price,
    currency: product.price_currency,
    status: product.status as Product["status"],
    inventory: product.quantity,
    category: null,
    images: product.images,
    variants: null,
    tags: product.tags,
    totalSales: 0,
    createdAt: new Date(product.created_at),
    updatedAt: new Date(product.updated_at),
  };
}

export async function getProducts(
  params: { limit?: number; offset?: number; merchantId?: string; status?: string; search?: string },
  scope: ScopeFilter,
): Promise<{ products: Product[]; total: number }> {
  await requireApi();

  const page = Math.floor((params.offset || 0) / (params.limit || 20)) + 1;
  const storeId = singleStoreId(scope);

  const result = await numuApi.listProducts({
    page,
    limit: params.limit,
    status: params.status,
    search: params.search,
    store_id: storeId,
  });

  let mapped = result.items.map(mapNuMUProduct);

  if (scope !== "all" && !storeId) {
    mapped = mapped.filter((p) => isAllowed(p.merchantId, scope));
  }

  return {
    products: mapped,
    total: scope === "all" || storeId ? result.total : mapped.length,
  };
}

// ============================================================================
// Dashboard Stats
// ============================================================================

export async function getDashboardStats(
  scope: ScopeFilter,
): Promise<{
  totalRevenue: number;
  activeMerchants: number;
  totalOrders: number;
  totalCustomers: number;
  revenueChange: number;
  merchantsChange: number;
  ordersChange: number;
  customersChange: number;
}> {
  await requireApi();

  if (scope === "all") {
    return numuApi.getDashboardStats();
  }

  // Scoped admin: fetch all data and aggregate from the filtered subset
  const [allStores, allOrders, allCustomers] = await Promise.all([
    fetchAllPages((page, limit) => numuApi.listStoresAdmin({ page, limit })),
    fetchAllPages((page, limit) => numuApi.listOrders({ page, limit })),
    fetchAllPages((page, limit) => numuApi.listCustomers({ page, limit })),
  ]);

  const visibleStores = allStores.filter((s) => isAllowed(s.id, scope));
  const visibleOrders = allOrders.map(mapNuMUOrder).filter((o) => isAllowed(o.merchantId, scope));
  const visibleCustomers = allCustomers.map(mapNuMUCustomer).filter((c) => isAllowed(c.merchantId, scope));

  const totalRevenue = visibleOrders.reduce((sum, o) => sum + o.total, 0);

  return {
    totalRevenue,
    activeMerchants: visibleStores.filter((s) => s.status === "active").length,
    totalOrders: visibleOrders.length,
    totalCustomers: visibleCustomers.length,
    revenueChange: 0,
    merchantsChange: 0,
    ordersChange: 0,
    customersChange: 0,
  };
}

// ============================================================================
// Dashboard helpers (computed from API data)
// ============================================================================

export async function getRevenueByMonth(
  _months: number = 12,
  _scope: ScopeFilter = "all",
): Promise<{ month: string; revenue: number }[]> {
  // Not available from the API yet
  return [];
}

export async function getTopMerchants(
  _limit: number = 5,
  _scope: ScopeFilter = "all",
): Promise<{ name: string; revenue: number }[]> {
  // Not available from the API yet
  return [];
}

export async function getRecentOrders(
  limit: number = 10,
  scope: ScopeFilter = "all",
): Promise<Order[]> {
  await requireApi();

  const storeId = singleStoreId(scope);
  const result = await numuApi.listOrders({ page: 1, limit, store_id: storeId });
  let mapped = result.items.map(mapNuMUOrder);

  if (scope !== "all" && !storeId) {
    mapped = mapped.filter((o) => isAllowed(o.merchantId, scope));
  }

  return mapped;
}

// ============================================================================
// Landing Page Config (platform-wide, no tenant scoping)
// ============================================================================

export async function getLandingConfig() {
  if (!(await isApiAvailable()) || !(await ensureAuthenticated())) {
    return {
      sections: {
        hero: { visible: true, order: 0 },
        preview: { visible: true, order: 1 },
        features: { visible: true, order: 2 },
        "import-showcase": { visible: true, order: 3 },
        "ai-showcase": { visible: true, order: 4 },
        "multichannel-showcase": { visible: true, order: 5 },
        integrations: { visible: true, order: 6 },
        testimonials: { visible: true, order: 7 },
        cta: { visible: true, order: 8 },
        footer: { visible: true, order: 9 },
      },
    };
  }

  try {
    const data = await numuApi.getLandingConfig();
    return data;
  } catch (err: any) {
    const status = err?.response?.status;
    const detail = err?.response?.data?.detail || err?.message;
    console.error(`[Data Layer] Failed to get landing config (status=${status}):`, detail);
    return {
      sections: {
        hero: { visible: true, order: 0 },
        preview: { visible: true, order: 1 },
        features: { visible: true, order: 2 },
        "import-showcase": { visible: true, order: 3 },
        "ai-showcase": { visible: true, order: 4 },
        "multichannel-showcase": { visible: true, order: 5 },
        integrations: { visible: true, order: 6 },
        testimonials: { visible: true, order: 7 },
        cta: { visible: true, order: 8 },
        footer: { visible: true, order: 9 },
      },
    };
  }
}

export async function updateLandingConfig(input: { sections: Record<string, { visible: boolean; order: number }> }) {
  if (!(await isApiAvailable()) || !(await ensureAuthenticated())) {
    throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "NUMU API is not available" });
  }

  try {
    const data = await numuApi.updateLandingConfig(input);
    return data;
  } catch (err: any) {
    const status = err?.response?.status;
    const detail = err?.response?.data?.detail || err?.message;
    console.error(`[Data Layer] Failed to update landing config (status=${status}):`, detail);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Failed to update landing page config: ${detail}` });
  }
}
