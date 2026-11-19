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
        className={`group relative rounded-3xl ${isLowerRow ? 'p-6 sm:p-6 xl:p-6 2xl:p-7' : 'p-7 sm:p-8 xl:p-8 2xl:p-9'} transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between h-full min-h-[440px] sm:min-h-[460px] overflow-hidden border ${
          isLight
            ? 'bg-white border-[#0F291B]/10 hover:border-[#15803d]/40 shadow-[0_10px_30px_-8px_rgba(15,41,27,0.08),0_2px_8px_-2px_rgba(15,41,27,0.04)] hover:shadow-[0_18px_42px_-10px_rgba(21,128,61,0.14)]'
            : 'bg-gradient-to-b from-[#091A10]/95 via-[#06130B]/95 to-[#030805] hover:bg-[#0C2416] border-[#184227]/75 hover:border-[#00E676]/80 shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] hover:shadow-[0_20px_60px_rgba(0,200,83,0.18),inset_0_1px_0_rgba(0,230,118,0.3)]'
        }`}
      >
        {/* Ambient Card Hover Glow */}
        <div
          className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
            isLight
              ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/[0.05] via-transparent to-transparent'
              : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/[0.08] via-transparent to-transparent'
          }`}
        />

        <div className="relative z-10">
          {/* Top Row: Logo Badge & Live Site Link */}
          <div className={`flex items-center justify-between ${isLowerRow ? 'gap-2.5' : 'gap-4'} mb-7 min-w-0`}>
            {/* Enhanced Logo Container for Maximum Contrast & Visibility */}
            <div 
              className={`${
                isLowerRow ? 'h-14 sm:h-15 w-24 sm:w-28 xl:w-28 2xl:w-32 px-2.5 py-2' : 'h-16 sm:h-17 w-36 sm:w-42 xl:w-44 px-3.5 py-2'
              } rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-[1.03] ${
                isDarkLogo
                  ? isLight
                    ? 'client-logo-swatch-dark bg-[#0D2317] border border-[#1B4D2E] shadow-sm'
                    : 'client-logo-swatch-dark bg-[#06160C] border-2 border-[#1B4D2B] shadow-[0_0_24px_rgba(0,200,83,0.2)] ring-1 ring-emerald-500/30'
                  : isLight
                    ? 'bg-[#F5F8F5] border border-[#0F291B]/10 shadow-xs'
                    : 'bg-white border-2 border-slate-200 shadow-md ring-1 ring-black/5'
              }`}
            >
              <img 
                src={client.logo} 
                alt={`${client.name} official logo`}
                className={`${isLowerRow ? 'max-h-9 sm:max-h-10' : 'max-h-11 sm:max-h-12'} max-w-full w-auto object-contain transition-transform duration-300`}
                loading="lazy"
              />
            </div>

            {/* Verified Badge & Live Domain */}
            <div className="flex flex-col items-end min-w-0 flex-1 gap-1.5">
              <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full transition-all border shrink-0 ${
                isLight
                  ? 'bg-[#E6F4EC] group-hover:bg-[#DAF0E3] border-[#15803d]/20 text-[#15803d]'
                  : 'bg-[#00C853]/12 group-hover:bg-[#00C853]/20 border-[#00C853]/35 text-[#00E676] shadow-xs'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse shrink-0 ${isLight ? 'bg-[#15803d]' : 'bg-[#00E676]'}`} />
                <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-[#15803d]' : 'text-[#00C853]'}`} />
                <span className={`text-[11px] font-mono font-semibold tracking-wide whitespace-nowrap ${isLight ? 'text-[#14532D]' : 'text-[#34D399]'}`}>
                  Client
                </span>
              </div>
              <a
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-[11px] font-mono flex items-center justify-end space-x-1 transition-colors group/link px-0.5 py-0.5 max-w-full min-w-0 ${
                  isLight ? 'text-[#4A5D52] hover:text-[#15803d]' : 'text-gray-400 hover:text-[#00E676]'
                }`}
                title={`Visit ${client.name} official website`}
              >
                <span className="truncate">{cleanUrl}</span>
                <ArrowUpRight className={`w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform shrink-0 ${isLight ? 'text-[#15803d]' : 'text-[#00C853]'}`} />
              </a>
            </div>
          </div>

          {/* Company Name & Sector */}
          <div className="mb-4">
            <h3 className={`font-sans font-extrabold text-2xl sm:text-[26px] transition-colors tracking-tight leading-snug ${
              isLight ? 'text-[#0F291B] group-hover:text-[#15803d]' : 'text-white group-hover:text-[#00E676]'
            }`}>
              {client.name}
            </h3>
            <span className={`text-xs sm:text-[13px] font-mono font-bold uppercase tracking-wider block mt-1.5 ${
              isLight ? 'text-[#15803d]' : 'text-[#00E676]'
            }`}>
              {client.sector}
            </span>
          </div>

          {/* Legal Entity / Location */}
          <div className={`text-xs sm:text-[13px] mb-5 flex items-center space-x-2 font-sans ${isLight ? 'text-[#4A5D52]' : 'text-gray-400'}`}>
            <Building2 className={`w-4 h-4 shrink-0 ${isLight ? 'text-[#15803d]' : 'text-emerald-400/80'}`} />
            <span className="truncate" title={client.headquarters}>{client.headquarters}</span>
          </div>

          {/* Sustainability Highlight */}
          <div className={`relative p-4 sm:p-5 rounded-2xl border mb-6 overflow-hidden transition-colors ${
            isLight
              ? 'bg-[#F5F8F5] border-[#0F291B]/10 group-hover:border-[#15803d]/30'
              : 'bg-[#030A05]/90 border-[#163822] group-hover:border-[#00C853]/40 shadow-inner'
          }`}>
            <div className="flex items-start space-x-3">
              <Leaf className={`w-4 h-4 shrink-0 mt-0.5 ${isLight ? 'text-[#15803d]' : 'text-[#00E676]'}`} />
              <p className={`text-xs sm:text-[13.5px] font-sans leading-relaxed font-normal min-h-[46px] ${
                isLight ? 'text-[#26382E]' : 'text-gray-200'
              }`}>
                {client.sustainabilityHighlight}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Card Footer: Facilities & Audit Info */}
        <div className={`relative z-10 pt-5 border-t flex items-center justify-between text-xs font-mono ${
          isLight ? 'border-[#0F291B]/10 text-[#4A5D52]' : 'border-white/[0.08] text-gray-400'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLight ? 'bg-[#15803d]' : 'bg-[#00E676]'}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLight ? 'bg-[#15803d]' : 'bg-[#00C853]'}`} />
            </span>
            <span className={`font-medium text-xs sm:text-[13px] ${isLight ? 'text-[#26382E]' : 'text-gray-300'}`}>
              {client.facilities.length} Active Sites
            </span>
          </div>
          <div className="text-right">
            <span className={`font-extrabold font-mono text-base sm:text-lg ${isLight ? 'text-[#15803d]' : 'text-[#00E676]'}`}>
              {client.activeInsets.toLocaleString()} tCO₂e
            </span>
            <span className={`text-xs ml-1.5 font-sans ${isLight ? 'text-[#4A5D52]' : 'text-gray-400'}`}>Offset</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className={`w-full py-24 sm:py-32 relative overflow-hidden font-sans border-b ${
      isLight ? 'bg-[#F2F3EE] border-[#0F291B]/8' : 'bg-[#040A06] border-white/5'
    }`}>
      {/* Ambient background glows */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full blur-[180px] pointer-events-none ${isLight ? 'bg-[#15803d]/[0.05]' : 'bg-[#00C853]/10'}`} />
      <div className={`absolute bottom-10 right-10 w-[600px] h-[400px] rounded-full blur-[160px] pointer-events-none ${isLight ? 'bg-emerald-500/[0.04]' : 'bg-emerald-500/5'}`} />
      <div className={`absolute top-10 left-10 w-[500px] h-[300px] rounded-full blur-[150px] pointer-events-none ${isLight ? 'bg-[#15803d]/[0.03]' : 'bg-[#00E676]/5'}`} />

      {/* Expanded Container Width to utilize high-resolution canvas generously */}
      <div className="max-w-[2100px] 2xl:max-w-[2300px] w-full mx-auto px-6 sm:px-10 lg:px-14 xl:px-18 2xl:px-24 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider mb-4 border ${
            isLight
              ? 'bg-[#E5F4EB] border-[#15803d]/20 text-[#15803d]'
              : 'bg-[#00C853]/10 border-[#00C853]/30 text-[#00E676] shadow-sm'
          }`}>
            <Award className={`w-4 h-4 ${isLight ? 'text-[#15803d]' : 'text-[#00C853]'}`} />
            <span>Trusted Enterprise Client Network</span>
          </div>

          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4 ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
            Powering Bangladesh's <br />
            <span className={isLight ? 'text-[#15803d]' : 'bg-gradient-to-r from-[#00E676] via-[#10B981] to-[#34D399] bg-clip-text text-transparent'}>
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
