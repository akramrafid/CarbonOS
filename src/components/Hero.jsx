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
    { time: "13:58 BST", desc: "3,500 tCO₂e Sundarbans Blue Carbon listed", detail: "Sentinel-2 NDVI 0.82 · not registered with any standard" },
    { time: "12:40 BST", desc: "800 tCO₂e Solar Irrigation Khulna retired", detail: "Corporate buyer retirement" },
    { time: "11:15 BST", desc: "2,400 tCO₂e Biogas Waste-to-Energy Dhaka minted", detail: "IoT sensor telemetry consensus (99.8%)" }
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

      // Background subtle entrance
      tl.fromTo('.hero-bg', 
        { scale: 1.03, opacity: 0.85 }, 
        { scale: 1, opacity: 1, duration: 0.9, ease: 'power2.out' }, 
        0
      );

      // Watermark
      tl.fromTo('.hero-watermark',
        { y: 12, opacity: 0.7 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
        0
      );

      // Pill
      tl.fromTo('.hero-pill', 
        { y: 8, opacity: 0.85 }, 
        { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' }, 
        0.05
      );

      // Headline (already visible default so mobile paint never blocks on opacity:0)
      tl.fromTo('.hero-h1', 
        { y: 14, opacity: 0.9 }, 
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.06 }, 
        0.08
      );

      // Body & CTA
      tl.fromTo(['.hero-body', '.hero-cta'], 
        { y: 10, opacity: 0.9 }, 
        { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', stagger: 0.06 }, 
        0.18
      );

      // Terminal Card
      tl.fromTo('.hero-terminal-card', 
        { y: 16, opacity: 0.9, scale: 0.985 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.55, ease: 'power3.out' }, 
        0.2
      );

      // Trust Badges
      tl.fromTo('.hero-trust-badge', 
        { y: 8, opacity: 0.9 }, 
        { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', stagger: 0.05 }, 
        0.25
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

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-12 pt-24 sm:pt-32 pb-12 sm:pb-16 w-full flex flex-col justify-between min-h-[100dvh]">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-8 items-center my-auto">
          
          {/* Left Column: Brand Statement & Primary Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left pt-2 sm:pt-6 lg:pt-0 min-w-0">
            
            {/* Live Protocol Status Pill */}
            <div className="hero-pill inline-flex flex-wrap items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-xl border border-emerald/30 hover:border-emerald/60 rounded-2xl sm:rounded-full py-1.5 px-3 sm:px-4 mb-5 sm:mb-6 shadow-[0_0_20px_rgba(0,200,83,0.15)] transition-all duration-300 max-w-full">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C853] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C853]"></span>
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider text-emerald uppercase whitespace-nowrap">
                CarbonOS Protocol v2.4
              </span>
              <span className="text-white/20 hidden sm:inline">|</span>
              <span className="font-sans text-[11px] text-white/80 hidden sm:inline">
                GHG Protocol Scope 1 &amp; 2 method
              </span>
              <span className="bg-emerald/15 text-emerald border border-emerald/30 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap">
                97% DIRECT PAYOUT
              </span>
            </div>

            {/* Headline with High-Impact Contrast */}
            <h1 className="flex flex-col mb-5 sm:mb-6 w-full tracking-tight">
              <span className="hero-h1 font-sans font-extrabold text-[32px] sm:text-5xl lg:text-[68px] leading-[1.08] text-white">
                Bangladesh's
              </span>
              <span className="hero-h1 font-sans font-extrabold text-[32px] sm:text-5xl lg:text-[68px] leading-[1.08] text-white">
                Carbon Infrastructure
              </span>
              <span className="hero-h1 serif-drama italic text-[38px] sm:text-6xl lg:text-[80px] leading-[1.05] bg-gradient-to-r from-[#00C853] via-[#69F0AE] to-[#A7F3D0] bg-clip-text text-transparent mt-1 drop-shadow-sm">
                & Credit Exchange.
              </span>
            </h1>

            {/* Precision Subtitle */}
            <p className="hero-body font-sans text-sm sm:text-lg lg:text-xl text-white/80 max-w-[620px] leading-relaxed mb-6 sm:mb-8 font-normal">
              Digitizing, tracing and securing Bangladesh's carbon asset pipeline from 1M+ smallholder rural farmers directly to global ESG institutional registries.
            </p>

            {/* Action Buttons & Fast Proof */}
            <div className="hero-cta flex flex-wrap gap-3 sm:gap-4 items-center mb-8 sm:mb-10 w-full">
              <Link 
                to="/platform/marketplace" 
                className="group relative inline-flex items-center justify-center bg-[#00C853] hover:bg-[#00E676] text-[#040A06] font-sans font-bold text-sm sm:text-base px-5 sm:px-7 py-3.5 sm:py-4 rounded-full transition-all duration-300 shadow-[0_0_30px_rgba(0,200,83,0.35)] hover:shadow-[0_0_45px_rgba(0,200,83,0.55)] hover:scale-[1.02] active:scale-[0.98] min-h-[44px] w-full sm:w-auto"
              >
                <span>Explore Credit Listings</span>
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                to="/platform/carbon-registry" 
                className="inline-flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15 hover:border-emerald/40 font-sans font-medium text-sm sm:text-base px-5 sm:px-6 py-3.5 sm:py-4 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] min-h-[44px] w-full sm:w-auto"
              >
                <Terminal size={16} className="mr-2 text-emerald" />
                <span>Registry Terminal</span>
              </Link>

              <Link
                to="/platform/saas-dashboard"
                className="inline-flex items-center text-xs font-mono text-white/70 hover:text-emerald px-2 py-2.5 min-h-[44px] transition-colors"
              >
                <Lock size={12} className="mr-1.5 text-emerald" />
                <span>Enterprise ESG Portal →</span>
              </Link>
            </div>

            {/* Regulatory Alignment Micro-Badges */}
            <div className="flex flex-wrap gap-3 sm:gap-6 pt-5 sm:pt-6 border-t border-white/10 w-full">
              <div className="hero-trust-badge flex items-center space-x-2 text-xs text-white/70">
                <CheckCircle2 size={16} className="text-emerald shrink-0" />
                <span>Cited, second-person-approved factors only</span>
              </div>
              <div className="hero-trust-badge flex items-center space-x-2 text-xs text-white/70">
                <ShieldCheck size={16} className="text-emerald shrink-0" />
                <span>Every ledger line traceable to its evidence</span>
              </div>
              <div className="hero-trust-badge flex items-center space-x-2 text-xs text-white/70">
                <Globe size={16} className="text-emerald shrink-0" />
                <span>Labelled NOT ASSURED until a verifier signs</span>
              </div>
            </div>

          </div>

          {/* Right Column: Sovereign Exchange Terminal Card */}
          <div className="lg:col-span-5 w-full min-w-0">
            <div className="hero-terminal-card bg-[#080F0B]/90 backdrop-blur-2xl border border-white/15 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.7)] relative overflow-hidden">
              
              {/* Corner Accent Glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald/10 rounded-full blur-3xl pointer-events-none"></div>
              
              {/* Terminal Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 sm:pb-4 mb-4 sm:mb-5">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald animate-pulse shrink-0"></div>
                  <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-white/80 font-semibold">
                    Live Clearing Terminal // Dhaka
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 font-mono text-[10px] text-emerald bg-emerald/10 border border-emerald/20 px-2 py-0.5 rounded shrink-0">
                  <Activity size={12} />
                  <span>42ms Consensus</span>
                </div>
              </div>

              {/* 4 Core Metrics Grid */}
              <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-2.5 sm:gap-3.5 mb-4 sm:mb-5">
                
                {/* Metric 1 */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col justify-between min-w-0">
                  <div className="flex items-center justify-between text-white/50 text-[10px] sm:text-[11px] font-mono gap-1">
                    <span className="truncate">TOTAL REDUCTION</span>
                    <TrendingUp size={14} className="text-emerald shrink-0" />
                  </div>
                  <div className="mt-2">
                    <span className="font-mono font-bold text-xl sm:text-2xl lg:text-3xl text-white">10.42M</span>
                    <span className="font-mono text-xs text-emerald ml-1 font-semibold">tCO₂e</span>
                  </div>
                  <span className="font-sans text-[10px] text-emerald/80 mt-1 font-medium">+18.4% YoY</span>
                </div>

                {/* Metric 2 */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col justify-between min-w-0">
                  <div className="flex items-center justify-between text-white/50 text-[10px] sm:text-[11px] font-mono gap-1">
                    <span className="truncate">FARMER REMITTANCE</span>
                    <span className="text-[10px] text-emerald font-mono font-bold shrink-0">97.0%</span>
                  </div>
                  <div className="mt-2">
                    <span className="font-mono font-bold text-xl sm:text-2xl lg:text-3xl text-emerald">৳412.8M</span>
                  </div>
                  <span className="font-sans text-[10px] text-white/60 mt-1">bKash / Nagad Direct Wallets</span>
                </div>

                {/* Metric 3 */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col justify-between min-w-0">
                  <div className="flex items-center justify-between text-white/50 text-[10px] sm:text-[11px] font-mono gap-1">
                    <span className="truncate">LIVE LIQUIDITY</span>
                    <Layers size={14} className="text-cyan-400 shrink-0" />
                  </div>
                  <div className="mt-2">
                    <span className="font-mono font-bold text-xl sm:text-2xl lg:text-3xl text-white">42,850</span>
                    <span className="font-mono text-xs text-white/50 ml-1">tCO₂e</span>
                  </div>
                  <span className="font-sans text-[10px] text-cyan-400 mt-1">Available for Settlement</span>
                </div>

                {/* Metric 4 */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col justify-between min-w-0">
                  <div className="flex items-center justify-between text-white/50 text-[10px] sm:text-[11px] font-mono gap-1">
                    <span className="truncate">AVG CLEARING</span>
                    <span className="font-mono text-[10px] text-white/40 shrink-0">BDT / t</span>
                  </div>
                  <div className="mt-2">
                    <span className="font-mono font-bold text-xl sm:text-2xl lg:text-3xl text-white">৳14,920</span>
                  </div>
                  <span className="font-sans text-[10px] text-white/60 mt-1">Indicative spot reference</span>
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

              {/* No registry integration or third-party certification is claimed. */}
              <p className="pt-2 border-t border-white/10 font-sans text-[10px] text-white/50">
                No registry integration or third-party certification is claimed.
              </p>

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

