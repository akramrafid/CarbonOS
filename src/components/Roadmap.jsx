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
    <section className="w-full bg-[#040A06] py-16 sm:py-24 px-4 sm:px-6 lg:px-12 relative overflow-hidden noise-overlay">
      <div className="max-w-7xl mx-auto relative z-10" ref={containerRef}>
        
        {/* Header */}
        <div className="text-center mb-12 sm:mb-20">
          <span className="font-mono text-xs text-emerald tracking-widest px-3 py-1 bg-[#0D2B1A]/40 border border-[#00C853]/20 rounded-full mb-6 inline-block">
            PROCESS OVERVIEW
          </span>
          <h2 className="serif-drama text-4xl sm:text-[48px] lg:text-[64px] text-white leading-tight mb-4">
            How Carbon Zero BD Works
          </h2>
          <p className="font-sans text-lg text-mist max-w-2xl mx-auto">
            A transparent, end-to-end operational framework for the national carbon ecosystem.
          </p>
        </div>

        {/* Roadmap Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Line */}
          <div className="absolute left-12 md:left-1/2 top-0 bottom-0 w-[2px] bg-[#00C853]/10 -translate-x-1/2 rounded-full hidden md:block">
            <div 
              ref={lineRef} 
              className="absolute top-0 left-0 w-full h-full bg-emerald origin-top"
              style={{ boxShadow: '0 0 10px rgba(0,200,83,0.5)' }}
            ></div>
          </div>

          <div className="flex flex-col space-y-12 relative">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={index} className={`roadmap-step relative flex flex-col md:flex-row items-center ${isEven ? 'md:flex-row-reverse' : ''}`}>
                  
                  {/* Timeline Dot */}
                  <div className={`hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 border-2 rounded-full items-center justify-center z-10 emerald-glow ${
                    isLight ? 'bg-white border-[#15803d]' : 'bg-[#080F0B] border-emerald'
                  }`}>
                    <div className={`w-3 h-3 rounded-full animate-pulse ${isLight ? 'bg-[#15803d]' : 'bg-emerald'}`}></div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden md:block md:w-1/2"></div>

                  {/* Content Card */}
                  <div className={`w-full md:w-1/2 ${isEven ? 'md:pr-16 text-left md:text-right' : 'md:pl-16 text-left'}`}>
                    <div className={`backdrop-blur-md p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] transition-all group border ${
                      isLight
                        ? 'bg-white border-[#0F291B]/10 hover:border-[#15803d]/35 shadow-[0_10px_28px_-8px_rgba(15,41,27,0.08)]'
                        : 'bg-[#080F0B]/80 registry-border hover:bg-[#0D2B1A]/60'
                    }`}>
                      <div className={`flex flex-wrap items-center gap-2 sm:gap-3 mb-4 ${isEven ? 'md:justify-end' : 'justify-start'}`}>
                        <span className={`font-mono text-xs px-2.5 py-1 rounded-full shrink-0 font-semibold ${
                          isLight ? 'text-[#15803d] bg-[#E3F2E9]' : 'text-emerald bg-emerald/10'
                        }`}>
                          STEP {step.icon}
                        </span>
                        <h3 className={`font-sans font-bold text-xl sm:text-2xl transition-colors ${
                          isLight ? 'text-[#0F291B] group-hover:text-[#15803d]' : 'text-registry group-hover:text-emerald'
                        }`}>
                          {step.title}
                        </h3>
                      </div>
                      
                      <p className={`font-sans mb-6 leading-relaxed ${isLight ? 'text-[#46574D]' : 'text-mist'}`}>
                        {step.description}
                      </p>
                      
                      <div className={`flex flex-wrap gap-2 ${isEven ? 'md:justify-end' : 'justify-start'}`}>
                        {step.metrics.map((metric, mIndex) => (
                          <span key={mIndex} className={`font-mono text-[11px] px-3 py-1 rounded-full border ${
                            isLight
                              ? 'text-[#37473E] bg-[#F5F8F5] border-[#0F291B]/10'
                              : 'text-mist/70 bg-[#040A06] border-emerald/10'
                          }`}>
                            {metric}
                          </span>
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
