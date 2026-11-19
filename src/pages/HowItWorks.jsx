import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Radio, Building2, Wallet } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const StepCard = ({ step, index, inView, isLight }) => {
  return (
    <div className={`relative flex flex-col md:flex-row items-center justify-between w-full mb-20 transition-all duration-700 ${
      inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
    } ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
      
      {/* Connector Line Point */}
      <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
          isLight
            ? inView ? 'bg-[#15803d] border-[#15803d] text-white' : 'bg-white border-[#0F291B]/25 text-[#0F291B]'
            : inView ? 'bg-emerald border-emerald text-[#040A06]' : 'bg-[#080F0B] border-white/20 text-white'
        }`}>
          <span className="font-mono text-[10px] font-bold tabular-nums">{index + 1}</span>
        </div>
      </div>

      {/* Content Container */}
      <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'} text-left mb-6 md:mb-0`}>
        <h3 className={`text-2xl sm:text-3xl font-bold mb-3 font-sans tracking-tight ${
          isLight ? 'text-[#0F291B]' : 'text-white'
        }`}>{step.title}</h3>
        <p className={`leading-relaxed text-sm md:text-base ${
          isLight ? 'text-[#37473E]' : 'text-mist'
        }`}>
          {step.description}
        </p>
        {step.metric && (
          <div className={`mt-5 pt-3 border-t flex items-baseline justify-between gap-4 text-left ${
            isLight ? 'border-[#0F291B]/12' : 'border-white/10'
          }`}>
            <span className={`text-[11px] font-mono uppercase tracking-wider ${
              isLight ? 'text-[#556B5E]' : 'text-mist/70'
            }`}>{step.metricLabel}</span>
            <span className={`text-sm font-mono font-bold tabular-nums ${
              isLight ? 'text-[#15803d]' : 'text-emerald'
            }`}>{step.metric}</span>
          </div>
        )}
      </div>

      {/* Visual / Graphic Container */}
      <div className={`w-full md:w-5/12 border rounded-2xl p-7 transition-colors relative overflow-hidden h-[240px] flex items-center justify-center ${
        isLight
          ? 'bg-white border-[#0F291B]/12 shadow-[0_8px_24px_-10px_rgba(15,41,27,0.08)]'
          : 'bg-[#080F0B] border-white/10 hover:border-emerald/35'
      }`}>
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center">
          {step.visual}
        </div>
      </div>
    </div>
  );
};

const HowItWorks = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [visibleSteps, setVisibleSteps] = useState([false, false, false, false, false]);
  const observerRefs = useRef([]);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index'), 10);
          setVisibleSteps(prev => {
            const next = [...prev];
            next[index] = true;
            return next;
          });
        }
      });
    }, { threshold: 0.2 });

    observerRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      title: "Data Collection & IoT",
      description: "Tamper-proof sensors and agromet stations deployed in the field continuously monitor soil moisture, crop yield, and weather patterns, capturing granular ground truth data.",
      metricLabel: "System Capacity",
      metric: "50,000+ Readings / Hour",
      visual: (
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-3 rounded-xl border flex items-center justify-center ${
            isLight ? 'bg-[#E5F4EB] border-[#15803d]/25 text-[#15803d]' : 'bg-[#0D2B1A] border-emerald/25 text-emerald'
          }`}>
            <Radio size={26} />
          </div>
          <div className={`font-mono text-xs font-semibold ${isLight ? 'text-[#15803d]' : 'text-emerald'}`}>LoRaWAN Active</div>
        </div>
      )
    },
    {
      title: "AI Verification Pipeline",
      description: "Ground truth is cross-referenced with Google Earth Engine satellite imagery. Our AI models analyze NDVI changes to verify biomass increases and authenticate carbon claims.",
      metricLabel: "Satellite Resolution",
      metric: "10m (Sentinel-2) Multi-spectral",
      visual: (
        <div className="w-full max-w-[220px] space-y-3">
          <div className={`flex justify-between items-center text-xs ${isLight ? 'text-[#37473E]' : 'text-mist'}`}>
            <span>Ground Data</span>
            <span className={`font-mono font-semibold ${isLight ? 'text-[#15803d]' : 'text-emerald'}`}>Matched</span>
          </div>
          <div className={`h-1.5 w-full rounded-full overflow-hidden ${isLight ? 'bg-[#0F291B]/10' : 'bg-[#1A1A1A]'}`}>
            <div className={`h-full w-full ${isLight ? 'bg-[#15803d]' : 'bg-emerald'}`}></div>
          </div>
          <div className={`flex justify-between items-center text-xs ${isLight ? 'text-[#37473E]' : 'text-mist'}`}>
            <span>Satellite Sync</span>
            <span className={`font-mono font-semibold ${isLight ? 'text-[#15803d]' : 'text-emerald'}`}>Verified</span>
          </div>
          <div className={`h-1.5 w-full rounded-full overflow-hidden ${isLight ? 'bg-[#0F291B]/10' : 'bg-[#1A1A1A]'}`}>
            <div className={`h-full w-[92%] ${isLight ? 'bg-[#15803d]' : 'bg-emerald'}`}></div>
          </div>
        </div>
      )
    },
    {
      title: "Registry & Tokenization",
      description: "Once verified, a distinct, traceable Carbon Credit (tCO₂e) is minted on the Carbon Zero BD registry. It receives a unique identifier preventing double-counting.",
      metricLabel: "Standard Compliant",
      metric: "Verra VCS / Gold Standard",
      visual: (
        <div className={`w-full max-w-[240px] border p-4 rounded-xl text-left ${
          isLight ? 'bg-[#F7FBF8] border-[#15803d]/25' : 'bg-[#040A06] border-emerald/25'
        }`}>
          <div className={`font-mono text-[10px] mb-1 border-b pb-1.5 ${
            isLight ? 'text-[#15803d] border-[#15803d]/20' : 'text-emerald border-emerald/20'
          }`}>SERIAL: BD-2026-CR-001</div>
          <div className={`text-2xl font-mono font-bold tabular-nums mt-2 ${
            isLight ? 'text-[#0F291B]' : 'text-white'
          }`}>1.0 <span className={`text-xs font-sans font-normal ${isLight ? 'text-[#556B5E]' : 'text-mist'}`}>tCO₂e</span></div>
        </div>
      )
    },
    {
      title: "Corporate Marketplace",
      description: "Global buyers seamlessly purchase credits to offset their emissions via our secure exchange. The platform holds funds in escrow instantly upon transaction.",
      metricLabel: "Current Spot Price",
      metric: "৳ 15,400 / tonne",
      visual: (
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`w-11 h-11 rounded-lg border flex items-center justify-center ${
              isLight ? 'bg-[#F5F8F5] border-[#0F291B]/15 text-[#0F291B]' : 'bg-[#0D1E14] border-white/15 text-white'
            }`}>
              <Building2 size={20} />
            </div>
            <span className={`font-mono text-xs ${isLight ? 'text-[#556B5E]' : 'text-white/50'}`}>→</span>
            <div className={`w-11 h-11 rounded-lg border flex items-center justify-center ${
              isLight ? 'bg-[#E5F4EB] border-[#15803d]/30 text-[#15803d]' : 'bg-emerald/15 border-emerald/35 text-emerald'
            }`}>
              <Wallet size={20} />
            </div>
          </div>
          <div className={`font-mono text-xs font-semibold ${isLight ? 'text-[#37473E]' : 'text-mist'}`}>
            Escrow Settlement Locked
          </div>
        </div>
      )
    },
    {
      title: "Instant Farmer Payout",
      description: "Zero manual intervention. The moment the credit is purchased, our smart contract routes 97% of the gross sale directly to the farmer's mobile wallet via the Mobile Banking System.",
      metricLabel: "Settlement Speed",
      metric: "< 5 Seconds End-to-End",
      visual: (
        <div className="w-full max-w-[240px] flex flex-col items-center space-y-3">
          <div className={`w-full py-2 px-4 rounded-lg border font-sans font-semibold text-xs text-center ${
            isLight ? 'bg-[#15803d] text-white border-transparent' : 'bg-[#1A3A28] text-white border-emerald/30'
          }`}>
            Mobile Banking System
          </div>
          <div className={`w-full pt-2 border-t flex items-baseline justify-between tabular-nums ${
            isLight ? 'border-[#0F291B]/12' : 'border-white/10'
          }`}>
            <span className={`text-[11px] font-mono ${isLight ? 'text-[#556B5E]' : 'text-mist'}`}>FARMER RECEIVES</span>
            <span className={`text-lg font-mono font-bold ${isLight ? 'text-[#15803d]' : 'text-emerald'}`}>৳ 14,938</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className={`min-h-screen font-sans selection:bg-emerald selection:text-carbon relative pt-20 ${
      isLight ? 'bg-[#F2F3EE] text-[#0F291B]' : 'bg-[#040A06] text-white'
    }`}>

      {/* Hero Section */}
      <header className={`relative pt-20 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-12 z-10 border-b ${
        isLight ? 'border-[#0F291B]/10' : 'border-white/10'
      }`}>
        <div className="max-w-4xl mx-auto">
          <h1 className={`font-sans font-extrabold text-4xl sm:text-5xl md:text-6xl leading-tight mb-5 tracking-tight ${
            isLight ? 'text-[#0F291B]' : 'text-white'
          }`}>
            The Lifecycle of a{' '}
            <span className={isLight ? 'text-[#15803d]' : 'text-emerald'}>Verified Credit</span>
          </h1>
          <p className={`text-base sm:text-lg md:text-xl font-sans max-w-2xl leading-relaxed ${
            isLight ? 'text-[#37473E]' : 'text-mist font-light'
          }`}>
            Data-to-BDT settlement pipeline moving verified carbon abatement from rural smallholder farms directly to institutional buyers.
          </p>
        </div>
      </header>

      {/* Main Roadmap / Timeline Section */}
      <section className="relative py-20 px-6 lg:px-12 z-10 overflow-hidden">
        <div className="max-w-6xl mx-auto relative">
          
          {/* Vertical Connecting Line (Desktop) */}
          <div className={`hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 ${
            isLight ? 'bg-[#0F291B]/12' : 'bg-[#1A3A28]'
          }`}>
            <div className={`w-full h-1/3 rounded-full animate-[slide_4s_ease-in-out_infinite] ${
              isLight ? 'bg-[#15803d]' : 'bg-emerald'
            }`}></div>
          </div>

          <div className="relative z-10 space-y-8 md:space-y-0">
            {steps.map((step, index) => (
              <div key={index} ref={el => observerRefs.current[index] = el} data-index={index}>
                <StepCard 
                  step={step} 
                  index={index} 
                  inView={visibleSteps[index]}
                  isLight={isLight}
                />
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Final Call To Action */}
      <section className={`relative py-20 px-6 lg:px-12 z-10 border-t ${
        isLight ? 'border-[#0F291B]/10 bg-white' : 'border-white/10 bg-[#080F0B]'
      }`}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className={`font-sans font-bold text-3xl mb-2 tracking-tight ${
              isLight ? 'text-[#0F291B]' : 'text-white'
            }`}>Experience the Pipeline</h2>
            <p className={`max-w-xl text-sm sm:text-base ${
              isLight ? 'text-[#37473E]' : 'text-mist'
            }`}>
              Open the Marketplace to initiate a live simulated retirement transaction.
            </p>
          </div>
          <Link to="/platform/marketplace" className={`font-sans font-bold text-sm px-6 py-3.5 rounded-xl transition-colors shrink-0 text-center ${
            isLight
              ? 'bg-[#15803d] hover:bg-[#166534] text-white'
              : 'bg-emerald hover:bg-[#00E676] text-[#050C07]'
          }`}>
            Test Corporate Purchase →
          </Link>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide {
          0% { transform: translateY(-100%); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(300%); opacity: 0; }
        }
      `}} />
    </div>
  );
};

export default HowItWorks;
