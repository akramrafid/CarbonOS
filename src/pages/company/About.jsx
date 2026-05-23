import React from 'react';

const About = () => {
  return (
    <div className="pt-24 pb-16 min-h-[80vh] flex flex-col items-center noise-overlay">
      <div className="w-full bg-[#040A06] border-b border-emerald/10 py-16 px-6 lg:px-12 relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00C85311_1px,transparent_1px),linear-gradient(to_bottom,#00C85311_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
        <span className="font-mono text-xs text-emerald tracking-widest px-3 py-1 bg-[#0D2B1A]/40 border border-[#00C853]/20 rounded-full mb-6 inline-block z-10">COMPANY</span>
        <h1 className="serif-drama text-[56px] lg:text-[72px] text-white leading-tight mb-4 z-10">About CarbonOS</h1>
        <p className="font-sans text-lg text-mist max-w-2xl z-10">The technical foundation for Bangladesh's transition to a green economy.</p>
      </div>

      <div className="max-w-4xl w-full mx-auto px-6 lg:px-12 mt-16 relative z-10">
        <div className="bg-[#080F0B] registry-border p-8 md:p-12 rounded-[2rem] shadow-[0_0_30px_rgba(0,200,83,0.05)]">
          <h2 className="font-sans font-bold text-2xl text-registry mb-6 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald mr-3"></span>
            Our Mission
          </h2>
          <div className="space-y-6 font-sans text-mist text-base leading-relaxed">
            <p>CarbonOS Bangladesh is a joint initiative aimed at digitizing, scaling, and securing the National Carbon Market. By replacing fragmented spreadsheets with real-time IoT feeds and immutable ledger technology, we ensure every carbon credit generated in Bangladesh meets global integrity standards.</p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="font-mono text-3xl text-registry mb-2">100%</div>
                <div className="font-sans text-xs text-mist">National Framework Alignment</div>
              </div>
              <div>
                <div className="font-mono text-3xl text-emerald mb-2">~0ms</div>
                <div className="font-sans text-xs text-mist">Data Reconciliation Delay</div>
              </div>
              <div>
                <div className="font-mono text-3xl text-registry mb-2">24/7</div>
                <div className="font-sans text-xs text-mist">Automated MRV Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
