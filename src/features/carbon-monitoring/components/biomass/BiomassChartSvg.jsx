import React from 'react';

export function BiomassChartSvg({
  isLight,
  chartW,
  chartH,
  padLeft,
  padRight,
  padTop,
  padBottom,
  plotH,
  colWidth,
  metricConfig,
  points,
  baselinePathString,
  selectedMetric,
  hoveredQuarter,
  setHoveredQuarter
}) {
  return (
    <div className="relative">
      {/* Tooltip Card Overlay (Dynamic) */}
      {hoveredQuarter && (
        <div
          className={`absolute top-0 right-4 z-20 p-3.5 rounded-2xl border shadow-xl backdrop-blur-xl transition-all duration-200 pointer-events-none max-w-xs ${
            isLight
              ? 'bg-white/95 border-border-subtle text-fg-primary'
              : 'bg-bg-elevated/95 border-border-subtle text-white'
          }`}
        >
          <div
            className={`flex items-center justify-between gap-2 border-b pb-2 mb-2 ${
              isLight ? 'border-border-subtle' : 'border-border-subtle'
            }`}
          >
            <span className="font-extrabold text-xs">{hoveredQuarter.label}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                isLight
                  ? 'bg-accent-muted text-accent border-border-subtle'
                  : 'bg-emerald/10 text-emerald border-emerald/20'
              }`}
            >
              {hoveredQuarter.status}
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className={isLight ? 'text-fg-secondary' : 'text-fg-secondary'}>Active Value:</span>
              <span className="font-bold font-mono tabular-nums text-emerald">
                {metricConfig.format(hoveredQuarter[metricConfig.primaryKey])}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={isLight ? 'text-fg-secondary' : 'text-fg-secondary'}>Pre-Project Base:</span>
              <span className="font-bold font-mono tabular-nums text-amber-500">
                {metricConfig.format(hoveredQuarter[metricConfig.baselineKey])}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={isLight ? 'text-fg-secondary' : 'text-fg-secondary'}>Additionality Delta:</span>
              <span className="font-bold font-mono tabular-nums text-emerald">
                +{(hoveredQuarter[metricConfig.primaryKey] - hoveredQuarter[metricConfig.baselineKey]).toFixed(2)}
              </span>
            </div>
            <div
              className={`flex justify-between border-t pt-1.5 text-[10px] font-mono ${
                isLight ? 'border-border-subtle text-fg-secondary' : 'border-border-subtle text-fg-secondary'
              }`}
            >
              <span>Sensor: {hoveredQuarter.sensor}</span>
              <span>Cloud: {hoveredQuarter.cloudCover}</span>
            </div>
          </div>
        </div>
      )}

      {/* SVG Surface */}
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-[270px] select-none">
          <defs>
            <linearGradient id="activeColGradLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent-hover)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="var(--color-accent-default)" stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="activeColGradDark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent-hover)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--color-accent-default)" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="hoverColGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent-hover)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--color-accent-default)" stopOpacity="0.75" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {metricConfig.gridSteps.map((step, idx) => {
            const y = padTop + (idx / 4) * plotH;
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={chartW - padRight}
                  y2={y}
                  stroke="var(--color-border-subtle)"
                  strokeDasharray={idx === 4 ? 'none' : '4 4'}
                  strokeWidth={idx === 4 ? '1.5' : '1'}
                />
                <text
                  x={padLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fontWeight="600"
                  fill="var(--color-fg-secondary)"
                  fontFamily="system-ui, sans-serif"
                >
                  {selectedMetric === 'ndvi' ? step.toFixed(2) : Math.round(step)}
                </text>
              </g>
            );
          })}

          {/* Dotted Baseline Spline Line */}
          <path
            d={baselinePathString}
            fill="none"
            stroke="var(--color-status-warning)"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            strokeLinecap="round"
            className="chart-animate-line"
            opacity={isLight ? '0.9' : '0.85'}
          />

          {/* Baseline Point Pins */}
          {points.map((p, idx) => (
            <circle
              key={`base-${idx}`}
              cx={p.x}
              cy={p.yBase}
              r="4"
              fill="var(--color-bg-surface)"
              stroke="var(--color-status-warning)"
              strokeWidth="2.5"
            />
          ))}

          {/* Primary Data Bars */}
          {points.map((p, idx) => {
            const isHovered = hoveredQuarter && hoveredQuarter.id === p.q.id;
            return (
              <g
                key={`bar-${idx}`}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredQuarter(p.q)}
                onMouseLeave={() => setHoveredQuarter(null)}
              >
                <rect
                  x={p.x - colWidth}
                  y={padTop}
                  width={colWidth * 2}
                  height={plotH + padBottom}
                  fill="transparent"
                />

                <rect
                  x={p.x - colWidth / 2}
                  y={p.yVal}
                  width={colWidth}
                  height={Math.max(4, p.barH)}
                  rx="6"
                  fill={
                    isHovered
                      ? 'url(#hoverColGrad)'
                      : isLight
                      ? 'url(#activeColGradLight)'
                      : 'url(#activeColGradDark)'
                  }
                  className="transition-all duration-200 chart-animate-bar"
                  style={{ animationDelay: `${idx * 45}ms` }}
                  opacity={hoveredQuarter && !isHovered ? '0.45' : '1'}
                />

                <line
                  x1={p.x - colWidth / 2 + 2}
                  y1={p.yVal}
                  x2={p.x + colWidth / 2 - 2}
                  y2={p.yVal}
                  stroke="var(--color-accent-default)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                <text
                  x={p.x}
                  y={p.yVal - 8}
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="800"
                  fill={isHovered ? 'var(--color-accent-default)' : 'var(--color-fg-primary)'}
                  className="transition-colors"
                >
                  {selectedMetric === 'ndvi' ? p.val.toFixed(2) : Math.round(p.val)}
                </text>

                <text
                  x={p.x}
                  y={chartH - 12}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={isHovered ? '800' : '600'}
                  fill={isHovered ? 'var(--color-accent-default)' : 'var(--color-fg-secondary)'}
                  className="transition-colors"
                >
                  {p.q.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default BiomassChartSvg;
