/**
 * Top Product Sales Component - NUMU Admin Dashboard
 * 
 * Design: Horizontal stacked bar chart
 * Based on Figma: 102-484.svg - Top Product Sales card
 */

import { cn } from "@/lib/utils";

const salesData = [
  {
    product: "Red",
    segments: [
      { value: 30, color: "bg-red-400" },
      { value: 25, color: "bg-blue-400" },
      { value: 20, color: "bg-green-400" },
      { value: 15, color: "bg-amber-400" },
      { value: 10, color: "bg-purple-400" },
    ],
  },
  {
    product: "Salmon",
    segments: [
      { value: 35, color: "bg-red-400" },
      { value: 20, color: "bg-blue-400" },
      { value: 25, color: "bg-green-400" },
      { value: 12, color: "bg-amber-400" },
      { value: 8, color: "bg-purple-400" },
    ],
  },
  {
    product: "Brown",
    segments: [
      { value: 28, color: "bg-red-400" },
      { value: 22, color: "bg-blue-400" },
      { value: 18, color: "bg-green-400" },
      { value: 20, color: "bg-amber-400" },
      { value: 12, color: "bg-purple-400" },
    ],
  },
  {
    product: "Tuna",
    segments: [
      { value: 40, color: "bg-red-400" },
      { value: 15, color: "bg-blue-400" },
      { value: 22, color: "bg-green-400" },
      { value: 13, color: "bg-amber-400" },
      { value: 10, color: "bg-purple-400" },
    ],
  },
];

const legend = [
  { label: "Red", color: "bg-red-400" },
  { label: "Salmon", color: "bg-blue-400" },
  { label: "Brown", color: "bg-green-400" },
  { label: "Tuna", color: "bg-amber-400" },
  { label: "Other", color: "bg-purple-400" },
];

export default function TopProductSales() {
  return (
    <div className="dashboard-card">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Top Product Sales
      </h3>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {legend.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <div className={cn("w-2.5 h-2.5 rounded-sm", item.color)} />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Bars */}
      <div className="space-y-4">
        {salesData.map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">{item.product}</span>
            </div>
            <div className="flex h-6 rounded-lg overflow-hidden">
              {item.segments.map((segment, segIndex) => (
                <div
                  key={segIndex}
                  className={cn("h-full", segment.color)}
                  style={{ width: `${segment.value}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
