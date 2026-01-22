/**
 * Team Performance Component - NUMU Admin Dashboard
 * 
 * Design: Table showing team metrics
 * Based on Figma: Team performance grid
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const teamData = [
  { team: "Payments Team", project1: 10, project2: 5, project3: 5 },
  { team: "Insurance", project1: 8, project2: 4, project3: 4 },
  { team: "General Support", project1: 12, project2: 8, project3: 8 },
  { team: "Admin", project1: 8, project2: 5, project3: 6 },
  { team: "Technical Support", project1: 7, project2: 2, project3: 3 },
  { team: "Analytics Team", project1: 10, project2: 5, project3: 5 },
];

export default function TeamPerformance() {
  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" className="h-7 text-xs">
            Group
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
            Agent
          </Button>
        </div>
        <Button variant="link" size="sm" className="text-primary text-xs">
          View Report →
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left text-xs font-medium text-muted-foreground py-2 pr-4">
                Team
              </th>
              <th className="text-center text-xs font-medium text-muted-foreground py-2 px-2">
                Project 1
              </th>
              <th className="text-center text-xs font-medium text-muted-foreground py-2 px-2">
                Project 2
              </th>
              <th className="text-center text-xs font-medium text-muted-foreground py-2 px-2">
                Project 3
              </th>
            </tr>
          </thead>
          <tbody>
            {teamData.map((row, index) => (
              <tr key={index} className="border-b border-border/30 last:border-0">
                <td className="py-2.5 pr-4">
                  <span className="text-sm text-foreground">{row.team}</span>
                </td>
                <td className="py-2.5 px-2 text-center">
                  <span className="text-sm font-medium text-foreground">
                    {row.project1}
                  </span>
                </td>
                <td className="py-2.5 px-2 text-center">
                  <span className="text-sm font-medium text-foreground">
                    {row.project2}
                  </span>
                </td>
                <td className="py-2.5 px-2 text-center">
                  <span className="text-sm font-medium text-foreground">
                    {row.project3}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <span>Showing Data: Last 2 Months</span>
      </div>
    </div>
  );
}
