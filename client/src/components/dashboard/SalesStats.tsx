/**
 * Sales Stats Component - NUMU Admin Dashboard
 * 
 * Design: Large number display with percentage indicator
 * Based on Figma: 103-771.svg - Sales Stats card
 */

import { ArrowUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SalesStats() {
  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-foreground">Sales #</h3>
        <Select defaultValue="month">
          <SelectTrigger className="w-28 h-8 text-xs">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-center">
        <p className="text-4xl font-bold text-foreground mb-2">$21,497.841</p>
        <div className="flex items-center justify-center gap-2 text-emerald-600">
          <ArrowUp className="w-4 h-4" />
          <span className="text-sm font-medium">32% From Last Period</span>
        </div>
      </div>

      {/* Donut indicator */}
      <div className="mt-6 flex justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#22c55e"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${68.875 * 2.51} ${100 * 2.51}`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-foreground">688.75%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
