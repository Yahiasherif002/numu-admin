/**
 * NUMU Data Layer
 * 
 * This module provides a unified data layer that:
 * 1. Attempts to fetch data from the NUMU backend API
 * 2. Falls back to local database if API is unavailable
 * 3. Caches API responses for performance
 * 
 * This hybrid approach ensures the admin dashboard works both:
 * - In production with the live NUMU API
 * - In development/testing with local mock data
 */

import { numuApi, NuMUTenant, NuMUStore, NuMUProduct, NuMUCustomer, NuMUOrder } from "./numuApi";
import * as localDb from "./db";

// Cache for API availability check
let apiAvailable: boolean | null = null;
let lastApiCheck = 0;
const API_CHECK_INTERVAL = 60000; // Check every minute

// Cache for admin token
let adminTokenExpiry = 0;

/**
 * Check if the NUMU API is available
 */
async function isApiAvailable(): Promise<boolean> {
  const now = Date.now();
  
  // Use cached result if recent
  if (apiAvailable !== null && now - lastApiCheck < API_CHECK_INTERVAL) {
    return apiAvailable;
  }
  
  try {
    apiAvailable = await numuApi.healthCheck();
    lastApiCheck = now;
    
    if (apiAvailable) {
      console.log("[NUMU Data Layer] API is available");
    } else {
      console.log("[NUMU Data Layer] API is not available, using local database");
    }
    
    return apiAvailable;
  } catch (error) {
    apiAvailable = false;
    lastApiCheck = now;
    console.log("[NUMU Data Layer] API check failed, using local database");
    return false;
  }
}

/**
 * Ensure we have a valid admin token
 */
async function ensureAuthenticated(): Promise<boolean> {
  const now = Date.now();
  
  // Token still valid
  if (adminTokenExpiry > now) {
    return true;
  }
  
  const email = process.env.NUMU_ADMIN_EMAIL;
  const password = process.env.NUMU_ADMIN_PASSWORD;
  
  if (!email || !password) {
    console.warn("[NUMU Data Layer] Admin credentials not configured");
    return false;
  }
  
  try {
    await numuApi.authenticate(email, password);
    // Token valid for 1 hour (adjust based on actual token expiry)
    adminTokenExpiry = now + 3600000;
    console.log("[NUMU Data Layer] Admin authentication successful");
    return true;
  } catch (error) {
    console.error("[NUMU Data Layer] Admin authentication failed:", error);
    return false;
  }
}

// ============================================================================
// Merchants (Tenants in NUMU API)
// ============================================================================

export interface Merchant {
  id: number;
  merchantId: string;
  name: string;
  email: string;
  domain: string | null;
  logoUrl: string | null;
  plan: string;
  status: "active" | "pending" | "suspended" | "inactive";
  country: string | null;
  category: string | null;
  totalRevenue: number | null;
  totalOrders: number | null;
  totalProducts: number | null;
  settings: unknown;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Map NUMU Tenant to our Merchant format
 */
function mapTenantToMerchant(tenant: NuMUTenant, index: number): Merchant {
  return {
    id: index + 1,
    merchantId: tenant.id,
    name: tenant.name,
    email: `contact@${tenant.subdomain}.com`, // API doesn't provide email directly
    domain: `${tenant.subdomain}.numu.io`,
    logoUrl: null,
    plan: tenant.plan,
    status: tenant.is_active ? "active" : "inactive",
    country: null,
    category: null,
    totalRevenue: 0, // Would need aggregation from orders
    totalOrders: 0,
    totalProducts: 0,
    settings: tenant.settings,
    createdAt: new Date(tenant.created_at),
    updatedAt: new Date(tenant.updated_at),
  };
}

export async function getMerchants(params: {
  limit?: number;
  offset?: number;
  status?: string;
  search?: string;
}): Promise<{ merchants: Merchant[]; total: number }> {
  const isAvailable = await isApiAvailable();
  
  if (isAvailable && await ensureAuthenticated()) {
    try {
      const tenants = await numuApi.listTenants({
        skip: params.offset,
        limit: params.limit,
      });
      
      let filtered = tenants;
      
      // Apply status filter
      if (params.status) {
        const isActive = params.status === "active";
        filtered = filtered.filter(t => t.is_active === isActive);
      }
      
      // Apply search filter
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(t => 
          t.name.toLowerCase().includes(search) ||
          t.subdomain.toLowerCase().includes(search)
        );
      }
      
      const merchants = filtered.map(mapTenantToMerchant);
      
      return {
        merchants,
        total: merchants.length,
      };
    } catch (error) {
      console.error("[NUMU Data Layer] Failed to fetch merchants from API:", error);
    }
  }
  
  // Fallback to local database
  return localDb.getMerchants(params);
}

export async function getMerchantById(merchantId: string): Promise<Merchant | null> {
  const isAvailable = await isApiAvailable();
  
  if (isAvailable && await ensureAuthenticated()) {
    try {
      const tenant = await numuApi.getTenant(merchantId);
      return mapTenantToMerchant(tenant, 0);
    } catch (error) {
      console.error("[NUMU Data Layer] Failed to fetch merchant from API:", error);
    }
  }
  
  return localDb.getMerchantById(merchantId);
}

export async function updateMerchantStatus(merchantId: string, status: string): Promise<boolean> {
  const isAvailable = await isApiAvailable();
  
  if (isAvailable && await ensureAuthenticated()) {
    try {
      await numuApi.updateTenant(merchantId, {
        is_active: status === "active",
      });
      return true;
    } catch (error) {
      console.error("[NUMU Data Layer] Failed to update merchant status via API:", error);
    }
  }
  
  return localDb.updateMerchantStatus(merchantId, status);
}

export async function getMerchantStats(): Promise<{
  total: number;
  active: number;
  pending: number;
  suspended: number;
}> {
  const isAvailable = await isApiAvailable();
  
  if (isAvailable && await ensureAuthenticated()) {
    try {
      const tenants = await numuApi.listTenants({ limit: 1000 });
      
      return {
        total: tenants.length,
        active: tenants.filter(t => t.is_active).length,
        pending: tenants.filter(t => t.plan === "free" && t.is_active).length,
        suspended: tenants.filter(t => !t.is_active).length,
      };
    } catch (error) {
      console.error("[NUMU Data Layer] Failed to fetch merchant stats from API:", error);
    }
  }
  
  return localDb.getMerchantStats();
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
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
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

/**
 * Map NUMU Order to our Order format
 */
function mapNuMUOrder(order: NuMUOrder, index: number): Order {
  return {
    id: index + 1,
    orderId: order.id,
    merchantId: order.tenant_id,
    customerId: order.customer_id,
    customerName: order.customer 
      ? `${order.customer.first_name} ${order.customer.last_name}`
      : null,
    customerEmail: order.customer?.email || null,
    status: order.status as Order["status"],
    paymentStatus: order.payment_status,
    subtotal: order.subtotal,
    tax: order.tax_amount,
    shipping: order.shipping_cost,
    discount: order.discount_amount,
    total: order.total,
    currency: order.currency,
    shippingAddress: order.shipping_address,
    billingAddress: order.billing_address,
    items: order.line_items,
    notes: order.notes,
    createdAt: new Date(order.created_at),
    updatedAt: new Date(order.updated_at),
  };
}

export async function getOrders(params: {
  limit?: number;
  offset?: number;
  status?: string;
  merchantId?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<{ orders: Order[]; total: number }> {
  const isAvailable = await isApiAvailable();
  
  if (isAvailable && await ensureAuthenticated()) {
    try {
      const page = Math.floor((params.offset || 0) / (params.limit || 20)) + 1;
      const result = await numuApi.listOrders({
        page,
        limit: params.limit,
        status: params.status,
        search: params.search,
      });
      
      const orders = result.items.map(mapNuMUOrder);
      
      return {
        orders,
        total: result.total,
      };
    } catch (error) {
      console.error("[NUMU Data Layer] Failed to fetch orders from API:", error);
    }
  }
  
  return localDb.getOrders(params);
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const isAvailable = await isApiAvailable();
  
  if (isAvailable && await ensureAuthenticated()) {
    try {
      const order = await numuApi.getOrder(orderId);
      return mapNuMUOrder(order, 0);
    } catch (error) {
      console.error("[NUMU Data Layer] Failed to fetch order from API:", error);
    }
  }
  
  return localDb.getOrderById(orderId);
}

export async function updateOrderStatus(orderId: string, status: string): Promise<boolean> {
  const isAvailable = await isApiAvailable();
  
  if (isAvailable && await ensureAuthenticated()) {
    try {
      await numuApi.updateOrderStatus(orderId, status);
      return true;
    } catch (error) {
      console.error("[NUMU Data Layer] Failed to update order status via API:", error);
    }
  }
  
  return localDb.updateOrderStatus(orderId, status);
}

export async function getOrderStats(): Promise<{
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}> {
  // For now, use local database stats
  // The NUMU API would need an admin stats endpoint
  return localDb.getOrderStats();
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

/**
 * Map NUMU Customer to our Customer format
 */
function mapNuMUCustomer(customer: NuMUCustomer, index: number): Customer {
  return {
    id: index + 1,
    customerId: customer.id,
    merchantId: customer.tenant_id,
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

export async function getCustomers(params: {
  limit?: number;
  offset?: number;
  merchantId?: string;
  search?: string;
}): Promise<{ customers: Customer[]; total: number }> {
  const isAvailable = await isApiAvailable();
  
  if (isAvailable && await ensureAuthenticated()) {
    try {
      const page = Math.floor((params.offset || 0) / (params.limit || 20)) + 1;
      const result = await numuApi.listCustomers({
        page,
        limit: params.limit,
        search: params.search,
      });
      
      const customers = result.items.map(mapNuMUCustomer);
      
      return {
        customers,
        total: result.total,
      };
    } catch (error) {
      console.error("[NUMU Data Layer] Failed to fetch customers from API:", error);
    }
  }
  
  return localDb.getCustomers(params);
}

export async function getCustomerStats(): Promise<{ total: number; active: number }> {
  return localDb.getCustomerStats();
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

/**
 * Map NUMU Product to our Product format
 */
function mapNuMUProduct(product: NuMUProduct, index: number): Product {
  return {
    id: index + 1,
    productId: product.id,
    merchantId: product.tenant_id,
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

export async function getProducts(params: {
  limit?: number;
  offset?: number;
  merchantId?: string;
  status?: string;
  search?: string;
}): Promise<{ products: Product[]; total: number }> {
  const isAvailable = await isApiAvailable();
  
  if (isAvailable && await ensureAuthenticated()) {
    try {
      const page = Math.floor((params.offset || 0) / (params.limit || 20)) + 1;
      const result = await numuApi.listProducts({
        page,
        limit: params.limit,
        is_active: params.status === "active" ? true : params.status === "draft" ? false : undefined,
        search: params.search,
      });
      
      const products = result.items.map(mapNuMUProduct);
      
      return {
        products,
        total: result.total,
      };
    } catch (error) {
      console.error("[NUMU Data Layer] Failed to fetch products from API:", error);
    }
  }
  
  return localDb.getProducts(params);
}

// ============================================================================
// Dashboard Stats
// ============================================================================

export async function getDashboardStats(): Promise<{
  totalRevenue: number;
  activeMerchants: number;
  totalOrders: number;
  totalCustomers: number;
  revenueChange: number;
  merchantsChange: number;
  ordersChange: number;
  customersChange: number;
}> {
  const isAvailable = await isApiAvailable();
  
  if (isAvailable && await ensureAuthenticated()) {
    try {
      return await numuApi.getDashboardStats();
    } catch (error) {
      console.error("[NUMU Data Layer] Failed to fetch dashboard stats from API:", error);
    }
  }
  
  return localDb.getDashboardStats();
}

// Re-export functions that don't need API integration
export { getRevenueByMonth, getTopMerchants, getRecentOrders } from "./db";
