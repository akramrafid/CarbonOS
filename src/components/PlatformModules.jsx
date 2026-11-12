import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { leftNodes, rightNodes } from './platform-modules/crystalData';
import { CrystalHubSvg } from './platform-modules/CrystalHubSvg';
import { PlatformModulesMobile } from './platform-modules/PlatformModulesMobile';

const PlatformModules = () => {
  const [hoveredNode, setHoveredNode] = useState(null);

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
          animation: scaleUpHub 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Decorative Brand Text Pillars (Top-Left / Top-Right) */}
      <div className="absolute top-8 left-12 hidden lg:flex items-center space-x-2 text-[10px] uppercase tracking-[0.25em] text-mist/40 pointer-events-none">
        <span>Platform Modules</span>
        <span className="w-1 h-1 rounded-full bg-emerald"></span>
        <span>6 Core Systems</span>
      </div>
      <div className="absolute top-8 right-12 hidden lg:flex items-center text-[10px] uppercase tracking-[0.25em] text-mist/40 pointer-events-none font-bold">
        <span>Carbon Zero BD</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Desktop Hub Container */}
        <div className="relative w-full hidden lg:block" style={{ aspectRatio: '1200/800' }}>
          <CrystalHubSvg hoveredNode={hoveredNode} />

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
              <div className="w-2 h-2 rounded-full bg-[#10b981] mr-3 relative flex items-center justify-center">
                <div className="absolute w-2.5 h-2.5 rounded-full bg-[#10b981]/50 animate-ping group-hover:duration-700"></div>
              </div>
              <span className="text-registry text-xs font-mono tracking-wide">{node.title}</span>
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
              <div className="w-2 h-2 rounded-full bg-[#06b6d4] mr-3 relative flex items-center justify-center">
                <div className="absolute w-2.5 h-2.5 rounded-full bg-[#06b6d4]/50 animate-ping group-hover:duration-700"></div>
              </div>
              <span className="text-registry text-xs font-mono tracking-wide">{node.title}</span>
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
            <h4 className="text-emerald font-mono text-[11px] uppercase tracking-[0.2em] mb-2.5 font-bold">Carbon Zero BD Core</h4>
            <p className="text-mist text-xs leading-relaxed font-sans opacity-95">
              Carbon Zero BD integration proactively monitors, verifies, and secures carbon credits at every step. By combining satellite telemetry, AI fraud detection, and automated registry workflows, we guarantee that every credit corresponds to real, permanent, and additional carbon offset, enabling instant global market access with zero risk of double counting or greenwashing.
            </p>
          </div>

          {/* Bottom links */}
          <div className="absolute bottom-4 left-0 text-[10px] font-mono text-mist/30 tracking-widest pointer-events-none uppercase">
            carbonzerobd.com
          </div>
          <div className="absolute bottom-4 right-0 text-[10px] font-mono text-mist/30 tracking-widest pointer-events-none uppercase text-right">
            System Platform Modules
          </div>
        </div>

        {/* Mobile View */}
        <PlatformModulesMobile />
      </div>
    </section>
  );
};

export default PlatformModules;
