import React from 'react';
import { Link } from 'react-router-dom';
import { 
  SunMedium, 
  Wheat, 
  Flame, 
  Recycle, 
  Trees, 
  Factory, 
  ArrowRight, 
  CheckCircle2,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';

const sectors = [
  {
    icon: SunMedium,
    name: 'Solar Irrigation & Mini-Grids',
    desc: 'Replacing diesel pump sets across 1M+ agrarian smallholders with smart telemetry metering.',
    market: '850,000 tCO₂e/yr',
    methodology: 'UNFCCC AMS-I.A',
    funding: 'Active Registry',
    additionality: 'High Additionality',
    color: 'from-amber-400/20 to-orange-500/20',
    borderColor: 'group-hover:border-amber-500/40',
    iconColor: 'text-amber-400',
    route: '/sectors/solar-irrigation'
  },
  {
    icon: Wheat,
    name: 'Alternate Wetting & Drying (AWD)',
    desc: 'Low-methane rice cultivation cutting anaerobic emissions by 38% with field water loggers.',
    market: '2.10M tCO₂e/yr',
    methodology: 'AMS-III.AU Aligned',
    funding: 'Prime Sovereign Asset',
    additionality: 'Co-Benefit Verified',
    color: 'from-emerald-400/20 to-teal-500/20',
    borderColor: 'group-hover:border-emerald-500/40',
    iconColor: 'text-emerald-400',
    route: '/sectors/rice-methane'
  },
  {
    icon: Flame,
    name: 'Clean Household Cookstoves',
    desc: 'Tier-4 thermal efficiency biomass stoves replacing open-fire chulhas in rural households.',
    market: '400,000 tCO₂e/yr',
    methodology: 'Gold Standard GS-TPDDTEC',
    funding: 'Active Registry',
    additionality: 'Health & Gender SDG',
    color: 'from-orange-400/20 to-rose-500/20',
    borderColor: 'group-hover:border-orange-500/40',
    iconColor: 'text-orange-400',
    route: '/sectors/clean-cookstoves'
  },
  {
    icon: Recycle,
    name: 'Urban Waste-to-Energy & Biogas',
    desc: 'Municipal solid waste biomethanation in Dhaka & Chattogram turning landfill gas into clean power.',
    market: '600,000 tCO₂e/yr',
    methodology: 'ACM0022 Multi-City',
    funding: 'Article 6.2 Pipeline',
    additionality: 'Circular Infrastructure',
    color: 'from-cyan-400/20 to-blue-500/20',
    borderColor: 'group-hover:border-cyan-500/40',
    iconColor: 'text-cyan-400',
    route: '/sectors/waste-to-energy'
  },
  {
    icon: Trees,
    name: 'Sundarbans Blue Carbon',
    desc: 'Mangrove sediment carbon sequestration, tidal wetland preservation, and community stewardship.',
    market: '1.20M tCO₂e/yr',
    methodology: 'Verra VM0033 Tidal Wetland',
    funding: 'Institutional Tier',
    additionality: 'Biodiversity Hotspot',
    color: 'from-emerald-500/20 to-green-600/20',
    borderColor: 'group-hover:border-emerald-400/40',
    iconColor: 'text-emerald-300',
    route: '/sectors/mangrove-carbon'
  },
  {
    icon: Factory,
    name: 'Brick Kiln Modernization (HHK/Tunnel)',
    desc: 'Transforming legacy Fixed Chimney Kilns (FCK) to energy-efficient Zigzag & Hybrid Hoffman Kilns.',
    market: '780,000 tCO₂e/yr',
    methodology: 'DoE S.R.O. Mandated CEMS',
    funding: 'Available Allocation',
    additionality: 'Black Carbon Mitigation',
    color: 'from-rose-400/20 to-amber-500/20',
    borderColor: 'group-hover:border-rose-500/40',
    iconColor: 'text-rose-400',
    route: '/sectors/brick-kilns'
  }
];

const SectorFocus = () => {
  return (
    <section className="w-full bg-[#030805] text-white py-32 px-6 lg:px-12 relative overflow-hidden border-t border-white/10">
      
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.04)_1px,transparent_1px)] bg-[size:4rem_4rem] z-0 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-950/20 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold uppercase tracking-wider mb-5 shadow-[0_0_15px_rgba(16,185,129,0.12)]">
            <span>Bangladesh Sovereign Positive List</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-bold tracking-tight text-white leading-tight">
            High-Integrity Carbon <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Sector Portfolios</span>.
          </h2>

          <p className="font-sans text-base sm:text-lg text-white/70 mt-4 leading-relaxed">
            Six priority sectors verified under Bangladesh's National Carbon Framework and Article 6.2 bilateral rules, offering verifiable additionality and direct social co-benefits.
          </p>
        </div>

        {/* 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {sectors.map((sector, index) => {
            const IconComponent = sector.icon;
            return (
              <div 
                key={index} 
                className={`relative bg-white/[0.02] backdrop-blur-xl border border-white/10 ${sector.borderColor} rounded-[2rem] p-8 transition-all duration-300 hover:bg-white/[0.04] hover:-translate-y-1.5 group flex flex-col justify-between shadow-2xl overflow-hidden`}
              >
                {/* Subtle top corner gradient bloom */}
                <div className={`absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-br ${sector.color} rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none`} />

                {/* Top Section */}
                <div>
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center ${sector.iconColor} shadow-inner group-hover:scale-105 transition-transform duration-300`}>
                      <IconComponent size={26} strokeWidth={1.75} />
                    </div>
                    <span className="font-mono text-[10px] text-emerald-300 bg-emerald-950/40 border border-emerald-500/25 px-3 py-1 rounded-full uppercase tracking-wider">
                      {sector.funding}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider block">
                      {sector.methodology}
                    </span>
                    <h3 className="font-sans font-bold text-xl sm:text-2xl text-white mt-1 tracking-tight group-hover:text-emerald-300 transition-colors">
                      {sector.name}
                    </h3>
                  </div>

                  <p className="font-sans text-sm text-white/60 leading-relaxed mt-2 mb-6">
                    {sector.desc}
                  </p>
                </div>

                {/* Metrics and Action Footer */}
                <div className="pt-4 border-t border-white/5 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block">Annual Abatement</span>
                      <span className="font-mono font-bold text-white text-base tracking-tight">{sector.market}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block">Additionality</span>
                      <span className="font-mono text-xs text-emerald-400 font-semibold">{sector.additionality}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Link 
                      to={sector.route} 
                      className="flex-1 bg-white/[0.06] hover:bg-emerald-500 hover:text-black text-white py-2.5 px-4 rounded-xl font-sans font-semibold text-xs flex justify-center items-center gap-1.5 transition-all duration-200 border border-white/10 hover:border-emerald-500"
                    >
                      <span>Sector Dossier</span>
                      <ArrowRight size={13} />
                    </Link>
                    <Link
                      to="/platform/marketplace"
                      className="px-3.5 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 text-xs font-mono font-semibold transition-all"
                      title="View active lots in marketplace"
                    >
                      Browse Credits
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Positive List Institutional Footnote */}
        <div className="mt-12 text-center">
          <p className="text-xs font-mono text-white/40 max-w-xl mx-auto">
            All listed sectors adhere to the Ministry of Environment, Forest and Climate Change (MoEFCC) National Carbon Registry rules. Verified third-party audit reports available on-chain.
          </p>
        </div>

      </div>
    </section>
  );
};

export default SectorFocus;

