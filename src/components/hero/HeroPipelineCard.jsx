import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Layers, Satellite, ShieldCheck, Activity } from 'lucide-react';
import { PIPELINE_STEPS } from '../saas-pipeline/pipelineStepsData';
import { PipelineStagesCanvas } from '../saas-pipeline/PipelineStagesCanvas';
import { BangladeshSatelliteScanSvg } from './BangladeshSatelliteScanSvg';
import { KpiTicker } from '../ui/KpiTicker';

export function HeroPipelineCard() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [transitionState, setTransitionState] = useState('active');
  const [activeView, setActiveView] = useState('pipeline'); // 'pipeline' | 'satellite'
  const timerRef = useRef(null);
  const stepTimeoutRef = useRef(null);

  const steps = PIPELINE_STEPS;

  // Autoplay progression for SaaS pipeline (pauses when tab hidden)
  useEffect(() => {
    if (isPlaying && activeView === 'pipeline') {
      timerRef.current = setInterval(() => {
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
        setTransitionState('transitioning');
        if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
        stepTimeoutRef.current = setTimeout(() => {
          setActiveStep((prev) => (prev + 1) % steps.length);
          setTransitionState('active');
        }, 500);
      }, 6500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    };
  }, [isPlaying, activeView, steps.length]);

  const handleStepSelect = (index) => {
    setIsPlaying(false);
    setTransitionState('transitioning');
    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    stepTimeoutRef.current = setTimeout(() => {
      setActiveStep(index);
      setTransitionState('active');
    }, 350);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setTransitionState('transitioning');
    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    stepTimeoutRef.current = setTimeout(() => {
      setActiveStep((prev) => (prev === 0 ? steps.length - 1 : prev - 1));
      setTransitionState('active');
    }, 350);
  };

  const handleNext = () => {
    setIsPlaying(false);
    setTransitionState('transitioning');
    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    stepTimeoutRef.current = setTimeout(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
      setTransitionState('active');
    }, 350);
  };

  return (
    <div className="hero-terminal-card bg-bg-canvas/95 border border-border-strong/70 rounded-[2rem] p-3.5 sm:p-5 lg:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7)] relative min-w-0 flex flex-col justify-between overflow-hidden">
      
      {/* Top Header & Dual Mode Switch */}
      <div className="flex flex-wrap items-center justify-between border-b border-border-subtle/80 pb-3 mb-4 gap-2">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald animate-pulse shrink-0"></div>
          <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-white/90 font-bold truncate">
            Corporate SaaS Pipeline
          </span>
          <span className="hidden sm:inline-block font-mono text-[9px] bg-emerald/10 border border-emerald/20 text-emerald px-1.5 py-0.5 rounded font-semibold uppercase">
            Scope 1-3
          </span>
        </div>

        {/* Action Controls: View Switch & Step Navigation */}
        <div className="flex items-center space-x-1.5">
          {/* View Mode Toggle: Pipeline (Default) vs Satellite MRV */}
          <div className="inline-flex rounded-full bg-bg-elevated p-0.5 border border-border-subtle">
            <button
              type="button"
              onClick={() => setActiveView('pipeline')}
              className={`font-mono text-[10px] px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 cursor-pointer min-h-[32px] ${
                activeView === 'pipeline'
                  ? 'bg-emerald text-bg-canvas font-bold shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
              title="Corporate SaaS Pipeline view"
            >
              <Layers size={11} />
              <span>Pipeline</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('satellite')}
              className={`font-mono text-[10px] px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 cursor-pointer min-h-[32px] ${
                activeView === 'satellite'
                  ? 'bg-emerald text-bg-canvas font-bold shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
              title="Satellite dMRV telemetry view"
            >
              <Satellite size={11} />
              <span className="hidden xs:inline">Satellite</span>
            </button>
          </div>

          {activeView === 'pipeline' && (
            <div className="flex items-center space-x-1 pl-1">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-full border border-border-subtle bg-bg-elevated flex items-center justify-center text-white/70 hover:text-emerald hover:border-emerald/40 transition-colors cursor-pointer"
                aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
                title={isPlaying ? "Pause autoplay" : "Play autoplay"}
              >
                {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              </button>
              <button
                type="button"
                onClick={handlePrev}
                className="w-8 h-8 rounded-full border border-border-subtle bg-bg-elevated flex items-center justify-center text-white/70 hover:text-emerald hover:border-emerald/40 transition-colors cursor-pointer"
                aria-label="Previous pipeline stage"
                title="Previous stage"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-8 h-8 rounded-full border border-border-subtle bg-bg-elevated flex items-center justify-center text-white/70 hover:text-emerald hover:border-emerald/40 transition-colors cursor-pointer"
                aria-label="Next pipeline stage"
                title="Next stage"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Stage Visualization */}
      {activeView === 'pipeline' ? (
        <div className="flex flex-col space-y-3.5">
          {/* Sleek Step Pills / Stepper */}
          <div className="grid grid-cols-4 gap-1.5 bg-bg-elevated/70 p-1 rounded-xl border border-border-subtle">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleStepSelect(idx)}
                  className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[38px] ${
                    isActive
                      ? 'bg-emerald text-bg-canvas font-bold shadow-[0_0_12px_rgba(0,200,83,0.3)]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="font-mono text-[9px] uppercase tracking-wider block">
                    {`0${idx + 1}`}
                  </span>
                  <span className="font-sans text-[11px] font-semibold truncate max-w-full">
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Interactive Pipeline Canvas */}
          <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-canvas relative">
            <PipelineStagesCanvas
              activeStep={activeStep}
              transitionState={transitionState}
            />
          </div>

          {/* Dynamic Stage Details Card */}
          <div className="bg-bg-elevated/80 border border-border-subtle rounded-xl p-3 sm:p-3.5">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[10px] text-emerald uppercase tracking-wider font-bold">
                Stage {activeStep + 1}: {steps[activeStep].sub}
              </span>
              <div className="flex items-center space-x-1.5 font-mono text-[9px] text-white/70 bg-bg-canvas px-2 py-0.5 rounded border border-border-subtle">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  transitionState === 'transitioning' ? 'bg-amber animate-pulse' : 'bg-emerald animate-pulse'
                }`}></span>
                <span className="truncate">{steps[activeStep].statusText}</span>
              </div>
            </div>
            <p className="font-sans text-xs text-white/80 leading-relaxed font-normal">
              {steps[activeStep].desc}
            </p>
          </div>
        </div>
      ) : (
        /* Alternate View: Satellite dMRV Scan & Live Telemetry */
        <div className="flex flex-col space-y-4">
          <BangladeshSatelliteScanSvg />

          {/* 2 Core Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-bg-elevated/80 border border-border-subtle rounded-xl p-3 flex flex-col justify-between">
              <span className="text-white/50 text-[10px] font-mono uppercase">Total Reduction</span>
              <div className="mt-1">
                <KpiTicker value="10.42M" className="font-mono font-bold text-lg text-white" />
                <span className="font-mono text-xs text-emerald ml-1">tCO₂e</span>
              </div>
            </div>
            <div className="bg-bg-elevated/80 border border-border-subtle rounded-xl p-3 flex flex-col justify-between">
              <span className="text-white/50 text-[10px] font-mono uppercase">Farmer Payout</span>
              <div className="mt-1">
                <KpiTicker value="৳412.8M" className="font-mono font-bold text-lg text-emerald" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Footnote */}
      <div className="pt-3 mt-3 border-t border-border-subtle/80 flex items-center justify-between text-[10px] font-sans text-white/50">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={12} className="text-emerald shrink-0" />
          <span>Every ledger entry traceable to primary source document</span>
        </span>
        <span className="font-mono text-[9px] text-white/40">v2.4 MRV</span>
      </div>

    </div>
  );
}

export default HeroPipelineCard;