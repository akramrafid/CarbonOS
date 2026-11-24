import React, { useEffect, useRef } from 'react';
import { m } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FileText } from 'lucide-react';
import { getPrefersReducedMotion } from '../lib/motion';

gsap.registerPlugin(ScrollTrigger);

const SealSVG = () => (
  <svg viewBox="0 0 100 100" className="w-56 h-56 sm:w-64 sm:h-64 animate-[spin_30s_linear_infinite] opacity-90 drop-shadow-[0_0_15px_rgba(0,200,83,0.25)]">
    <circle cx="50" cy="50" r="48" fill="none" stroke="var(--color-emerald)" strokeWidth="0.5" strokeDasharray="4 2" />
    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-emerald)" strokeWidth="1" />
    <circle cx="50" cy="50" r="38" fill="none" stroke="var(--color-emerald)" strokeWidth="0.5" strokeDasharray="2 4" />
    <path id="curve" d="M 20 50 A 30 30 0 1 1 80 50 A 30 30 0 1 1 20 50" fill="transparent" />
    <text className="font-mono text-[7px]" fill="var(--color-emerald)">
      <textPath href="#curve" startOffset="50%" textAnchor="middle">
        • BANGLADESH CARBON INFRASTRUCTURE • CITED SOURCES
      </textPath>
    </text>
  </svg>
);

const ScannerGrid = () => (
  <div className="relative w-64 h-48 bg-bg-canvas/60 rounded-2xl border border-border-subtle p-3 overflow-hidden shadow-inner">
    <div className="grid grid-cols-10 gap-2 h-full">
      {Array.from({ length: 80 }).map((_, i) => (
        <div key={i} className="flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-emerald/30 rounded-full" id={`dot-${i}`}></div>
        </div>
      ))}
    </div>
    <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-amber shadow-[0_0_15px_var(--color-amber)] animate-[marquee_4s_linear_infinite]" style={{ animationName: 'scanLine' }}></div>
    <style>{`
      @keyframes scanLine {
        0% { left: 0%; opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { left: 100%; opacity: 0; }
      }
    `}</style>
  </div>
);

const EKGWave = () => (
  <div className="w-full max-w-sm bg-bg-canvas/60 rounded-2xl border border-border-subtle p-4 shadow-inner flex flex-col justify-center">
    <svg viewBox="0 0 200 100" className="w-full h-32 overflow-visible">
      <path
        d="M 0 50 L 40 50 L 50 20 L 60 80 L 70 50 L 110 50 L 120 30 L 130 70 L 140 50 L 200 50"
        fill="none"
        stroke="var(--color-emerald)"
        strokeWidth="2"
        className="animate-[dash_3s_linear_infinite]"
        strokeDasharray="400"
        strokeDashoffset="400"
        style={{ filter: 'drop-shadow(0 0 8px rgba(0,200,83,0.5))' }}
      />
    </svg>
    <div className="flex items-center justify-between pt-2 border-t border-border-subtle/80 font-mono text-[10px] text-white/50">
      <span>TELEMETRY PULSE</span>
      <span className="text-emerald font-semibold">99.8% ACCURACY</span>
    </div>
  </div>
);

const RulesCitationCard = () => (
  <div className="w-full max-w-sm bg-bg-canvas/70 border border-border-subtle rounded-2xl p-4 sm:p-5 shadow-inner space-y-3 font-mono">
    <div className="flex items-center justify-between border-b border-border-subtle pb-2 text-[10px] text-white/50">
      <span className="flex items-center gap-1.5">
        <FileText size={12} className="text-emerald" />
        PRIMARY CITATION LEDGER
      </span>
      <span className="text-emerald">VERIFIED</span>
    </div>
    <div className="space-y-2 text-xs">
      <div className="bg-bg-elevated/70 p-2.5 rounded-lg border border-border-subtle flex items-center justify-between">
        <div>
          <span className="text-white font-medium block">GHG Protocol Scope 1 & 2</span>
          <span className="text-[10px] text-white/50">Corporate Standard (2015 Rev)</span>
        </div>
        <span className="text-[10px] text-emerald bg-emerald/10 border border-emerald/20 px-1.5 py-0.5 rounded font-bold">CITED</span>
      </div>
      <div className="bg-bg-elevated/70 p-2.5 rounded-lg border border-border-subtle flex items-center justify-between">
        <div>
          <span className="text-white font-medium block">ISO 14064-1:2018</span>
          <span className="text-[10px] text-white/50">Specification for GHG Inventories</span>
        </div>
        <span className="text-[10px] text-emerald bg-emerald/10 border border-emerald/20 px-1.5 py-0.5 rounded font-bold">CITED</span>
      </div>
      <div className="bg-bg-elevated/70 p-2.5 rounded-lg border border-border-subtle flex items-center justify-between">
        <div>
          <span className="text-white font-medium block">IPCC 2006 Guidelines</span>
          <span className="text-[10px] text-white/50">National GHG Inventories (Vol 2 & 4)</span>
        </div>
        <span className="text-[10px] text-emerald bg-emerald/10 border border-emerald/20 px-1.5 py-0.5 rounded font-bold">CITED</span>
      </div>
    </div>
  </div>
);

const FrameworkAlignment = () => {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const prefersReducedMotion = getPrefersReducedMotion();

    let ctx = gsap.context(() => {
      const cards = cardsRef.current;

      if (prefersReducedMotion) {
        cards.forEach((card) => {
          if (card) gsap.set(card, { scale: 1, opacity: 1 });
        });
        return;
      }

      cards.forEach((card, i) => {
        if (!card || i === 0) return;

        gsap.fromTo(cards[i - 1],
          { scale: 1, opacity: 1 },
          {
            scale: 0.94,
            opacity: 0.6,
            ease: 'power2.inOut',
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "top top",
              scrub: true,
            }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} id="framework" className="w-full bg-bg-canvas py-10 md:py-16 relative overflow-hidden font-sans">
      <div id="philosophy" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald/30 bg-emerald/10 text-emerald font-mono text-xs font-semibold tracking-wider uppercase mb-4 shadow-[0_0_15px_rgba(0,200,83,0.15)]">
            <span className="w-2 h-2 rounded-full bg-emerald animate-pulse"></span>
            Process Overview & Sovereign Architecture
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Bangladesh Carbon Infrastructure
          </h2>
          <p className="font-sans text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
            Climate infrastructure engineered for Bangladesh. Primary source citations, field-hardened MRV, and international standard alignment.
          </p>
        </div>

        {/* Stacked Cards Container */}
        <div className="space-y-12 sm:space-y-16">

          {/* Card 0: Sovereign Foundation & Philosophy */}
          <section
            ref={el => cardsRef.current[0] = el}
            className="w-full min-h-[100dvh] sticky top-16 sm:top-20 flex items-center justify-center py-6 sm:py-10 z-10"
          >
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-6xl bg-gradient-to-br from-bg-surface via-bg-canvas to-bg-elevated border border-emerald/40 hover:border-emerald shadow-[0_0_35px_rgba(0,200,83,0.18)] hover:shadow-[0_0_55px_rgba(0,200,83,0.32)] transition-all duration-300 rounded-[2.5rem] p-6 sm:p-10 lg:p-14 relative overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">

                {/* Left Column: Core Philosophy Copy */}
                <div className="lg:col-span-7 flex flex-col items-start text-left">

                  {/* Cited Sources Pill */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald/30 bg-emerald/10 text-emerald font-mono text-[11px] font-semibold tracking-wider uppercase mb-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse"></span>
                    • BANGLADESH CARBON INFRASTRUCTURE • CITED SOURCES
                  </div>

                  <p className="font-sans text-base sm:text-lg text-white/70 mb-2">
                    Most climate software is built for Geneva boardrooms.
                  </p>

                  <p className="font-sans text-xl sm:text-2xl text-white font-semibold mb-1">
                    Carbon Zero BD is built for
                  </p>

                  <h3 className="serif-drama text-5xl sm:text-7xl lg:text-8xl leading-none text-emerald font-bold mb-6">
                    Bangladesh.
                  </h3>

                  <div className="w-28 h-[2px] bg-gradient-to-r from-emerald to-transparent mb-6"></div>

                  <p className="font-sans text-lg sm:text-xl text-white font-medium mb-1">
                    You are not a carbon science company.
                  </p>

                  <p className="font-sans font-extrabold text-2xl sm:text-3xl text-emerald mb-4">
                    You are climate infrastructure.
                  </p>

                  <p className="font-sans text-sm sm:text-base text-white/80 leading-relaxed max-w-xl">
                    Software + automation + local knowledge. That is your advantage. That is Carbon Zero BD.
                  </p>
                </div>

                {/* Right Column: Spinning Seal Visual */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center py-4 lg:py-0">
                  <SealSVG />
                  <span className="font-mono text-xs text-white/40 mt-4 tracking-widest uppercase">
                    Primary Source Citation Architecture
                  </span>
                </div>

              </div>
            </m.div>
          </section>

          {/* Card 1: 01 Built Around Published Rules */}
          <section
            ref={el => cardsRef.current[1] = el}
            className="w-full min-h-[100dvh] sticky top-20 sm:top-24 flex items-center justify-center py-6 sm:py-10 z-20"
          >
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-6xl bg-gradient-to-br from-bg-surface via-bg-canvas to-bg-elevated border border-emerald/40 hover:border-emerald shadow-[0_0_35px_rgba(0,200,83,0.18)] hover:shadow-[0_0_55px_rgba(0,200,83,0.32)] transition-all duration-300 rounded-[2.5rem] p-6 sm:p-10 lg:p-14 relative overflow-hidden"
            >
              {/* Background 01 Watermark */}
              <div className="absolute top-2 right-6 sm:right-10 font-mono text-[100px] sm:text-[140px] text-emerald/[0.07] font-bold select-none pointer-events-none leading-none">
                01
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">

                <div className="lg:col-span-7 flex flex-col items-start text-left">
                  <span className="font-mono text-xs text-emerald font-bold tracking-widest uppercase mb-2">
                    Stage 01 // Regulatory Grounding
                  </span>

                  <h3 className="font-sans font-bold text-2xl sm:text-4xl text-white mb-5 tracking-tight">
                    Built Around Published Rules
                  </h3>

                  <p className="font-sans text-base sm:text-lg text-white/80 leading-relaxed mb-8">
                    Designed around Bangladesh's climate rules as they are published. A rule enters the product only with its primary document cited; nothing here is approved or endorsed by a regulator.
                  </p>

                  <div className="flex flex-wrap gap-2.5">
                    <span className="font-mono text-xs text-emerald bg-emerald/10 border border-emerald/25 px-3 py-1.5 rounded-lg font-medium">
                      [GHG Protocol]
                    </span>
                    <span className="font-mono text-xs text-emerald bg-emerald/10 border border-emerald/25 px-3 py-1.5 rounded-lg font-medium">
                      [ISO 14064-1]
                    </span>
                    <span className="font-mono text-xs text-emerald bg-emerald/10 border border-emerald/25 px-3 py-1.5 rounded-lg font-medium">
                      [IPCC 2006]
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center">
                  <RulesCitationCard />
                </div>

              </div>
            </m.div>
          </section>

          {/* Card 2: 02 MRV That Works in the Field */}
          <section
            ref={el => cardsRef.current[2] = el}
            className="w-full min-h-[100dvh] sticky top-24 sm:top-28 flex items-center justify-center py-6 sm:py-10 z-30"
          >
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-6xl bg-gradient-to-br from-bg-surface via-bg-canvas to-bg-elevated border border-emerald/40 hover:border-emerald shadow-[0_0_35px_rgba(0,200,83,0.18)] hover:shadow-[0_0_55px_rgba(0,200,83,0.32)] transition-all duration-300 rounded-[2.5rem] p-6 sm:p-10 lg:p-14 relative overflow-hidden"
            >
              {/* Background 02 Watermark */}
              <div className="absolute top-2 right-6 sm:right-10 font-mono text-[100px] sm:text-[140px] text-emerald/[0.07] font-bold select-none pointer-events-none leading-none">
                02
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">

                <div className="lg:col-span-7 flex flex-col items-start text-left">
                  <span className="font-mono text-xs text-emerald font-bold tracking-widest uppercase mb-2">
                    Stage 02 // Field-Hardened Verification
                  </span>

                  <h3 className="font-sans font-bold text-2xl sm:text-4xl text-white mb-5 tracking-tight">
                    MRV That Works in the Field
                  </h3>

                  <p className="font-sans text-base sm:text-lg text-white/80 leading-relaxed mb-8">
                    Google Earth Engine satellite integration. GPS field tagging. IoT sensor data ingestion. Mobile farmer reporting app. AI-powered anomaly detection comparing satellite data against project reports. MRV that works in Khulna, not just in Dhaka conference rooms.
                  </p>

                  <div className="flex flex-wrap gap-2.5">
                    <span className="font-mono text-xs text-emerald bg-emerald/10 border border-emerald/25 px-3 py-1.5 rounded-lg font-medium">
                      [Google Earth Engine]
                    </span>
                    <span className="font-mono text-xs text-emerald bg-emerald/10 border border-emerald/25 px-3 py-1.5 rounded-lg font-medium">
                      [PostGIS]
                    </span>
                    <span className="font-mono text-xs text-emerald bg-emerald/10 border border-emerald/25 px-3 py-1.5 rounded-lg font-medium">
                      [TensorFlow]
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center">
                  <ScannerGrid />
                </div>

              </div>
            </m.div>
          </section>

          {/* Card 3: 03 International Standards, Local Execution */}
          <section
            ref={el => cardsRef.current[3] = el}
            className="w-full min-h-[100dvh] sticky top-28 sm:top-32 flex items-center justify-center py-6 sm:py-10 z-40"
          >
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-6xl bg-gradient-to-br from-bg-surface via-bg-canvas to-bg-elevated border border-emerald/40 hover:border-emerald shadow-[0_0_35px_rgba(0,200,83,0.18)] hover:shadow-[0_0_55px_rgba(0,200,83,0.32)] transition-all duration-300 rounded-[2.5rem] p-6 sm:p-10 lg:p-14 relative overflow-hidden"
            >
              {/* Background 03 Watermark */}
              <div className="absolute top-2 right-6 sm:right-10 font-mono text-[100px] sm:text-[140px] text-emerald/[0.07] font-bold select-none pointer-events-none leading-none">
                03
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">

                <div className="lg:col-span-7 flex flex-col items-start text-left">
                  <span className="font-mono text-xs text-emerald font-bold tracking-widest uppercase mb-2">
                    Stage 03 // Global Fungibility
                  </span>

                  <h3 className="font-sans font-bold text-2xl sm:text-4xl text-white mb-5 tracking-tight">
                    International Standards, Local Execution
                  </h3>

                  <p className="font-sans text-base sm:text-lg text-white/80 leading-relaxed mb-8">
                    Verra VCS, Gold Standard, Article 6 and CDM methodologies are referenced, not integrated: CarbonOS has no registry connection or certification. Your Bangladesh projects speak the language of international carbon buyers in London, Singapore, and Tokyo.
                  </p>

                  <div className="flex flex-wrap gap-2.5">
                    <span className="font-mono text-xs text-emerald bg-emerald/10 border border-emerald/25 px-3 py-1.5 rounded-lg font-medium">
                      [Verra VCS]
                    </span>
                    <span className="font-mono text-xs text-emerald bg-emerald/10 border border-emerald/25 px-3 py-1.5 rounded-lg font-medium">
                      [Gold Standard]
                    </span>
                    <span className="font-mono text-xs text-emerald bg-emerald/10 border border-emerald/25 px-3 py-1.5 rounded-lg font-medium">
                      [Article 6]
                    </span>
                    <span className="font-mono text-xs text-emerald bg-emerald/10 border border-emerald/25 px-3 py-1.5 rounded-lg font-medium">
                      [CDM]
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center">
                  <EKGWave />
                </div>

              </div>
            </m.div>
          </section>

        </div>

      </div>
    </div>
  );
};

export default FrameworkAlignment;