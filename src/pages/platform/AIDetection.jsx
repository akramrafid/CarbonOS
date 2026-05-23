import React from 'react';

const AIDetection = () => {
  return (
    <div className="pt-24 pb-16 min-h-[80vh] flex flex-col items-center noise-overlay">
      <div className="w-full bg-[#040A06] border-b border-emerald/10 py-16 px-6 lg:px-12 relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00C85311_1px,transparent_1px),linear-gradient(to_bottom,#00C85311_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
        <span className="font-mono text-xs text-emerald tracking-widest px-3 py-1 bg-[#0D2B1A]/40 border border-[#00C853]/20 rounded-full mb-6 inline-block z-10">PLATFORM</span>
        <h1 className="serif-drama text-[56px] lg:text-[72px] text-white leading-tight mb-4 z-10">AI Fraud Detection</h1>
        <p className="font-sans text-lg text-mist max-w-2xl z-10">Automated anomaly flagging using geospatial and telemetry data.</p>
      </div>

      <div className="max-w-4xl w-full mx-auto px-6 lg:px-12 mt-16 relative z-10">
        <div className="bg-[#080F0B] registry-border p-8 md:p-12 rounded-[2rem] shadow-[0_0_30px_rgba(0,200,83,0.05)]">
          <h2 className="font-sans font-bold text-2xl text-registry mb-6 flex items-center">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-3"></span>
            Anomaly Scanner
          </h2>
          <div className="space-y-6 font-sans text-mist text-base leading-relaxed">
            <p>Our proprietary machine learning models continuously analyze MRV streams against satellite baselines to identify false claims or overlapping project boundaries in real-time.</p>
            
            <div className="mt-8 bg-[#040A06] border border-red-500/20 p-6 rounded-xl">
              <div className="font-mono text-[11px] text-red-500 mb-4 border-b border-red-500/20 pb-2">&gt;&gt; FLAG REPORT: HIGH CONFIDENCE</div>
              <div className="flex flex-col space-y-3 font-mono text-xs text-mist">
                <div className="flex justify-between">
                  <span>PROJECT: BD-PIN-2025-0033</span>
                  <span className="text-red-400">DOUBLE COUNTING RISK</span>
                </div>
                <div className="text-[10px] text-mist/60 border-l-2 border-red-500 pl-3">
                  GIS Polygon intersects with BD-PIN-2025-0019 by 14%. Satellite imagery indicates no new tree cover.
                </div>
                <button className="self-end mt-2 bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded">
                  Escalate to Auditor
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDetection;
