import React from 'react';

const MRVDashboard = () => {
  return (
    <div className="pt-24 pb-16 min-h-[80vh] flex flex-col items-center noise-overlay">
      <div className="w-full bg-[#040A06] border-b border-emerald/10 py-16 px-6 lg:px-12 relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00C85311_1px,transparent_1px),linear-gradient(to_bottom,#00C85311_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
        <span className="font-mono text-xs text-emerald tracking-widest px-3 py-1 bg-[#0D2B1A]/40 border border-[#00C853]/20 rounded-full mb-6 inline-block z-10">PLATFORM</span>
        <h1 className="serif-drama text-[56px] lg:text-[72px] text-white leading-tight mb-4 z-10">MRV Dashboard</h1>
        <p className="font-sans text-lg text-mist max-w-2xl z-10">Real-time Measurement, Reporting, and Verification data feeds.</p>
      </div>

      <div className="max-w-4xl w-full mx-auto px-6 lg:px-12 mt-16 relative z-10">
        <div className="bg-[#080F0B] registry-border p-8 md:p-12 rounded-[2rem] shadow-[0_0_30px_rgba(0,200,83,0.05)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-sans font-bold text-2xl text-registry flex items-center">
              <span className="pulse-dot mr-3"></span>
              Live Telemetry
            </h2>
            <span className="font-mono text-[10px] text-emerald bg-emerald/10 px-2 py-1 rounded">SYSTEM: NOMINAL</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-[#040A06] border border-emerald/10 rounded-lg">
              <div className="font-mono text-[10px] text-mist mb-2">ACTIVE IOT NODES</div>
              <div className="font-mono text-xl text-registry">12,408</div>
            </div>
            <div className="p-4 bg-[#040A06] border border-emerald/10 rounded-lg">
              <div className="font-mono text-[10px] text-mist mb-2">LAST SATELLITE PASS</div>
              <div className="font-mono text-xl text-registry">14 mins ago</div>
            </div>
            <div className="p-4 bg-[#040A06] border border-emerald/10 rounded-lg">
              <div className="font-mono text-[10px] text-mist mb-2">tCO2e MITIGATED TODAY</div>
              <div className="font-mono text-xl text-emerald">450.2</div>
            </div>
          </div>
          
          <div className="p-6 bg-[#0D2B1A]/50 border border-emerald/10 rounded-xl font-mono text-xs text-mist">
            <div className="text-amber mb-2">&gt;&gt; INCOMING DATA STREAM</div>
            <div>[NODE-84A] Solar output matched expected baseline. (+2.1 tCO2e)</div>
            <div>[NODE-92C] Cookstove usage confirmed via thermal sensor. (+0.4 tCO2e)</div>
            <div>[SAT-GEO] Mangrove boundary scan complete. Zero deforestation detected.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MRVDashboard;
