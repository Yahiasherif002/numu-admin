# NUMU API Analysis

## Overview
The NUMU API is a FastAPI-based multi-tenant e-commerce platform following Clean Architecture.

## Key Models

### Tenants (Merchants)
- **Table**: `public.tenants`
- **Fields**: id, name, subdomain, owner_id, plan, is_active, settings, created_at, updated_at
- **Plans**: free, starter, pro, enterprise

### Stores
- **Table**: `public.stores` (with tenant_id discriminator)
- **Fields**: id, tenant_id, name, slug, owner_id, description, logo_url, banner_url, status, default_currency, contact_email, contact_phone, address, social_links, settings, created_at, updated_at
- **Status**: pending_approval, active, inactive, suspended

### Products
- **Table**: `public.products` (with tenant_id discriminator)
- **Fields**: id, tenant_id, store_id, name, slug, sku, description, short_description, product_type, status, price_amount (cents), price_currency, compare_at_price, cost_price, quantity, low_stock_threshold, weight, dimensions, images, category_id, tags, attributes, extra_data, created_at, updated_at
- **Status**: draft, active, archived

### Customers
- **Table**: `public.customers` (with tenant_id discriminator)
- **Fields**: id, tenant_id, store_id, user_id, email, first_name, last_name, phone, accepts_marketing, notes, tags, default_address_id, total_orders, total_spent (cents), extra_data, created_at, updated_at

### Orders
- **Table**: `public.orders` (with tenant_id discriminator)
- **Fields**: id, tenant_id, store_id, customer_id, order_number, status, payment_status, fulfillment_status, line_items (JSON), shipping_address (JSON), billing_address (JSON), subtotal, shipping_cost, tax_amount, discount_amount, total (all in cents), currency, payment_method, payment_id, shipping_method, tracking_number, notes, customer_notes, extra_data, cancelled_at, paid_at, fulfilled_at, created_at, updated_at
- **Order Status**: pending, confirmed, processing, shipped, delivered, cancelled, refunded
- **Payment Status**: pending, paid, failed, refunded, partially_refunded
- **Fulfillment Status**: unfulfilled, partially_fulfilled, fulfilled

## API Endpoints

### Admin Endpoints (require SUPER_ADMIN role)
- `GET /api/v1/admin/tenants` - List all tenants
- `GET /api/v1/admin/tenants/{tenant_id}` - Get tenant by ID
- `PATCH /api/v1/admin/tenants/{tenant_id}` - Update tenant
- `DELETE /api/v1/admin/tenants/{tenant_id}` - Deactivate tenant

### Public Endpoints
- `POST /api/v1/public/tenants` - Create new tenant
- `GET /api/v1/public/tenants/check-subdomain/{subdomain}` - Check subdomain availability

### Tenant-Scoped Endpoints (require tenant context)
- `GET /api/v1/stores` - List stores
- `POST /api/v1/stores` - Create store
- `GET /api/v1/stores/{store_id}` - Get store
- `PATCH /api/v1/stores/{store_id}` - Update store
- `DELETE /api/v1/stores/{store_id}` - Delete store
- `GET /api/v1/products` - List products
- `POST /api/v1/products` - Create product
- `GET /api/v1/products/{product_id}` - Get product
- `PATCH /api/v1/products/{product_id}` - Update product
- `DELETE /api/v1/products/{product_id}` - Delete product

## Integration Strategy

Since the NUMU API is a separate FastAPI backend, we need to:
1. Create an API client service that makes HTTP requests to the NUMU API
2. Configure the NUMU API URL as an environment variable
3. Use admin JWT tokens for authentication
4. Map the API responses to our admin dashboard data structures
