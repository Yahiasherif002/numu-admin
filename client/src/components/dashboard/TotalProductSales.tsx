/**
 * Total Product Sales Component - NUMU Admin Dashboard
 * 
 * Design: Gradient line chart with period selector
 * Based on Figma: 103-746.svg - Total Product Sales card
 */

import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { month: "Jan", desktop: 45000, mobile: 25000, tablet: 15000 },
  { month: "Feb", desktop: 52000, mobile: 28000, tablet: 18000 },
  { month: "Mar", desktop: 48000, mobile: 32000, tablet: 20000 },
  { month: "Apr", desktop: 61000, mobile: 35000, tablet: 22000 },
  { month: "May", desktop: 55000, mobile: 38000, tablet: 25000 },
  { month: "Jun", desktop: 67000, mobile: 42000, tablet: 28000 },
  { month: "Jul", desktop: 72000, mobile: 45000, tablet: 30000 },
  { month: "Aug", desktop: 68000, mobile: 48000, tablet: 32000 },
  { month: "Sep", desktop: 75000, mobile: 52000, tablet: 35000 },
  { month: "Oct", desktop: 82000, mobile: 55000, tablet: 38000 },
  { month: "Nov", desktop: 78000, mobile: 58000, tablet: 40000 },
  { month: "Dec", desktop: 90000, mobile: 62000, tablet: 42000 },
];

const channels = [
  { key: "desktop", label: "Desktop", color: "#6366f1" },
  { key: "mobile", label: "Mobile", color: "#22c55e" },
  { key: "tablet", label: "Tablet", color: "#f59e0b" },
];

export default function TotalProductSales() {
  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-foreground">
            Total Product Sales
          </h3>
          <HelpCircle className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-full">
            $17,520.08
          </div>
          <div className="flex items-center gap-4 text-xs">
            {channels.map((channel) => (
              <div key={channel.key} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: channel.color }}
                />
                <span className="text-muted-foreground">{channel.label}</span>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            past 6 months
          </Button>
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              {channels.map((channel) => (
                <linearGradient
                  key={channel.key}
                  id={`sales-gradient-${channel.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={channel.color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={channel.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              width={45}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
            />
            {channels.map((channel) => (
              <Area
                key={channel.key}
                type="monotone"
                dataKey={channel.key}
                stroke={channel.color}
                strokeWidth={2}
                fill={`url(#sales-gradient-${channel.key})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
