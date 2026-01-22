/**
 * Tickets By Status Component - NUMU Admin Dashboard
 * 
 * Design: Status list with counts
 * Based on Figma: 102-432.svg - Tickets By Status card
 */

import { cn } from "@/lib/utils";

const statusData = [
  { status: "Open", count: 110, color: "bg-blue-500" },
  { status: "In Progress", count: 650, color: "bg-amber-500" },
  { status: "On Hold", count: 60, color: "bg-purple-500" },
  { status: "Resolved", count: 400, color: "bg-green-500" },
  { status: "Closed", count: 200, color: "bg-gray-400" },
];

export default function TicketsByStatus() {
  const total = statusData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="dashboard-card">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Tickets By Status
      </h3>
      <div className="space-y-3">
        {statusData.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={cn("w-2 h-2 rounded-full", item.color)} />
            <span className="flex-1 text-sm text-muted-foreground">
              {item.status}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {item.count.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Total</span>
          <span className="text-lg font-bold text-foreground">
            {total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
