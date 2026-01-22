/**
 * Requests By Month Component - NUMU Admin Dashboard
 * 
 * Design: Stacked bar chart
 * Based on Figma: 102-3106.svg - Requests Received By Month card
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { month: "Oct 2023", contract: 80, marketing: 120, legal: 60 },
  { month: "Nov 2023", contract: 100, marketing: 150, legal: 80 },
  { month: "Dec 2023", contract: 120, marketing: 180, legal: 100 },
];

const categories = [
  { key: "contract", label: "Contract Review", color: "#f97316" },
  { key: "marketing", label: "Marketing Review", color: "#22c55e" },
  { key: "legal", label: "Legal Advice", color: "#6366f1" },
];

export default function RequestsByMonth() {
  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">
          Requests Received By Month
        </h3>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4">
        {categories.map((cat) => (
          <div key={cat.key} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-xs text-muted-foreground">{cat.label}</span>
          </div>
        ))}
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
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
              width={30}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            {categories.map((cat) => (
              <Bar
                key={cat.key}
                dataKey={cat.key}
                stackId="a"
                fill={cat.color}
                radius={cat.key === "legal" ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
