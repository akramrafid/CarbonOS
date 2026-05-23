import React from 'react';
import { ArrowRight } from 'lucide-react';

const sectors = [
  {
    icon: '☀️',
    name: 'Solar Irrigation',
    desc: '1M+ rural farmers. Largest BD opportunity.',
    market: '850,000 tCO₂e/yr',
    funding: 'Active',
  },
  {
    icon: '🌾',
    name: 'Rice Methane Reduction',
    desc: 'Largest agriculture sector emissions.',
    market: '2.1M tCO₂e/yr',
    funding: 'Available',
  },
  {
    icon: '🍳',
    name: 'Clean Cookstoves',
    desc: 'International donor funding pipeline.',
    market: '400,000 tCO₂e/yr',
    funding: 'Active',
  },
  {
    icon: '♻️',
    name: 'Waste-to-Energy',
    desc: 'Dhaka/Chattogram urban crisis → revenue.',
    market: '600,000 tCO₂e/yr',
    funding: 'Available',
  },
  {
    icon: '🌿',
    name: 'Mangrove Restoration',
    desc: 'Sundarbans blue carbon, premium prices.',
    market: '1.2M tCO₂e/yr',
    funding: 'Active',
  },
  {
    icon: '🧱',
    name: 'Brick Kiln Modernization',
    desc: "BD's biggest industrial polluter.",
    market: '780,000 tCO₂e/yr',
    funding: 'Available',
  }
];

const SectorFocus = () => {
  return (
    <section className="w-full bg-[#0D2B1A] py-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-16">
          <span className="font-mono text-xs text-mist tracking-widest px-3 py-1 bg-[#080F0B]/40 border border-[#00C853]/10 rounded-full mb-6 inline-block">
            BANGLADESH POSITIVE LIST — 6 SECTORS
          </span>
          <h2 className="serif-drama text-[48px] lg:text-[64px] text-white leading-tight">
            Where the Opportunity Lives
          </h2>
        </div>

        {/* 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectors.map((sector, index) => (
            <div 
              key={index} 
              className="bg-[#080F0B]/60 registry-border rounded-[1.5rem] p-8 transition-all duration-300 hover:bg-[#00C853]/[0.08] hover:border-[#00C853]/40 group flex flex-col justify-between h-[320px] overflow-hidden"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[64px] leading-none">{sector.icon}</span>
                  <span className="font-mono text-[11px] text-emerald bg-emerald/10 px-2 py-1 rounded">
                    Positive List
                  </span>
                </div>
                <h3 className="font-sans font-bold text-xl text-registry mb-2">
                  {sector.name}
                </h3>
                <p className="font-sans text-sm text-mist group-hover:opacity-0 transition-opacity duration-300 h-10">
                  {sector.desc}
                </p>
              </div>

              <div className="opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex flex-col space-y-3 relative -top-10">
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-sans text-mist">Est. Market Size:</span>
                    <span className="font-mono text-amber">{sector.market}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="font-sans text-mist">Int'l Funding:</span>
                    <span className="font-mono text-emerald">{sector.funding}</span>
                  </div>
                </div>
                <button className="ghost-btn w-full py-2 rounded font-sans font-bold text-xs flex justify-center items-center space-x-2 mt-2">
                  <span>View Projects</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default SectorFocus;
