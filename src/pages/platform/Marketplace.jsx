import React from 'react';

const Marketplace = () => {
  return (
    <div className="pt-24 pb-16 min-h-[80vh] flex flex-col items-center noise-overlay">
      <div className="w-full bg-[#040A06] border-b border-emerald/10 py-16 px-6 lg:px-12 relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00C85311_1px,transparent_1px),linear-gradient(to_bottom,#00C85311_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
        <span className="font-mono text-xs text-emerald tracking-widest px-3 py-1 bg-[#0D2B1A]/40 border border-[#00C853]/20 rounded-full mb-6 inline-block z-10">PLATFORM</span>
        <h1 className="serif-drama text-[56px] lg:text-[72px] text-white leading-tight mb-4 z-10">Carbon Marketplace</h1>
        <p className="font-sans text-lg text-mist max-w-2xl z-10">Connect directly with buyers and trade verified emissions reductions.</p>
      </div>

      <div className="max-w-4xl w-full mx-auto px-6 lg:px-12 mt-16 relative z-10">
        <div className="bg-[#080F0B] registry-border p-8 md:p-12 rounded-[2rem] shadow-[0_0_30px_rgba(0,200,83,0.05)]">
          <div className="flex justify-between items-end border-b border-emerald/20 pb-4 mb-6">
            <h2 className="font-sans font-bold text-2xl text-registry">Spot Prices</h2>
            <div className="font-mono text-xs text-emerald bg-emerald/10 px-2 py-1 rounded">LIVE TRADING</div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-[#040A06] border border-emerald/10 rounded-lg">
              <div>
                <div className="font-sans font-bold text-registry">BD Solar VCU</div>
                <div className="font-mono text-[10px] text-mist">Vintage 2024-2025</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg text-emerald">৳1,450 / tCO2e</div>
                <div className="font-sans text-[10px] text-mist/70">Vol: 14,500</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-[#040A06] border border-emerald/10 rounded-lg">
              <div>
                <div className="font-sans font-bold text-registry">BD Cookstove VER</div>
                <div className="font-mono text-[10px] text-mist">Vintage 2025</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg text-emerald">৳950 / tCO2e</div>
                <div className="font-sans text-[10px] text-mist/70">Vol: 2,100</div>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-8 bg-emerald text-carbon font-sans font-bold text-sm px-5 py-3 rounded-xl btn-magnetic hover:bg-emerald/90 transition-colors">
            Enter Exchange Platform
          </button>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
