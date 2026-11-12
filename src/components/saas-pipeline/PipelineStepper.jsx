import React from 'react';

export function PipelineStepper({ steps, activeStep, onStepChange }) {
  return (
    <div className="relative w-full px-6 md:px-10 py-2">
      {/* Stepper Progress Container */}
      <div className="relative h-11 flex justify-between items-center w-full">
        {/* Stepper Progress Line */}
        <div className="absolute top-[22px] left-[22px] right-[22px] h-[3px] bg-white/10 -z-10"></div>
        <div 
          className="absolute top-[22px] left-[22px] h-[3px] bg-emerald -z-10 transition-all duration-500 ease-out"
          style={{ width: `calc(${(activeStep / 3) * 100}% - ${(activeStep / 3) * 44}px)` }}
        ></div>

        {/* Individual Steps Nodes */}
        {steps.map((step, idx) => {
          const isActive = activeStep === idx;
          const isCompleted = activeStep > idx;

          return (
            <button
              key={idx}
              onClick={() => onStepChange(idx)}
              className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-300 focus:outline-none cursor-pointer z-10 ${
                isActive 
                  ? 'bg-bg-canvas border-emerald text-emerald shadow-[0_0_20px_rgba(0,200,83,0.4)] scale-110' 
                  : isCompleted 
                  ? 'bg-emerald border-emerald text-carbon font-bold' 
                  : 'bg-bg-canvas border-white/15 text-white/40 hover:border-white/40 hover:scale-105'
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

      {/* Labels Row */}
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
  );
}

export default PipelineStepper;
