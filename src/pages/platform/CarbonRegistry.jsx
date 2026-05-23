import React from 'react';

const CarbonRegistry = () => {
  return (
    <div className="pt-24 pb-16 min-h-[80vh] flex flex-col items-center noise-overlay">
      <div className="w-full bg-[#040A06] border-b border-emerald/10 py-16 px-6 lg:px-12 relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00C85311_1px,transparent_1px),linear-gradient(to_bottom,#00C85311_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
        <span className="font-mono text-xs text-emerald tracking-widest px-3 py-1 bg-[#0D2B1A]/40 border border-[#00C853]/20 rounded-full mb-6 inline-block z-10">PLATFORM</span>
        <h1 className="serif-drama text-[56px] lg:text-[72px] text-white leading-tight mb-4 z-10">Carbon Registry</h1>
        <p className="font-sans text-lg text-mist max-w-2xl z-10">The National ledger for serialized carbon credit issuance and retirement.</p>
      </div>

      <div className="max-w-4xl w-full mx-auto px-6 lg:px-12 mt-16 relative z-10">
        <div className="bg-[#080F0B] registry-border p-8 md:p-12 rounded-[2rem] shadow-[0_0_30px_rgba(0,200,83,0.05)]">
          <h2 className="font-sans font-bold text-2xl text-registry mb-6 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald mr-3"></span>
            Ledger Explorer
          </h2>
          <div className="space-y-6 font-sans text-mist text-base leading-relaxed">
            <p>The Registry engine assigns a unique serial number to every metric tonne of verified CO2e reduced or removed. All records align with UNFCCC Article 6 protocols.</p>
            
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left font-mono text-xs text-mist">
                <thead>
                  <tr className="border-b border-emerald/20 text-emerald">
                    <th className="pb-3 px-4">SERIAL BLOCK</th>
                    <th className="pb-3 px-4">VINTAGE</th>
                    <th className="pb-3 px-4">PROJECT</th>
                    <th className="pb-3 px-4">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald/10">
                  <tr className="hover:bg-[#0D2B1A]/30 transition-colors">
                    <td className="py-3 px-4 text-registry">BD-2025-001-A-Z</td>
                    <td className="py-3 px-4">2025</td>
                    <td className="py-3 px-4">Khulna Solar</td>
                    <td className="py-3 px-4"><span className="text-emerald">ISSUED</span></td>
                  </tr>
                  <tr className="hover:bg-[#0D2B1A]/30 transition-colors">
                    <td className="py-3 px-4 text-registry">BD-2024-089-B-F</td>
                    <td className="py-3 px-4">2024</td>
                    <td className="py-3 px-4">Sylhet Cookstoves</td>
                    <td className="py-3 px-4"><span className="text-mist/50">RETIRED</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button className="bg-emerald text-carbon font-sans font-bold text-sm px-5 py-2 rounded-full btn-magnetic">
                Access Full Registry
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonRegistry;
