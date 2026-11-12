import React from 'react';
import { sortedCubes, leftNodes, rightNodes, renderCube } from './crystalData';

export function CrystalHubSvg({ hoveredNode }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid meet">
      <defs>
        {/* Standard Silver Metallic Cube Gradients */}
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

        {/* Glowing Emerald Cube Gradients */}
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

        {/* Glowing Cyan Cube Gradients */}
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

        {/* Hexagon Neon Gradient */}
        <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>

        {/* Connection Line Gradients */}
        <linearGradient id="lineGradLeft" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
          <stop offset="60%" stopColor="#10b981" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="lineGradRight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
          <stop offset="40%" stopColor="#06b6d4" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
        </linearGradient>

        {/* Glow Filter */}
        <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Static Background Path Glows */}
      {leftNodes.map(node => (
        <path
          key={`bg-l-${node.id}`}
          d={`M 320 ${node.y} C 420 ${node.y}, 513.4 380, 613.4 380`}
          fill="none"
          stroke="rgba(16, 185, 129, 0.08)"
          strokeWidth="1.5"
          className="transition-all duration-300"
          style={{
            stroke: hoveredNode ? (hoveredNode.type === 'left' && hoveredNode.id === node.id ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.02)') : 'rgba(16, 185, 129, 0.08)'
          }}
        />
      ))}
      {rightNodes.map(node => (
        <path
          key={`bg-r-${node.id}`}
          d={`M 786.6 380 C 886.6 380, 860 ${node.y}, 960 ${node.y}`}
          fill="none"
          stroke="rgba(6, 182, 212, 0.08)"
          strokeWidth="1.5"
          className="transition-all duration-300"
          style={{
            stroke: hoveredNode ? (hoveredNode.type === 'right' && hoveredNode.id === node.id ? 'rgba(6, 182, 212, 0.35)' : 'rgba(6, 182, 212, 0.02)') : 'rgba(6, 182, 212, 0.08)'
          }}
        />
      ))}

      {/* Animated Flow Lines */}
      {leftNodes.map((node, i) => (
        <path
          key={`flow-l-${node.id}`}
          d={`M 320 ${node.y} C 420 ${node.y}, 513.4 380, 613.4 380`}
          fill="none"
          stroke="url(#lineGradLeft)"
          strokeWidth="2"
          filter="url(#glowFilter)"
          className="flow-line-left transition-all duration-300"
          style={{
            animationDelay: `${i * 0.65}s`,
            animationDuration: `${3.5 + (i % 3) * 0.6}s`,
            opacity: hoveredNode ? (hoveredNode.type === 'left' && hoveredNode.id === node.id ? 1 : 0.08) : 0.65
          }}
        />
      ))}
      {rightNodes.map((node, i) => (
        <path
          key={`flow-r-${node.id}`}
          d={`M 786.6 380 C 886.6 380, 860 ${node.y}, 960 ${node.y}`}
          fill="none"
          stroke="url(#lineGradRight)"
          strokeWidth="2"
          filter="url(#glowFilter)"
          className="flow-line-right transition-all duration-300"
          style={{
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${3.5 + (i % 2) * 0.6}s`,
            opacity: hoveredNode ? (hoveredNode.type === 'right' && hoveredNode.id === node.id ? 1 : 0.08) : 0.65
          }}
        />
      ))}

      {/* Central Hexagon and Cube Cluster Group */}
      <g className="animate-hub-scale" style={{ transformOrigin: '700px 380px', animationDelay: '0.3s', opacity: 0 }}>
        <g className="animate-[floatCluster_5.5s_ease-in-out_infinite]" style={{ transformOrigin: '700px 380px' }}>
          <polygon
            points="700,280 786.6,330 786.6,430 700,480 613.4,430 613.4,330"
            fill="none"
            stroke="url(#hexGrad)"
            strokeWidth="4"
            filter="url(#glowFilter)"
            className="animate-[pulseGlow_4s_ease-in-out_infinite]"
          />
          <polygon
            points="700,280 786.6,330 786.6,430 700,480 613.4,430 613.4,330"
            fill="#080F0B"
            stroke="url(#hexGrad)"
            strokeWidth="1.5"
            opacity="0.9"
          />
          {sortedCubes.map((cube, idx) => renderCube(cube, idx, 28, 700, 380))}
        </g>
      </g>
    </svg>
  );
}

export default CrystalHubSvg;
