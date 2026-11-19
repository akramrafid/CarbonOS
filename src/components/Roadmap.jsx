import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTheme } from '../context/ThemeContext';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    title: "Project Registration",
    description: "Submit PIN and project design documents adhering to the Bangladesh National Carbon Market Framework.",
    icon: "01",
    metrics: ["GIS Boundary Maps", "Baseline Emissions", "Additionality Proof"]
  },
  {
    title: "MRV Data Collection",
    description: "Automated, continuous data stream combining IoT sensors, satellite imagery (NDVI), and field reports.",
    icon: "02",
    metrics: ["Live Carbon Feed", "Anomaly Detection", "AI Verification"]
  },
  {
    title: "Audit & Verification",
    description: "Independent assessment by accredited third-party verifiers using our robust verification workflow engine.",
    icon: "03",
    metrics: ["Risk Score", "Document Audit", "Final Approval"]
  },
  {
    title: "Registry Issuance",
    description: "Minting of unique carbon credits with serialized IDs directly onto the national registry.",
    icon: "04",
    metrics: ["Unique IDs", "Vintage Assignment", "Ownership Record"]
  },
  {
    title: "Marketplace Trading",
    description: "Seamless matching of buyers and sellers, enabling secure climate finance transactions.",
    icon: "05",
    metrics: ["Spot Pricing", "Transfer Execution", "Retirement"]
  }
];

const Roadmap = () => {
  const containerRef = useRef(null);
  const lineRef = useRef(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Animate the central connecting line drawing down
      gsap.fromTo(lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 60%",
            end: "bottom 80%",
            scrub: true
          }
        }
      );

      // Animate each step card fading/sliding in
      gsap.utils.toArray('.roadmap-step').forEach((step, i) => {
        gsap.fromTo(step,
          { opacity: 0, x: i % 2 === 0 ? -50 : 50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: step,
              start: "top 85%",
            }
          }
        );
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section className={`w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-12 relative overflow-hidden border-t ${
      isLight ? 'bg-[#F2F3EE] text-[#0F291B] border-[#0F291B]/10' : 'bg-[#040A06] text-white border-white/10 noise-overlay'
    }`}>
      <div className="max-w-7xl mx-auto relative z-10" ref={containerRef}>
        
        {/* Header */}
        <div className="mb-12 sm:mb-16 max-w-2xl">
          <h2 className={`font-sans font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight mb-3 ${
            isLight ? 'text-[#0F291B]' : 'text-white'
          }`}>
            How Carbon Zero BD Works
          </h2>
          <p className={`font-sans text-base sm:text-lg leading-relaxed ${
            isLight ? 'text-[#37473E]' : 'text-mist'
          }`}>
            A transparent, end-to-end operational framework from field telemetry to institutional carbon settlement.
          </p>
        </div>

        {/* Roadmap Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Line */}
          <div className={`absolute left-12 md:left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 rounded-full hidden md:block ${
            isLight ? 'bg-[#0F291B]/12' : 'bg-[#00C853]/15'
          }`}>
            <div 
              ref={lineRef} 
              className={`absolute top-0 left-0 w-full h-full origin-top ${isLight ? 'bg-[#15803d]' : 'bg-emerald'}`}
            ></div>
          </div>

          <div className="flex flex-col space-y-10 relative">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={index} className={`roadmap-step relative flex flex-col md:flex-row items-center ${isEven ? 'md:flex-row-reverse' : ''}`}>
                  
                  {/* Timeline Dot */}
                  <div className={`hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 rounded-full items-center justify-center z-10 ${
                    isLight ? 'bg-white border-[#15803d]' : 'bg-[#080F0B] border-emerald'
                  }`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${isLight ? 'bg-[#15803d]' : 'bg-emerald'}`}></div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden md:block md:w-1/2"></div>

                  {/* Content Card */}
                  <div className={`w-full md:w-1/2 ${isEven ? 'md:pr-14 text-left md:text-right' : 'md:pl-14 text-left'}`}>
                    <div className={`p-5 sm:p-7 rounded-2xl transition-colors group border ${
                      isLight
                        ? 'bg-white border-[#0F291B]/12 hover:border-[#15803d]/40 shadow-[0_8px_24px_-10px_rgba(15,41,27,0.08)]'
                        : 'bg-[#080F0B] border-white/10 hover:border-emerald/40'
                    }`}>
                      <div className={`flex items-baseline gap-2.5 mb-2.5 ${isEven ? 'md:justify-end' : 'justify-start'}`}>
                        <span className={`font-mono text-xs tabular-nums font-bold ${
                          isLight ? 'text-[#15803d]' : 'text-emerald'
                        }`}>
                          Step {step.icon}
                        </span>
                        <h3 className={`font-sans font-bold text-xl transition-colors ${
                          isLight ? 'text-[#0F291B] group-hover:text-[#15803d]' : 'text-white group-hover:text-emerald'
                        }`}>
                          {step.title}
                        </h3>
                      </div>
                      
                      <p className={`font-sans text-sm mb-5 leading-relaxed ${isLight ? 'text-[#37473E]' : 'text-mist'}`}>
                        {step.description}
                      </p>
                      
                      <div className={`pt-3 border-t flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono ${
                        isLight ? 'border-[#0F291B]/8 text-[#556B5E]' : 'border-white/10 text-mist/75'
                      } ${isEven ? 'md:justify-end' : 'justify-start'}`}>
                        {step.metrics.map((metric, mIndex) => (
                          <span key={mIndex}>{metric}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* End cap */}
          <div className="hidden md:flex absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-emerald rounded-full shadow-[0_0_15px_rgba(0,200,83,0.8)] z-10"></div>
        </div>

      </div>
    </section>
  );
};

export default Roadmap;
