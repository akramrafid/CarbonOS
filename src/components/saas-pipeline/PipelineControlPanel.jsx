import React from 'react';
import { ArrowLeft, ArrowRight, Play, Pause, RefreshCw } from 'lucide-react';

export function PipelineControlPanel({
  steps,
  activeStep,
  transitionState,
  isPlaying,
  onPrev,
  onNext,
  onTogglePlay,
  onResume
}) {
  return (
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
                onClick={onPrev}
                className="w-11 h-11 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-white/70 hover:text-emerald hover:border-emerald/40 hover:bg-white/10 transition-all cursor-pointer shadow-sm"
                aria-label="Previous step"
              >
                <ArrowLeft size={18} />
              </button>
              <button 
                onClick={onNext}
                className="w-11 h-11 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-white/70 hover:text-emerald hover:border-emerald/40 hover:bg-white/10 transition-all cursor-pointer shadow-sm"
                aria-label="Next step"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Description Box */}
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
              onClick={onTogglePlay}
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
              onClick={onResume}
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
  );
}

export default PipelineControlPanel;
