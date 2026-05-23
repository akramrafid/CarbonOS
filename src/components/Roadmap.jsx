import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
    <section className="w-full bg-[#040A06] py-24 px-6 lg:px-12 relative overflow-hidden noise-overlay">
      <div className="max-w-7xl mx-auto relative z-10" ref={containerRef}>
        
        {/* Header */}
        <div className="text-center mb-20">
          <span className="font-mono text-xs text-emerald tracking-widest px-3 py-1 bg-[#0D2B1A]/40 border border-[#00C853]/20 rounded-full mb-6 inline-block">
            PROCESS OVERVIEW
          </span>
          <h2 className="serif-drama text-[48px] lg:text-[64px] text-white leading-tight mb-4">
            How CarbonOS Works
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
                  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-[#080F0B] border-2 border-emerald rounded-full items-center justify-center z-10 emerald-glow">
                    <div className="w-3 h-3 bg-emerald rounded-full animate-pulse"></div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden md:block md:w-1/2"></div>

                  {/* Content Card */}
                  <div className={`w-full md:w-1/2 ${isEven ? 'md:pr-16 text-left md:text-right' : 'md:pl-16 text-left'}`}>
                    <div className="bg-[#080F0B]/80 backdrop-blur-md registry-border p-8 rounded-[2rem] hover:bg-[#0D2B1A]/60 transition-colors group">
                      <div className={`flex items-center space-x-3 mb-4 ${isEven ? 'md:justify-end' : 'justify-start'}`}>
                        <span className="font-mono text-xs text-emerald bg-emerald/10 px-2 py-1 rounded">
                          STEP {step.icon}
                        </span>
                        <h3 className="font-sans font-bold text-2xl text-registry group-hover:text-emerald transition-colors">
                          {step.title}
                        </h3>
                      </div>
                      
                      <p className="font-sans text-mist mb-6 leading-relaxed">
                        {step.description}
                      </p>
                      
                      <div className={`flex flex-wrap gap-2 ${isEven ? 'md:justify-end' : 'justify-start'}`}>
                        {step.metrics.map((metric, mIndex) => (
                          <span key={mIndex} className="font-mono text-[11px] text-mist/70 bg-[#040A06] border border-emerald/10 px-3 py-1 rounded-full">
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
