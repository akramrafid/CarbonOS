import React, { useEffect, useRef, useState } from 'react';

const StepCard = ({ step, index, inView }) => {
  return (
    <div className={`relative flex flex-col md:flex-row items-center justify-between w-full mb-24 transition-all duration-1000 ${
      inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'
    } ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
      
      {/* Connector Line Point */}
      <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className={`w-8 h-8 rounded-full border-4 border-[#040A06] flex items-center justify-center transition-all duration-700 delay-300 ${
          inView ? 'bg-emerald shadow-[0_0_20px_#16A34A]' : 'bg-[#0D2B1A]'
        }`}>
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>

      {/* Content Container */}
      <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'} text-center md:text-left mb-8 md:mb-0`}>
        <div className="inline-block px-3 py-1 bg-emerald/10 border border-emerald/20 rounded-full font-mono text-[10px] text-emerald mb-4 tracking-widest uppercase">
          Phase 0{index + 1}
        </div>
        <h3 className="text-3xl font-bold text-white mb-3 font-sans tracking-tight">{step.title}</h3>
        <p className="text-mist leading-relaxed text-sm md:text-base">
          {step.description}
        </p>
        {step.metric && (
          <div className={`mt-6 p-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm inline-block w-full text-left`}>
            <p className="text-[10px] text-mist/70 font-mono uppercase mb-1">{step.metricLabel}</p>
            <p className="text-lg font-bold text-emerald">{step.metric}</p>
          </div>
        )}
      </div>

      {/* Visual / Graphic Container */}
      <div className="w-full md:w-5/12 bg-[#080F0B] border border-white/10 rounded-[2rem] p-8 hover:border-emerald/40 transition-colors group relative overflow-hidden h-[280px] flex items-center justify-center">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-emerald/5 blur-[80px] group-hover:bg-emerald/10 transition-colors z-0"></div>
        
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center">
          {step.visual}
        </div>
      </div>
    </div>
  );
};

const HowItWorks = () => {
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
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 border-2 border-emerald border-dashed rounded-full animate-[spin_10s_linear_infinite]"></div>
            <div className="absolute inset-2 bg-[#0D2B1A] rounded-full flex items-center justify-center">
              <span className="text-3xl">📡</span>
            </div>
          </div>
          <div className="font-mono text-xs text-emerald bg-emerald/10 px-2 py-1 rounded inline-block">LoRaWAN Active</div>
        </div>
      )
    },
    {
      title: "AI Verification Pipeline",
      description: "Ground truth is cross-referenced with Google Earth Engine satellite imagery. Our AI models analyze NDVI changes to verify biomass increases and authenticate carbon claims.",
      metricLabel: "Satellite Resolution",
      metric: "10m (Sentinel-2) Multi-spectral",
      visual: (
        <div className="w-full max-w-[200px] space-y-3">
          <div className="flex justify-between items-center text-xs text-mist">
            <span>Ground Data</span>
            <span className="text-emerald">Matched</span>
          </div>
          <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
            <div className="h-full bg-emerald w-full animate-[pulse_2s_ease-in-out_infinite]"></div>
          </div>
          <div className="flex justify-between items-center text-xs text-mist">
            <span>Satellite Sync</span>
            <span className="text-emerald">Verified</span>
          </div>
          <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
            <div className="h-full bg-emerald w-[92%]"></div>
          </div>
        </div>
      )
    },
    {
      title: "Registry & Tokenization",
      description: "Once verified, a distinct, traceable Carbon Credit (tCO₂e) is minted on the CarbonOS registry. It receives a unique identifier preventing double-counting.",
      metricLabel: "Standard Compliant",
      metric: "Verra VCS / Gold Standard",
      visual: (
        <div className="relative">
          <div className="absolute -inset-4 bg-emerald/20 blur-xl rounded-full"></div>
          <div className="relative bg-[#040A06] border border-emerald/30 p-4 rounded-xl">
            <div className="font-mono text-[10px] text-emerald mb-1 border-b border-emerald/20 pb-1">CERTIFICATE: BD-2026-CR-001</div>
            <div className="text-3xl font-bold text-white my-2">1.0 <span className="text-sm font-sans font-normal text-mist">tCO₂e</span></div>
            <div className="flex justify-center mt-2">
              <svg className="w-16 h-8 text-emerald/40" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0,10 Q25,20 50,10 T100,10" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>
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
          <div className="flex space-x-2 mb-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg z-10 text-xl border-2 border-[#080F0B]">🏢</div>
            <div className="w-12 h-12 rounded-full bg-emerald flex items-center justify-center shadow-lg -ml-4 z-20 text-xl border-2 border-[#080F0B] text-white">💰</div>
          </div>
          <div className="font-mono text-xs text-mist bg-[#1A1A1A] px-3 py-1.5 rounded-lg border border-white/10">
            Escrow Locked
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
        <div className="w-full flex flex-col items-center">
          <div className="flex justify-center mb-6 w-full">
            <div className="bg-[#1A3A28] text-white font-bold px-6 py-2 rounded-lg flex items-center space-x-2 shadow-[0_0_15px_rgba(22,163,74,0.3)] border border-emerald/30 animate-pulse">
              <div className="w-3 h-3 bg-emerald rounded-full"></div>
              <span>Mobile Banking System</span>
            </div>
          </div>
          <div className="text-center bg-[#0D2B1A]/50 w-full p-3 rounded-lg border border-emerald/20">
            <p className="text-xs text-mist font-mono mb-1">FARMER RECEIVES</p>
            <p className="text-xl font-bold text-emerald">৳ 14,938</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#040A06] font-sans selection:bg-emerald selection:text-carbon relative pt-20">
      
      {/* Background Noise & Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00C85305_1px,transparent_1px),linear-gradient(to_bottom,#00C85305_1px,transparent_1px)] bg-[size:4rem_4rem] z-0 pointer-events-none"></div>

      {/* Hero Section */}
      <header className="relative pt-40 pb-20 px-6 lg:px-12 z-10 border-b border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <span className="font-mono text-xs text-emerald tracking-widest px-3 py-1 bg-[#0D2B1A]/40 border border-[#00C853]/20 rounded-full mb-6 inline-block">
            DATA TO DOLLARS PIPELINE
          </span>
          <h1 className="serif-drama text-5xl md:text-7xl text-white leading-tight mb-6 tracking-tight">
            The Lifecycle of a <br/>
            <span className="text-emerald italic">Verified Credit</span>
          </h1>
          <p className="text-lg md:text-xl text-mist font-sans font-light max-w-2xl mx-auto">
            CarbonOS is the first end-to-end registry in South Asia with zero payment friction. See how we move value from the farm directly to the farmer.
          </p>
        </div>
      </header>

      {/* Main Roadmap / Timeline Section */}
      <section className="relative py-24 px-6 lg:px-12 z-10 overflow-hidden">
        <div className="max-w-6xl mx-auto relative">
          
          {/* Vertical Connecting Line (Desktop) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-[#1A3A28] to-transparent -translate-x-1/2">
            {/* Animated glowing progress line */}
            <div className="w-full bg-emerald h-1/3 rounded-full animate-[slide_4s_ease-in-out_infinite] shadow-[0_0_15px_#16A34A]"></div>
          </div>

          <div className="relative z-10 space-y-8 md:space-y-0">
            {steps.map((step, index) => (
              <div key={index} ref={el => observerRefs.current[index] = el} data-index={index}>
                <StepCard 
                  step={step} 
                  index={index} 
                  inView={visibleSteps[index]} 
                />
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Final Call To Action */}
      <section className="relative py-24 px-6 lg:px-12 z-10 border-t border-white/5 bg-gradient-to-b from-transparent to-[#0A1F13]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="serif-drama text-4xl text-white mb-6">Experience the Pipeline</h2>
          <p className="text-mist mb-10 max-w-xl mx-auto">
            Ready to see the smart contract in action? Head over to the Marketplace and initiate a live test transaction.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a href="/platform/marketplace" className="bg-emerald text-carbon font-sans font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(0,200,83,0.3)] hover:shadow-[0_0_30px_rgba(0,200,83,0.5)] hover:-translate-y-1 w-full sm:w-auto">
              Test Corporate Purchase →
            </a>
          </div>
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
