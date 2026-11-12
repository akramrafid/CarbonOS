import React, { useState } from 'react';

// Catmull-Rom Bezier Spline Helper for Smooth Curves
export function getSplinePath(points) {
  if (!points || points.length === 0) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

// Wide Emissions Trend Chart (Smooth Spline Area Chart)
export const EmissionsTrendChart = ({ isLight = false, total = 2450 }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const seasonalWeights = [0.88, 0.82, 0.94, 1.06, 1.18, 1.25, 1.16, 1.10, 1.02, 0.94, 0.86, 0.82];
  const safeTotal = Math.max(12, parseFloat(total) || 2450);
  const avgMonthly = safeTotal / 12;

  const rawValues = seasonalWeights.map(w => Math.round(avgMonthly * w));
  const maxVal = Math.max(...rawValues, 10) * 1.15;
  const minVal = Math.max(0, Math.min(...rawValues) * 0.7);
  const range = maxVal - minVal || 1;

  const actualPoints = months.map((month, idx) => {
    const x = 45 + idx * 49;
    const val = rawValues[idx];
    const y = 140 - ((val - minVal) / range) * 105;
    return { x, y: Math.max(28, Math.min(140, y)), val, month };
  });

  const targetPoints = months.map((_, idx) => {
    const x = 45 + idx * 49;
    const targetVal = avgMonthly * (1.10 - 0.025 * idx);
    const y = 140 - ((targetVal - minVal) / range) * 105;
    return { x, y: Math.max(28, Math.min(140, y)) };
  });

  const actualCurve = getSplinePath(actualPoints);
  const targetCurve = getSplinePath(targetPoints);
  const areaPath = `${actualCurve} L 585 140 L 45 140 Z`;

  const gridTicks = [
    { label: Math.round(maxVal).toString(), y: 35 },
    { label: Math.round(minVal + range * 0.66).toString(), y: 70 },
    { label: Math.round(minVal + range * 0.33).toString(), y: 105 },
    { label: Math.round(minVal).toString(), y: 140 }
  ];

  return (
    <div className="relative w-full h-full flex flex-col justify-between">
      {hoveredPoint && (
        <div 
          className={`absolute -top-3 z-20 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold shadow-md border pointer-events-none transform -translate-x-1/2 transition-transform duration-150 ${
            isLight 
              ? 'bg-white text-[#0F2417] border-[#E8ECE8]' 
              : 'bg-[#0D2B1A] text-[#4ADE80] border-[#1B4D2E]'
          }`}
          style={{ left: `${(hoveredPoint.x / 620) * 100}%` }}
        >
          {hoveredPoint.month}: {hoveredPoint.val.toLocaleString()} tCO₂e
        </div>
      )}

      <svg viewBox="0 0 620 170" className="w-full h-auto overflow-visible select-none" preserveAspectRatio="none">
        <defs>
          <linearGradient id="emissionsSplineArea" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00C853" stopOpacity={isLight ? 0.35 : 0.45} />
            <stop offset="50%" stopColor="#00E676" stopOpacity={isLight ? 0.15 : 0.20} />
            <stop offset="100%" stopColor="#00C853" stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {gridTicks.map((grid, idx) => (
          <g key={idx}>
            <text 
              x="8" 
              y={grid.y + 3} 
              fill={isLight ? '#8BA192' : '#557361'} 
              fontSize="8" 
              fontFamily="monospace"
            >
              {grid.label}
            </text>
            <line 
              x1="35" 
              y1={grid.y} 
              x2="600" 
              y2={grid.y} 
              stroke={isLight ? '#E5ECE5' : '#122418'} 
              strokeDasharray="3 3" 
              strokeWidth="1" 
            />
          </g>
        ))}

        <path
          d={targetCurve}
          fill="none"
          stroke={isLight ? '#7C9A88' : '#385443'}
          strokeWidth="1.5"
          strokeDasharray="4 4"
          strokeOpacity="0.7"
        />

        <path
          d={areaPath}
          fill="url(#emissionsSplineArea)"
        />

        <path
          d={actualCurve}
          fill="none"
          stroke="#00C853"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {actualPoints.map((pt, i) => (
          <g key={i}>
            <text
              x={pt.x}
              y="160"
              textAnchor="middle"
              fill={isLight ? '#557361' : '#7C9A88'}
              fontSize="8.5"
              fontFamily="sans-serif"
              fontWeight={hoveredPoint?.month === pt.month ? 'bold' : 'normal'}
            >
              {pt.month}
            </text>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint?.month === pt.month ? 5 : 3}
              fill={hoveredPoint?.month === pt.month ? '#00E676' : '#00C853'}
              stroke={isLight ? '#FFFFFF' : '#040906'}
              strokeWidth="1.5"
              className="transition-all duration-150 cursor-pointer"
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          </g>
        ))}
      </svg>
    </div>
  );
};
