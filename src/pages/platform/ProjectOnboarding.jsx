import React from 'react';

const ProjectOnboarding = () => {
  return (
    <div className="pt-24 pb-16 min-h-[80vh] flex flex-col items-center noise-overlay">
      <div className="w-full bg-[#040A06] border-b border-emerald/10 py-16 px-6 lg:px-12 relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00C85311_1px,transparent_1px),linear-gradient(to_bottom,#00C85311_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
        <span className="font-mono text-xs text-emerald tracking-widest px-3 py-1 bg-[#0D2B1A]/40 border border-[#00C853]/20 rounded-full mb-6 inline-block z-10">PLATFORM</span>
        <h1 className="serif-drama text-[56px] lg:text-[72px] text-white leading-tight mb-4 z-10">Project Onboarding</h1>
        <p className="font-sans text-lg text-mist max-w-2xl z-10">Submit your PIN and design documents seamlessly into the National Framework.</p>
      </div>

      <div className="max-w-4xl w-full mx-auto px-6 lg:px-12 mt-16 relative z-10">
        <div className="bg-[#080F0B] registry-border p-8 md:p-12 rounded-[2rem] shadow-[0_0_30px_rgba(0,200,83,0.05)]">
          <h2 className="font-sans font-bold text-2xl text-registry mb-6 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald mr-3"></span>
            Onboarding Portal
          </h2>
          <div className="space-y-6 font-sans text-mist text-base leading-relaxed">
            <p>Welcome to the digital gateway for carbon project origination in Bangladesh. Upload your Project Idea Note (PIN) and GIS polygon boundaries securely.</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-[#0D2B1A]/50 border border-emerald/10 rounded-xl">
                <h3 className="font-mono text-[11px] text-amber mb-3">CURRENT PIPELINE</h3>
                <div className="text-4xl font-bold text-registry font-sans">142</div>
                <div className="text-xs text-mist font-mono mt-1">Active Proposals</div>
              </div>
              <div className="p-6 bg-[#0D2B1A]/50 border border-emerald/10 rounded-xl flex flex-col justify-center">
                <button className="w-full bg-emerald text-carbon font-sans font-bold text-sm px-5 py-3 rounded-xl btn-magnetic hover:bg-emerald/90 transition-colors">
                  Submit New PIN
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOnboarding;
