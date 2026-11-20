import React, { useState } from 'react';
import { getPrefersReducedMotion } from '../../lib/motion';

const BANGLADESH_SCAN_NODES = [
  {
    id: 'rangpur-awd',
    name: 'Rangpur AWD Rice Corridor',
    sector: 'Methane Reduction (AWD)',
    cx: 108,
    cy: 64,
    ndvi: '0.78 NDVI',
    metric: '1,200 tCO₂e · IoT Piezometer',
  },
  {
    id: 'sylhet-solar',
    name: 'Sylhet Haor Solar Irrigation',
    sector: 'Grid Displacement',
    cx: 224,
    cy: 88,
    ndvi: '0.71 NDVI',
    metric: '940 MWh · Smart Inverter',
  },
  {
    id: 'dhaka-esg',
    name: 'Dhaka Industrial Cluster',
    sector: 'Corporate Scope 1 & 2',
    cx: 158,
    cy: 132,
    ndvi: 'DESCO / Titas',
    metric: 'Dual-Control Ledger Active',
  },
  {
    id: 'sundarbans-blue',
    name: 'Sundarbans Mangrove Reserve',
    sector: 'Blue Carbon Allometry',
    cx: 118,
    cy: 204,
    ndvi: '0.84 NDVI',
    metric: '3,800 ha · Sentinel-2 L2A',
  },
  {
    id: 'cht-forestry',
    name: 'Chittagong Hill Agroforestry',
    sector: 'Canopy Biomass Stock',
    cx: 248,
    cy: 196,
    ndvi: '0.81 NDVI',
    metric: '5,420 ha · SAR + Optical',
  },
];

const STORY_STEPS = [
  {
    id: 'upload',
    step: '01',
    label: 'Upload',
    detail: 'Ingest DESCO/Titas utility bills, IoT water-table logs, or GeoJSON field boundaries.',
  },
  {
    id: 'verify',
    step: '02',
    label: 'Verify',
    detail: 'Cross-check Sentinel-2 NDVI/NDWI bands and enforce two-person auditor approval.',
  },
  {
    id: 'credit',
    step: '03',
    label: 'Credit',
    detail: 'Compute conservative tCO₂e reductions with cited IPCC AR6 & national grid factors.',
  },
  {
    id: 'registry',
    step: '04',
    label: 'Registry',
    detail: 'Record hash-chained serials on the ledger with direct bKash/Nagad farmer settlement.',
  },
];

/**
 * BangladeshSatelliteScanSvg (Phase 7.2)
 * - Interactive SVG satellite-scan & carbon-flow graphic over Bangladesh (zero heavy 3D libs).
 * - Subtle pointer parallax on mouse devices only (disabled on touch and under prefers-reduced-motion).
 * - Interactive 4-stage storytelling bar (Upload -> Verify -> Credit -> Registry).
 */
export function BangladeshSatelliteScanSvg() {
  const [selectedNodeId, setSelectedNodeId] = useState('sundarbans-blue');
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const selectedNode =
    BANGLADESH_SCAN_NODES.find((n) => n.id === selectedNodeId) || BANGLADESH_SCAN_NODES[0];
  const activeStory = STORY_STEPS[activeStoryIdx] || STORY_STEPS[0];

  const handlePointerMove = (e) => {
    // Disable pointer parallax on touch devices or when user prefers reduced motion
    if (e.pointerType === 'touch' || getPrefersReducedMotion()) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({
      x: Number((nx * 10).toFixed(2)),
      y: Number((ny * 8).toFixed(2)),
    });
  };

  const handlePointerLeave = () => {
    if (parallax.x !== 0 || parallax.y !== 0) {
      setParallax({ x: 0, y: 0 });
    }
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      data-testid="hero-satellite-scan"
      className="rounded-2xl bg-black/55 border border-white/10 p-3 sm:p-4 mb-4 space-y-3 select-none"
    >
      {/* Top Status Bar */}
      <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
        <span className="text-accent font-semibold uppercase tracking-wider">
          SENTINEL-2 ORBITAL PASS · BANGLADESH GRID
        </span>
        <span className="text-white/60">{selectedNode.ndvi}</span>
      </div>

      {/* Interactive SVG Map + Scan Frame */}
      <div className="relative w-full h-40 sm:h-44 rounded-xl bg-bg-canvas/90 border border-white/10 overflow-hidden">
        <svg
          viewBox="0 0 340 240"
          className="w-full h-full"
          role="img"
          aria-label="Interactive satellite scan over Bangladesh carbon project corridors"
          style={
            parallax.x !== 0 || parallax.y !== 0
              ? {
                  transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
                  transition: 'transform 150ms cubic-bezier(0.22, 1, 0.36, 1)',
                }
              : undefined
          }
        >
          <defs>
            <linearGradient id="bdScanGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(0, 200, 83, 0.28)" />
              <stop offset="100%" stopColor="rgba(6, 182, 212, 0.08)" />
            </linearGradient>
          </defs>

          {/* Coordinate Graticule Lines */}
          <g stroke="rgba(255,255,255,0.06)" strokeWidth="1">
            <line x1="0" y1="60" x2="340" y2="60" />
            <line x1="0" y1="120" x2="340" y2="120" />
            <line x1="0" y1="180" x2="340" y2="180" />
            <line x1="85" y1="0" x2="85" y2="240" />
            <line x1="170" y1="0" x2="170" y2="240" />
            <line x1="255" y1="0" x2="255" y2="240" />
          </g>

          {/* Stylized Bangladesh Delta & River Basin Silhouette */}
          <path
            d="M84,36 L142,28 L178,56 L248,62 L262,108 L234,142 L268,184 L244,224 L196,202 L152,222 L96,214 L82,164 L66,112 Z"
            fill="url(#bdScanGrad)"
            stroke="rgba(0, 200, 83, 0.45)"
            strokeWidth="1.5"
          />

          {/* Major River Channels (Jamuna / Padma / Meghna) */}
          <path
            d="M126,32 Q144,96 158,132 T184,212 M224,68 Q190,118 164,144"
            fill="none"
            stroke="rgba(56, 189, 248, 0.35)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {/* Carbon Flow Telemetry Vectors Connecting Nodes to Dhaka Hub */}
          {BANGLADESH_SCAN_NODES.map((node) => (
            <line
              key={`link-${node.id}`}
              x1={node.cx}
              y1={node.cy}
              x2={158}
              y2={132}
              stroke={node.id === selectedNode.id ? 'rgba(0, 200, 83, 0.85)' : 'rgba(255, 255, 255, 0.16)'}
              strokeWidth={node.id === selectedNode.id ? '1.8' : '1'}
              strokeDasharray="4 4"
            />
          ))}

          {/* Project Corridor Nodes */}
          {BANGLADESH_SCAN_NODES.map((node) => {
            const isSelected = node.id === selectedNode.id;
            return (
              <g
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className="cursor-pointer"
              >
                {isSelected && (
                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r="13"
                    fill="rgba(0, 200, 83, 0.18)"
                    stroke="rgba(0, 200, 83, 0.6)"
                    strokeWidth="1"
                  />
                )}
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r={isSelected ? '5.5' : '4'}
                  fill={isSelected ? '#00C853' : '#F0F4F1'}
                />
              </g>
            );
          })}
        </svg>

        {/* Active Node Telemetry Readout Pill */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-[11px] font-mono">
          <span className="text-white font-semibold truncate">{selectedNode.name}</span>
          <span className="text-accent shrink-0">{selectedNode.metric}</span>
        </div>
      </div>

      {/* 4-Stage Storytelling Pipeline: Upload -> Verify -> Credit -> Registry */}
      <div className="space-y-2 pt-1">
        <div className="grid grid-cols-4 gap-1.5" role="tablist" aria-label="CarbonOS pipeline stages">
          {STORY_STEPS.map((st, idx) => {
            const isActive = idx === activeStoryIdx;
            return (
              <button
                key={st.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveStoryIdx(idx)}
                className={`px-2 py-1.5 rounded-lg font-mono text-[10px] transition-colors cursor-pointer text-center border min-h-[36px] ${
                  isActive
                    ? 'bg-accent/20 border-accent text-white font-bold'
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                }`}
              >
                <span className="text-accent mr-1">{st.step}</span>
                <span>{st.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] font-sans text-white/75 leading-snug px-1">
          <span className="font-mono text-accent font-semibold mr-1.5">
            [{activeStory.label}]
          </span>
          {activeStory.detail}
        </p>
      </div>
    </div>
  );
}

export default BangladeshSatelliteScanSvg;

