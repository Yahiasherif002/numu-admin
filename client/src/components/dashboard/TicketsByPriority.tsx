/**
 * Tickets By Priority Component - NUMU Admin Dashboard
 * 
 * Design: Donut chart with legend
 * Based on Figma: 102-628.svg - Tickets By Priority card
 */

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const data = [
  { name: "High", value: 50, color: "#f97316" },
  { name: "Urgent", value: 20, color: "#ef4444" },
  { name: "Medium", value: 200, color: "#fbbf24" },
  { name: "Low", value: 170, color: "#60a5fa" },
];

export default function TicketsByPriority() {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="dashboard-card">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Tickets By Priority
      </h3>
      <div className="flex items-center gap-6">
        {/* Donut Chart */}
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
