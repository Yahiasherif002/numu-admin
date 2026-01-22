/**
 * SLA Stats Component - NUMU Admin Dashboard
 * 
 * Design: Three circular progress indicators
 * Based on Figma: 102-609.svg - SLA Stats card
 */

import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number;
  label: string;
  sublabel: string;
  color: string;
  size?: number;
}

function CircularProgress({
  value,
  label,
  sublabel,
  color,
  size = 100,
}: CircularProgressProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-secondary"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Value text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-foreground">{value}%</span>
        </div>
      </div>
      <div className="mt-3 text-center">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      </div>
    </div>
  );
}

export default function SLAStats() {
  const stats = [
    {
      value: 80,
      label: "First Response",
      sublabel: "Within SLA",
      color: "#22c55e", // Green
    },
    {
      value: 70,
      label: "Resolution",
      sublabel: "Within SLA",
      color: "#f59e0b", // Amber
    },
    {
      value: 40,
      label: "First Contact",
      sublabel: "Resolution",
      color: "#ef4444", // Red
    },
  ];

  return (
    <div className="dashboard-card">
      <h3 className="text-base font-semibold text-foreground mb-6">SLA Stats</h3>
      <div className="flex items-center justify-around">
        {stats.map((stat, index) => (
          <CircularProgress key={index} {...stat} />
        ))}
      </div>
    </div>
  );
}
