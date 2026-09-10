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
  Plane
} from 'lucide-react';
import { CLIENT_PROFILES, CLIENT_SECTORS } from '../pages/platform/clientProfiles';

const ClientShowcase = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const getSectorIcon = (id) => {
    switch (id) {
      case 'all': return Layers;
      case 'mobility': return Zap;
      case 'circular': return Recycle;
      case 'education': return GraduationCap;
      case 'travel': return Plane;
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
        className={`group relative rounded-3xl p-7 sm:p-8 xl:p-8 2xl:p-9 bg-gradient-to-b from-[#091A10]/95 via-[#06130B]/95 to-[#030805] hover:bg-[#0C2416] border border-[#184227]/75 hover:border-[#00E676]/80 transition-all duration-300 shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] hover:shadow-[0_20px_60px_rgba(0,200,83,0.18),inset_0_1px_0_rgba(0,230,118,0.3)] hover:-translate-y-2 flex flex-col justify-between h-full min-h-[440px] sm:min-h-[460px] overflow-hidden`}
      >
        {/* Ambient Card Hover Glow */}
        <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/[0.08] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative z-10">
          {/* Top Row: Logo Badge & Live Site Link */}
          <div className="flex items-center justify-between gap-4 mb-7">
            {/* Enhanced Logo Container for Maximum Contrast & Visibility */}
            <div 
              className={`h-16 sm:h-17 ${
                isLowerRow ? 'w-32 sm:w-36 xl:w-36 2xl:w-40' : 'w-36 sm:w-42 xl:w-44'
              } px-3.5 py-2 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 ${
                isDarkLogo
                  ? 'bg-[#06160C] border-2 border-[#1B4D2B] shadow-[0_0_24px_rgba(0,200,83,0.2)] ring-1 ring-emerald-500/30'
                  : 'bg-white border-2 border-slate-200 shadow-md ring-1 ring-black/5'
              }`}
            >
              <img 
                src={client.logo} 
                alt={`${client.name} official logo`}
                className="max-h-11 sm:max-h-12 max-w-full w-auto object-contain transition-transform duration-300"
                loading="lazy"
              />
            </div>

            {/* Verified Badge & Live Domain: Generously spaced from card border */}
            <div className="flex flex-col items-end shrink-0 gap-2">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#00C853]/12 group-hover:bg-[#00C853]/20 border border-[#00C853]/35 text-[#00E676] transition-all shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse shrink-0" />
                <ShieldCheck className="w-3.5 h-3.5 text-[#00C853] shrink-0" />
                <span className="text-[11px] sm:text-xs font-mono font-semibold tracking-wide text-[#34D399] whitespace-nowrap">
                  Verified Client
                </span>
              </div>
              <a
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] sm:text-xs font-mono text-gray-400 hover:text-[#00E676] flex items-center space-x-1.5 transition-colors group/link px-1 py-0.5"
                title={`Visit ${client.name} official website`}
              >
                <span className="truncate max-w-[120px] sm:max-w-[150px] xl:max-w-[170px]">{cleanUrl}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#00C853] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform shrink-0" />
              </a>
            </div>
          </div>

          {/* Company Name & Sector */}
          <div className="mb-4">
            <h3 className="font-sans font-extrabold text-2xl sm:text-[26px] text-white group-hover:text-[#00E676] transition-colors tracking-tight leading-snug">
              {client.name}
            </h3>
            <span className="text-xs sm:text-[13px] font-mono font-bold text-[#00E676] uppercase tracking-wider block mt-1.5">
              {client.sector}
            </span>
          </div>

          {/* Legal Entity / Location */}
          <div className="text-xs sm:text-[13px] text-gray-400 mb-5 flex items-center space-x-2 font-sans">
            <Building2 className="w-4 h-4 text-emerald-400/80 shrink-0" />
            <span className="truncate" title={client.headquarters}>{client.headquarters}</span>
          </div>

          {/* Sustainability Highlight with Left Accent Bar */}
          <div className="relative p-4 sm:p-5 rounded-2xl bg-[#030A05]/90 border border-[#163822] group-hover:border-[#00C853]/40 mb-6 shadow-inner overflow-hidden transition-colors">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#00E676] to-[#10B981] rounded-l-2xl" />
            <div className="flex items-start space-x-3 pl-1">
              <Leaf className="w-4 h-4 text-[#00E676] shrink-0 mt-0.5" />
              <p className="text-xs sm:text-[13.5px] text-gray-200 font-sans leading-relaxed font-normal min-h-[46px]">
                {client.sustainabilityHighlight}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Card Footer: Facilities & Audit Info */}
        <div className="relative z-10 pt-5 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-gray-400">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00C853]" />
            </span>
            <span className="text-gray-300 font-medium text-xs sm:text-[13px]">{client.facilities.length} Active Sites</span>
          </div>
          <div className="text-right">
            <span className="text-[#00E676] font-extrabold font-mono text-base sm:text-lg">
              {client.activeInsets.toLocaleString()} tCO₂e
            </span>
            <span className="text-gray-400 text-xs ml-1.5 font-sans">Verified Offset</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="w-full bg-[#040A06] py-24 sm:py-32 relative overflow-hidden font-sans border-b border-white/5">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-[#00C853]/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[600px] h-[400px] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-[500px] h-[300px] bg-[#00E676]/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Expanded Container Width to utilize high-resolution canvas generously */}
      <div className="max-w-[2100px] 2xl:max-w-[2300px] w-full mx-auto px-6 sm:px-10 lg:px-14 xl:px-18 2xl:px-24 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#00C853]/10 border border-[#00C853]/30 text-[#00E676] font-mono text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Award className="w-4 h-4 text-[#00C853]" />
            <span>Trusted Enterprise Client Network</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Powering Bangladesh's <br />
            <span className="bg-gradient-to-r from-[#00E676] via-[#10B981] to-[#34D399] bg-clip-text text-transparent">
              Decarbonization Pioneers
            </span>
          </h2>

          <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-sans">
            From electric mobility and smart student transit to circular jute biopolymers and premier universities, 
            see how Bangladesh’s industry leaders use <strong className="text-white font-semibold">CarbonZero BD</strong> for verified ESG carbon accounting.
          </p>
        </div>

        {/* Sector Filter Tabs - Impeccable Segmented Control Dock */}
        <div className="flex justify-center mb-16 px-2">
          <div className="inline-flex flex-wrap items-center justify-center p-1.5 sm:p-2 rounded-2xl sm:rounded-full bg-[#051108]/90 backdrop-blur-xl border border-[#143B22] shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] gap-1.5 sm:gap-2 max-w-full">
            {CLIENT_SECTORS.map((sec) => {
              const IconComponent = getSectorIcon(sec.id);
              const isActive = selectedCategory === sec.id;

              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedCategory(sec.id)}
                  className={`group px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-full text-xs sm:text-[13px] font-sans font-semibold transition-all duration-200 cursor-pointer flex items-center space-x-2.5 border ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00C853] via-[#00E676] to-[#00C853] text-[#031508] font-extrabold border-[#00E676] shadow-[0_0_24px_rgba(0,200,83,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] scale-[1.02]'
                      : 'bg-[#08180E]/60 hover:bg-[#0D2616] text-gray-300 hover:text-white border-[#13331E] hover:border-emerald-500/40 shadow-xs'
                  }`}
                >
                  <IconComponent className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-[#031508]' : 'text-emerald-400/90 group-hover:text-[#00E676]'
                  }`} />
                  <span className="tracking-tight">{sec.label}</span>
                  <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full transition-colors ${
                    isActive 
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
        <div className="mt-16 sm:mt-20 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#081A0F] via-[#0E2618] to-[#081A0F] border border-[#1B4D2E] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-[#00C853]/20 border border-[#00C853]/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-7 h-7 text-[#00C853]" />
            </div>
            <div>
              <h4 className="font-sans font-bold text-white text-lg">
                Join Bangladesh's Premier Sustainability Leaders
              </h4>
              <p className="text-xs sm:text-sm text-gray-300 font-sans mt-0.5">
                Onboard your enterprise in 24 hours with automated PDF utility invoice extraction and DoE gazette compliance.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <a
              href="/platform"
              className="bg-[#00C853] hover:bg-[#00E676] text-[#050C07] font-sans font-extrabold text-sm px-7 py-3.5 rounded-full transition-all shadow-lg shadow-[#00C853]/25 flex items-center space-x-2 cursor-pointer"
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
