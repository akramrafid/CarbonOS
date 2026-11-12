import React from 'react';

export function BoundingBoxViewer({ present = [], lowConfidence = [], unmapped = [], activeField, onSelectField }) {
  const pageWidth = 612;
  const pageHeight = 792;

  return (
    <div className="relative border border-emerald/20 rounded-xl bg-forest/80 overflow-hidden p-2">
      <div className="flex items-center justify-between text-[11px] font-mono text-mist px-2 pb-2 border-b border-emerald/10">
        <span className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 bg-emerald rounded-sm" /> Verified
          <span className="inline-block w-2.5 h-2.5 bg-amber-400 rounded-sm ml-2" /> Low Confidence
          <span className="inline-block w-2.5 h-2.5 bg-blue-400 rounded-sm ml-2" /> Unmapped
        </span>
        <span>Page 1 Coordinate Map</span>
      </div>
      <div className="relative w-full aspect-[612/792] max-h-[500px] mx-auto bg-carbon/90 mt-2 rounded-lg border border-mist/20 overflow-hidden">
        <svg
          viewBox={`0 0 ${pageWidth} ${pageHeight}`}
          className="w-full h-full select-none"
        >
          <line x1="40" y1="80" x2="572" y2="80" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1="40" y1="200" x2="572" y2="200" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1="40" y1="400" x2="572" y2="400" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

          {/* Render present fields */}
          {present.filter((p) => p.bbox && p.bbox.length === 4).map((p, idx) => {
            const [x0, y0, x1, y1] = p.bbox;
            const w = Math.max(x1 - x0, 8);
            const h = Math.max(y1 - y0, 8);
            const isSelected = activeField === p.field;

            return (
              <g
                key={`p-${idx}`}
                className="cursor-pointer transition-all"
                onClick={() => onSelectField && onSelectField(p.field)}
              >
                <rect
                  x={x0}
                  y={y0}
                  width={w}
                  height={h}
                  fill={isSelected ? 'rgba(52, 211, 153, 0.45)' : 'rgba(52, 211, 153, 0.15)'}
                  stroke={isSelected ? '#10b981' : 'rgba(52, 211, 153, 0.7)'}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  rx="2"
                />
                <text
                  x={x0}
                  y={Math.max(y0 - 3, 10)}
                  fill="#34d399"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {p.field}
                </text>
              </g>
            );
          })}

          {/* Render low confidence fields */}
          {lowConfidence.filter((lc) => lc.bbox && lc.bbox.length === 4).map((lc, idx) => {
            const [x0, y0, x1, y1] = lc.bbox;
            return (
              <g key={`lc-${idx}`} className="cursor-pointer">
                <rect
                  x={x0}
                  y={y0}
                  width={Math.max(x1 - x0, 8)}
                  height={Math.max(y1 - y0, 8)}
                  fill="rgba(251, 191, 36, 0.25)"
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  rx="2"
                />
              </g>
            );
          })}

          {/* Render unmapped candidate numbers */}
          {unmapped.filter((u) => u.bbox && u.bbox.length === 4).map((u, idx) => {
            const [x0, y0, x1, y1] = u.bbox;
            return (
              <g key={`u-${idx}`} className="cursor-pointer">
                <rect
                  x={x0}
                  y={y0}
                  width={Math.max(x1 - x0, 8)}
                  height={Math.max(y1 - y0, 8)}
                  fill="rgba(96, 165, 250, 0.2)"
                  stroke="#60a5fa"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  rx="1"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default BoundingBoxViewer;
