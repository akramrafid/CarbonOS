import React, { useEffect, useRef } from 'react';
import ReactCountUp from 'react-countup';
const CountUp = ReactCountUp.default || ReactCountUp;
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LiveMetrics = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo('.metric-card', 
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          ease: 'power3.out', 
          stagger: 0.14,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full bg-[#080F0B] py-20 px-6 lg:px-12 noise-overlay">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="mb-4">
            <span className="font-mono text-xs text-mist tracking-widest px-3 py-1 bg-[#0D2B1A]/40 border border-[#00C853]/10 rounded-full">
              PLATFORM METRICS — REAL TIME
            </span>
          </div>
          <h2 className="serif-drama text-[40px] lg:text-[52px] text-white">
            Infrastructure at Scale
          </h2>
        </div>

        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1 */}
          <div className="metric-card bg-[#0D2B1A]/30 backdrop-blur-md rounded-[1.5rem] p-8 registry-border emerald-glow group relative overflow-hidden transition-all duration-300 hover:bg-[#0D2B1A]/50">
            <div className="absolute top-6 right-6">
              <div className="pulse-dot"></div>
            </div>
            <div className="mb-2 flex items-baseline">
              <span className="font-mono text-[40px] lg:text-[48px] text-amber leading-none">
                <CountUp end={14820} duration={1.8} separator="," enableScrollSpy scrollSpyOnce />
              </span>
              <span className="font-mono text-sm text-mist ml-2">tCO₂e</span>
            </div>
            <h3 className="font-sans text-lg text-registry mb-1 group-hover:text-emerald transition-colors">
              Carbon Credits Tracked
            </h3>
            <p className="font-sans text-xs text-mist">Across 6 verified sectors</p>
          </div>

          {/* Card 2 */}
          <div className="metric-card bg-[#0D2B1A]/30 backdrop-blur-md rounded-[1.5rem] p-8 registry-border emerald-glow group transition-all duration-300 hover:bg-[#0D2B1A]/50">
            <div className="mb-2">
              <span className="font-mono text-[40px] lg:text-[48px] text-amber leading-none">
                <CountUp end={47} duration={1.8} enableScrollSpy scrollSpyOnce />
              </span>
            </div>
            <h3 className="font-sans text-lg text-registry mb-1 group-hover:text-emerald transition-colors">
              Active Projects Registered
            </h3>
            <p className="font-sans text-xs text-mist">From Dhaka to Khulna</p>
          </div>

          {/* Card 3 */}
          <div className="metric-card bg-[#0D2B1A]/30 backdrop-blur-md rounded-[1.5rem] p-8 registry-border emerald-glow group transition-all duration-300 hover:bg-[#0D2B1A]/50">
            <div className="mb-2 flex items-baseline">
              <span className="font-mono text-[40px] lg:text-[48px] text-amber leading-none">
                ৳<CountUp end={2.3} decimals={1} duration={1.8} enableScrollSpy scrollSpyOnce />
              </span>
              <span className="font-mono text-xl text-amber ml-1">Cr</span>
            </div>
            <h3 className="font-sans text-lg text-registry mb-1 group-hover:text-emerald transition-colors">
              Climate Finance Facilitated
            </h3>
            <p className="font-sans text-xs text-mist">BDT — international + domestic</p>
          </div>

          {/* Card 4 */}
          <div className="metric-card bg-[#0D2B1A]/30 backdrop-blur-md rounded-[1.5rem] p-8 registry-border emerald-glow group transition-all duration-300 hover:bg-[#0D2B1A]/50">
            <div className="mb-2">
              <span className="font-mono text-[40px] lg:text-[48px] text-amber leading-none">
                <CountUp end={6} duration={1.8} enableScrollSpy scrollSpyOnce />
              </span>
            </div>
            <h3 className="font-sans text-lg text-registry mb-3 group-hover:text-emerald transition-colors">
              Verified Sectors
            </h3>
            <div className="flex space-x-2 text-xl opacity-80">
              <span>☀️</span>
              <span>🌾</span>
              <span>🍳</span>
              <span>🏭</span>
              <span>🌿</span>
              <span>🧱</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LiveMetrics;
