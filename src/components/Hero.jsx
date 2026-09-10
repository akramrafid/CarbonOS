import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Activity, 
  TrendingUp, 
  Radio, 
  Terminal, 
  Lock, 
  Globe, 
  Layers,
  Sparkles
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Hero = () => {
  const containerRef = useRef(null);
  const { t } = useTranslation();
  const [activeStreamIndex, setActiveStreamIndex] = useState(0);

  const tradeStreams = [
    { time: "14:22 BST", desc: "1,200 tCO₂e AWD Rice Rangpur cleared @ ৳15,000/t", detail: "৳17.46M direct to 410 bKash farmer wallets" },
    { time: "13:58 BST", desc: "3,500 tCO₂e Sundarbans Blue Carbon verified by SGS", detail: "Sentinel-2 NDVI 0.82 · Verra VCS 2491 synced" },
    { time: "12:40 BST", desc: "800 tCO₂e Solar Irrigation Khulna retired", detail: "Corporate ESG Scope 1 settlement · Tax credit issued" },
    { time: "11:15 BST", desc: "2,400 tCO₂e Biogas Waste-to-Energy Dhaka minted", detail: "IoT sensor telemetry consensus verified (99.8%)" }
  ];

  useEffect(() => {
    const streamTimer = setInterval(() => {
      setActiveStreamIndex(prev => (prev + 1) % tradeStreams.length);
    }, 4500);
    return () => clearInterval(streamTimer);
  }, [tradeStreams.length]);

  useEffect(() => {
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(['.hero-bg', '.hero-watermark', '.hero-pill', '.hero-h1', '.hero-body', '.hero-cta', '.hero-terminal-card', '.hero-trust-badge'], {
          opacity: 1,
          scale: 1,
          x: 0,
          y: 0
        });
        return;
      }

      const tl = gsap.timeline();

      // Background fade & subtle zoom
      tl.fromTo('.hero-bg', 
        { scale: 1.06, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 1.6, ease: 'power2.out' }, 
        0
      );

      // Watermark
      tl.fromTo('.hero-watermark',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.4, ease: 'power3.out' },
        0.2
      );

      // Pill
      tl.fromTo('.hero-pill', 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 
        0.4
      );

      // Headline
      tl.fromTo('.hero-h1', 
        { y: 35, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.12 }, 
        0.5
      );

      // Body & CTA
      tl.fromTo(['.hero-body', '.hero-cta'], 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.1 }, 
        0.75
      );

      // Terminal Card
      tl.fromTo('.hero-terminal-card', 
        { x: 40, opacity: 0, scale: 0.96 }, 
        { x: 0, opacity: 1, scale: 1, duration: 1, ease: 'power3.out' }, 
        0.8
      );

      // Trust Badges
      tl.fromTo('.hero-trust-badge', 
        { y: 15, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.08 }, 
        1.0
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden bg-[#040A06]"
    >
      {/* Background Photography with Modern Composite Layering */}
      <div 
        className="hero-bg absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("/hero_landscape.png")' }}
      ></div>
      
      {/* High-End Dark Gradient & Contrast Overlays */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#040A06] via-[#040A06]/75 to-[#040A06]/60"></div>
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,200,83,0.15),rgba(255,255,255,0))]"></div>
      
      {/* Subtle Precision Grid Lines */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#00c85308_1px,transparent_1px),linear-gradient(to_bottom,#00c85308_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]"></div>

      {/* Elegant Atmospheric Watermark: "CARBON ZERO BD" */}
      <div className="hero-watermark absolute top-[12%] left-0 w-full text-center z-0 pointer-events-none select-none overflow-hidden">
        <span className="font-sans font-extrabold text-[12vw] leading-none text-white/[0.04] tracking-[-0.05em] uppercase whitespace-nowrap">
          CARBON ZERO BD
        </span>
      </div>

      <div className="relative z-10 container mx-auto px-6 lg:px-12 pt-32 pb-16 w-full flex flex-col justify-between min-h-[100dvh]">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center my-auto">
          
          {/* Left Column: Brand Statement & Primary Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left pt-6 lg:pt-0">
            
            {/* Live Protocol Status Pill */}
            <div className="hero-pill inline-flex items-center gap-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-xl border border-emerald/30 hover:border-emerald/60 rounded-full py-1.5 px-4 mb-6 shadow-[0_0_20px_rgba(0,200,83,0.15)] transition-all duration-300">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C853] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C853]"></span>
              </span>
              <span className="font-mono text-[11px] font-semibold tracking-wider text-emerald uppercase">
                National Sovereign Protocol v2.4
              </span>
              <span className="text-white/20">|</span>
              <span className="font-sans text-[11px] text-white/80 hidden sm:inline">
                MoEFCC S.R.O. 349 Aligned
              </span>
              <span className="bg-emerald/15 text-emerald border border-emerald/30 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                97% DIRECT PAYOUT
              </span>
            </div>

            {/* Headline with High-Impact Contrast */}
            <h1 className="flex flex-col mb-6 w-full tracking-tight">
              <span className="hero-h1 font-sans font-extrabold text-4xl sm:text-6xl lg:text-[68px] leading-[1.08] text-white">
                Bangladesh's Sovereign
              </span>
              <span className="hero-h1 font-sans font-extrabold text-4xl sm:text-6xl lg:text-[68px] leading-[1.08] text-white">
                Carbon Infrastructure
              </span>
              <span className="hero-h1 serif-drama italic text-5xl sm:text-7xl lg:text-[80px] leading-[1.05] bg-gradient-to-r from-[#00C853] via-[#69F0AE] to-[#A7F3D0] bg-clip-text text-transparent mt-1 drop-shadow-sm">
                & Credit Exchange.
              </span>
            </h1>

            {/* Precision Subtitle */}
            <p className="hero-body font-sans text-base sm:text-lg lg:text-xl text-white/80 max-w-[620px] leading-relaxed mb-8 font-normal">
              Digitizing, verifying, and securing Bangladesh's national carbon asset pipeline from 1M+ smallholder rural farmers directly to global ESG institutional registries.
            </p>

            {/* Action Buttons & Fast Proof */}
            <div className="hero-cta flex flex-wrap gap-4 items-center mb-10 w-full">
              <Link 
                to="/platform/marketplace" 
                className="group relative inline-flex items-center justify-center bg-[#00C853] hover:bg-[#00E676] text-[#040A06] font-sans font-bold text-sm sm:text-base px-7 py-4 rounded-full transition-all duration-300 shadow-[0_0_30px_rgba(0,200,83,0.35)] hover:shadow-[0_0_45px_rgba(0,200,83,0.55)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Explore Verified Credits</span>
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                to="/platform/carbon-registry" 
                className="inline-flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15 hover:border-emerald/40 font-sans font-medium text-sm sm:text-base px-6 py-4 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Terminal size={16} className="mr-2 text-emerald" />
                <span>Registry Terminal</span>
              </Link>

              <Link
                to="/platform/saas-dashboard"
                className="inline-flex items-center text-xs font-mono text-white/60 hover:text-emerald px-2 py-1 transition-colors"
              >
                <Lock size={12} className="mr-1.5 text-emerald" />
                <span>Enterprise ESG Portal →</span>
              </Link>
            </div>

            {/* Regulatory Alignment Micro-Badges */}
            <div className="flex flex-wrap gap-6 pt-6 border-t border-white/10 w-full">
              <div className="hero-trust-badge flex items-center space-x-2 text-xs text-white/70">
                <CheckCircle2 size={16} className="text-emerald" />
                <span>DoE Baseline: 0.550 kg CO₂e/kWh</span>
              </div>
              <div className="hero-trust-badge flex items-center space-x-2 text-xs text-white/70">
                <ShieldCheck size={16} className="text-emerald" />
                <span>Article 6.2 ITMO Compatible</span>
              </div>
              <div className="hero-trust-badge flex items-center space-x-2 text-xs text-white/70">
                <Globe size={16} className="text-emerald" />
                <span>Verra VCS & Gold Standard Synced</span>
              </div>
            </div>

          </div>

          {/* Right Column: Sovereign Exchange Terminal Card */}
          <div className="lg:col-span-5 w-full">
            <div className="hero-terminal-card bg-[#080F0B]/90 backdrop-blur-2xl border border-white/15 rounded-[2rem] p-6 lg:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.7)] relative overflow-hidden">
              
              {/* Corner Accent Glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald/10 rounded-full blur-3xl pointer-events-none"></div>
              
              {/* Terminal Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                <div className="flex items-center space-x-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald animate-pulse"></div>
                  <span className="font-mono text-[11px] uppercase tracking-widest text-white/80 font-semibold">
                    Live Clearing Terminal // Dhaka
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 font-mono text-[10px] text-emerald bg-emerald/10 border border-emerald/20 px-2 py-0.5 rounded">
                  <Activity size={12} />
                  <span>42ms Consensus</span>
                </div>
              </div>

              {/* 4 Core Metrics Grid */}
              <div className="grid grid-cols-2 gap-3.5 mb-5">
                
                {/* Metric 1 */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-white/50 text-[11px] font-mono">
                    <span>TOTAL REDUCTION</span>
                    <TrendingUp size={14} className="text-emerald" />
                  </div>
                  <div className="mt-2">
                    <span className="font-mono font-bold text-2xl lg:text-3xl text-white">10.42M</span>
                    <span className="font-mono text-xs text-emerald ml-1 font-semibold">tCO₂e</span>
                  </div>
                  <span className="font-sans text-[10px] text-emerald/80 mt-1 font-medium">+18.4% YoY Audited</span>
                </div>

                {/* Metric 2 */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-white/50 text-[11px] font-mono">
                    <span>FARMER REMITTANCE</span>
                    <span className="text-[10px] text-emerald font-mono font-bold">97.0%</span>
                  </div>
                  <div className="mt-2">
                    <span className="font-mono font-bold text-2xl lg:text-3xl text-emerald">৳412.8M</span>
                  </div>
                  <span className="font-sans text-[10px] text-white/60 mt-1">bKash / Nagad Direct Wallets</span>
                </div>

                {/* Metric 3 */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-white/50 text-[11px] font-mono">
                    <span>LIVE LIQUIDITY</span>
                    <Layers size={14} className="text-cyan-400" />
                  </div>
                  <div className="mt-2">
                    <span className="font-mono font-bold text-2xl lg:text-3xl text-white">42,850</span>
                    <span className="font-mono text-xs text-white/50 ml-1">tCO₂e</span>
                  </div>
                  <span className="font-sans text-[10px] text-cyan-400 mt-1">Available for Settlement</span>
                </div>

                {/* Metric 4 */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-white/50 text-[11px] font-mono">
                    <span>AVG CLEARING</span>
                    <span className="font-mono text-[10px] text-white/40">BDT / t</span>
                  </div>
                  <div className="mt-2">
                    <span className="font-mono font-bold text-2xl lg:text-3xl text-white">৳14,920</span>
                  </div>
                  <span className="font-sans text-[10px] text-white/60 mt-1">Sovereign Spot Reference</span>
                </div>

              </div>

              {/* Streaming Real-Time Transaction Ribbon */}
              <div className="bg-black/50 border border-white/10 rounded-xl p-3.5 mb-5 relative">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] text-emerald uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    <Radio size={12} className="text-emerald animate-pulse" />
                    <span>Real-Time Settlement Feed</span>
                  </span>
                  <span className="font-mono text-[10px] text-white/40">
                    {tradeStreams[activeStreamIndex].time}
                  </span>
                </div>
                <p className="font-mono text-xs text-white font-medium truncate">
                  {tradeStreams[activeStreamIndex].desc}
                </p>
                <p className="font-mono text-[11px] text-emerald/80 truncate mt-0.5">
                  → {tradeStreams[activeStreamIndex].detail}
                </p>
              </div>

              {/* Verified Registry Stamps */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                  <span className="font-mono text-[10px] text-emerald font-bold">VCS 2024</span>
                  <span className="font-sans text-[9px] text-white/50">Verra Integrated</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                  <span className="font-mono text-[10px] text-amber-400 font-bold">GOLD STD</span>
                  <span className="font-sans text-[9px] text-white/50">Dual Certified</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                  <span className="font-mono text-[10px] text-cyan-400 font-bold">ART 6.2</span>
                  <span className="font-sans text-[9px] text-white/50">ITMO Compliant</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
      
      {/* Sentinel for Navbar */}
      <div id="hero-sentinel" className="absolute bottom-0 w-full h-1"></div>
    </section>
  );
};

export default Hero;

