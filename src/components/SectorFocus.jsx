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
import { useTheme } from '../context/ThemeContext';

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
    methodology: 'AMS-III.AU',
    funding: 'Prime Asset',
    additionality: 'Co-Benefits (unverified)',
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
    funding: 'Article 6.2 candidate (not authorized)',
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
    methodology: 'CEMS (continuous emissions monitoring)',
    funding: 'Available Allocation',
    additionality: 'Black Carbon Mitigation',
    color: 'from-rose-400/20 to-amber-500/20',
    borderColor: 'group-hover:border-rose-500/40',
    iconColor: 'text-rose-400',
    route: '/sectors/brick-kilns'
  }
];

const SectorFocus = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  return (
    <section className={`w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-12 relative overflow-hidden border-t ${
      isLight ? 'bg-[#F2F3EE] text-[#0F291B] border-[#0F291B]/10' : 'bg-[#030805] text-white border-white/10'
    }`}>
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="mb-12 max-w-3xl">
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-sans font-bold tracking-tight leading-tight ${
            isLight ? 'text-[#0F291B]' : 'text-white'
          }`}>
            High-Integrity Carbon <span className={isLight ? 'text-[#15803d]' : 'text-[#00E676]'}>Sector Portfolios.</span>
          </h2>

          <p className={`font-sans text-base sm:text-lg mt-3 leading-relaxed ${
            isLight ? 'text-[#37473E]' : 'text-white/70'
          }`}>
            Six CarbonOS priority sectors across Bangladesh calibrated for measurable emissions reductions and direct social co-benefits.
          </p>
        </div>

        {/* 3x2 Hairline Portfolio Matrix */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px border rounded-xl overflow-hidden ${
          isLight ? 'bg-[#0F291B]/12 border-[#0F291B]/12' : 'bg-white/10 border-white/10'
        }`}>
          {sectors.map((sector, index) => {
            const IconComponent = sector.icon;
            return (
              <div 
                key={index} 
                className={`p-6 sm:p-7 flex flex-col justify-between transition-colors ${
                  isLight
                    ? 'bg-white hover:bg-[#FAFDFB]'
                    : 'bg-[#060E09] hover:bg-[#09150E]'
                }`}
              >
                <div>
                  <div className={`flex items-center justify-between gap-3 mb-4 pb-3 border-b text-[11px] font-mono ${
                    isLight ? 'border-[#0F291B]/8 text-[#556B5E]' : 'border-white/10 text-white/50'
                  }`}>
                    <span className="uppercase tracking-wider">{sector.methodology}</span>
                    <span className={`font-semibold ${isLight ? 'text-[#15803d]' : 'text-emerald-400'}`}>
                      {sector.funding}
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-3 mb-2.5">
                    <IconComponent size={20} strokeWidth={1.75} className={`mt-1 shrink-0 ${
                      isLight ? 'text-[#15803d]' : sector.iconColor
                    }`} />
                    <h3 className={`font-sans font-bold text-lg sm:text-xl tracking-tight ${
                      isLight ? 'text-[#0F291B]' : 'text-white'
                    }`}>
                      {sector.name}
                    </h3>
                  </div>

                  <p className={`font-sans text-sm leading-relaxed mb-6 ${
                    isLight ? 'text-[#37473E]' : 'text-white/65'
                  }`}>
                    {sector.desc}
                  </p>
                </div>

                <div className={`pt-4 border-t ${isLight ? 'border-[#0F291B]/8' : 'border-white/10'}`}>
                  <div className="flex items-center justify-between mb-4 tabular-nums">
                    <div>
                      <span className={`text-[10px] font-mono uppercase tracking-wider block ${
                        isLight ? 'text-[#556B5E]' : 'text-white/45'
                      }`}>Annual Abatement</span>
                      <span className={`font-mono font-bold text-base tracking-tight ${
                        isLight ? 'text-[#0F291B]' : 'text-white'
                      }`}>{sector.market}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-mono uppercase tracking-wider block ${
                        isLight ? 'text-[#556B5E]' : 'text-white/45'
                      }`}>Additionality</span>
                      <span className={`font-mono text-xs font-semibold ${
                        isLight ? 'text-[#15803d]' : 'text-emerald-400'
                      }`}>{sector.additionality}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <Link 
                      to={sector.route} 
                      className={`flex-1 min-w-[130px] min-h-[40px] py-2 px-3.5 rounded-lg font-sans font-semibold text-xs flex justify-center items-center gap-1.5 transition-colors ${
                        isLight
                          ? 'bg-[#15803d] hover:bg-[#166534] text-white'
                          : 'bg-[#00C853] hover:bg-[#00E676] text-[#050C07]'
                      }`}
                    >
                      <span>Sector Dossier</span>
                      <ArrowRight size={13} />
                    </Link>
                    <Link
                      to="/platform/marketplace"
                      className={`min-h-[40px] px-3.5 py-2 rounded-lg border text-xs font-mono font-semibold transition-colors flex items-center justify-center ${
                        isLight
                          ? 'bg-[#F5F8F5] hover:bg-[#E4F2EA] text-[#0F291B] border-[#0F291B]/12'
                          : 'bg-white/[0.04] hover:bg-white/[0.1] text-white/80 hover:text-white border-white/15'
                      }`}
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
        <div className="mt-8">
          <p className={`text-xs font-mono ${isLight ? 'text-[#556B5E]' : 'text-white/50'}`}>
            Sector listings are informational. No project here has been registered or verified by a regulator or a third party.
          </p>
        </div>

      </div>
    </section>
  );
};

export default SectorFocus;

