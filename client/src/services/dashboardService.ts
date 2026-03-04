/**
 * Dashboard API service — platform-wide statistics.
 */

import { apiClient } from "@/lib/apiClient";

export interface DashboardStats {
  totalRevenue: number;
  activeMerchants: number;
  totalOrders: number;
  totalCustomers: number;
  revenueChange: number;
  merchantsChange: number;
  ordersChange: number;
  customersChange: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const data = await apiClient<{
      total_revenue: number;
      active_merchants: number;
      total_orders: number;
      total_customers: number;
      revenue_change: number;
      merchants_change: number;
      orders_change: number;
      customers_change: number;
    }>("/admin/dashboard/stats");

    return {
      totalRevenue: data.total_revenue,
      activeMerchants: data.active_merchants,
      totalOrders: data.total_orders,
      totalCustomers: data.total_customers,
      revenueChange: data.revenue_change,
      merchantsChange: data.merchants_change,
      ordersChange: data.orders_change,
      customersChange: data.customers_change,
    };
  } catch {
    return {
      totalRevenue: 0,
      activeMerchants: 0,
      totalOrders: 0,
      totalCustomers: 0,
      revenueChange: 0,
      merchantsChange: 0,
      ordersChange: 0,
      customersChange: 0,
    };
  }
}
