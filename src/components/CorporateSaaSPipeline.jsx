import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, FileText, Cpu, ShieldCheck, Download, 
  ArrowLeft, ArrowRight, Play, Pause, RefreshCw 
} from 'lucide-react';

const CorporateSaaSPipeline = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [transitionState, setTransitionState] = useState('active'); // 'active' | 'transitioning'
  const timerRef = useRef(null);

  const steps = [
    {
      title: "Upload",
      sub: "Simple Bill & Memo Upload",
      desc: "Skip manual data entry. Upload utility bills, fuel memos, or expense invoices as PDFs or images directly into the platform with drag-and-drop ease.",
      statusText: "Active: Document Upload",
    },
    {
      title: "Processing",
      sub: "AI Automated Processing",
      desc: "Our AI engine scans files instantly, extracts raw energy values (like kWh or fuel liters), calculates the exact CO2 footprint using localized emission factors, and automatically categorizes them into Scopes 1, 2, and 3.",
      statusText: "Active: AI OCR Processing",
    },
    {
      title: "Audit",
      sub: "Audit-Ready Dashboard",
      desc: "Full verification transparency. Every calculated emission point links directly back to the original source bill or memo via secure 'proof links', making auditing painless and secure.",
      statusText: "Active: Verification Audit",
    },
    {
      title: "Export",
      sub: "Seamless Compliance Export",
      desc: "Generate compliance reports in one click. Instantly export formatted data ready for the Bangladesh national MRV system, EU CBAM, or ISO 14064 standards.",
      statusText: "Active: Generating Reports",
    }
  ];

  // Auto-play logic
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTransitionState('transitioning');
        setTimeout(() => {
          setActiveStep((prev) => (prev + 1) % 4);
          setTransitionState('active');
        }, 600); // match transition time
      }, 7500); // step duration
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const handleStepChange = (index) => {
    setIsPlaying(false); // Stop autoplay when user manually interacts
    setTransitionState('transitioning');
    setTimeout(() => {
      setActiveStep(index);
      setTransitionState('active');
    }, 400);
  };

  const handleNext = () => {
    setIsPlaying(false);
    setTransitionState('transitioning');
    setTimeout(() => {
      setActiveStep((prev) => (prev + 1) % 4);
      setTransitionState('active');
    }, 400);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setTransitionState('transitioning');
    setTimeout(() => {
      setActiveStep((prev) => (prev === 0 ? 3 : prev - 1));
      setTransitionState('active');
    }, 400);
  };

  return (
    <div className="w-full bg-[#040A06] py-24 relative overflow-hidden font-sans border-t border-white/5">
      
      {/* Component Styles for Precise Keyframes & Visual Effects */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatDoc {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
        @keyframes docFall1 {
          0% { transform: translateY(-140px) scale(0.8); opacity: 0; }
          40% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes docFall2 {
          0%, 20% { transform: translateY(-140px) scale(0.8); opacity: 0; }
          60% { transform: translateY(12px) scale(1); opacity: 1; }
          100% { transform: translateY(12px) scale(1); opacity: 1; }
        }
        @keyframes docFall3 {
          0%, 40% { transform: translateY(-140px) scale(0.8); opacity: 0; }
          80% { transform: translateY(24px) scale(1); opacity: 1; }
          100% { transform: translateY(24px) scale(1); opacity: 1; }
        }
        @keyframes laserScan {
          0%, 100% { top: 10%; opacity: 0.8; }
          50% { top: 90%; opacity: 0.8; }
        }
        @keyframes particleFlowScope1 {
          0% { stroke-dashoffset: 240; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }
        @keyframes particleFlowScope2 {
          0% { stroke-dashoffset: 240; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }
        @keyframes particleFlowScope3 {
          0% { stroke-dashoffset: 240; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }
        @keyframes growBarAnim {
          from { height: 0; }
          to { height: 100%; }
        }
        @keyframes pulseDashedLine {
          0%, 100% { stroke-dashoffset: 0; stroke: rgba(16, 185, 129, 0.4); }
          50% { stroke-dashoffset: -20; stroke: rgba(16, 185, 129, 0.8); }
        }
        @keyframes flowArrow {
          0% { stroke-dashoffset: 40; opacity: 0.3; }
          50% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0.3; }
        }
        .animate-float-doc {
          animation: floatDoc 4s ease-in-out infinite;
        }
        .animate-doc-fall-1 {
          animation: docFall1 3s cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }
        .animate-doc-fall-2 {
          animation: docFall2 3s cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }
        .animate-doc-fall-3 {
          animation: docFall3 3s cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }
        .animate-laser {
          animation: laserScan 2.5s ease-in-out infinite;
        }
        .flow-path-scope1 {
          stroke-dasharray: 8, 20;
          animation: particleFlowScope1 2s linear infinite;
        }
        .flow-path-scope2 {
          stroke-dasharray: 8, 20;
          animation: particleFlowScope2 2.2s linear infinite;
        }
        .flow-path-scope3 {
          stroke-dasharray: 8, 20;
          animation: particleFlowScope3 2.4s linear infinite;
        }
        .grow-bar {
          animation: growBarAnim 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: bottom;
        }
        .pulse-dashed {
          stroke-dasharray: 5, 5;
          animation: pulseDashedLine 3s linear infinite;
        }
        .flow-arrow-path {
          stroke-dasharray: 6, 10;
          animation: flowArrow 2s linear infinite;
        }
      ` }} />

      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-emerald/5 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Increased max-width of the section container to 90rem (1440px) for a grander look */}
      <div className="max-w-[90rem] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Header Block (Scaled up title and subtitle sizes) */}
        <div className="text-center mb-20 max-w-4xl mx-auto">
          <span className="font-mono text-xs text-emerald tracking-[0.25em] px-4 py-1.5 bg-emerald/10 border border-emerald/20 rounded-full mb-5 inline-block uppercase font-bold">
            Workflow & System Integration
          </span>
          <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
            Corporate  SaaS  Pipeline
          </h2>
          <p className="text-base md:text-lg text-mist/85 mt-4 font-light">
            Automating emissions tracking, verification, and compliance inside a single unified pipeline.
          </p>
        </div>

        {/* Outer Visual Panel (Matches Video Layout, using 12-column grid to give text more space) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-[#080F0B] border border-white/5 rounded-[3rem] p-10 lg:p-14 shadow-[0_0_100px_rgba(0,0,0,0.5)] backdrop-blur-md">
          
          {/* Left Column: Controls, Info & Status (Takes 4 columns, wider typography) */}
          <div className="lg:col-span-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 pb-8 lg:pb-0 lg:pr-10">
            
            {/* Title / Description area */}
            <div className="space-y-8">
              <div>
                <h3 className="font-mono text-xs text-emerald uppercase tracking-wider font-bold mb-1">
                  Process Stage
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold text-white tracking-tight">
                    {steps[activeStep].title}
                  </span>
                  
                  {/* Navigation Button Controls */}
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={handlePrev}
                      className="w-11 h-11 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-white/70 hover:text-emerald hover:border-emerald/40 hover:bg-white/10 transition-all cursor-pointer shadow-sm"
                      aria-label="Previous step"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <button 
                      onClick={handleNext}
                      className="w-11 h-11 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-white/70 hover:text-emerald hover:border-emerald/40 hover:bg-white/10 transition-all cursor-pointer shadow-sm"
                      aria-label="Next step"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Description Box (Improved font size, color and line height) */}
              <div className={`transition-all duration-300 min-h-[180px] ${
                transitionState === 'transitioning' ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
              }`}>
                <h4 className="text-xl font-semibold text-white mb-4">
                  {steps[activeStep].sub}
                </h4>
                <p className="text-base text-mist/95 leading-relaxed font-sans font-light">
                  {steps[activeStep].desc}
                </p>
              </div>
            </div>

            {/* Play/Pause Autoplay Controls & Active Status Indicator */}
            <div className="pt-8 border-t border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-10 h-10 rounded-full bg-emerald/10 border border-emerald/20 text-emerald flex items-center justify-center hover:bg-emerald/20 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)] cursor-pointer"
                    title={isPlaying ? "Pause autoplay" : "Play autoplay"}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <span className="text-xs font-mono text-mist/60 font-semibold tracking-wider">
                    {isPlaying ? "AUTOPLAYING" : "PAUSED"}
                  </span>
                </div>
                
                {!isPlaying && (
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="text-xs font-mono text-emerald hover:underline hover:text-emerald/80 flex items-center space-x-1 cursor-pointer font-bold"
                  >
                    <RefreshCw size={14} className="animate-spin" style={{ animationDuration: '4s' }} />
                    <span>Resume</span>
                  </button>
                )}
              </div>

              {/* Status display */}
              <div className="bg-[#040A06] rounded-xl p-4 border border-white/5">
                <p className="text-[10px] font-mono text-mist/40 uppercase tracking-widest font-bold">
                  System Status
                </p>
                <div className="flex items-center space-x-2.5 mt-1.5">
                  <div className={`w-2 h-2 rounded-full ${
                    transitionState === 'transitioning' ? 'bg-amber animate-pulse' : 'bg-emerald animate-pulse'
                  }`}></div>
                  <span className="font-mono text-xs text-white/90 font-medium">
                    {transitionState === 'transitioning' ? 'Updating State...' : steps[activeStep].statusText}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Steps Stepper & Visual Screen Canvas (Takes 8 columns, scaled canvas height to h-[420px]) */}
          <div className="lg:col-span-8 flex flex-col space-y-8 lg:pl-10">
            
            {/* Top Stepper Track (Nodes & Line Progress, circles scaled to w-11 h-11) */}
            <div className="relative w-full px-6 md:px-10 py-2">
              {/* Stepper Progress Container (circles & connecting line) */}
              <div className="relative h-11 flex justify-between items-center w-full">
                
                {/* Stepper Progress Line (Centered vertically at top-[22px] for 44px circles) */}
                <div className="absolute top-[22px] left-[22px] right-[22px] h-[3px] bg-white/10 -z-10"></div>
                <div 
                  className="absolute top-[22px] left-[22px] h-[3px] bg-emerald -z-10 transition-all duration-500 ease-out"
                  style={{ width: `calc(${(activeStep / 3) * 100}% - ${(activeStep / 3) * 44}px)` }}
                ></div>

                {/* Individual Steps Nodes (Circles only) */}
                {steps.map((step, idx) => {
                  const isActive = activeStep === idx;
                  const isCompleted = activeStep > idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleStepChange(idx)}
                      className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-300 focus:outline-none cursor-pointer z-10 ${
                        isActive 
                          ? 'bg-[#040A06] border-emerald text-emerald shadow-[0_0_20px_rgba(0,200,83,0.4)] scale-110' 
                          : isCompleted 
                          ? 'bg-emerald border-emerald text-carbon font-bold' 
                          : 'bg-[#040A06] border-white/15 text-white/40 hover:border-white/40 hover:scale-105'
                      }`}
                    >
                      {isCompleted ? (
                        <span className="text-base font-bold">✓</span>
                      ) : (
                        <span className="font-mono text-base font-semibold">{idx + 1}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Labels Row (Decoupled from circles height to preserve correct line vertical alignment) */}
              <div className="flex justify-between items-center w-full mt-4 relative h-6">
                {steps.map((step, idx) => {
                  const isActive = activeStep === idx;
                  return (
                    <div 
                      key={idx} 
                      className="w-11 flex items-center justify-center relative"
                    >
                      <span className={`absolute text-xs font-mono tracking-wider whitespace-nowrap transition-colors duration-300 uppercase ${
                        isActive ? 'text-emerald font-bold' : 'text-mist/40'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Visual Display Canvas (Scaled height to h-[420px] for massive visual impact) */}
            <div className="relative bg-[#040A06] rounded-[2rem] border border-white/5 h-[420px] flex items-center justify-center overflow-hidden shadow-inner group">
              
              {/* Grid Overlay inside the canvas */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#00c85302_1px,transparent_1px),linear-gradient(to_bottom,#00c85302_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] z-0 pointer-events-none"></div>

              {/* Stage 1: Uploading Animation (Scaled up elements) */}
              {activeStep === 0 && (
                <div className={`w-full max-w-lg px-6 text-center z-10 transition-all duration-500 ${
                  transitionState === 'transitioning' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}>
                  {/* Floating Document Icons */}
                  <div className="relative h-36 mx-auto w-64 mb-8 flex justify-center items-end">
                    
                    {/* Document stack background */}
                    <div className="absolute w-20 h-24 bg-[#080F0B] border border-white/10 rounded-xl flex items-center justify-center text-white/20 transform -rotate-12 translate-x-[-25px] z-10">
                      <FileText size={24} />
                    </div>
                    <div className="absolute w-20 h-24 bg-[#080F0B] border border-white/10 rounded-xl flex items-center justify-center text-white/20 transform rotate-12 translate-x-[25px] z-10">
                      <FileText size={24} />
                    </div>
                    
                    {/* Visual stack central drop container */}
                    <div className="relative w-24 h-28 bg-[#080F0B]/90 border-2 border-dashed border-emerald/30 rounded-2xl flex items-center justify-center text-emerald shadow-[0_0_30px_rgba(16,185,129,0.15)] z-20">
                      <Upload size={38} className="animate-bounce" />
                    </div>

                    {/* Falling document icons mimicking files dropping */}
                    <div className="absolute left-[8%] bottom-[50px] w-14 h-16 bg-emerald/10 border border-emerald/30 rounded-lg flex flex-col items-center justify-center text-xs font-mono text-emerald font-bold animate-doc-fall-1">
                      <span>PDF</span>
                    </div>
                    <div className="absolute left-[38%] bottom-[65px] w-14 h-16 bg-emerald/10 border border-emerald/30 rounded-lg flex flex-col items-center justify-center text-xs font-mono text-emerald font-bold animate-doc-fall-2">
                      <span>JPG</span>
                    </div>
                    <div className="absolute right-[8%] bottom-[40px] w-14 h-16 bg-emerald/10 border border-emerald/30 rounded-lg flex flex-col items-center justify-center text-xs font-mono text-emerald font-bold animate-doc-fall-3">
                      <span>CSV</span>
                    </div>
                  </div>

                  <p className="font-mono text-base text-emerald tracking-wider uppercase mb-1.5 font-bold">
                    Drop Files Here
                  </p>
                  <p className="text-sm text-mist/60 max-w-sm mx-auto">
                    PDF, JPG, CSV utility bills & fuel memos
                  </p>
                </div>
              )}

              {/* Stage 2: AI OCR & Scope Extraction */}
              {activeStep === 1 && (
                <div className={`w-full max-w-xl px-6 flex flex-col items-center justify-center z-10 transition-all duration-500 ${
                  transitionState === 'transitioning' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}>
                  
                  {/* Custom SVG flow network showing document OCR to Scopes */}
                  <div className="relative w-full h-[280px]">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 450 280" fill="none">
                      
                      {/* Flows to Scope 1 */}
                      <path 
                        d="M 225 140 C 275 140, 275 55, 345 55" 
                        stroke="rgba(16, 185, 129, 0.15)" 
                        strokeWidth="2.5" 
                      />
                      <path 
                        d="M 225 140 C 275 140, 275 55, 345 55" 
                        stroke="#10b981" 
                        strokeWidth="2.5" 
                        className="flow-path-scope1"
                      />

                      {/* Flows to Scope 2 */}
                      <path 
                        d="M 225 140 Q 285 140 345 140" 
                        stroke="rgba(16, 185, 129, 0.15)" 
                        strokeWidth="2.5" 
                      />
                      <path 
                        d="M 225 140 Q 285 140 345 140" 
                        stroke="#10b981" 
                        strokeWidth="2.5" 
                        className="flow-path-scope2"
                      />

                      {/* Flows to Scope 3 */}
                      <path 
                        d="M 225 140 C 275 140, 275 225, 345 225" 
                        stroke="rgba(16, 185, 129, 0.15)" 
                        strokeWidth="2.5" 
                      />
                      <path 
                        d="M 225 140 C 275 140, 275 225, 345 225" 
                        stroke="#10b981" 
                        strokeWidth="2.5" 
                        className="flow-path-scope3"
                      />
                    </svg>

                    {/* Central Document + Scanline (Scaled up) */}
                    <div className="absolute left-[175px] top-[80px] w-24 h-28 bg-[#080F0B] border border-emerald/30 rounded-xl flex flex-col items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)] z-20 overflow-hidden animate-float-doc">
                      <Cpu className="text-emerald mb-1 animate-pulse" size={32} />
                      <span className="font-mono text-[10px] text-white/70 font-semibold tracking-wider">EXTRACTING</span>
                      
                      {/* Glowing Laser Scanline */}
                      <div className="absolute left-0 right-0 h-[3px] bg-emerald shadow-[0_0_10px_#10b981] z-30 animate-laser"></div>
                    </div>

                    {/* Target Scope Nodes (Scaled up card width and paddings) */}
                    {/* Scope 1 */}
                    <div className="absolute right-[10px] top-[15px] w-32 bg-[#080F0B]/95 border border-white/10 rounded-xl p-3 text-left z-20 hover:border-emerald/40 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-mono text-emerald font-bold">SCOPE 1</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse"></span>
                      </div>
                      <span className="text-sm text-white font-mono font-semibold block">Direct</span>
                      <span className="text-xs text-mist/60 block">Fuel/Diesel</span>
                    </div>

                    {/* Scope 2 */}
                    <div className="absolute right-[10px] top-[100px] w-32 bg-[#080F0B]/95 border border-white/10 rounded-xl p-3 text-left z-20 hover:border-emerald/40 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-mono text-emerald font-bold">SCOPE 2</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse"></span>
                      </div>
                      <span className="text-sm text-white font-mono font-semibold block">Indirect</span>
                      <span className="text-xs text-mist/60 block">Grid Electricity</span>
                    </div>

                    {/* Scope 3 */}
                    <div className="absolute right-[10px] top-[185px] w-32 bg-[#080F0B]/95 border border-white/10 rounded-xl p-3 text-left z-20 hover:border-emerald/40 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-mono text-emerald font-bold">SCOPE 3</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse"></span>
                      </div>
                      <span className="text-sm text-white font-mono font-semibold block">Value Chain</span>
                      <span className="text-xs text-mist/60 block">Supply Chain</span>
                    </div>

                  </div>

                  <span className="text-sm font-sans text-mist/80 mt-4 block">
                    AI OCR extracts and categorizes data into greenhouse scopes
                  </span>
                </div>
              )}

              {/* Stage 3: Audit-Ready Dashboard & Verification Trace (Increased spacing and sizes) */}
              {activeStep === 2 && (
                <div className={`w-full max-w-lg px-6 z-10 transition-all duration-500 ${
                  transitionState === 'transitioning' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}>
                  
                  <div className="relative h-[300px] w-full flex items-end justify-center pb-8">
                    
                    {/* SVG Connector Lines (Proof links connecting chart to source document) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 450 300" fill="none">
                      {/* Dashed lines from chart nodes to source document */}
                      <path d="M 190 106 L 130 200" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1.5" className="pulse-dashed" />
                      <path d="M 225 106 L 225 160" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1.5" className="pulse-dashed" />
                      <path d="M 260 106 L 320 225" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1.5" className="pulse-dashed" />
                    </svg>

                    {/* Floating Source Document (Enlarged) */}
                    <div className="absolute top-[20px] left-[170px] w-[110px] h-auto py-3 bg-[#080F0B] border border-emerald/40 rounded-xl text-center shadow-[0_0_25px_rgba(16,185,129,0.2)] animate-float-doc z-20">
                      <div className="w-7 h-7 rounded-full bg-emerald/20 flex items-center justify-center mx-auto mb-1 text-emerald">
                        <ShieldCheck size={16} />
                      </div>
                      <p className="text-xs font-mono text-emerald uppercase font-bold tracking-wider">VERIFIED</p>
                      <p className="text-[10px] text-mist/60 font-mono tracking-tight mt-0.5">Source Doc</p>
                    </div>

                    {/* Bar Chart Bars Container (Enlarged width and height) */}
                    <div className="flex items-end justify-between space-x-8 w-full max-w-[340px] px-4 h-[140px] border-b border-white/10 relative z-10">
                      
                      {/* Bar 1 */}
                      <div className="flex flex-col items-center flex-1 h-[70px] relative">
                        <div className="w-full bg-[#1A3A28]/80 hover:bg-[#1A3A28] border-t-2 border-emerald rounded-t-md grow-bar h-full transition-all duration-300 flex items-start justify-center pt-3">
                          <span className="text-xs font-mono text-emerald font-bold">42t</span>
                        </div>
                        {/* Dot Anchor */}
                        <div className="absolute top-0 w-3 h-3 bg-emerald rounded-full border-2 border-[#040A06] -translate-y-1.5 shadow-[0_0_8px_#10b981]"></div>
                        <span className="text-xs font-mono text-mist/60 mt-2 font-medium">Scope 1</span>
                      </div>

                      {/* Bar 2 */}
                      <div className="flex flex-col items-center flex-1 h-[110px] relative">
                        <div className="w-full bg-[#1A3A28]/80 hover:bg-[#1A3A28] border-t-2 border-emerald rounded-t-md grow-bar h-full transition-all duration-300 flex items-start justify-center pt-3">
                          <span className="text-xs font-mono text-emerald font-bold">88t</span>
                        </div>
                        {/* Dot Anchor */}
                        <div className="absolute top-0 w-3 h-3 bg-emerald rounded-full border-2 border-[#040A06] -translate-y-1.5 shadow-[0_0_8px_#10b981]"></div>
                        <span className="text-xs font-mono text-mist/60 mt-2 font-medium">Scope 2</span>
                      </div>

                      {/* Bar 3 */}
                      <div className="flex flex-col items-center flex-1 h-[45px] relative">
                        <div className="w-full bg-[#1A3A28]/80 hover:bg-[#1A3A28] border-t-2 border-emerald rounded-t-md grow-bar h-full transition-all duration-300 flex items-start justify-center pt-3">
                          <span className="text-xs font-mono text-emerald font-bold">23t</span>
                        </div>
                        {/* Dot Anchor */}
                        <div className="absolute top-0 w-3 h-3 bg-emerald rounded-full border-2 border-[#040A06] -translate-y-1.5 shadow-[0_0_8px_#10b981]"></div>
                        <span className="text-xs font-mono text-mist/60 mt-2 font-medium">Scope 3</span>
                      </div>

                    </div>

                  </div>

                  <span className="text-sm font-sans text-mist/85 mt-3 block text-center">
                    Emissions are tracked directly to verified original source files
                  </span>
                </div>
              )}

              {/* Stage 4: Seamless Export to Compliance Standards (Enlarged) */}
              {activeStep === 3 && (
                <div className={`w-full max-w-xl px-6 z-10 transition-all duration-500 ${
                  transitionState === 'transitioning' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}>
                  
                  <div className="relative h-[280px] w-full">
                    
                    {/* SVG Flow Arrows pointing from center outward */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 460 280" fill="none">
                      {/* Left Pointing (BD Gov MRV) */}
                      <path d="M 180 110 C 150 110, 150 70, 120 70" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="2" />
                      <path d="M 180 110 C 150 110, 150 70, 120 70" stroke="#10b981" strokeWidth="2.5" className="flow-arrow-path" />

                      {/* Right Pointing (EU CBAM) */}
                      <path d="M 280 110 C 310 110, 310 70, 340 70" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="2" />
                      <path d="M 280 110 C 310 110, 310 70, 340 70" stroke="#10b981" strokeWidth="2.5" className="flow-arrow-path" />

                      {/* Down Pointing (ISO 14064) */}
                      <path d="M 230 165 L 230 197" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="2" />
                      <path d="M 230 165 L 230 197" stroke="#10b981" strokeWidth="2.5" className="flow-arrow-path" />
                    </svg>

                    {/* Central Report Document */}
                    <div className="absolute left-[180px] top-[55px] w-[100px] h-[110px] bg-[#080F0B] border border-emerald/40 rounded-xl flex flex-col items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.25)] animate-float-doc z-20">
                      <Download className="text-emerald mb-1 animate-pulse" size={32} />
                      <span className="font-mono text-sm text-white font-bold">REPORT</span>
                      <span className="text-[9px] text-mist/60 font-mono tracking-tighter uppercase mt-0.5">One-Click</span>
                    </div>

                    {/* Output Formats targets (Scaled up width & padding) */}
                    {/* BD Gov MRV */}
                    <div className="absolute left-[10px] top-[30px] w-[110px] bg-[#080F0B]/95 border border-white/10 rounded-xl p-3 text-center z-20 hover:border-emerald/40 transition-colors">
                      <span className="text-[9px] font-mono text-emerald font-bold block mb-1">COMPLIANCE</span>
                      <span className="text-xs text-white font-mono font-semibold block">BD Gov MRV</span>
                      <span className="text-[9px] text-[#10b981] font-mono block mt-1 font-bold">✓ Ready</span>
                    </div>

                    {/* EU CBAM */}
                    <div className="absolute right-[10px] top-[30px] w-[110px] bg-[#080F0B]/95 border border-white/10 rounded-xl p-3 text-center z-20 hover:border-emerald/40 transition-colors">
                      <span className="text-[9px] font-mono text-emerald font-bold block mb-1">REGULATION</span>
                      <span className="text-xs text-white font-mono font-semibold block">EU CBAM</span>
                      <span className="text-[9px] text-[#10b981] font-mono block mt-1 font-bold">✓ Compliant</span>
                    </div>

                    {/* ISO 14064 */}
                    <div className="absolute left-[175px] bottom-[15px] w-[110px] bg-[#080F0B]/95 border border-white/10 rounded-xl p-3 text-center z-20 hover:border-emerald/40 transition-colors">
                      <span className="text-[9px] font-mono text-emerald font-bold block mb-1">STANDARD</span>
                      <span className="text-xs text-white font-mono font-semibold block">ISO 14064</span>
                      <span className="text-[9px] text-[#10b981] font-mono block mt-1 font-bold">✓ Certified</span>
                    </div>

                  </div>

                  <span className="text-sm font-sans text-mist/80 mt-3 block text-center">
                    One-click export ready for national MRV, EU compliance, and ISO auditing
                  </span>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default CorporateSaaSPipeline;
