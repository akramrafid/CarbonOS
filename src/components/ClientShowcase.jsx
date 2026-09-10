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

  return (
    <section className="w-full bg-[#050C07] py-24 relative overflow-hidden font-sans border-b border-white/5">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#00C853]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
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

        {/* Client Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="group relative rounded-3xl p-6 bg-[#08130C]/90 hover:bg-[#0C1A11] border border-[#152B1D] hover:border-[#00C853]/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#00C853]/10 flex flex-col justify-between"
            >
              {/* Top Row: Logo & Live Site Link */}
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-white p-2 flex items-center justify-center shadow-md overflow-hidden border border-white/20 shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src={client.logo} 
                      alt={`${client.name} logo`}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#00C853]/15 text-[#4ADE80] border border-[#00C853]/30 mb-1 flex items-center space-x-1">
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
                      <span className="truncate max-w-[130px]">{client.website.replace('https://www.', '').replace('https://', '').replace('/', '')}</span>
                      <ArrowUpRight className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </div>

                {/* Company Name & Sector */}
                <div className="mb-3">
                  <h3 className="font-sans font-bold text-lg text-white group-hover:text-[#00E676] transition-colors flex items-center gap-2">
                    {client.name}
                  </h3>
                  <span className="text-xs font-mono text-[#7C9A88] block">
                    {client.sector}
                  </span>
                </div>

                {/* Legal Entity / Location */}
                <div className="text-[11px] text-gray-400 mb-4 flex items-center space-x-1.5 font-sans">
                  <Building2 className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span className="truncate">{client.headquarters}</span>
                </div>

                {/* Sustainability Highlight */}
                <div className="p-3 rounded-2xl bg-[#040A06] border border-white/5 mb-4">
                  <div className="flex items-start space-x-2">
                    <Leaf className="w-3.5 h-3.5 text-[#00C853] shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-300 font-sans leading-relaxed">
                      {client.sustainabilityHighlight}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer: Facilities & Audit Info */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-400">
                <div className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C853]" />
                  <span>{client.facilities.length} Active Sites</span>
                </div>
                <div className="text-right">
                  <span className="text-[#00C853] font-bold font-mono">
                    {client.activeInsets} tCO₂e
                  </span>
                  <span className="text-gray-500 text-[10px] ml-1">Offset</span>
                </div>
              </div>

            </div>
          ))}
        </div>

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
