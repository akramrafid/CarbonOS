import React from 'react';

const RiceMethane = () => {
  return (
    <div className="pt-24 pb-16 min-h-[80vh] flex flex-col items-center noise-overlay">
      <div className="w-full bg-legacy-canvas-night border-b border-emerald/10 py-16 px-6 lg:px-12 relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 legacy-grid bg-[size:4rem_4rem] legacy-grid-mask pointer-events-none"></div>
        <span className="font-mono text-xs text-emerald tracking-widest px-3 py-1 bg-legacy-surface-raised/40 border border-legacy-brand-base/20 rounded-full mb-6 inline-block z-10">SECTORS</span>
        <h1 className="serif-drama text-[56px] lg:text-[72px] text-white leading-tight mb-4 z-10">Rice Methane</h1>
        <p className="font-sans text-lg text-mist max-w-2xl z-10">AWD (Alternate Wetting and Drying) techniques to reduce CH4 emissions in paddy fields.</p>
      </div>

      <div className="max-w-4xl w-full mx-auto px-6 lg:px-12 mt-16 relative z-10">
        <div className="bg-legacy-canvas-base registry-border p-8 md:p-12 rounded-[2rem] shadow-[0_0_30px_rgba(0,200,83,0.05)]">
          <h2 className="font-sans font-bold text-2xl text-registry mb-6 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald mr-3"></span>
            Methodology & MRV
          </h2>
          <div className="space-y-6 font-sans text-mist text-base leading-relaxed">
            <p>Rice cultivation is a major source of methane in Bangladesh. AWD projects require careful MRV using water level sensors and satellite soil moisture indices.</p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-legacy-canvas-night border border-emerald/10 rounded-xl">
                <div className="font-mono text-[10px] text-amber mb-2">ELIGIBLE FRAMEWORK</div>
                <div className="font-sans font-bold text-registry">CDM AMS-III.AU</div>
              </div>
              <div className="p-5 bg-legacy-canvas-night border border-emerald/10 rounded-xl">
                <div className="font-mono text-[10px] text-amber mb-2">DATA REQUIREMENT</div>
                <div className="font-sans font-bold text-registry">IoT Water Level Sensors</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiceMethane;
