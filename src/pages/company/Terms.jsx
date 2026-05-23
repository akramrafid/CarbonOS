import React from 'react';

const Terms = () => {
  return (
    <div className="pt-24 pb-16 min-h-[80vh] flex flex-col items-center noise-overlay">
      <div className="w-full bg-[#040A06] border-b border-emerald/10 py-16 px-6 lg:px-12 relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00C85311_1px,transparent_1px),linear-gradient(to_bottom,#00C85311_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
        <span className="font-mono text-xs text-emerald tracking-widest px-3 py-1 bg-[#0D2B1A]/40 border border-[#00C853]/20 rounded-full mb-6 inline-block z-10">COMPANY</span>
        <h1 className="serif-drama text-[56px] lg:text-[72px] text-white leading-tight mb-4 z-10">Terms of Service</h1>
        <p className="font-sans text-lg text-mist max-w-2xl z-10">User agreement for accessing the CarbonOS platform and registry.</p>
      </div>

      <div className="max-w-4xl w-full mx-auto px-6 lg:px-12 mt-16 relative z-10">
        <div className="bg-[#080F0B] registry-border p-8 md:p-12 rounded-[2rem] shadow-[0_0_30px_rgba(0,200,83,0.05)]">
          <div className="space-y-6 font-sans text-mist text-base leading-relaxed">
            <h3 className="text-registry font-bold text-lg mt-6">1. Acceptance of Terms</h3>
            <p>By accessing CarbonOS, you agree to comply with these terms and all applicable laws of Bangladesh, including the National Carbon Market Framework guidelines.</p>
            <h3 className="text-registry font-bold text-lg mt-6">2. Registry Integrity</h3>
            <p>Users must not submit false data. Intentional double-counting or falsification of MRV telemetry is a violation of federal law and will result in immediate account termination and legal action.</p>
            <h3 className="text-registry font-bold text-lg mt-6">3. Marketplace Trading</h3>
            <p>CarbonOS provides the technology for peer-to-peer carbon credit trading. We do not act as a financial broker and are not liable for market price fluctuations.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
