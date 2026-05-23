import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SealSVG = () => (
  <svg viewBox="0 0 100 100" className="w-64 h-64 animate-[spin_30s_linear_infinite] opacity-80">
    <circle cx="50" cy="50" r="48" fill="none" stroke="var(--color-emerald)" strokeWidth="0.5" strokeDasharray="4 2" />
    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-emerald)" strokeWidth="1" />
    <circle cx="50" cy="50" r="38" fill="none" stroke="var(--color-emerald)" strokeWidth="0.5" strokeDasharray="2 4" />
    <path id="curve" d="M 20 50 A 30 30 0 1 1 80 50 A 30 30 0 1 1 20 50" fill="transparent" />
    <text className="font-mono text-[7px]" fill="var(--color-emerald)">
      <textPath href="#curve" startOffset="50%" textAnchor="middle">
        • BANGLADESH NATIONAL CARBON FRAMEWORK • VERIFIED
      </textPath>
    </text>
  </svg>
);

const ScannerGrid = () => (
  <div className="relative w-64 h-48">
    <div className="grid grid-cols-10 gap-2 h-full">
      {Array.from({ length: 80 }).map((_, i) => (
        <div key={i} className="flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-emerald/20 rounded-full" id={`dot-${i}`}></div>
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
    <style>{`
      @keyframes dash {
        to {
          stroke-dashoffset: 0;
        }
      }
    `}</style>
  </svg>
);

const FrameworkAlignment = () => {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const cards = cardsRef.current;
      
      cards.forEach((card, i) => {
        if (i === 0) return; // Skip first card
        
        gsap.fromTo(cards[i - 1], 
          { scale: 1, filter: 'blur(0px)', opacity: 1 },
          {
            scale: 0.9,
            filter: 'blur(20px)',
            opacity: 0.5,
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
    <div ref={containerRef} className="relative">
      
      {/* Card 1 */}
      <section 
        ref={el => cardsRef.current[0] = el}
        className="w-full h-screen sticky top-0 flex items-center bg-[#0D2B1A] overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center lg:justify-start">
            <SealSVG />
          </div>
          <div className="relative">
            <div className="absolute -top-16 -left-8 font-mono text-[120px] text-emerald opacity-10 leading-none">01</div>
            <h3 className="font-sans font-bold text-3xl lg:text-4xl text-white mb-6 relative z-10">Built on the Official Framework</h3>
            <p className="font-sans text-lg text-mist leading-relaxed mb-8 relative z-10">
              Designed from day one around Bangladesh's 2024 National Carbon Market Framework. PIN submission flows, MRV data standards, registry ID formats, verification accreditation — all pre-built and pre-compliant. Zero custom configuration required.
            </p>
            <div className="flex space-x-3 relative z-10">
              <span className="font-mono text-xs text-registry bg-black/40 border border-emerald/20 px-3 py-1.5 rounded">[DOE Bangladesh]</span>
              <span className="font-mono text-xs text-registry bg-black/40 border border-emerald/20 px-3 py-1.5 rounded">[MoEFCC]</span>
              <span className="font-mono text-xs text-registry bg-black/40 border border-emerald/20 px-3 py-1.5 rounded">[UNFCCC]</span>
            </div>
          </div>
        </div>
      </section>

      {/* Card 2 */}
      <section 
        ref={el => cardsRef.current[1] = el}
        className="w-full h-screen sticky top-0 flex items-center bg-[#080F0B] noise-overlay overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="flex justify-center lg:justify-start">
            <ScannerGrid />
          </div>
          <div className="relative">
            <div className="absolute -top-16 -left-8 font-mono text-[120px] text-emerald opacity-10 leading-none">02</div>
            <h3 className="font-sans font-bold text-3xl lg:text-4xl text-white mb-6 relative z-10">MRV That Works in the Field</h3>
            <p className="font-sans text-lg text-mist leading-relaxed mb-8 relative z-10">
              Google Earth Engine satellite integration. GPS field tagging. IoT sensor data ingestion. Mobile farmer reporting app. AI-powered anomaly detection comparing satellite data against project reports. MRV that works in Khulna, not just in Dhaka conference rooms.
            </p>
            <div className="flex flex-wrap gap-3 relative z-10">
              <span className="font-mono text-xs text-registry bg-black/40 border border-emerald/20 px-3 py-1.5 rounded">[Google Earth Engine]</span>
              <span className="font-mono text-xs text-registry bg-black/40 border border-emerald/20 px-3 py-1.5 rounded">[PostGIS]</span>
              <span className="font-mono text-xs text-registry bg-black/40 border border-emerald/20 px-3 py-1.5 rounded">[TensorFlow]</span>
            </div>
          </div>
        </div>
      </section>

      {/* Card 3 */}
      <section 
        ref={el => cardsRef.current[2] = el}
        className="w-full h-screen sticky top-0 flex items-center bg-[#0D2B1A] overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center lg:justify-start w-full pr-12">
            <EKGWave />
          </div>
          <div className="relative">
            <div className="absolute -top-16 -left-8 font-mono text-[120px] text-emerald opacity-10 leading-none">03</div>
            <h3 className="font-sans font-bold text-3xl lg:text-4xl text-white mb-6 relative z-10">International Standards, Local Execution</h3>
            <p className="font-sans text-lg text-mist leading-relaxed mb-8 relative z-10">
              Verra VCS. Gold Standard. Article 6 bilateral agreements. CDM legacy compatibility. Your Bangladesh projects speak the language of international carbon buyers in London, Singapore, and Tokyo. First day, full compliance.
            </p>
            <div className="flex flex-wrap gap-3 relative z-10">
              <span className="font-mono text-xs text-registry bg-black/40 border border-emerald/20 px-3 py-1.5 rounded">[Verra VCS]</span>
              <span className="font-mono text-xs text-registry bg-black/40 border border-emerald/20 px-3 py-1.5 rounded">[Gold Standard]</span>
              <span className="font-mono text-xs text-registry bg-black/40 border border-emerald/20 px-3 py-1.5 rounded">[Article 6]</span>
              <span className="font-mono text-xs text-registry bg-black/40 border border-emerald/20 px-3 py-1.5 rounded">[CDM]</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default FrameworkAlignment;
