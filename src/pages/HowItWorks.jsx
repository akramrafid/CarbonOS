import React from 'react';
import { useTranslation } from 'react-i18next';

const HowItWorks = () => {
  const { t } = useTranslation();
  
  // We use the raw steps array from the translation dictionary
  const steps = t('howItWorks.steps', { returnObjects: true });

  return (
    <div className="pt-24 pb-16 min-h-[80vh] flex flex-col items-center noise-overlay">
      <div className="w-full bg-[#040A06] border-b border-emerald/10 py-16 px-6 lg:px-12 relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00C85311_1px,transparent_1px),linear-gradient(to_bottom,#00C85311_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
        <span className="font-mono text-xs text-emerald tracking-widest px-3 py-1 bg-[#0D2B1A]/40 border border-[#00C853]/20 rounded-full mb-6 inline-block z-10">
          {t('howItWorks.tag')}
        </span>
        <h1 className="serif-drama text-[56px] lg:text-[72px] text-white leading-tight mb-4 z-10">
          {t('howItWorks.title')}
        </h1>
        <p className="font-sans text-lg text-mist max-w-2xl z-10">
          {t('howItWorks.subtitle')}
        </p>
      </div>

      <div className="max-w-4xl w-full mx-auto px-6 lg:px-12 mt-16 relative z-10">
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="bg-[#080F0B] registry-border p-8 md:p-10 rounded-[2rem] shadow-[0_0_30px_rgba(0,200,83,0.05)] hover:border-emerald/40 transition-colors group">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                
                {/* Step Number Circle */}
                <div className="w-16 h-16 shrink-0 rounded-full bg-[#0D2B1A] border-2 border-emerald/50 flex items-center justify-center font-serif-drama text-3xl text-emerald group-hover:emerald-glow transition-all">
                  {index + 1}
                </div>
                
                {/* Text Content */}
                <div>
                  <h2 className="font-sans font-bold text-2xl text-registry mb-2">
                    {step.title}
                  </h2>
                  <div className="font-mono text-xs text-amber mb-3">
                    &gt;&gt; {step.subtitle}
                  </div>
                  <p className="font-sans text-mist text-base leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
