import React from 'react';
import { Upload, FileText, Cpu, ShieldCheck, Download } from 'lucide-react';

export function PipelineStagesCanvas({ activeStep, transitionState }) {
  return (
    <div className="relative bg-bg-canvas rounded-[2rem] border border-white/5 h-[420px] flex items-center justify-center overflow-hidden shadow-inner group">
      {/* Grid Overlay inside the canvas */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00c85302_1px,transparent_1px),linear-gradient(to_bottom,#00c85302_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] z-0 pointer-events-none"></div>

      {/* Stage 1: Uploading Animation */}
      {activeStep === 0 && (
        <div className={`w-full max-w-lg px-6 text-center z-10 transition-all duration-500 ${
          transitionState === 'transitioning' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}>
          <div className="relative h-36 mx-auto w-64 mb-8 flex justify-center items-end">
            <div className="absolute w-20 h-24 bg-bg-canvas border border-white/10 rounded-xl flex items-center justify-center text-white/20 transform -rotate-12 translate-x-[-25px] z-10">
              <FileText size={24} />
            </div>
            <div className="absolute w-20 h-24 bg-bg-canvas border border-white/10 rounded-xl flex items-center justify-center text-white/20 transform rotate-12 translate-x-[25px] z-10">
              <FileText size={24} />
            </div>
            
            <div className="relative w-24 h-28 bg-bg-canvas/90 border-2 border-dashed border-emerald/30 rounded-2xl flex items-center justify-center text-emerald shadow-[0_0_30px_rgba(16,185,129,0.15)] z-20">
              <Upload size={38} className="animate-pulse text-emerald drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>

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
          <div className="relative w-full h-[280px]">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 450 280" fill="none">
              <path d="M 225 140 C 275 140, 275 55, 345 55" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="2.5" />
              <path d="M 225 140 C 275 140, 275 55, 345 55" stroke="#10b981" strokeWidth="2.5" className="flow-path-scope1" />
              <path d="M 225 140 Q 285 140 345 140" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="2.5" />
              <path d="M 225 140 Q 285 140 345 140" stroke="#10b981" strokeWidth="2.5" className="flow-path-scope2" />
              <path d="M 225 140 C 275 140, 275 225, 345 225" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="2.5" />
              <path d="M 225 140 C 275 140, 275 225, 345 225" stroke="#10b981" strokeWidth="2.5" className="flow-path-scope3" />
            </svg>

            <div className="absolute left-[175px] top-[80px] w-24 h-28 bg-bg-canvas border border-emerald/30 rounded-xl flex flex-col items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)] z-20 overflow-hidden animate-float-doc">
              <Cpu className="text-emerald mb-1 animate-pulse" size={32} />
              <span className="font-mono text-[10px] text-white/70 font-semibold tracking-wider">EXTRACTING</span>
              <div className="absolute left-0 right-0 h-[3px] bg-emerald shadow-[0_0_10px_#10b981] z-30 animate-laser"></div>
            </div>

            <div className="absolute right-[10px] top-[15px] w-32 bg-bg-canvas/95 border border-white/10 rounded-xl p-3 text-left z-20 hover:border-emerald/40 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono text-emerald font-bold">SCOPE 1</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse"></span>
              </div>
              <span className="text-sm text-white font-mono font-semibold block">Direct</span>
              <span className="text-xs text-mist/60 block">Fuel/Diesel</span>
            </div>

            <div className="absolute right-[10px] top-[100px] w-32 bg-bg-canvas/95 border border-white/10 rounded-xl p-3 text-left z-20 hover:border-emerald/40 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono text-emerald font-bold">SCOPE 2</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse"></span>
              </div>
              <span className="text-sm text-white font-mono font-semibold block">Indirect</span>
              <span className="text-xs text-mist/60 block">Grid Electricity</span>
            </div>

            <div className="absolute right-[10px] top-[185px] w-32 bg-bg-canvas/95 border border-white/10 rounded-xl p-3 text-left z-20 hover:border-emerald/40 transition-colors">
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

      {/* Stage 3: Audit-Ready Dashboard */}
      {activeStep === 2 && (
        <div className={`w-full max-w-lg px-6 z-10 transition-all duration-500 ${
          transitionState === 'transitioning' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}>
          <div className="relative h-[300px] w-full flex items-end justify-center pb-8">
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 450 300" fill="none">
              <path d="M 190 106 L 130 200" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1.5" className="pulse-dashed" />
              <path d="M 225 106 L 225 160" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1.5" className="pulse-dashed" />
              <path d="M 260 106 L 320 225" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1.5" className="pulse-dashed" />
            </svg>

            <div className="absolute top-[20px] left-[170px] w-[110px] h-auto py-3 bg-bg-canvas border border-emerald/40 rounded-xl text-center shadow-[0_0_25px_rgba(16,185,129,0.2)] animate-float-doc z-20">
              <div className="w-7 h-7 rounded-full bg-emerald/20 flex items-center justify-center mx-auto mb-1 text-emerald">
                <ShieldCheck size={16} />
              </div>
              <p className="text-xs font-mono text-emerald uppercase font-bold tracking-wider">REVIEWED</p>
              <p className="text-[10px] text-mist/60 font-mono tracking-tight mt-0.5">Source Doc</p>
            </div>

            <div className="flex items-end justify-between space-x-8 w-full max-w-[340px] px-4 h-[140px] border-b border-white/10 relative z-10">
              <div className="flex flex-col items-center flex-1 h-[70px] relative">
                <div className="w-full bg-bg-surface/80 hover:bg-bg-surface border border-emerald/50 border-b-0 rounded-t-md shadow-[inset_0_1px_0_rgba(16,185,129,0.5)] grow-bar h-full transition-all duration-300 flex items-start justify-center pt-3">
                  <span className="text-xs font-mono text-emerald font-bold">42t</span>
                </div>
                <div className="absolute top-0 w-3 h-3 bg-emerald rounded-full border-2 border-border-subtle -translate-y-1.5 shadow-[0_0_8px_#10b981]"></div>
                <span className="text-xs font-mono text-mist/60 mt-2 font-medium">Scope 1</span>
              </div>

              <div className="flex flex-col items-center flex-1 h-[110px] relative">
                <div className="w-full bg-bg-surface/80 hover:bg-bg-surface border border-emerald/50 border-b-0 rounded-t-md shadow-[inset_0_1px_0_rgba(16,185,129,0.5)] grow-bar h-full transition-all duration-300 flex items-start justify-center pt-3">
                  <span className="text-xs font-mono text-emerald font-bold">88t</span>
                </div>
                <div className="absolute top-0 w-3 h-3 bg-emerald rounded-full border-2 border-border-subtle -translate-y-1.5 shadow-[0_0_8px_#10b981]"></div>
                <span className="text-xs font-mono text-mist/60 mt-2 font-medium">Scope 2</span>
              </div>

              <div className="flex flex-col items-center flex-1 h-[45px] relative">
                <div className="w-full bg-bg-surface/80 hover:bg-bg-surface border border-emerald/50 border-b-0 rounded-t-md shadow-[inset_0_1px_0_rgba(16,185,129,0.5)] grow-bar h-full transition-all duration-300 flex items-start justify-center pt-3">
                  <span className="text-xs font-mono text-emerald font-bold">23t</span>
                </div>
                <div className="absolute top-0 w-3 h-3 bg-emerald rounded-full border-2 border-border-subtle -translate-y-1.5 shadow-[0_0_8px_#10b981]"></div>
                <span className="text-xs font-mono text-mist/60 mt-2 font-medium">Scope 3</span>
              </div>
            </div>
          </div>

          <span className="text-sm font-sans text-mist/85 mt-3 block text-center">
            Emissions are traced to the original source files a reviewer approved
          </span>
        </div>
      )}

      {/* Stage 4: Structured Export to Compliance Standards */}
      {activeStep === 3 && (
        <div className={`w-full max-w-xl px-6 z-10 transition-all duration-500 ${
          transitionState === 'transitioning' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}>
          <div className="relative h-[280px] w-full">
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 460 280" fill="none">
              <path d="M 180 110 C 150 110, 150 70, 120 70" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="2" />
              <path d="M 180 110 C 150 110, 150 70, 120 70" stroke="#10b981" strokeWidth="2.5" className="flow-arrow-path" />
              <path d="M 280 110 C 310 110, 310 70, 340 70" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="2" />
              <path d="M 280 110 C 310 110, 310 70, 340 70" stroke="#10b981" strokeWidth="2.5" className="flow-arrow-path" />
              <path d="M 230 165 L 230 197" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="2" />
              <path d="M 230 165 L 230 197" stroke="#10b981" strokeWidth="2.5" className="flow-arrow-path" />
            </svg>

            <div className="absolute left-[180px] top-[55px] w-[100px] h-[110px] bg-bg-canvas border border-emerald/40 rounded-xl flex flex-col items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.25)] animate-float-doc z-20">
              <Download className="text-emerald mb-1 animate-pulse" size={32} />
              <span className="font-mono text-sm text-white font-bold">REPORT</span>
              <span className="text-[9px] text-mist/60 font-mono tracking-tighter uppercase mt-0.5">One-Click</span>
            </div>

            <div className="absolute left-[10px] top-[30px] w-[110px] bg-bg-canvas/95 border border-white/10 rounded-xl p-3 text-center z-20 hover:border-emerald/40 transition-colors">
              <span className="text-[9px] font-mono text-emerald font-bold block mb-1">METHOD</span>
              <span className="text-xs text-white font-mono font-semibold block">GHG Protocol</span>
              <span className="text-[9px] text-emerald-500 font-mono block mt-1 font-bold">✓ Scope 1 & 2</span>
            </div>

            <div className="absolute right-[10px] top-[30px] w-[110px] bg-bg-canvas/95 border border-white/10 rounded-xl p-3 text-center z-20 hover:border-emerald/40 transition-colors">
              <span className="text-[9px] font-mono text-emerald font-bold block mb-1">REGULATION</span>
              <span className="text-xs text-white font-mono font-semibold block">EU CBAM</span>
              <span className="text-[9px] text-emerald-500 font-mono block mt-1 font-bold">Not yet supported</span>
            </div>

            <div className="absolute left-[175px] bottom-[15px] w-[110px] bg-bg-canvas/95 border border-white/10 rounded-xl p-3 text-center z-20 hover:border-emerald/40 transition-colors">
              <span className="text-[9px] font-mono text-emerald font-bold block mb-1">STANDARD</span>
              <span className="text-xs text-white font-mono font-semibold block">ISO 14064-1</span>
              <span className="text-[9px] text-emerald-500 font-mono block mt-1 font-bold">Statement format</span>
            </div>
          </div>

          <span className="text-sm font-sans text-mist/80 mt-3 block text-center">
            One-click export ready for national MRV, EU compliance, and ISO auditing
          </span>
        </div>
      )}
    </div>
  );
}

export default PipelineStagesCanvas;
