import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { Loader2 } from 'lucide-react';

// Card 1
const Module1 = () => {
  const [cards, setCards] = useState([
    { id: 1, type: 'SOLAR ☀️', pid: 'BD-PIN-2025-0041', title: 'Khulna Solar Irrigation — Phase II', loc: '22.8456°N, 89.5403°E' },
    { id: 2, type: 'COOKSTOVE 🍳', pid: 'BD-PIN-2025-0089', title: 'Sylhet Clean Cookstove Distribution', loc: '24.8949°N, 91.8687°E' },
    { id: 3, type: 'WASTE ♻️', pid: 'BD-PIN-2025-0102', title: 'Chattogram Waste-to-Energy Plant', loc: '22.3569°N, 91.7832°E' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCards(prev => {
        const newCards = [...prev];
        const last = newCards.pop();
        newCards.unshift(last);
        return newCards;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-48 mb-6 perspective-1000">
      {cards.map((c, i) => {
        const isTop = i === 0;
        return (
          <div 
            key={c.id}
            className="absolute top-0 left-0 w-full bg-[#080F0B] border border-emerald/20 p-4 rounded-xl transition-all duration-400"
            style={{
              transform: `translateY(${i * 12}px) scale(${1 - i * 0.05})`,
              opacity: 1 - i * 0.3,
              zIndex: 10 - i,
              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-[10px] text-carbon bg-amber px-2 py-0.5 rounded">{c.type}</span>
              <span className="font-mono text-xs text-mist">{c.pid}</span>
            </div>
            <h4 className="font-sans font-bold text-registry text-sm mb-2 truncate">{c.title}</h4>
            <div className="flex items-center space-x-2 text-xs text-mist mb-1">
              <span>Status:</span>
              <span className="flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald mr-1"></span> Submitted → Under Review
              </span>
            </div>
            <div className="font-mono text-[10px] text-mist">GIS: {c.loc}</div>
          </div>
        );
      })}
    </div>
  );
};

// Card 2
const Module2 = () => {
  const lines = [
    "[09:42:11] CO2_SENSOR_BD047 → 12.4 tCO2e  ✓",
    "[09:42:18] SATELLITE_KHU_03 → NDVI +0.14  ✓",
    "[09:42:25] FARMER_REPORT_SYL → Submitted  ✓",
    "[09:42:33] IOT_NODE_DHK_012 → Active      ✓",
    "[09:42:41] ANOMALY_CHECK     → CLEAR      ✓",
    "[09:42:49] MRV_PERIOD_CLOSE  → Verified   ✓"
  ];

  const [visibleLines, setVisibleLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  useEffect(() => {
    if (currentLineIndex >= lines.length) {
      const resetTimer = setTimeout(() => {
        setVisibleLines([]);
        setCurrentLineIndex(0);
        setCurrentCharIndex(0);
      }, 3000);
      return () => clearTimeout(resetTimer);
    }

    const currentLine = lines[currentLineIndex];
    if (currentCharIndex < currentLine.length) {
      const typeTimer = setTimeout(() => {
        setCurrentCharIndex(prev => prev + 1);
      }, 30);
      return () => clearTimeout(typeTimer);
    } else {
      setVisibleLines(prev => [...prev, currentLine]);
      const nextLineTimer = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, 500);
      return () => clearTimeout(nextLineTimer);
    }
  }, [currentLineIndex, currentCharIndex, lines]);

  const currentTyping = currentLineIndex < lines.length ? lines[currentLineIndex].substring(0, currentCharIndex) : '';

  return (
    <div className="h-48 mb-6 bg-[#080F0B] border border-emerald/20 rounded-xl p-4 font-mono text-[11px] text-emerald flex flex-col justify-end overflow-hidden relative">
      <div className="absolute top-3 right-3 flex items-center space-x-2">
        <div className="pulse-dot-amber"></div>
        <span className="text-[10px] text-amber">LIVE MRV FEED</span>
      </div>
      <div className="flex flex-col space-y-1 mt-4">
        {visibleLines.slice(-5).map((l, i) => <div key={i}>{l}</div>)}
        {currentLineIndex < lines.length && (
          <div>
            {currentTyping}
            <span className="animate-pulse ml-0.5">|</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Card 3
const Module3 = () => {
  const [state, setState] = useState('idle'); // idle, loading, success

  useEffect(() => {
    const loop = () => {
      setState('loading');
      setTimeout(() => {
        setState('success');
        setTimeout(() => {
          setState('idle');
        }, 2500);
      }, 1000);
    };

    const interval = setInterval(loop, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-48 mb-6 bg-[#080F0B] border border-emerald/20 rounded-xl p-4 relative overflow-hidden">
      {state !== 'success' && (
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="font-mono text-xs text-mist border-b border-emerald/20 pb-2 mb-3">ISSUE CARBON CREDITS</div>
            <div className="grid grid-cols-[80px_1fr] gap-2 items-center text-xs mb-2">
              <span className="text-mist font-sans">Project ID:</span>
              <span className="font-mono text-emerald">BD-CRB-2025-0041</span>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-2 items-center text-xs mb-2">
              <span className="text-mist font-sans">Credits:</span>
              <span className="font-mono text-registry bg-[#0D2B1A] px-2 py-1 rounded">500 tCO₂e</span>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-2 items-center text-xs">
              <span className="text-mist font-sans">Standard:</span>
              <span className="font-sans text-registry bg-[#0D2B1A] px-2 py-1 rounded">Verra VCS ▼</span>
            </div>
          </div>
          <button className="w-full bg-emerald text-carbon font-bold text-xs py-2 rounded flex items-center justify-center transition-colors">
            {state === 'loading' ? <Loader2 size={14} className="animate-spin" /> : 'Issue Credits →'}
          </button>
        </div>
      )}
      {state === 'success' && (
        <div className="absolute inset-0 bg-emerald/20 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-8 h-8 rounded-full bg-emerald text-carbon flex items-center justify-center font-bold mb-2">✓</div>
          <div className="font-sans font-bold text-sm text-registry mb-1">CREDITS ISSUED</div>
          <div className="font-mono text-[10px] text-emerald mb-1">BD-CRK-0041-A → BD-CRK-0041-E</div>
          <div className="font-sans text-xs text-mist mb-1">500 tCO₂e | Vintage 2025</div>
          <div className="font-mono text-[9px] text-registry">Recorded in National Registry</div>
        </div>
      )}
    </div>
  );
};

// Card 4
const Module4 = () => {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    "Document Upload Review",
    "GIS Boundary Verification",
    "Satellite Cross-check",
    "Emission Calculation Audit",
    "Risk Score Assessment"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= steps.length) return 0;
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="h-48 mb-6 bg-[#080F0B] border border-emerald/20 rounded-xl p-4 relative">
      <div className="flex flex-col space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center text-[11px] font-mono">
            <span className={`mr-2 ${i < activeStep ? 'text-emerald' : 'text-mist/50'}`}>
              {i < activeStep ? '✓' : '□'}
            </span>
            <span className={i < activeStep ? 'text-registry' : 'text-mist'}>{step}</span>
            {i === activeStep && (
              <svg className="w-3 h-3 ml-2 text-amber animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 2l12 11.2-5.8.5 3.3 7.3-2.2.9-3.2-7.4-4.4 4.1z" />
              </svg>
            )}
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex justify-between items-end mb-1">
          <span className="font-sans text-[10px] text-mist">Progress</span>
          <span className="font-mono text-[10px] text-emerald">{Math.min(100, activeStep * 20)}%</span>
        </div>
        <div className="w-full bg-[#0D2B1A] h-1.5 rounded-full overflow-hidden">
          <div className="bg-emerald h-full transition-all duration-500" style={{ width: `${activeStep * 20}%` }}></div>
        </div>
        {activeStep >= steps.length && (
          <div className="absolute inset-0 bg-[#080F0B]/90 flex items-center justify-center">
            <div className="border-2 border-emerald text-emerald font-bold px-4 py-1 rounded rotate-[-5deg] animate-pulse">
              APPROVED
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Card 5
const Module5 = () => {
  const pathRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(pathRef.current,
        { strokeDashoffset: 300 },
        { 
          strokeDashoffset: 0, 
          duration: 2, 
          ease: 'power2.out',
          scrollTrigger: {
            trigger: pathRef.current,
            start: "top 90%",
          }
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="h-48 mb-6 bg-[#080F0B] border border-emerald/20 rounded-xl p-4 flex flex-col justify-between">
      <div className="font-mono text-[10px] text-mist mb-2 border-b border-emerald/10 pb-1">BD Carbon Credit — Spot Price</div>
      <div className="h-16 relative w-full mb-2">
        <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <path
            ref={pathRef}
            d="M 0 25 C 10 25, 20 15, 30 18 C 40 21, 50 10, 60 12 C 70 14, 80 5, 100 2"
            fill="none"
            stroke="var(--color-emerald)"
            strokeWidth="1.5"
            strokeDasharray="300"
            strokeLinecap="round"
          />
          <path
            d="M 0 25 C 10 25, 20 15, 30 18 C 40 21, 50 10, 60 12 C 70 14, 80 5, 100 2 L 100 30 L 0 30 Z"
            fill="url(#grad)"
            stroke="none"
            opacity="0.2"
          />
          <defs>
            <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-emerald)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="grid grid-cols-[60px_1fr] gap-x-2 gap-y-1 text-[11px] mb-3">
        <span className="text-mist font-sans">Last Trade:</span>
        <span className="font-mono text-registry">$11.20 / tCO₂e</span>
        <span className="text-mist font-sans">Change:</span>
        <span className="font-mono text-amber">▲ +$0.23 (+2.1%)</span>
        <span className="text-mist font-sans">Volume:</span>
        <span className="font-mono text-registry">340 tCO₂e today</span>
      </div>
      <div className="flex space-x-2">
        <button className="flex-1 bg-emerald text-carbon font-bold text-[10px] py-1.5 rounded">Buy Credits</button>
        <button className="flex-1 ghost-btn font-bold text-[10px] py-1.5 rounded">Sell Credits</button>
      </div>
    </div>
  );
};

// Card 6
const Module6 = () => {
  const [scan, setScan] = useState(false);
  const [anomaly, setAnomaly] = useState(false);

  useEffect(() => {
    const loop = () => {
      setScan(true);
      setAnomaly(false);
      setTimeout(() => {
        setScan(false);
        setAnomaly(true);
      }, 600);
    };
    const interval = setInterval(loop, 4000);
    loop();
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-48 mb-6 bg-[#080F0B] border border-emerald/20 rounded-xl p-4 relative overflow-hidden">
      <div className="grid grid-cols-6 gap-2 mb-2 relative">
        {Array.from({ length: 24 }).map((_, i) => {
          const isTarget = i === 14 || i === 15;
          let dotClass = "w-2.5 h-2.5 rounded-full bg-emerald/30";
          if (anomaly && isTarget) dotClass = "w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ff3b30]";
          else if (!anomaly && isTarget) dotClass = "w-2.5 h-2.5 rounded-full bg-emerald/30";
          else if (anomaly) dotClass = "w-2.5 h-2.5 rounded-full bg-emerald/10";
          
          return (
            <div key={i} className="flex justify-center">
              <div className={dotClass}></div>
            </div>
          );
        })}
        {/* Scanner Line */}
        <div 
          className={`absolute top-0 bottom-0 w-[2px] bg-amber shadow-[0_0_10px_var(--color-amber)] transition-all duration-[600ms] ease-linear z-10 ${scan ? 'left-full opacity-100' : 'left-0 opacity-0'}`}
        ></div>
      </div>
      
      <div className={`mt-4 transition-opacity duration-300 ${anomaly ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center space-x-1 text-red-500 font-mono text-[10px] mb-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <span>ANOMALY DETECTED</span>
        </div>
        <div className="font-mono text-[9px] text-amber">
          BD-CRB-2025-0033 | BD-CRB-2025-0019<br/>
          Satellite vs. reported data mismatch<br/>
          <span className="text-red-400 mt-1 block">→ FLAGGED FOR MANUAL REVIEW</span>
        </div>
      </div>
    </div>
  );
};


const PlatformModules = () => {
  return (
    <section className="w-full bg-[#040A06] py-24 px-6 lg:px-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="mb-16">
          <span className="font-mono text-xs text-mist tracking-widest px-3 py-1 bg-[#0D2B1A]/40 border border-[#00C853]/10 rounded-full mb-6 inline-block">
            PLATFORM MODULES — 6 CORE SYSTEMS
          </span>
          <h2 className="serif-drama text-[48px] lg:text-[64px] text-white leading-tight mb-4">
            The Full Carbon Lifecycle
          </h2>
          <p className="font-sans text-lg text-mist max-w-2xl">
            One platform. From project idea to traded carbon credit.
          </p>
        </div>

        {/* 2x3 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <Link to="/platform/project-onboarding" className="bg-[#0D2B1A]/50 registry-border rounded-[1.5rem] p-7 transition-all hover:bg-[#0D2B1A]/70 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,200,83,0.15)] group flex flex-col justify-between">
            <div>
              <Module1 />
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-mono text-xs text-emerald">01</span>
                <h3 className="font-sans font-bold text-xl text-registry group-hover:text-emerald transition-colors">Project Onboarding Portal</h3>
              </div>
              <p className="font-sans text-sm text-mist">Submit PIN, documents, GIS data per Bangladesh framework.</p>
            </div>
            <div className="mt-6 flex items-center text-emerald font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              Explore Module <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          <Link to="/platform/mrv-dashboard" className="bg-[#0D2B1A]/50 registry-border rounded-[1.5rem] p-7 transition-all hover:bg-[#0D2B1A]/70 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,200,83,0.15)] group flex flex-col justify-between">
            <div>
              <Module2 />
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-mono text-xs text-emerald">02</span>
                <h3 className="font-sans font-bold text-xl text-registry group-hover:text-emerald transition-colors">MRV Dashboard</h3>
              </div>
              <p className="font-sans text-sm text-mist">Satellite. IoT. Farmer reports. AI fraud detection. All unified.</p>
            </div>
            <div className="mt-6 flex items-center text-emerald font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              Explore Module <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          <Link to="/platform/carbon-registry" className="bg-[#0D2B1A]/50 registry-border rounded-[1.5rem] p-7 transition-all hover:bg-[#0D2B1A]/70 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,200,83,0.15)] group flex flex-col justify-between">
            <div>
              <Module3 />
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-mono text-xs text-emerald">03</span>
                <h3 className="font-sans font-bold text-xl text-registry group-hover:text-emerald transition-colors">Carbon Registry System</h3>
              </div>
              <p className="font-sans text-sm text-mist">Unique IDs, ownership tracking, transfer records. National registry aligned.</p>
            </div>
            <div className="mt-6 flex items-center text-emerald font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              Explore Module <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          <Link to="/platform/verification-workflow" className="bg-[#0D2B1A]/50 registry-border rounded-[1.5rem] p-7 transition-all hover:bg-[#0D2B1A]/70 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,200,83,0.15)] group flex flex-col justify-between">
            <div>
              <Module4 />
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-mono text-xs text-emerald">04</span>
                <h3 className="font-sans font-bold text-xl text-registry group-hover:text-emerald transition-colors">Verification Workflow Engine</h3>
              </div>
              <p className="font-sans text-sm text-mist">Audit tools, risk scoring, accredited verifier dashboards.</p>
            </div>
            <div className="mt-6 flex items-center text-emerald font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              Explore Module <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          <Link to="/platform/marketplace" className="bg-[#0D2B1A]/50 registry-border rounded-[1.5rem] p-7 transition-all hover:bg-[#0D2B1A]/70 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,200,83,0.15)] group flex flex-col justify-between">
            <div>
              <Module5 />
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-mono text-xs text-emerald">05</span>
                <h3 className="font-sans font-bold text-xl text-registry group-hover:text-emerald transition-colors">Carbon Marketplace</h3>
              </div>
              <p className="font-sans text-sm text-mist">Buyers, sellers, price discovery. Climate finance, simplified.</p>
            </div>
            <div className="mt-6 flex items-center text-emerald font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              Explore Module <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          <Link to="/platform/ai-detection" className="bg-[#0D2B1A]/50 registry-border rounded-[1.5rem] p-7 transition-all hover:bg-[#0D2B1A]/70 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,200,83,0.15)] group flex flex-col justify-between">
            <div>
              <Module6 />
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-mono text-xs text-emerald">06</span>
                <h3 className="font-sans font-bold text-xl text-registry group-hover:text-emerald transition-colors">AI Fraud Detection</h3>
              </div>
              <p className="font-sans text-sm text-mist">Satellite analysis vs. reported data. Automated anomaly flagging.</p>
            </div>
            <div className="mt-6 flex items-center text-emerald font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              Explore Module <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
};

export default PlatformModules;
