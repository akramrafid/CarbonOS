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
import { useTheme } from '../context/ThemeContext';

const Hero = () => {
  const containerRef = useRef(null);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isLight = theme === 'light';
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
      {/* Background Photography with Theme-Aware Composite Layering */}
      <div 
        className="hero-bg absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("/hero_landscape.png")' }}
      ></div>
      
      {/* High-End Theme-Adaptive Contrast Overlays */}
      {isLight ? (
        <>
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(105deg, rgba(242, 243, 238, 0.94) 0%, rgba(242, 243, 238, 0.84) 48%, rgba(242, 243, 238, 0.42) 100%)',
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-44 z-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, #f2f3ee 0%, rgba(242, 243, 238, 0) 100%)',
            }}
          />
          <div
            className="absolute inset-x-0 top-0 h-28 z-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(242, 243, 238, 0.82) 0%, rgba(242, 243, 238, 0) 100%)',
            }}
          />
        </>
      ) : (
        <>
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#040A06] via-[#040A06]/75 to-[#040A06]/60"></div>
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,200,83,0.15),rgba(255,255,255,0))]"></div>
        </>
      )}
      
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

            {/* Headline with High-Impact Typographic Scale (Unified Poppins, Zero Gradient Text) */}
            <h1 className="flex flex-col mb-5 sm:mb-6 w-full tracking-tight font-sans font-extrabold">
              <span className="hero-h1 text-[34px] sm:text-5xl lg:text-[64px] leading-[1.08] text-white">
                Bangladesh's Carbon
              </span>
              <span className="hero-h1 text-[34px] sm:text-5xl lg:text-[64px] leading-[1.08] text-white">
                Infrastructure{' '}
                <span className={isLight ? 'text-[#15803d]' : 'text-[#00C853]'}>
                  &amp; Credit Exchange.
                </span>
              </span>
            </h1>

            {/* Precision Subtitle */}
            <p className="hero-body font-sans text-sm sm:text-lg lg:text-xl text-white/80 max-w-[600px] leading-relaxed mb-7 sm:mb-9 font-normal">
              Digitizing, tracing and securing Bangladesh's carbon asset pipeline from 1M+ smallholder rural farmers directly to global ESG institutional registries.
            </p>

            {/* Action Buttons */}
            <div className="hero-cta flex flex-wrap gap-3 sm:gap-4 items-center mb-8 sm:mb-10 w-full">
              <Link 
                to="/platform/marketplace" 
                className="group relative inline-flex items-center justify-center bg-[#00C853] hover:bg-[#00E676] text-[#040A06] font-sans font-bold text-sm sm:text-base px-6 sm:px-7 py-3.5 sm:py-4 rounded-full transition-all duration-300 shadow-[0_0_24px_rgba(0,200,83,0.3)] hover:scale-[1.02] active:scale-[0.98] min-h-[44px] w-full sm:w-auto"
              >
                <span>Explore Credit Listings</span>
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                to="/platform/carbon-registry" 
                className={`inline-flex items-center justify-center font-sans font-medium text-sm sm:text-base px-5 sm:px-6 py-3.5 sm:py-4 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] min-h-[44px] w-full sm:w-auto border ${
                  isLight
                    ? 'bg-white/95 hover:bg-white text-[#0F291B] border-[#0F291B]/14 hover:border-[#15803d]/40 shadow-[0_6px_18px_-6px_rgba(15,41,27,0.10)]'
                    : 'bg-white/[0.06] hover:bg-white/[0.12] text-white border-white/15 hover:border-emerald/40'
                }`}
              >
                <Terminal size={16} className={`mr-2 ${isLight ? 'text-[#15803d]' : 'text-emerald'}`} />
                <span>Registry Terminal</span>
              </Link>

              <Link
                to="/platform/esg"
                className="inline-flex items-center text-xs font-mono text-white/70 hover:text-emerald px-2 py-2.5 min-h-[44px] transition-colors"
              >
                <Lock size={12} className="mr-1.5 text-emerald" />
                <span>Enterprise ESG Portal →</span>
              </Link>
            </div>

            {/* Regulatory Alignment Ledger Strip */}
            <div className="flex flex-wrap gap-3 sm:gap-6 pt-5 sm:pt-6 border-t border-white/10 w-full">
              <div className="hero-trust-badge flex items-center space-x-2 text-xs text-white/70">
                <CheckCircle2 size={15} className="text-emerald shrink-0" />
                <span>Cited, second-person-approved factors only</span>
              </div>
              <div className="hero-trust-badge flex items-center space-x-2 text-xs text-white/70">
                <ShieldCheck size={15} className="text-emerald shrink-0" />
                <span>Every ledger line traceable to evidence</span>
              </div>
              <div className="hero-trust-badge flex items-center space-x-2 text-xs text-white/70">
                <Globe size={15} className="text-emerald shrink-0" />
                <span>Labelled NOT ASSURED until verified</span>
              </div>
            </div>

          </div>

          {/* Right Column: Single-Surface Hairline Clearing Terminal Sheet (Zero Nested Cards) */}
          <div className="lg:col-span-5 w-full min-w-0">
            <div className={`hero-terminal-card backdrop-blur-2xl border rounded-2xl relative overflow-hidden ${
              isLight
                ? 'bg-white/96 border-[#0F291B]/12 shadow-[0_24px_60px_-15px_rgba(15,41,27,0.14),0_6px_18px_-6px_rgba(15,41,27,0.06)]'
                : 'bg-[#080F0B]/92 border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.7)]'
            }`}>
              
              {/* Terminal Top Header */}
              <div className={`flex flex-wrap items-center justify-between gap-2 px-5 sm:px-6 py-3.5 border-b ${isLight ? 'border-[#0F291B]/10' : 'border-white/10'}`}>
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${isLight ? 'bg-[#15803d]' : 'bg-emerald'}`} />
                  <span className={`font-mono text-[11px] uppercase tracking-wider font-semibold ${isLight ? 'text-[#0F291B]' : 'text-white/85'}`}>
                    Clearing Terminal · Dhaka
                  </span>
                </div>
                <span className={`font-mono text-[10px] ${isLight ? 'text-[#15803d] font-semibold' : 'text-emerald'}`}>
                  Protocol v2.4 · 42ms
                </span>
              </div>

              {/* 2x2 Hairline Ledger Matrix (No Nested Boxes) */}
              <div className={`grid grid-cols-1 min-[360px]:grid-cols-2 divide-y min-[360px]:divide-y-0 ${isLight ? 'divide-[#0F291B]/10' : 'divide-white/10'}`}>
                {/* Metric 1 */}
                <div className={`p-4 sm:p-5 border-b ${isLight ? 'border-[#0F291B]/10 min-[360px]:border-r' : 'border-white/10 min-[360px]:border-r'}`}>
                  <div className={`text-[10px] font-mono uppercase tracking-wider ${isLight ? 'text-[#4A5D52]' : 'text-white/55'}`}>
                    Total Reduction
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-1">
                    <span className={`font-mono font-bold text-xl sm:text-2xl tabular-nums ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>10.42M</span>
                    <span className={`font-mono text-xs font-semibold ${isLight ? 'text-[#15803d]' : 'text-emerald'}`}>tCO₂e</span>
                  </div>
                  <span className={`font-sans text-[11px] mt-1 block font-medium ${isLight ? 'text-[#15803d]' : 'text-emerald/85'}`}>+18.4% YoY</span>
                </div>

                {/* Metric 2 */}
                <div className={`p-4 sm:p-5 border-b ${isLight ? 'border-[#0F291B]/10' : 'border-white/10'}`}>
                  <div className={`flex items-center justify-between text-[10px] font-mono uppercase tracking-wider gap-1 ${isLight ? 'text-[#4A5D52]' : 'text-white/55'}`}>
                    <span>Direct Payout</span>
                    <span className={`font-bold ${isLight ? 'text-[#15803d]' : 'text-emerald'}`}>97.0%</span>
                  </div>
                  <div className="mt-1.5">
                    <span className={`font-mono font-bold text-xl sm:text-2xl tabular-nums ${isLight ? 'text-[#15803d]' : 'text-emerald'}`}>৳412.8M</span>
                  </div>
                  <span className={`font-sans text-[11px] mt-1 block ${isLight ? 'text-[#4A5D52]' : 'text-white/60'}`}>bKash / Nagad direct</span>
                </div>

                {/* Metric 3 */}
                <div className={`p-4 sm:p-5 min-[360px]:border-r ${isLight ? 'border-[#0F291B]/10' : 'border-white/10'}`}>
                  <div className={`text-[10px] font-mono uppercase tracking-wider ${isLight ? 'text-[#4A5D52]' : 'text-white/55'}`}>
                    Live Liquidity
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-1">
                    <span className={`font-mono font-bold text-xl sm:text-2xl tabular-nums ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>42,850</span>
                    <span className={`font-mono text-xs ${isLight ? 'text-[#4A5D52]' : 'text-white/50'}`}>tCO₂e</span>
                  </div>
                  <span className={`font-sans text-[11px] mt-1 block font-medium ${isLight ? 'text-[#0369a1]' : 'text-cyan-400'}`}>Available for settlement</span>
                </div>

                {/* Metric 4 */}
                <div className="p-4 sm:p-5">
                  <div className={`flex items-center justify-between text-[10px] font-mono uppercase tracking-wider gap-1 ${isLight ? 'text-[#4A5D52]' : 'text-white/55'}`}>
                    <span>Avg Clearing</span>
                    <span>BDT/t</span>
                  </div>
                  <div className="mt-1.5">
                    <span className={`font-mono font-bold text-xl sm:text-2xl tabular-nums ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>৳14,920</span>
                  </div>
                  <span className={`font-sans text-[11px] mt-1 block ${isLight ? 'text-[#4A5D52]' : 'text-white/60'}`}>Indicative spot ref.</span>
                </div>
              </div>

              {/* Settlement Stream Feed Row */}
              <div className={`px-5 sm:px-6 py-4 border-t ${isLight ? 'border-[#0F291B]/10 bg-[#F7FAF8]' : 'border-white/10 bg-black/25'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-mono text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 ${isLight ? 'text-[#15803d]' : 'text-emerald'}`}>
                    <Radio size={11} />
                    <span>Settlement Feed</span>
                  </span>
                  <span className={`font-mono text-[10px] tabular-nums ${isLight ? 'text-[#4A5D52]' : 'text-white/45'}`}>
                    {tradeStreams[activeStreamIndex].time}
                  </span>
                </div>
                <p className={`font-mono text-xs font-medium truncate ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                  {tradeStreams[activeStreamIndex].desc}
                </p>
                <p className={`font-mono text-[11px] truncate mt-0.5 ${isLight ? 'text-[#15803d]' : 'text-emerald/85'}`}>
                  → {tradeStreams[activeStreamIndex].detail}
                </p>
              </div>

              {/* Footnote */}
              <div className={`px-5 sm:px-6 py-2.5 border-t font-sans text-[10px] ${isLight ? 'border-[#0F291B]/8 text-[#556B5E]' : 'border-white/8 text-white/50'}`}>
                No registry integration or third-party certification is claimed.
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

