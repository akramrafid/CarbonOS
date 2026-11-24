import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Leaf, 
  Building2, 
  ArrowUpRight, 
  Sparkles, 
  Zap,
  Award,
  Layers,
  Recycle,
  GraduationCap,
  ShoppingBag
} from 'lucide-react';
import { CLIENT_PROFILES, CLIENT_SECTORS } from '../pages/platform/clientProfiles';
import { useTheme } from '../context/ThemeContext';
import { SectionHeader } from './ui/Section';
import { Badge } from './ui/Badge';

const ClientShowcase = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { theme } = useTheme();
  const isLight = theme === 'light';

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
        className={`group relative rounded-2xl sm:rounded-3xl p-5 sm:p-6 xl:p-6 2xl:p-7 transition-[background-color,border-color,box-shadow,transform] duration-300 flex flex-col justify-between h-full min-h-[440px] sm:min-h-[460px] overflow-hidden ${
          isLight
            ? 'bg-white border border-border-strong shadow-[0_4px_25px_rgba(4,18,38,0.06)] hover:shadow-[0_12px_35px_rgba(4,18,38,0.12)] hover:border-border-strong/40'
            : 'bg-gradient-to-b from-bg-surface/95 via-bg-surface/95 to-bg-canvas hover:bg-bg-elevated border border-border-subtle/75 hover:border-border-strong/80 shadow-[0_12px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_60px_rgba(0,200,83,0.18)]'
        } hover:-translate-y-2`}
      >
        {/* Ambient Card Hover Glow */}
        <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
          isLight 
            ? 'bg-[radial-gradient(ellipse_at_top,_rgba(21,128,61,0.08),_transparent_70%)]' 
            : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/[0.08] via-transparent to-transparent'
        }`} />

        <div className="relative z-10 flex flex-col flex-1">
          {/* Top Row: Logo Badge & Live Site Link - Aligned Fixed Height Slot */}
          <div className="flex items-center justify-between gap-3 mb-5 h-14">
            {/* Enhanced Logo Container with fluid width */}
            <div 
              className={`h-12 sm:h-13.5 max-w-[115px] sm:max-w-[135px] xl:max-w-[130px] 2xl:max-w-[145px] px-3 py-1.5 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${
                isDarkLogo
                  ? 'bg-bg-elevated border border-border-strong shadow-[0_0_20px_rgba(0,200,83,0.2)] ring-1 ring-emerald-500/30'
                  : 'bg-white border border-slate-200 shadow-xs ring-1 ring-black/5'
              }`}
            >
              <img 
                src={client.logo} 
                alt={`${client.name} official logo`}
                className="max-h-9 sm:max-h-10 max-w-full w-auto object-contain transition-transform duration-300"
                loading="lazy"
              />
            </div>

            {/* Verified Badge & Live Domain: compact, zero horizontal overflow */}
            <div className="flex flex-col items-end shrink-0 gap-1.5 min-w-0">
              <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full transition-colors shadow-xs ${
                isLight
                  ? 'bg-accent-muted border border-border-strong/30 text-accent'
                  : 'bg-accent/12 group-hover:bg-accent/20 border border-border-strong/35 text-accent-hover'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse shrink-0 ${isLight ? 'bg-accent' : 'bg-accent-hover'}`} />
                <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-accent' : 'text-accent'}`} />
                <span className={`text-[11px] sm:text-xs font-mono font-semibold tracking-wide whitespace-nowrap ${
                  isLight ? 'text-accent' : 'text-emerald-400'
                }`}>
                  Demo Profile
                </span>
              </div>
              <a
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-[11px] sm:text-xs font-mono flex items-center space-x-1 transition-colors group/link px-1 py-0.5 ${
                  isLight ? 'text-slate-600 hover:text-accent' : 'text-gray-400 hover:text-accent-hover'
                }`}
                title={`Visit ${client.name} official website`}
              >
                <span className="truncate max-w-[105px] sm:max-w-[125px] xl:max-w-[115px] 2xl:max-w-[140px]">{cleanUrl}</span>
                <ArrowUpRight className={`w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform shrink-0 ${
                  isLight ? 'text-accent' : 'text-accent'
                }`} />
              </a>
            </div>
          </div>

          {/* Company Name & Sector - Deterministic Height Slot */}
          <div className="mb-3.5 min-h-[66px] sm:min-h-[72px] flex flex-col justify-start">
            <h3 
              className={`font-sans font-extrabold text-xl sm:text-[22px] tracking-tight leading-snug line-clamp-1 transition-colors ${
                isLight
                  ? 'text-fg-primary group-hover:text-accent'
                  : 'text-white group-hover:text-accent-hover'
              }`}
              title={client.name}
            >
              {client.name}
            </h3>
            <span className={`text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider line-clamp-2 mt-1 ${
              isLight ? 'text-accent' : 'text-accent-hover'
            }`}>
              {client.sector}
            </span>
          </div>

          {/* Legal Entity / Location - Deterministic Height Slot */}
          <div className={`h-6 mb-4 flex items-center space-x-2 font-sans text-xs sm:text-[13px] ${
            isLight ? 'text-slate-600' : 'text-gray-400'
          }`}>
            <Building2 className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-accent' : 'text-emerald-400/80'}`} />
            <span className="truncate" title={client.headquarters}>{client.headquarters}</span>
          </div>

          {/* Sustainability Highlight with Left Accent Bar - Equalized Flex Box */}
          <div className={`relative p-3.5 sm:p-4 rounded-xl sm:rounded-2xl mb-5 flex-1 min-h-[84px] sm:min-h-[92px] flex items-center overflow-hidden transition-colors ${
            isLight
              ? 'bg-bg-muted border border-border-strong group-hover:border-border-strong/40'
              : 'bg-bg-canvas/90 border border-border-subtle group-hover:border-border-strong/40 shadow-inner'
          }`}>
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl sm:rounded-l-2xl ${
              isLight ? 'bg-accent' : 'bg-gradient-to-b from-accent-hover to-accent'
            }`} />
            <div className="flex items-start space-x-2.5 pl-1 w-full">
              <Leaf className={`w-4 h-4 shrink-0 mt-0.5 ${isLight ? 'text-accent' : 'text-accent-hover'}`} />
              <p className={`text-xs sm:text-[13px] font-sans leading-relaxed font-normal line-clamp-3 ${
                isLight ? 'text-fg-secondary' : 'text-gray-200'
              }`}>
                {client.sustainabilityHighlight}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Card Footer: Facilities & Audit Info - Strict Baseline Alignment */}
        <div className={`relative z-10 pt-4 border-t flex items-center justify-between text-xs font-mono mt-auto ${
          isLight ? 'border-slate-200 text-slate-600' : 'border-white/[0.08] text-gray-400'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isLight ? 'bg-accent' : 'bg-accent-hover'
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isLight ? 'bg-accent' : 'bg-accent'
              }`} />
            </span>
            <span className={`font-medium text-xs sm:text-[13px] ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
              {client.facilities.length} Active Sites
            </span>
          </div>
          <div className="text-right">
            <span className={`font-extrabold font-mono text-base sm:text-lg ${isLight ? 'text-accent' : 'text-accent-hover'}`}>
              {client.activeInsets.toLocaleString()} tCO₂e
            </span>
            <span className={`text-[11px] sm:text-xs ml-1.5 font-sans ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
              Demo Baseline
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className={`w-full py-10 md:py-16 relative overflow-hidden font-sans border-b transition-colors duration-300 ${
      isLight ? 'bg-bg-canvas border-border-strong' : 'bg-bg-canvas border-white/5'
    }`}>
      <div className="w-full max-w-[1720px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 relative z-10">
        
        <SectionHeader
          centered
          badge={
            <Badge variant="emerald" className="inline-flex items-center gap-1.5 uppercase font-mono text-xs">
              <Award className="w-3.5 h-3.5" />
              <span>Demo Data · Illustrative Bangladesh Sector Profiles</span>
            </Badge>
          }
          title="Sector Reference Profiles for Bangladesh ESG Accounting"
          subtitle="Explore illustrative Scope 1, 2, and 3 operational baselines modeled across electric mobility, student transit, circular jute biopolymers, and higher education campuses."
          className="max-w-3xl mx-auto mb-16"
        />

        {/* Sector Filter Tabs - Impeccable Segmented Control Dock */}
        <div className="flex justify-center mb-16 px-2">
          <div className={`inline-flex flex-wrap items-center justify-center p-1.5 sm:p-2 rounded-2xl sm:rounded-full backdrop-blur-xl border gap-1.5 sm:gap-2 max-w-full ${
            isLight
              ? 'bg-white border-border-strong shadow-[0_4px_20px_rgba(4,18,38,0.06)]'
              : 'bg-bg-elevated/90 border-border-subtle shadow-[0_12px_40px_rgba(0,0,0,0.6)]'
          }`}>
            {CLIENT_SECTORS.map((sec) => {
              const IconComponent = getSectorIcon(sec.id);
              const isActive = selectedCategory === sec.id;

              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedCategory(sec.id)}
                  className={`group px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-full text-xs sm:text-[13px] font-sans font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200 cursor-pointer flex items-center space-x-2.5 border ${
                    isActive
                      ? isLight
                        ? 'bg-accent text-white font-extrabold border-border-strong shadow-md scale-[1.02]'
                        : 'bg-gradient-to-r from-accent via-accent-hover to-accent text-fg-inverse font-extrabold border-border-strong shadow-[0_0_24px_rgba(0,200,83,0.35)] scale-[1.02]'
                      : isLight
                        ? 'bg-transparent hover:bg-slate-100 text-fg-secondary border-transparent hover:border-slate-200'
                        : 'bg-bg-surface/60 hover:bg-bg-surface text-gray-300 hover:text-white border-border-subtle hover:border-emerald-500/40'
                  }`}
                >
                  <IconComponent className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? (isLight ? 'text-white' : 'text-fg-inverse') : (isLight ? 'text-accent' : 'text-emerald-400/90')
                  }`} />
                  <span className="tracking-tight">{sec.label}</span>
                  <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full transition-colors ${
                    isActive 
                      ? (isLight ? 'bg-white/20 text-white' : 'bg-bg-canvas/20 text-fg-inverse')
                      : (isLight ? 'bg-slate-100 text-slate-700' : 'bg-white/[0.06] text-gray-300')
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">
              {filteredClients.slice(0, 3).map((client) => renderClientCard(client, false))}
            </div>

            {/* Lower Row: 4 Clients (Higher Ed, Transit, Logistics, Circular Packaging) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5 xl:gap-6">
              {filteredClients.slice(3, 7).map((client) => renderClientCard(client, true))}
            </div>
          </div>
        ) : (
          /* Filtered category view */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 xl:gap-6">
            {filteredClients.map((client) => renderClientCard(client, true))}
          </div>
        )}

        {/* Enterprise Bottom Strip */}
        <div className={`mt-16 sm:mt-20 p-6 sm:p-8 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-6 ${
          isLight
            ? 'bg-white border-border-strong shadow-[0_10px_35px_rgba(4,18,38,0.06)]'
            : 'bg-gradient-to-r from-bg-surface via-bg-surface to-bg-canvas border-border-subtle shadow-2xl'
        }`}>
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              isLight ? 'bg-accent-muted border border-border-strong/30' : 'bg-accent/20 border border-border-strong/40'
            }`}>
              <Sparkles className={`w-7 h-7 ${isLight ? 'text-accent' : 'text-accent'}`} />
            </div>
            <div>
              <h4 className={`font-sans font-bold text-lg ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                Join Bangladesh's Premier Sustainability Leaders
              </h4>
              <p className={`text-xs sm:text-sm font-sans mt-0.5 ${isLight ? 'text-fg-secondary' : 'text-gray-300'}`}>
                Onboard your enterprise in 24 hours with automated PDF utility invoice extraction and DoE gazette compliance.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {/* [COMMENTED OUT FOR PERSONAL REFERENCE — dead <a href="/platform"> 404 link replaced with SPA Link] */}
            <Link
              to="/platform/saas-dashboard"
              className="keep-white bg-accent hover:bg-accent-hover dark:bg-accent dark:hover:bg-accent-hover text-white dark:text-fg-inverse font-sans font-extrabold text-sm px-7 py-3.5 rounded-full transition-colors shadow-lg flex items-center space-x-2 cursor-pointer"
            >
              <span>Explore Client Dashboard</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ClientShowcase;
