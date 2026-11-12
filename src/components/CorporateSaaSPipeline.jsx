import React, { useState, useEffect, useRef } from 'react';
import { PIPELINE_STEPS } from './saas-pipeline/pipelineStepsData';
import { PipelineControlPanel } from './saas-pipeline/PipelineControlPanel';
import { PipelineStepper } from './saas-pipeline/PipelineStepper';
import { PipelineStagesCanvas } from './saas-pipeline/PipelineStagesCanvas';
import { SectionHeader } from './ui/Section';
import { Badge } from './ui/Badge';

const CorporateSaaSPipeline = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [transitionState, setTransitionState] = useState('active');
  const timerRef = useRef(null);

  const steps = PIPELINE_STEPS;

  // Auto-play logic
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTransitionState('transitioning');
        setTimeout(() => {
          setActiveStep((prev) => (prev + 1) % 4);
          setTransitionState('active');
        }, 600);
      }, 7500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const handleStepChange = (index) => {
    setIsPlaying(false);
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
    <div className="w-full bg-bg-canvas py-10 md:py-16 relative overflow-hidden font-sans border-t border-white/5">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-emerald/5 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-[90rem] mx-auto px-6 lg:px-12 relative z-10">
        {/* Header Block */}
        <SectionHeader
          centered
          badge={<Badge variant="emerald">Workflow & System Integration</Badge>}
          title="Corporate SaaS Pipeline"
          subtitle="Automating emissions tracking, verification, and compliance inside a single unified pipeline."
          className="max-w-4xl mx-auto mb-20"
        />

        {/* Outer Visual Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-bg-canvas border border-white/5 rounded-[3rem] p-10 lg:p-14 shadow-[0_0_100px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <PipelineControlPanel
            steps={steps}
            activeStep={activeStep}
            transitionState={transitionState}
            isPlaying={isPlaying}
            onPrev={handlePrev}
            onNext={handleNext}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onResume={() => setIsPlaying(true)}
          />

          <div className="lg:col-span-8 flex flex-col space-y-8 lg:pl-10">
            <PipelineStepper
              steps={steps}
              activeStep={activeStep}
              onStepChange={handleStepChange}
            />

            <PipelineStagesCanvas
              activeStep={activeStep}
              transitionState={transitionState}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateSaaSPipeline;
