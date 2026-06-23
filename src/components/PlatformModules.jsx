import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const cos30 = 0.8660254;
const sin30 = 0.5;

// Define the 3D coordinate space for the crystal cluster of cubes
const rawCubes = [
  // Bottom layer (z = -1)
  { x: -1, y: -1, z: -1 },
  { x: 0, y: -1, z: -1 },
  { x: 1, y: -1, z: -1 },
  { x: -1, y: 0, z: -1 },
  { x: 0, y: 0, z: -1, glow: 'emerald' }, // Glowing emerald center-bottom
  { x: 1, y: 0, z: -1 },
  { x: -1, y: 1, z: -1 },
  { x: 0, y: 1, z: -1 },
  { x: 1, y: 1, z: -1 },

  // Middle layer (z = 0)
  { x: -1, y: -1, z: 0 },
  { x: 0, y: -1, z: 0 },
  { x: 1, y: -1, z: 0 },
  { x: -1, y: 0, z: 0 },
  { x: 0, y: 0, z: 0 }, // Center
  { x: 1, y: 0, z: 0, glow: 'cyan' }, // Glowing cyan middle-right
  { x: -1, y: 1, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 1, y: 1, z: 0 },

  // Top layer (z = 1)
  { x: -1, y: -1, z: 1 },
  { x: 0, y: -1, z: 1 },
  { x: 1, y: -1, z: 1 },
  { x: -1, y: 0, z: 1, glow: 'emerald' }, // Glowing emerald top-left
  { x: 0, y: 0, z: 1 },
  { x: 1, y: 0, z: 1 },
  { x: -1, y: 1, z: 1 },
  { x: 0, y: 1, z: 1 },
  { x: 1, y: 1, z: 1 },
];

// Filter to create a beautiful octahedron/hexagonal crystal shape
const activeCubes = rawCubes.filter(c => {
  const dist = Math.abs(c.x) + Math.abs(c.y) + Math.abs(c.z);
  return dist <= 2;
});

// Sort from back to front (painter's algorithm) based on depth (x + y - z)
const sortedCubes = [...activeCubes].sort((a, b) => (a.x + a.y - a.z) - (b.x + b.y - b.z));

const leftNodes = [
  { id: 1, y: 130, title: "Project Onboarding Portal", to: "/platform/project-onboarding" },
  { id: 2, y: 230, title: "MRV Dashboard", to: "/platform/mrv-dashboard" },
  { id: 3, y: 330, title: "Carbon Registry System", to: "/platform/carbon-registry" },
  { id: 4, y: 430, title: "Verification Workflow Engine", to: "/platform/verification-workflow" },
  { id: 5, y: 530, title: "Carbon Marketplace", to: "/platform/marketplace" },
  { id: 6, y: 630, title: "AI Fraud Detection", to: "/platform/ai-detection" },
];

const rightNodes = [
  { id: 7, y: 230, title: "99.9% Verified Credits" },
  { id: 8, y: 330, title: "Automated Compliance" },
  { id: 9, y: 430, title: "Global Market Access" },
  { id: 10, y: 530, title: "Traceable Lifecycle" },
];

const PlatformModules = () => {
  const [hoveredNode, setHoveredNode] = useState(null);

  const renderCube = (cube, index, w = 28, centerOffsetX = 700, centerOffsetY = 380) => {
    const { x, y, z, glow } = cube;
    const cx = centerOffsetX + (x - y) * w * cos30;
    const cy = centerOffsetY + (x + y) * w * sin30 - z * w;

    let topFill = 'url(#cubeTop)';
    let leftFill = 'url(#cubeLeft)';
    let rightFill = 'url(#cubeRight)';

    if (glow === 'emerald') {
      topFill = 'url(#glowEmeraldTop)';
      leftFill = 'url(#glowEmeraldLeft)';
      rightFill = 'url(#glowEmeraldRight)';
    } else if (glow === 'cyan') {
      topFill = 'url(#glowCyanTop)';
      leftFill = 'url(#glowCyanLeft)';
      rightFill = 'url(#glowCyanRight)';
    }

    const topPath = `M ${cx} ${cy} L ${cx - w * cos30} ${cy - w * sin30} L ${cx} ${cy - w} L ${cx + w * cos30} ${cy - w * sin30} Z`;
    const leftPath = `M ${cx} ${cy} L ${cx - w * cos30} ${cy - w * sin30} L ${cx - w * cos30} ${cy + w * sin30} L ${cx} ${cy + w} Z`;
    const rightPath = `M ${cx} ${cy} L ${cx + w * cos30} ${cy - w * sin30} L ${cx + w * cos30} ${cy + w * sin30} L ${cx} ${cy + w} Z`;

    return (
      <g key={index} className={glow ? 'animate-pulse' : ''} style={glow ? { animationDuration: '2s', animationDelay: `${index * 0.25}s` } : {}}>
        <path d={leftPath} fill={leftFill} stroke="rgba(4, 10, 6, 0.4)" strokeWidth="0.5" />
        <path d={rightPath} fill={rightFill} stroke="rgba(4, 10, 6, 0.4)" strokeWidth="0.5" />
        <path d={topPath} fill={topFill} stroke="rgba(255, 255, 255, 0.12)" strokeWidth="0.5" />
      </g>
    );
  };

  return (
    <section className="w-full bg-[#040A06] py-24 relative overflow-hidden font-sans modules-section">
      <style>{`
        @keyframes fadeInHeader {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px) translateY(-50%);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(-50%);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px) translateY(-50%);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(-50%);
          }
        }
        @keyframes scaleUpHub {
          from {
            opacity: 0;
            transform: scale(0.7);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes lineFlowLeft {
          0% {
            stroke-dashoffset: 360;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes lineFlowRight {
          0% {
            stroke-dashoffset: 360;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        .flow-line-left {
          stroke-dasharray: 45 150;
          animation: lineFlowLeft 4s linear infinite;
        }
        .flow-line-right {
          stroke-dasharray: 45 150;
          animation: lineFlowRight 4s linear infinite;
        }
        @keyframes pulseGlow {
          0%, 100% {
            opacity: 0.35;
            filter: drop-shadow(0 0 12px rgba(16, 185, 129, 0.3));
          }
          50% {
            opacity: 0.7;
            filter: drop-shadow(0 0 24px rgba(6, 182, 212, 0.6));
          }
        }
        @keyframes floatCluster {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-fade-in-header {
          animation: fadeInHeader 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-hub-scale {
          animation: scaleUpHub 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      {/* Decorative Brand Text Pillars (Top-Left / Top-Right) */}
      <div className="absolute top-8 left-12 hidden lg:flex items-center space-x-2 text-[10px] uppercase tracking-[0.25em] text-mist/40 pointer-events-none">
        <span>Platform Modules</span>
        <span className="w-1 h-1 rounded-full bg-emerald"></span>
        <span>6 Core Systems</span>
      </div>
      <div className="absolute top-8 right-12 hidden lg:flex items-center text-[10px] uppercase tracking-[0.25em] text-mist/40 pointer-events-none font-bold">
        <span>CarbonOS</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Desktop Hub Container */}
        <div className="relative w-full hidden lg:block" style={{ aspectRatio: '1200/800' }}>
          
          {/* SVG Connection Lines & Hub */}
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
                {/* Outer Hexagon with neon pulsing glow */}
                <polygon
                  points="700,280 786.6,330 786.6,430 700,480 613.4,430 613.4,330"
                  fill="none"
                  stroke="url(#hexGrad)"
                  strokeWidth="4"
                  filter="url(#glowFilter)"
                  className="animate-[pulseGlow_4s_ease-in-out_infinite]"
                />
                {/* Inner Hexagon Container */}
                <polygon
                  points="700,280 786.6,330 786.6,430 700,480 613.4,430 613.4,330"
                  fill="#080F0B"
                  stroke="url(#hexGrad)"
                  strokeWidth="1.5"
                  opacity="0.9"
                />
                {/* Isometric Cube Cluster */}
                {sortedCubes.map((cube, idx) => renderCube(cube, idx, 28, 700, 380))}
              </g>
            </g>
          </svg>

          {/* Left Column Pills */}
          {leftNodes.map((node, idx) => (
            <Link
              key={node.id}
              to={node.to}
              className="absolute left-pill-anim flex items-center bg-[#080F0B]/85 hover:bg-[#0d1c13] border border-emerald/25 hover:border-emerald/80 rounded-full px-4 py-3 cursor-pointer transition-all duration-300 z-20 backdrop-blur-sm shadow-[0_3px_12px_rgba(4,10,6,0.6)] group"
              style={{
                left: '6.666%',
                top: `${(node.y / 800) * 100}%`,
                width: '20%',
                transform: 'translateY(-50%)',
                animation: 'slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                animationDelay: `${0.1 + idx * 0.08}s`,
                opacity: 0
              }}
              onMouseEnter={() => setHoveredNode({ type: 'left', id: node.id })}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Pulsing indicator dot */}
              <div className="w-2 h-2 rounded-full bg-[#10b981] mr-3 relative flex items-center justify-center">
                <div className="absolute w-2.5 h-2.5 rounded-full bg-[#10b981]/50 animate-ping group-hover:duration-700"></div>
              </div>
              <span className="text-registry text-xs font-mono tracking-wide">{node.title}</span>
              {/* Edge connector anchor */}
              <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#10b981] border border-[#040A06] z-30 shadow-[0_0_8px_rgba(16,185,129,0.8)] group-hover:scale-125 transition-transform duration-300"></div>
            </Link>
          ))}

          {/* Right Column Pills */}
          {rightNodes.map((node, idx) => (
            <div
              key={node.id}
              className="absolute right-pill-anim flex items-center bg-[#080F0B]/85 border border-cyan/25 hover:border-cyan/80 rounded-full px-4 py-3 transition-all duration-300 z-20 backdrop-blur-sm shadow-[0_3px_12px_rgba(4,10,6,0.6)] group"
              style={{
                left: '80%',
                top: `${(node.y / 800) * 100}%`,
                width: '16.666%',
                transform: 'translateY(-50%)',
                animation: 'slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                animationDelay: `${0.1 + idx * 0.08}s`,
                opacity: 0
              }}
              onMouseEnter={() => setHoveredNode({ type: 'right', id: node.id })}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Pulsing indicator dot */}
              <div className="w-2 h-2 rounded-full bg-[#06b6d4] mr-3 relative flex items-center justify-center">
                <div className="absolute w-2.5 h-2.5 rounded-full bg-[#06b6d4]/50 animate-ping group-hover:duration-700"></div>
              </div>
              <span className="text-registry text-xs font-mono tracking-wide">{node.title}</span>
              {/* Edge connector anchor */}
              <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#06b6d4] border border-[#040A06] z-30 shadow-[0_0_8px_rgba(6,182,212,0.8)] group-hover:scale-125 transition-transform duration-300"></div>
            </div>
          ))}

          {/* Large Title Text */}
          <div
            className="absolute modules-header pointer-events-none select-none"
            style={{
              left: '38.333%',
              top: '9.375%',
              width: '40%',
              animation: 'fadeInHeader 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              animationDelay: '0.1s',
              opacity: 0
            }}
          >
            <h2 className="font-sans font-light text-[38px] leading-[1.2] text-registry tracking-tight">
              Securing the entire<br />
              carbon lifecycle<br />
              from source to registry
            </h2>
          </div>

          {/* Objective Paragraph */}
          <div
            className="absolute modules-header"
            style={{
              left: '38.333%',
              top: '70.625%',
              width: '38.333%',
              animation: 'fadeInHeader 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              animationDelay: '0.2s',
              opacity: 0
            }}
          >
            <h4 className="text-emerald font-mono text-[11px] uppercase tracking-[0.2em] mb-2.5 font-bold">CarbonOS Core</h4>
            <p className="text-mist text-xs leading-relaxed font-sans opacity-95">
              CarbonOS integration proactively monitors, verifies, and secures carbon credits at every step. By combining satellite telemetry, AI fraud detection, and automated registry workflows, we guarantee that every credit corresponds to real, permanent, and additional carbon offset, enabling instant global market access with zero risk of double counting or greenwashing.
            </p>
          </div>

          {/* Bottom links */}
          <div className="absolute bottom-4 left-0 text-[10px] font-mono text-mist/30 tracking-widest pointer-events-none uppercase">
            carbonos.live
          </div>
          <div className="absolute bottom-4 right-0 text-[10px] font-mono text-mist/30 tracking-widest pointer-events-none uppercase text-right">
            System Platform Modules
          </div>
        </div>

        {/* Mobile View (Hidden on Desktop) */}
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
              CarbonOS integration proactively monitors, verifies, and secures carbon credits. By combining satellite telemetry, AI fraud detection, and automated registry workflows, we guarantee that every credit is real and permanent.
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
                  className="flex items-center bg-[#080F0B]/80 border border-emerald/20 hover:border-emerald/50 rounded-full px-4 py-3 transition-colors group"
                >
                  <div className="w-2 h-2 rounded-full bg-[#10b981] mr-3 relative flex items-center justify-center">
                    <div className="absolute w-2 h-2 rounded-full bg-[#10b981]/50 animate-ping"></div>
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
                  className="flex items-center bg-[#080F0B]/80 border border-cyan/20 rounded-full px-4 py-3"
                >
                  <div className="w-2 h-2 rounded-full bg-[#06b6d4] mr-3 relative flex items-center justify-center">
                    <div className="absolute w-2 h-2 rounded-full bg-[#06b6d4]/50 animate-ping"></div>
                  </div>
                  <span className="text-registry text-xs font-mono">{node.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default PlatformModules;
