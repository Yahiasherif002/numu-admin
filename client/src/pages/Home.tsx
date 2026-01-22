/**
 * Home Page - NUMU Admin Dashboard
 * 
 * Design: Soft Minimalist Dashboard
 * Layout: Grid-based with multiple card sections
 * 
 * This page implements the admin backoffice dashboard for NUMU,
 * featuring all the components from the Figma design.
 */

import DashboardLayout from "@/components/DashboardLayout";
import {
  AnalyticsReport,
  BusinessIndicators,
  CompaniesTable,
  FXTrades,
  RequestsByMonth,
  RequestsCreated,
  RevenueShare,
  SalesStats,
  SLAStats,
  StatsCard,
  TeamPerformance,
  TicketsByPriority,
  TicketsByStatus,
  TimeStats,
  TopProductSales,
  TotalProductSales,
  TotalTicketStats,
  WorldMap,
} from "@/components/dashboard";
import {
  Activity,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

export default function Home() {
  return (
    <DashboardLayout
      title="Dashboard Overview"
      subtitle="Welcome back! Here's what's happening with your platform today."
    >
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Revenue"
          value="$89,432"
          change={12.5}
          changeLabel="vs last month"
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatsCard
          title="Active Merchants"
          value="5,612"
          change={8.2}
          changeLabel="vs last month"
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatsCard
          title="Total Orders"
          value="5,161"
          change={-2.4}
          changeLabel="vs last month"
          icon={ShoppingCart}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatsCard
          title="Conversion Rate"
          value="391,152"
          change={5.7}
          changeLabel="vs last month"
          icon={TrendingUp}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
      </div>

      {/* Row 1: SLA Stats, Tickets By Priority, Total Ticket Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
        <div className="lg:col-span-4">
          <SLAStats />
        </div>
        <div className="lg:col-span-3">
          <TicketsByPriority />
        </div>
        <div className="lg:col-span-5">
          <TotalTicketStats />
        </div>
      </div>

      {/* Row 2: Requests Created + Companies Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
        <div className="lg:col-span-5">
          <RequestsCreated />
        </div>
        <div className="lg:col-span-7">
          <CompaniesTable />
        </div>
      </div>

      {/* Row 3: Tickets By Status, Top Product Sales, Revenue Share */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
        <div className="lg:col-span-3">
          <TicketsByStatus />
        </div>
        <div className="lg:col-span-3">
          <TopProductSales />
        </div>
        <div className="lg:col-span-6">
          <RevenueShare />
        </div>
      </div>

      {/* Row 4: Team Performance, Analytics Report, Sales Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
        <div className="lg:col-span-3">
          <TeamPerformance />
        </div>
        <div className="lg:col-span-5">
          <AnalyticsReport />
        </div>
        <div className="lg:col-span-4">
          <SalesStats />
        </div>
      </div>

      {/* Row 5: World Map, Business Indicators, Requests By Month */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
        <div className="lg:col-span-4">
          <WorldMap />
        </div>
        <div className="lg:col-span-4">
          <BusinessIndicators />
        </div>
        <div className="lg:col-span-4">
          <RequestsByMonth />
        </div>
      </div>

      {/* Row 6: FX Trades + Time Stats + Total Product Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6">
          <FXTrades />
        </div>
        <div className="lg:col-span-3">
          <TimeStats />
        </div>
        <div className="lg:col-span-3">
          <TotalProductSales />
        </div>
      </div>
    </DashboardLayout>
  );
}
