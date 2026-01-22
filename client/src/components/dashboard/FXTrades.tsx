/**
 * FX Trades Component - NUMU Admin Dashboard
 * 
 * Design: Area chart showing currency trades
 * Based on Figma: 103-772.svg - FX Trades card
 */

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HelpCircle } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { quarter: "Q1 2021", DKK: 50000, EUR: 80000, NOK: 30000, SEK: 20000 },
  { quarter: "Q2 2021", DKK: 70000, EUR: 120000, NOK: 45000, SEK: 35000 },
  { quarter: "Q3 2021", DKK: 90000, EUR: 150000, NOK: 60000, SEK: 50000 },
  { quarter: "Q1 2022", DKK: 120000, EUR: 180000, NOK: 80000, SEK: 70000 },
  { quarter: "Q2 2022", DKK: 150000, EUR: 220000, NOK: 100000, SEK: 90000 },
];

const currencies = [
  { key: "DKK", color: "#3b82f6" },
  { key: "EUR", color: "#22c55e" },
  { key: "NOK", color: "#f59e0b" },
  { key: "SEK", color: "#ef4444" },
];

export default function FXTrades() {
  return (
    <div className="dashboard-card h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-foreground">FX trades</h3>
          <HelpCircle className="w-4 h-4 text-muted-foreground" />
        </div>
        <Select defaultValue="next-month">
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this-month">This month</SelectItem>
            <SelectItem value="next-month">Next month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              {currencies.map((currency) => (
                <linearGradient
                  key={currency.key}
                  id={`gradient-${currency.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={currency.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={currency.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="quarter"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              width={50}
              tickFormatter={(value) => `${value / 1000}k DKK`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value: number) => [
                `${(value / 1000).toFixed(0)}k DKK`,
                "",
              ]}
            />
            {currencies.map((currency) => (
              <Area
                key={currency.key}
                type="monotone"
                dataKey={currency.key}
                stroke={currency.color}
                strokeWidth={2}
                fill={`url(#gradient-${currency.key})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        {currencies.map((currency) => (
          <div key={currency.key} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: currency.color }}
            />
            <span className="text-xs text-muted-foreground">{currency.key}</span>
          </div>
        ))}
      </div>

      {/* Toggle buttons */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18" />
            <path d="M18 9l-5 5-4-4-3 3" />
          </svg>
          Chart
        </Button>
        <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs text-muted-foreground">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          List
        </Button>
      </div>
    </div>
  );
}
