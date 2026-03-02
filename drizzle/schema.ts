import { bigint, index, integer, jsonb, pgEnum, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

/**
 * NUMU Admin Backoffice Database Schema (PostgreSQL)
 *
 * This schema supports the admin dashboard for managing:
 * - Platform users (admins)
 * - Merchants (store owners)
 * - Orders (across all merchants)
 * - Customers (across all merchants)
 * - Products (across all merchants)
 */

// ============================================
// ENUMS
// ============================================
export const userRoleEnum = pgEnum("admin_user_role", ["user", "admin", "super_admin"]);
export const merchantStatusEnum = pgEnum("admin_merchant_status", ["active", "pending", "suspended", "inactive"]);
export const merchantPlanEnum = pgEnum("admin_merchant_plan", ["free", "basic", "pro", "enterprise"]);
export const orderStatusEnum = pgEnum("admin_order_status", ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]);
export const paymentStatusEnum = pgEnum("admin_payment_status", ["pending", "paid", "failed", "refunded"]);
export const customerStatusEnum = pgEnum("admin_customer_status", ["active", "inactive"]);
export const productStatusEnum = pgEnum("admin_product_status", ["active", "draft", "archived"]);

// ============================================
// USERS TABLE (Admin Authentication)
// ============================================
export const users = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================
// MERCHANTS TABLE
// ============================================
export const merchants = pgTable("admin_merchants", {
  id: serial("id").primaryKey(),
  /** Unique merchant identifier */
  merchantId: varchar("merchant_id", { length: 64 }).notNull().unique(),
  /** Store name */
  name: varchar("name", { length: 255 }).notNull(),
  /** Business email */
  email: varchar("email", { length: 320 }).notNull(),
  /** Store domain/subdomain */
  domain: varchar("domain", { length: 255 }),
  /** Store logo URL */
  logoUrl: text("logo_url"),
  /** Merchant status */
  status: merchantStatusEnum("status").default("pending").notNull(),
  /** Subscription plan */
  plan: merchantPlanEnum("plan").default("free").notNull(),
  /** Country code */
  country: varchar("country", { length: 2 }),
  /** Business category */
  category: varchar("category", { length: 100 }),
  /** Total revenue generated (in cents) */
  totalRevenue: bigint("total_revenue", { mode: "number" }).default(0),
  /** Total orders count */
  totalOrders: integer("total_orders").default(0),
  /** Total products count */
  totalProducts: integer("total_products").default(0),
  /** Store settings JSON */
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Merchant = typeof merchants.$inferSelect;
export type InsertMerchant = typeof merchants.$inferInsert;

// ============================================
// ORDERS TABLE
// ============================================
export const orders = pgTable("admin_orders", {
  id: serial("id").primaryKey(),
  /** Unique order identifier */
  orderId: varchar("order_id", { length: 64 }).notNull().unique(),
  /** Reference to merchant */
  merchantId: varchar("merchant_id", { length: 64 })
    .notNull()
    .references(() => merchants.merchantId, { onDelete: "restrict" }),
  /** Reference to customer */
  customerId: varchar("customer_id", { length: 64 }),
  /** Customer email */
  customerEmail: varchar("customer_email", { length: 320 }),
  /** Customer name */
  customerName: varchar("customer_name", { length: 255 }),
  /** Order status */
  status: orderStatusEnum("status").default("pending").notNull(),
  /** Payment status */
  paymentStatus: paymentStatusEnum("payment_status").default("pending").notNull(),
  /** Order subtotal (in cents) */
  subtotal: bigint("subtotal", { mode: "number" }).notNull(),
  /** Tax amount (in cents) */
  tax: bigint("tax", { mode: "number" }).default(0),
  /** Shipping cost (in cents) */
  shipping: bigint("shipping", { mode: "number" }).default(0),
  /** Discount amount (in cents) */
  discount: bigint("discount", { mode: "number" }).default(0),
  /** Total amount (in cents) */
  total: bigint("total", { mode: "number" }).notNull(),
  /** Currency code */
  currency: varchar("currency", { length: 3 }).default("USD"),
  /** Shipping address JSON */
  shippingAddress: jsonb("shipping_address"),
  /** Billing address JSON */
  billingAddress: jsonb("billing_address"),
  /** Order items JSON */
  items: jsonb("items"),
  /** Order notes */
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("orders_merchant_id_idx").on(table.merchantId),
  index("orders_customer_id_idx").on(table.customerId),
]);

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ============================================
// CUSTOMERS TABLE
// ============================================
export const customers = pgTable("admin_customers", {
  id: serial("id").primaryKey(),
  /** Unique customer identifier */
  customerId: varchar("customer_id", { length: 64 }).notNull().unique(),
  /** Reference to merchant */
  merchantId: varchar("merchant_id", { length: 64 })
    .notNull()
    .references(() => merchants.merchantId, { onDelete: "restrict" }),
  /** Customer email */
  email: varchar("email", { length: 320 }).notNull(),
  /** Customer name */
  name: varchar("name", { length: 255 }),
  /** Phone number */
  phone: varchar("phone", { length: 32 }),
  /** Customer status */
  status: customerStatusEnum("status").default("active").notNull(),
  /** Total orders count */
  totalOrders: integer("total_orders").default(0),
  /** Total spent (in cents) */
  totalSpent: bigint("total_spent", { mode: "number" }).default(0),
  /** Default shipping address JSON */
  defaultAddress: jsonb("default_address"),
  /** Customer tags */
  tags: jsonb("tags"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("customers_merchant_id_idx").on(table.merchantId),
]);

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// ============================================
// PRODUCTS TABLE
// ============================================
export const products = pgTable("admin_products", {
  id: serial("id").primaryKey(),
  /** Unique product identifier */
  productId: varchar("product_id", { length: 64 }).notNull().unique(),
  /** Reference to merchant */
  merchantId: varchar("merchant_id", { length: 64 })
    .notNull()
    .references(() => merchants.merchantId, { onDelete: "restrict" }),
  /** Product name */
  name: varchar("name", { length: 255 }).notNull(),
  /** Product description */
  description: text("description"),
  /** Product SKU */
  sku: varchar("sku", { length: 100 }),
  /** Product price (in cents) */
  price: bigint("price", { mode: "number" }).notNull(),
  /** Compare at price (in cents) */
  compareAtPrice: bigint("compare_at_price", { mode: "number" }),
  /** Cost per item (in cents) */
  costPerItem: bigint("cost_per_item", { mode: "number" }),
  /** Currency code */
  currency: varchar("currency", { length: 3 }).default("USD"),
  /** Product status */
  status: productStatusEnum("status").default("draft").notNull(),
  /** Inventory quantity */
  inventory: integer("inventory").default(0),
  /** Product category */
  category: varchar("category", { length: 100 }),
  /** Product images JSON */
  images: jsonb("images"),
  /** Product variants JSON */
  variants: jsonb("variants"),
  /** Product tags */
  tags: jsonb("tags"),
  /** Total sales count */
  totalSales: integer("total_sales").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("products_merchant_id_idx").on(table.merchantId),
]);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ============================================
// PLATFORM STATS TABLE (Aggregated metrics)
// ============================================
export const platformStats = pgTable("admin_platform_stats", {
  id: serial("id").primaryKey(),
  /** Date for the stats */
  date: timestamp("date").notNull(),
  /** Total revenue (in cents) */
  totalRevenue: bigint("total_revenue", { mode: "number" }).default(0),
  /** Total orders */
  totalOrders: integer("total_orders").default(0),
  /** New merchants */
  newMerchants: integer("new_merchants").default(0),
  /** New customers */
  newCustomers: integer("new_customers").default(0),
  /** Active merchants */
  activeMerchants: integer("active_merchants").default(0),
  /** Conversion rate (percentage * 100) */
  conversionRate: integer("conversion_rate").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PlatformStats = typeof platformStats.$inferSelect;
export type InsertPlatformStats = typeof platformStats.$inferInsert;

// ============================================
// ADMIN MERCHANT ASSIGNMENTS (Tenant Scoping)
// ============================================
export const adminMerchantAssignments = pgTable(
  "admin_merchant_assignments",
  {
    id: serial("id").primaryKey(),
    /** Reference to admin user */
    adminId: integer("admin_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** NUMU store/merchant ID the admin is assigned to */
    merchantId: varchar("merchant_id", { length: 64 })
      .notNull()
      .references(() => merchants.merchantId, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("admin_merchant_unique").on(table.adminId, table.merchantId),
    index("assignments_merchant_id_idx").on(table.merchantId),
  ]
);

export type AdminMerchantAssignment = typeof adminMerchantAssignments.$inferSelect;
export type InsertAdminMerchantAssignment = typeof adminMerchantAssignments.$inferInsert;
