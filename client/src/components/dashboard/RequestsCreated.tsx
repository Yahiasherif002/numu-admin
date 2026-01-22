/**
 * Requests Created Component - NUMU Admin Dashboard
 * 
 * Design: Donut chart with category breakdown
 * Based on Figma: 102-3226.svg - Requests Created card
 */

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Intellectual Property", value: 25.16, color: "#6366f1" },
  { name: "Legal Advice", value: 17.96, color: "#22c55e" },
  { name: "Litigation", value: 17.01, color: "#f59e0b" },
  { name: "Marketing", value: 37.15, color: "#ec4899" },
  { name: "Compliance", value: 2.72, color: "#8b5cf6" },
];

export default function RequestsCreated() {
  return (
    <div className="dashboard-card h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">
          Requests Created
        </h3>
        <span className="text-xs text-muted-foreground">All time</span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-muted-foreground">{item.name}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
                const RADIAN = Math.PI / 180;
                const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                return (
                  <text
                    x={x}
                    y={y}
                    fill="#6b7280"
                    textAnchor={x > cx ? "start" : "end"}
                    dominantBaseline="central"
                    fontSize={11}
                  >
                    {`${value.toFixed(1)}%`}
                  </text>
                );
              }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value: number) => [`${value.toFixed(2)}%`, "Share"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
