import React from 'react';
import { ArrowRight } from 'lucide-react';

const sectors = [
  {
    icon: '☀️',
    name: 'Solar Irrigation',
    desc: '1M+ rural farmers. Largest BD opportunity.',
    market: '850,000 tCO₂e/yr',
    funding: 'Active',
    color: 'from-amber to-orange-500',
    shadow: 'shadow-[0_0_30px_rgba(251,191,36,0.3)]'
  },
  {
    icon: '🌾',
    name: 'Rice Methane',
    desc: 'Largest agriculture sector emissions.',
    market: '2.1M tCO₂e/yr',
    funding: 'Available',
    color: 'from-emerald to-teal-500',
    shadow: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]'
  },
  {
    icon: '🍳',
    name: 'Clean Cookstoves',
    desc: 'International donor funding pipeline.',
    market: '400,000 tCO₂e/yr',
    funding: 'Active',
    color: 'from-purple-500 to-pink-500',
    shadow: 'shadow-[0_0_30px_rgba(168,85,247,0.3)]'
  },
  {
    icon: '♻️',
    name: 'Waste-to-Energy',
    desc: 'Dhaka/Chattogram urban crisis → revenue.',
    market: '600,000 tCO₂e/yr',
    funding: 'Available',
    color: 'from-blue-500 to-cyan-500',
    shadow: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]'
  },
  {
    icon: '🌿',
    name: 'Blue Carbon',
    desc: 'Sundarbans mangrove restoration.',
    market: '1.2M tCO₂e/yr',
    funding: 'Active',
    color: 'from-green-500 to-emerald-700',
    shadow: 'shadow-[0_0_30px_rgba(34,197,94,0.3)]'
  },
  {
    icon: '🧱',
    name: 'Kiln Modernization',
    desc: "BD's biggest industrial polluter.",
    market: '780,000 tCO₂e/yr',
    funding: 'Available',
    color: 'from-red-500 to-orange-600',
    shadow: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]'
  }
];

const SectorFocus = () => {
  return (
    <section className="w-full bg-[#040A06] py-32 px-6 lg:px-12 relative overflow-hidden">
      
      {/* Background Graphic Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00C85308_1px,transparent_1px),linear-gradient(to_bottom,#00C85308_1px,transparent_1px)] bg-[size:4rem_4rem] z-0 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="mb-20 text-center">
          <span className="font-mono text-xs text-emerald tracking-widest px-4 py-1.5 bg-emerald/10 border border-emerald/20 rounded-full mb-6 inline-block uppercase">
            Bangladesh Positive List
          </span>
          <h2 className="serif-drama text-[56px] lg:text-[80px] text-white leading-tight tracking-tight">
            Where the <span className="italic text-emerald">Opportunity</span> Lives
          </h2>
          <p className="font-sans text-xl text-mist mt-6 max-w-2xl mx-auto">
            Six high-impact sectors approved for Article 6.2 trading, offering unparalleled scale and verified carbon reduction potential.
          </p>
        </div>

        {/* 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sectors.map((sector, index) => (
            <div 
              key={index} 
              className="relative bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-[2rem] p-8 transition-all duration-500 hover:bg-white/[0.04] hover:-translate-y-2 hover:border-white/20 group flex flex-col justify-between h-[360px] overflow-hidden"
            >
              {/* Top Section */}
              <div>
                <div className="flex justify-between items-start mb-8">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${sector.color} flex items-center justify-center text-4xl ${sector.shadow} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12`}>
                    {sector.icon}
                  </div>
                  <span className="font-mono text-[10px] text-white/60 bg-white/5 border border-white/10 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                    {sector.funding}
                  </span>
                </div>
                
                <h3 className="font-sans font-bold text-3xl text-white mb-3 tracking-tight group-hover:text-emerald transition-colors">
                  {sector.name}
                </h3>
                <p className="font-sans text-base text-mist/80 transition-opacity duration-300">
                  {sector.desc}
                </p>
              </div>

              {/* Reveal Section on Hover */}
              <div className="absolute bottom-0 left-0 right-0 p-8 pt-12 bg-gradient-to-t from-[#080F0B] to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex flex-col space-y-4">
                <div className="flex flex-col space-y-2 border-l-2 border-emerald pl-4 mb-2">
                  <div className="flex justify-between text-[13px]">
                    <span className="font-sans text-mist uppercase tracking-wider">Market Size</span>
                    <span className="font-mono font-bold text-white">{sector.market}</span>
                  </div>
                </div>
                <button className="w-full bg-emerald text-carbon py-3 rounded-xl font-sans font-bold text-sm flex justify-center items-center space-x-2 hover:bg-[#10B981] transition-colors">
                  <span>View Pipeline</span>
                  <ArrowRight size={16} />
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
