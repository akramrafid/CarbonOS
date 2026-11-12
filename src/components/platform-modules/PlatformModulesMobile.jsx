import React from 'react';
import { Link } from 'react-router-dom';
import { sortedCubes, leftNodes, rightNodes, renderCube } from './crystalData';

export function PlatformModulesMobile() {
  return (
    <div className="lg:hidden flex flex-col space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 text-[10px] uppercase tracking-[0.25em] text-emerald font-bold">
          <span>Platform Modules</span>
          <span className="w-1 h-1 rounded-full bg-emerald"></span>
          <span>6 Core Systems</span>
        </div>
        <h2 className="font-sans font-light text-3xl text-registry tracking-tight leading-tight">
          Securing the entire carbon lifecycle
        </h2>
        <p className="text-mist text-xs leading-relaxed max-w-lg mx-auto">
          Carbon Zero BD integration proactively monitors, verifies, and secures carbon credits. By combining satellite telemetry, AI fraud detection, and automated registry workflows, we guarantee that every credit is real and permanent.
        </p>
      </div>

      {/* Centered Hub SVG */}
      <div className="flex justify-center my-6">
        <svg className="w-48 h-56 overflow-visible pointer-events-none" viewBox="0 0 220 220">
          <defs>
            <linearGradient id="cubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id="cubeLeft" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="cubeRight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="glowEmeraldTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="glowEmeraldLeft" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="glowEmeraldRight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#064e3b" />
            </linearGradient>
            <linearGradient id="glowCyanTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a5f3fc" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <linearGradient id="glowCyanLeft" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
            <linearGradient id="glowCyanRight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#164e63" />
            </linearGradient>
            <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g className="animate-[floatCluster_5s_ease-in-out_infinite]" style={{ transformOrigin: '110px 110px' }}>
            <polygon
              points="110,10 196.6,60 196.6,160 110,210 23.4,160 23.4,60"
              fill="none"
              stroke="url(#hexGrad)"
              strokeWidth="4"
              filter="url(#glowFilter)"
              className="animate-[pulseGlow_4s_ease-in-out_infinite]"
            />
            <polygon
              points="110,10 196.6,60 196.6,160 110,210 23.4,160 23.4,60"
              fill="#080F0B"
              stroke="url(#hexGrad)"
              strokeWidth="1.5"
              opacity="0.9"
            />
            {sortedCubes.map((cube, idx) => renderCube(cube, idx, 24, 110, 110))}
          </g>
        </svg>
      </div>

      {/* Core Systems list */}
      <div className="space-y-4">
        <h3 className="text-emerald font-mono text-xs uppercase tracking-wider font-semibold border-b border-emerald/10 pb-2">
          Core Platform Systems
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {leftNodes.map((node) => (
            <Link
              key={node.id}
              to={node.to}
              className="flex items-center bg-bg-canvas/80 border border-emerald/20 hover:border-emerald/50 rounded-full px-4 py-3 transition-colors group"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3 relative flex items-center justify-center">
                <div className="absolute w-2 h-2 rounded-full bg-emerald-500/50 animate-ping"></div>
              </div>
              <span className="text-registry text-xs font-mono group-hover:text-emerald transition-colors">{node.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Key Outcomes list */}
      <div className="space-y-4">
        <h3 className="text-cyan font-mono text-xs uppercase tracking-wider font-semibold border-b border-cyan/10 pb-2">
          Target Outcomes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rightNodes.map((node) => (
            <div
              key={node.id}
              className="flex items-center bg-bg-canvas/80 border border-cyan/20 rounded-full px-4 py-3"
            >
              <div className="w-2 h-2 rounded-full bg-cyan-500 mr-3 relative flex items-center justify-center">
                <div className="absolute w-2 h-2 rounded-full bg-cyan-500/50 animate-ping"></div>
              </div>
              <span className="text-registry text-xs font-mono">{node.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PlatformModulesMobile;
