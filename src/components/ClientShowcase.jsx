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
  Award
} from 'lucide-react';
import { CLIENT_PROFILES, CLIENT_SECTORS } from '../pages/platform/clientProfiles';

const ClientShowcase = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredClients = selectedCategory === 'all'
    ? CLIENT_PROFILES
    : CLIENT_PROFILES.filter(c => c.category === selectedCategory);

  const renderClientCard = (client, isLowerRow = false) => {
    const isDarkLogo = client.logoTheme === 'dark';

    return (
      <div
        key={client.id}
        className={`group relative rounded-3xl ${
          isLowerRow ? 'p-6 sm:p-7 bg-[#08140D]/95' : 'p-6 sm:p-7 bg-[#08130C]/90'
        } hover:bg-[#0C1E13] border border-[#152B1D] hover:border-[#00C853]/60 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#00C853]/15 hover:-translate-y-1 flex flex-col justify-between h-full`}
      >
        <div>
          {/* Top Row: Logo Badge & Live Site Link */}
          <div className="flex items-center justify-between gap-3 mb-5">
            {/* Enhanced Logo Container for Maximum Contrast & Visibility */}
            <div 
              className={`h-16 sm:h-18 w-36 sm:w-42 px-3.5 py-2.5 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 ${
                isDarkLogo
                  ? 'bg-[#06140B] border-2 border-[#163D22] shadow-[0_0_20px_rgba(0,200,83,0.18)] ring-1 ring-emerald-500/25'
                  : 'bg-white border-2 border-slate-200 shadow-md ring-1 ring-black/5'
              }`}
            >
              <img 
                src={client.logo} 
                alt={`${client.name} official logo`}
                className="max-h-12 max-w-full w-auto object-contain transition-transform duration-300"
                loading="lazy"
              />
            </div>

            <div className="flex flex-col items-end shrink-0">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#00C853]/15 text-[#4ADE80] border border-[#00C853]/30 mb-1.5 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-[#00C853]" />
                <span>Verified Client</span>
              </span>
              <a
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-gray-400 hover:text-[#00E676] flex items-center space-x-1 transition-colors group/link"
                title={`Visit ${client.name} official website`}
              >
                <span className="truncate max-w-[110px] sm:max-w-[130px]">{client.website.replace('https://www.', '').replace('https://', '').replace(/\/$/, '')}</span>
                <ArrowUpRight className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Company Name & Sector */}
          <div className="mb-3">
            <h3 className="font-sans font-bold text-lg sm:text-xl text-white group-hover:text-[#00E676] transition-colors flex items-center gap-2">
              {client.name}
            </h3>
            <span className="text-xs font-mono text-[#7C9A88] block mt-0.5">
              {client.sector}
            </span>
          </div>

          {/* Legal Entity / Location */}
          <div className="text-xs text-gray-400 mb-4 flex items-center space-x-1.5 font-sans">
            <Building2 className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <span className="line-clamp-1" title={client.headquarters}>{client.headquarters}</span>
          </div>

          {/* Sustainability Highlight */}
          <div className="p-3.5 rounded-2xl bg-[#040A06] border border-white/5 mb-5">
            <div className="flex items-start space-x-2">
              <Leaf className="w-3.5 h-3.5 text-[#00C853] shrink-0 mt-0.5" />
              <p className="text-xs text-gray-300 font-sans leading-relaxed min-h-[44px]">
                {client.sustainabilityHighlight}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Card Footer: Facilities & Audit Info */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-gray-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C853]" />
            <span>{client.facilities.length} Active Sites</span>
          </div>
          <div className="text-right">
            <span className="text-[#00C853] font-bold font-mono text-sm">
              {client.activeInsets} tCO₂e
            </span>
            <span className="text-gray-500 text-[10px] ml-1">Offset</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="w-full bg-[#050C07] py-24 relative overflow-hidden font-sans border-b border-white/5">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#00C853]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#00C853]/10 border border-[#00C853]/30 text-[#00E676] font-mono text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Award className="w-3.5 h-3.5" />
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

        {/* Sector Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {CLIENT_SECTORS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setSelectedCategory(sec.id)}
              className={`px-4 py-2 rounded-full text-xs font-sans font-semibold transition-all duration-200 cursor-pointer flex items-center space-x-2 border ${
                selectedCategory === sec.id
                  ? 'bg-[#00C853] text-[#050C07] border-[#00C853] font-bold shadow-lg shadow-[#00C853]/25 scale-105'
                  : 'bg-white/[0.03] hover:bg-white/[0.08] text-gray-300 border-white/10 hover:border-white/20'
              }`}
            >
              <span>{sec.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                selectedCategory === sec.id ? 'bg-[#050C07]/20 text-[#050C07]' : 'bg-white/10 text-gray-400'
              }`}>
                {sec.count}
              </span>
            </button>
          ))}
        </div>

        {/* Client Cards Grid - Structured into exactly 2 rows for 'all' (3 upper, 4 lower) */}
        {selectedCategory === 'all' ? (
          <div>
            {/* Upper Row: 3 Clients (Clean Mobility & Aviation Pioneers) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {filteredClients.slice(0, 3).map((client) => renderClientCard(client, false))}
            </div>

            {/* Lower Row: 4 Clients (Higher Ed, Transit, Logistics, Circular Packaging) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredClients.slice(3, 7).map((client) => renderClientCard(client, true))}
            </div>
          </div>
        ) : (
          /* Filtered category view */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClients.map((client) => renderClientCard(client, true))}
          </div>
        )}

        {/* Enterprise Bottom Strip */}
        <div className="mt-14 p-6 rounded-3xl bg-gradient-to-r from-[#081A0F] via-[#0E2618] to-[#081A0F] border border-[#1B4D2E] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00C853]/20 border border-[#00C853]/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-[#00C853]" />
            </div>
            <div>
              <h4 className="font-sans font-bold text-white text-base">
                Join Bangladesh's Premier Sustainability Leaders
              </h4>
              <p className="text-xs text-gray-300 font-sans mt-0.5">
                Onboard your enterprise in 24 hours with automated PDF utility invoice extraction and DoE gazette compliance.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <a
              href="/platform"
              className="bg-[#00C853] hover:bg-[#00E676] text-[#050C07] font-sans font-bold text-xs px-6 py-3 rounded-full transition-all shadow-md shadow-[#00C853]/20 flex items-center space-x-1.5"
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
