CREATE TYPE "public"."admin_customer_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."admin_merchant_plan" AS ENUM('free', 'basic', 'pro', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."admin_merchant_status" AS ENUM('active', 'pending', 'suspended', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."admin_order_status" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."admin_payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."admin_product_status" AS ENUM('active', 'draft', 'archived');--> statement-breakpoint
CREATE TYPE "public"."admin_user_role" AS ENUM('user', 'admin', 'super_admin');--> statement-breakpoint
CREATE TABLE "admin_merchant_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" integer NOT NULL,
	"merchant_id" varchar(64) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar(64) NOT NULL,
	"merchant_id" varchar(64) NOT NULL,
	"email" varchar(320) NOT NULL,
	"name" varchar(255),
	"phone" varchar(32),
	"status" "admin_customer_status" DEFAULT 'active' NOT NULL,
	"total_orders" integer DEFAULT 0,
	"total_spent" bigint DEFAULT 0,
	"default_address" jsonb,
	"tags" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_customers_customer_id_unique" UNIQUE("customer_id")
);
--> statement-breakpoint
CREATE TABLE "admin_merchants" (
	"id" serial PRIMARY KEY NOT NULL,
	"merchant_id" varchar(64) NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(320) NOT NULL,
	"domain" varchar(255),
	"logo_url" text,
	"status" "admin_merchant_status" DEFAULT 'pending' NOT NULL,
	"plan" "admin_merchant_plan" DEFAULT 'free' NOT NULL,
	"country" varchar(2),
	"category" varchar(100),
	"total_revenue" bigint DEFAULT 0,
	"total_orders" integer DEFAULT 0,
	"total_products" integer DEFAULT 0,
	"settings" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_merchants_merchant_id_unique" UNIQUE("merchant_id")
);
--> statement-breakpoint
CREATE TABLE "admin_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" varchar(64) NOT NULL,
	"merchant_id" varchar(64) NOT NULL,
	"customer_id" varchar(64),
	"customer_email" varchar(320),
	"customer_name" varchar(255),
	"status" "admin_order_status" DEFAULT 'pending' NOT NULL,
	"payment_status" "admin_payment_status" DEFAULT 'pending' NOT NULL,
	"subtotal" bigint NOT NULL,
	"tax" bigint DEFAULT 0,
	"shipping" bigint DEFAULT 0,
	"discount" bigint DEFAULT 0,
	"total" bigint NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"shipping_address" jsonb,
	"billing_address" jsonb,
	"items" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_orders_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "admin_platform_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"total_revenue" bigint DEFAULT 0,
	"total_orders" integer DEFAULT 0,
	"new_merchants" integer DEFAULT 0,
	"new_customers" integer DEFAULT 0,
	"active_merchants" integer DEFAULT 0,
	"conversion_rate" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" varchar(64) NOT NULL,
	"merchant_id" varchar(64) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"sku" varchar(100),
	"price" bigint NOT NULL,
	"compare_at_price" bigint,
	"cost_per_item" bigint,
	"currency" varchar(3) DEFAULT 'USD',
	"status" "admin_product_status" DEFAULT 'draft' NOT NULL,
	"inventory" integer DEFAULT 0,
	"category" varchar(100),
	"images" jsonb,
	"variants" jsonb,
	"tags" jsonb,
	"total_sales" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_products_product_id_unique" UNIQUE("product_id")
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"open_id" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"login_method" varchar(64),
	"role" "admin_user_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_signed_in" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_open_id_unique" UNIQUE("open_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "admin_merchant_unique" ON "admin_merchant_assignments" USING btree ("admin_id","merchant_id");