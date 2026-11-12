import React from 'react';

// Carbon Distribution Donut Chart
export const CarbonDistributionDonut = ({ categories = [], totalKg = 0, totalTonnes = 0, unitMode = 'tonnes', hoveredId = null, onHover = () => {}, isLight = false }) => {
  const radius = 68;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius; // ~427.25

  const activeSlices = categories.filter(c => c.percentage > 0);
  let accumulatedPct = 0;

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
        <svg viewBox="0 0 180 180" className="w-full h-full transform -rotate-90">
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="transparent"
            stroke={isLight ? "#E2E8F0" : "#0D2214"}
            strokeWidth={strokeWidth}
          />
          {activeSlices.map((slice) => {
            const strokeDash = (slice.percentage / 100) * circumference;
            const strokeOffset = -((accumulatedPct / 100) * circumference);
            accumulatedPct += slice.percentage;
            const isHovered = hoveredId === slice.id;

            return (
              <circle
                key={slice.id}
                cx="90"
                cy="90"
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${strokeDash} ${circumference}`}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => onHover(slice.id)}
                onMouseLeave={() => onHover(null)}
                style={{
                  filter: isHovered ? `drop-shadow(0 0 8px ${slice.color}99)` : 'none'
                }}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
          <span className={`text-[9px] font-mono uppercase tracking-wider font-bold ${
            isLight ? 'text-fg-muted' : 'text-fg-secondary'
          }`}>
            Total Footprint
          </span>
          <span className={`font-mono font-black text-lg sm:text-xl leading-tight ${
            isLight ? 'text-accent' : 'text-accent-hover'
          }`}>
            {unitMode === 'tonnes' ? `${totalTonnes.toLocaleString()} t` : `${totalKg.toLocaleString()} kg`}
          </span>
          <span className={`text-[9px] font-semibold ${isLight ? 'text-fg-secondary' : 'text-emerald-300/60'}`}>
            CO₂e Emissions
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 w-full">
        {activeSlices.map(slice => {
          const isHovered = hoveredId === slice.id;
          return (
            <div
              key={slice.id}
              onMouseEnter={() => onHover(slice.id)}
              onMouseLeave={() => onHover(null)}
              className={`flex items-center space-x-2 p-1.5 rounded-xl cursor-pointer transition-all border ${
                isHovered 
                  ? (isLight ? 'bg-emerald-50/80 border-emerald-300 scale-[1.02]' : 'bg-bg-elevated border-border-strong/40 scale-[1.02]') 
                  : (isLight ? 'bg-bg-canvas border-transparent hover:border-slate-200' : 'bg-bg-canvas/60 border-transparent hover:border-border-subtle')
              }`}
            >
              <div 
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: slice.color }}
              />
              <div className="truncate text-left leading-tight min-w-0">
                <div className={`text-[11px] font-bold truncate ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                  {slice.name}
                </div>
                <div className={`text-[10px] font-mono ${isLight ? 'text-fg-muted' : 'text-fg-secondary'}`}>
                  {slice.percentage}% • {unitMode === 'tonnes' ? `${slice.carbonTonnes} t` : `${slice.carbonKg.toLocaleString()} kg`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
