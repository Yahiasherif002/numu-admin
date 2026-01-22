/**
 * Total Ticket Stats Component - NUMU Admin Dashboard
 * 
 * Design: Multi-line chart with legend and tooltip
 * Based on Figma: 102-534.svg - Total Ticket Stats card
 */

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { time: "1AM", received: 20, resolved: 15, escalated: 5 },
  { time: "2AM", received: 25, resolved: 18, escalated: 3 },
  { time: "3AM", received: 30, resolved: 22, escalated: 4 },
  { time: "4AM", received: 35, resolved: 28, escalated: 5 },
  { time: "5AM", received: 45, resolved: 35, escalated: 6 },
  { time: "6AM", received: 55, resolved: 42, escalated: 8 },
  { time: "7AM", received: 60, resolved: 48, escalated: 7 },
  { time: "8AM", received: 65, resolved: 52, escalated: 9 },
  { time: "9AM", received: 58, resolved: 45, escalated: 8 },
  { time: "10AM", received: 50, resolved: 40, escalated: 6 },
  { time: "11AM", received: 45, resolved: 38, escalated: 5 },
  { time: "12PM", received: 42, resolved: 35, escalated: 4 },
  { time: "1PM", received: 48, resolved: 38, escalated: 6 },
  { time: "2PM", received: 35, resolved: 28, escalated: 5 },
  { time: "3PM", received: 30, resolved: 25, escalated: 4 },
  { time: "4PM", received: 28, resolved: 22, escalated: 3 },
  { time: "5PM", received: 32, resolved: 26, escalated: 4 },
  { time: "6PM", received: 25, resolved: 20, escalated: 3 },
];

export default function TotalTicketStats() {
  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">
          Total Ticket Stats
        </h3>
        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
              <span className="text-muted-foreground">Received</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-green-500" />
              <span className="text-muted-foreground">Resolved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-red-400" />
              <span className="text-muted-foreground">Escalated</span>
            </div>
          </div>
          <Select defaultValue="default">
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="time"
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
            <Line
              type="monotone"
              dataKey="received"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="resolved"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="escalated"
              stroke="#f87171"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
