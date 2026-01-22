/**
 * Time Stats Component - NUMU Admin Dashboard
 * 
 * Design: Response time metrics with circular gauge
 * Based on Figma: 102-459.svg - Time Stats card
 */

export default function TimeStats() {
  const metrics = [
    { label: "Average First Response Time", value: "30m" },
    { label: "Average Response Time", value: "1h 30 m" },
    { label: "Average Resolution Time", value: "48h" },
  ];

  const gaugeSegments = [
    { label: "Heart Health", color: "#ef4444", position: "top-right" },
    { label: "Cholesterol Balance", color: "#22c55e", position: "right" },
    { label: "Inflammation", color: "#f59e0b", position: "bottom-right" },
    { label: "Metabolic Health", color: "#3b82f6", position: "bottom-left" },
  ];

  return (
    <div className="dashboard-card">
      <h3 className="text-base font-semibold text-foreground mb-4">Time Stats</h3>

      <div className="flex gap-6">
        {/* Metrics list */}
        <div className="flex-1 space-y-4">
          {metrics.map((metric, index) => (
            <div key={index}>
              <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
              <p className="text-lg font-semibold text-foreground">{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Gauge */}
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Background circle segments */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#fee2e2"
              strokeWidth="8"
              strokeDasharray="31.4 125.6"
              transform="rotate(-45 50 50)"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#dcfce7"
              strokeWidth="8"
              strokeDasharray="31.4 125.6"
              transform="rotate(45 50 50)"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#fef3c7"
              strokeWidth="8"
              strokeDasharray="31.4 125.6"
              transform="rotate(135 50 50)"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#dbeafe"
              strokeWidth="8"
              strokeDasharray="31.4 125.6"
              transform="rotate(225 50 50)"
            />

            {/* Active segment (green) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#22c55e"
              strokeWidth="8"
              strokeDasharray="31.4 125.6"
              transform="rotate(45 50 50)"
              strokeLinecap="round"
            />
          </svg>

          {/* Center value */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-emerald-500">78</span>
          </div>

          {/* Labels */}
          <div className="absolute -top-1 right-0 text-[9px] text-muted-foreground text-right">
            <span className="text-red-500">Heart</span>
            <br />
            <span className="text-red-500">Health</span>
          </div>
          <div className="absolute top-1/2 -right-2 -translate-y-1/2 text-[9px] text-muted-foreground">
            <span className="text-emerald-500">Cholesterol</span>
            <br />
            <span className="text-emerald-500">Balance</span>
          </div>
          <div className="absolute -bottom-1 right-0 text-[9px] text-muted-foreground text-right">
            <span className="text-amber-500">Inflammation</span>
          </div>
          <div className="absolute bottom-1/4 -left-2 text-[9px] text-muted-foreground">
            <span className="text-blue-500">Metabolic</span>
            <br />
            <span className="text-blue-500">Health</span>
          </div>
        </div>
      </div>
    </div>
  );
}
