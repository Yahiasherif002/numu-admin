/**
 * World Map Component - NUMU Admin Dashboard
 * 
 * Design: Geographic data visualization
 * Based on Figma: World map visualization
 */

export default function WorldMap() {
  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">
          Delivery Stats - Order by Country
        </h3>
      </div>

      {/* Simplified world map using SVG */}
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg overflow-hidden">
        <svg
          viewBox="0 0 800 400"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Simplified continents */}
          <g fill="#93c5fd" opacity="0.6">
            {/* North America */}
            <path d="M120,80 Q180,60 220,90 L240,140 Q200,180 150,160 L100,120 Z" />
            {/* South America */}
            <path d="M180,200 Q220,180 230,220 L220,300 Q180,320 160,280 L170,220 Z" />
            {/* Europe */}
            <path d="M380,80 Q420,60 460,80 L470,120 Q440,140 400,130 L380,100 Z" />
            {/* Africa */}
            <path d="M400,150 Q450,140 480,180 L470,280 Q420,300 390,260 L400,180 Z" />
            {/* Asia */}
            <path d="M500,60 Q600,40 700,80 L720,180 Q650,200 550,180 L500,120 Z" />
            {/* Australia */}
            <path d="M620,260 Q680,240 720,270 L710,320 Q660,340 620,310 Z" />
          </g>

          {/* Data points */}
          <g>
            {/* USA */}
            <circle cx="180" cy="120" r="8" fill="#6366f1" opacity="0.8">
              <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
            </circle>
            {/* Brazil */}
            <circle cx="200" cy="260" r="6" fill="#22c55e" opacity="0.8">
              <animate attributeName="r" values="4;8;4" dur="2.5s" repeatCount="indefinite" />
            </circle>
            {/* UK */}
            <circle cx="400" cy="90" r="7" fill="#f59e0b" opacity="0.8">
              <animate attributeName="r" values="5;9;5" dur="2.2s" repeatCount="indefinite" />
            </circle>
            {/* India */}
            <circle cx="580" cy="160" r="9" fill="#ec4899" opacity="0.8">
              <animate attributeName="r" values="7;11;7" dur="1.8s" repeatCount="indefinite" />
            </circle>
            {/* Australia */}
            <circle cx="670" cy="290" r="5" fill="#14b8a6" opacity="0.8">
              <animate attributeName="r" values="3;7;3" dur="2.8s" repeatCount="indefinite" />
            </circle>
          </g>
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 bg-white/80 px-2 py-1 rounded text-xs">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-muted-foreground">USA</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/80 px-2 py-1 rounded text-xs">
            <div className="w-2 h-2 rounded-full bg-pink-500" />
            <span className="text-muted-foreground">India</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/80 px-2 py-1 rounded text-xs">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">UK</span>
          </div>
        </div>
      </div>
    </div>
  );
}
