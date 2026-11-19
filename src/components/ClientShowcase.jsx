import React, { useState } from 'react';
import { 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  Leaf, 
  Building2, 
  ArrowUpRight, 
  Sparkles, 
  Zap,
  Globe,
  Award,
  Layers,
  Recycle,
  GraduationCap,
  ShoppingBag
} from 'lucide-react';
import { CLIENT_PROFILES, CLIENT_SECTORS } from '../pages/platform/clientProfiles';
import { useTheme } from '../context/ThemeContext';

const ClientShowcase = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [selectedCategory, setSelectedCategory] = useState('all');

  const getSectorIcon = (id) => {
    switch (id) {
      case 'all': return Layers;
      case 'mobility': return Zap;
      case 'circular': return Recycle;
      case 'education': return GraduationCap;
      case 'fashion': return ShoppingBag;
      default: return Sparkles;
    }
  };

  const filteredClients = selectedCategory === 'all'
    ? CLIENT_PROFILES
    : CLIENT_PROFILES.filter(c => c.category === selectedCategory);

  const renderClientCard = (client, isLowerRow = false) => {
    const isDarkLogo = client.logoTheme === 'dark';
    const cleanUrl = client.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

    return (
      <div
        key={client.id}
        className={`group relative rounded-2xl ${isLowerRow ? 'p-5 sm:p-6' : 'p-6 sm:p-7'} transition-colors flex flex-col justify-between h-full overflow-hidden border ${
          isLight
            ? 'bg-white border-[#0F291B]/10 hover:border-[#15803d]/40 shadow-[0_8px_24px_-8px_rgba(15,41,27,0.07)]'
            : 'bg-[#08130C] hover:bg-[#0B1C12] border-[#184227]/75 hover:border-[#00C853]/70'
        }`}
      >
        <div className="relative z-10">
          {/* Top Row: Logo Badge & Live Site Link */}
          <div className={`flex items-center justify-between ${isLowerRow ? 'gap-2.5' : 'gap-4'} mb-5 min-w-0`}>
            <div 
              className={`${
                isLowerRow ? 'h-12 w-24 sm:w-26 px-2.5 py-1.5' : 'h-14 w-34 sm:w-38 px-3 py-2'
              } rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 ${
                isDarkLogo
                  ? isLight
                    ? 'client-logo-swatch-dark bg-[#0D2317] border border-[#1B4D2E]'
                    : 'client-logo-swatch-dark bg-[#06160C] border border-[#1B4D2B]'
                  : isLight
                    ? 'bg-[#F5F8F5] border border-[#0F291B]/10'
                    : 'bg-white border border-slate-200'
              }`}
            >
              <img 
                src={client.logo} 
                alt={`${client.name} official logo`}
                className={`${isLowerRow ? 'max-h-8 sm:max-h-9' : 'max-h-10'} max-w-full w-auto object-contain`}
                loading="lazy"
              />
            </div>

            <div className="flex flex-col items-end min-w-0 flex-1 gap-1">
              <span className={`text-[11px] font-mono font-semibold tracking-wide whitespace-nowrap ${
                isLight ? 'text-[#15803d]' : 'text-[#34D399]'
              }`}>
                Active Client
              </span>
              <a
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-[11px] font-mono flex items-center justify-end space-x-1 transition-colors group/link max-w-full min-w-0 ${
                  isLight ? 'text-[#4A5D52] hover:text-[#15803d]' : 'text-gray-400 hover:text-[#00C853]'
                }`}
                title={`Visit ${client.name} official website`}
              >
                <span className="truncate">{cleanUrl}</span>
                <ArrowUpRight className={`w-3 h-3 shrink-0 ${isLight ? 'text-[#15803d]' : 'text-[#00C853]'}`} />
              </a>
            </div>
          </div>

          {/* Company Name & Sector */}
          <div className="mb-3">
            <h3 className={`font-sans font-bold text-xl sm:text-2xl transition-colors tracking-tight leading-snug ${
              isLight ? 'text-[#0F291B] group-hover:text-[#15803d]' : 'text-white group-hover:text-[#00C853]'
            }`}>
              {client.name}
            </h3>
            <span className={`text-xs font-mono font-semibold uppercase tracking-wider block mt-1 ${
              isLight ? 'text-[#15803d]' : 'text-[#00C853]'
            }`}>
              {client.sector}
            </span>
          </div>

          {/* Legal Entity / Location */}
          <div className={`text-xs mb-4 flex items-center space-x-1.5 font-sans ${isLight ? 'text-[#4A5D52]' : 'text-gray-400'}`}>
            <Building2 className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-[#15803d]' : 'text-emerald-400/80'}`} />
            <span className="truncate" title={client.headquarters}>{client.headquarters}</span>
          </div>

          {/* Sustainability Highlight (Flat Hairline Top Rule — No Nested Card Box) */}
          <div className={`pt-4 pb-5 border-t flex items-start space-x-2.5 ${
            isLight ? 'border-[#0F291B]/8' : 'border-white/[0.08]'
          }`}>
            <Leaf className={`w-4 h-4 shrink-0 mt-0.5 ${isLight ? 'text-[#15803d]' : 'text-[#00C853]'}`} />
            <p className={`text-xs sm:text-[13px] font-sans leading-relaxed ${
              isLight ? 'text-[#26382E]' : 'text-gray-200'
            }`}>
              {client.sustainabilityHighlight}
            </p>
          </div>
        </div>

        {/* Bottom Card Footer: Facilities & Audit Info */}
        <div className={`relative z-10 pt-4 border-t flex items-center justify-between text-xs font-mono ${
          isLight ? 'border-[#0F291B]/10 text-[#4A5D52]' : 'border-white/[0.08] text-gray-400'
        }`}>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex rounded-full h-2 w-2 ${isLight ? 'bg-[#15803d]' : 'bg-[#00C853]'}`} />
            <span className={`font-medium text-xs ${isLight ? 'text-[#26382E]' : 'text-gray-300'}`}>
              {client.facilities.length} Active Sites
            </span>
          </div>
          <div className="text-right tabular-nums">
            <span className={`font-bold font-mono text-base ${isLight ? 'text-[#15803d]' : 'text-[#00C853]'}`}>
              {client.activeInsets.toLocaleString()} tCO₂e
            </span>
            <span className={`text-xs ml-1.5 font-sans ${isLight ? 'text-[#4A5D52]' : 'text-gray-400'}`}>Offset</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className={`w-full py-20 sm:py-28 relative overflow-hidden font-sans border-b ${
      isLight ? 'bg-[#F2F3EE] border-[#0F291B]/8' : 'bg-[#040A06] border-white/5'
    }`}>
      {/* Expanded Container Width */}
      <div className="max-w-[2100px] 2xl:max-w-[2300px] w-full mx-auto px-6 sm:px-10 lg:px-14 xl:px-18 2xl:px-24 relative z-10">
        
        {/* Section Header (No Eyebrow Pill, No Gradient Text) */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4 ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
            Powering Bangladesh's{' '}
            <span className={isLight ? 'text-[#15803d]' : 'text-[#00C853]'}>
              Decarbonization Pioneers
            </span>
          </h2>

          <p className={`text-sm sm:text-base leading-relaxed font-sans ${isLight ? 'text-[#46574D]' : 'text-gray-400'}`}>
            From electric mobility and smart student transit to circular jute biopolymers and premier universities, 
            see how Bangladesh’s industry leaders use <strong className={`font-semibold ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>CarbonZero BD</strong> for ESG carbon accounting.
          </p>
        </div>

        {/* Sector Filter Tabs - Segmented Control Dock */}
        <div className="flex justify-center mb-16 px-2">
          <div className={`inline-flex flex-wrap items-center justify-center p-1.5 sm:p-2 rounded-2xl sm:rounded-full backdrop-blur-xl border gap-1.5 sm:gap-2 max-w-full ${
            isLight
              ? 'bg-white/95 border-[#0F291B]/12 shadow-[0_8px_24px_-6px_rgba(15,41,27,0.08)]'
              : 'bg-[#051108]/90 border-[#143B22] shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]'
          }`}>
            {CLIENT_SECTORS.map((sec) => {
              const IconComponent = getSectorIcon(sec.id);
              const isActive = selectedCategory === sec.id;

              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedCategory(sec.id)}
                  className={`group px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-full text-xs sm:text-[13px] font-sans font-semibold transition-all duration-200 cursor-pointer flex items-center space-x-2.5 border ${
                    isLight
                      ? isActive
                        ? 'bg-[#15803d] text-white font-bold border-transparent shadow-sm'
                        : 'bg-transparent hover:bg-[#EFF6F1] text-[#37473E] hover:text-[#0F291B] border-transparent'
                      : isActive
                        ? 'bg-gradient-to-r from-[#00C853] via-[#00E676] to-[#00C853] text-[#031508] font-extrabold border-[#00E676] shadow-[0_0_24px_rgba(0,200,83,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] scale-[1.02]'
                        : 'bg-[#08180E]/60 hover:bg-[#0D2616] text-gray-300 hover:text-white border-[#13331E] hover:border-emerald-500/40 shadow-xs'
                  }`}
                >
                  <IconComponent className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isLight
                      ? isActive ? 'text-white' : 'text-[#15803d]'
                      : isActive ? 'text-[#031508]' : 'text-emerald-400/90 group-hover:text-[#00E676]'
                  }`} />
                  <span className="tracking-tight">{sec.label}</span>
                  <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full transition-colors ${
                    isLight
                      ? isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#E8F2EC] text-[#15803d]'
                      : isActive 
                        ? 'bg-[#031508]/20 text-[#031508] border border-[#031508]/15' 
                        : 'bg-white/[0.06] text-gray-300 group-hover:text-white group-hover:bg-white/[0.12] border border-white/5'
                  }`}>
                    {sec.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Client Cards Grid - Structured into exactly 2 rows for 'all' (3 upper, 4 lower) */}
        {selectedCategory === 'all' ? (
          <div className="space-y-8 xl:space-y-10">
            {/* Upper Row: 3 Clients (Clean Mobility & Aviation Pioneers) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
              {filteredClients.slice(0, 3).map((client) => renderClientCard(client, false))}
            </div>

            {/* Lower Row: 4 Clients (Higher Ed, Transit, Logistics, Circular Packaging) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 xl:gap-8">
              {filteredClients.slice(3, 7).map((client) => renderClientCard(client, true))}
            </div>
          </div>
        ) : (
          /* Filtered category view */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
            {filteredClients.map((client) => renderClientCard(client, true))}
          </div>
        )}

        {/* Enterprise Bottom Strip */}
        <div className={`mt-16 sm:mt-20 p-6 sm:p-8 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-6 ${
          isLight
            ? 'bg-gradient-to-r from-[#EEF6F1] via-white to-[#EEF6F1] border-[#15803d]/20 shadow-[0_12px_32px_-10px_rgba(15,41,27,0.08)]'
            : 'bg-gradient-to-r from-[#081A0F] via-[#0E2618] to-[#081A0F] border-[#1B4D2E] shadow-2xl'
        }`}>
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 ${
              isLight ? 'bg-[#E3F2E9] border-[#15803d]/20' : 'bg-[#00C853]/20 border-[#00C853]/40'
            }`}>
              <Sparkles className={`w-7 h-7 ${isLight ? 'text-[#15803d]' : 'text-[#00C853]'}`} />
            </div>
            <div>
              <h4 className={`font-sans font-bold text-lg ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                Join Bangladesh's Premier Sustainability Leaders
              </h4>
              <p className={`text-xs sm:text-sm font-sans mt-0.5 ${isLight ? 'text-[#46574D]' : 'text-gray-300'}`}>
                Onboard your enterprise in 24 hours with automated PDF utility invoice extraction and a GHG Protocol Scope 1 and 2 method.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <a
              href="/platform"
              className={`font-sans font-bold text-sm px-7 py-3.5 rounded-full transition-all flex items-center space-x-2 cursor-pointer ${
                isLight
                  ? 'bg-[#15803d] hover:bg-[#166534] text-white shadow-[0_8px_20px_-6px_rgba(21,128,61,0.45)]'
                  : 'bg-[#00C853] hover:bg-[#00E676] text-[#050C07] font-extrabold shadow-lg shadow-[#00C853]/25'
              }`}
            >
              <span>Explore Client Dashboard</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ClientShowcase;
