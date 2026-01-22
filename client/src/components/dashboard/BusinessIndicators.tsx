/**
 * Business Indicators Component - NUMU Admin Dashboard
 * 
 * Design: Line chart with multiple metrics
 * Based on Figma: Business Indicators card
 */

import { Button } from "@/components/ui/button";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { date: "Jan", sales: 4000, profit: 2400 },
  { date: "Feb", sales: 3000, profit: 1398 },
  { date: "Mar", sales: 2000, profit: 9800 },
  { date: "Apr", sales: 2780, profit: 3908 },
  { date: "May", sales: 1890, profit: 4800 },
  { date: "Jun", sales: 2390, profit: 3800 },
  { date: "Jul", sales: 3490, profit: 4300 },
  { date: "Aug", sales: 4000, profit: 2400 },
  { date: "Sep", sales: 3000, profit: 1398 },
  { date: "Oct", sales: 2000, profit: 9800 },
];

export default function BusinessIndicators() {
  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">
          Business Indicators
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs">
            Sum of Sales
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
            Sales last Year
          </Button>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
