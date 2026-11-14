import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowUp, ChevronDown, Activity, Globe, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Footer = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const currentYear = new Date().getFullYear();
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const footerGroups = [
    {
      title: 'Platform',
      links: [
        { label: 'Project Onboarding', to: '/platform/project-onboarding' },
        { label: 'MRV Dashboard', to: '/platform/mrv-dashboard' },
        { label: 'Carbon Registry', to: '/platform/carbon-registry' },
        { label: 'Verification Workflow', to: '/platform/verification-workflow' },
        { label: 'Credit Marketplace', to: '/platform/marketplace' },
        { label: 'AI Detection Engine', to: '/platform/ai-detection' }
      ]
    },
    {
      title: 'Sectors',
      links: [
        { label: 'Solar Irrigation', to: '/sectors/solar-irrigation' },
        { label: 'Rice Methane (AWD)', to: '/sectors/rice-methane' },
        { label: 'Clean Cookstoves', to: '/sectors/clean-cookstoves' },
        { label: 'Waste-to-Energy', to: '/sectors/waste-to-energy' },
        { label: 'Mangrove Blue Carbon', to: '/sectors/mangrove-carbon' },
        { label: 'Brick Kiln Modernization', to: '/sectors/brick-kilns' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About CarbonOS', to: '/company/about' },
        { label: 'Framework & Methodology', to: '/company/framework-docs' },
        { label: 'Developer API Docs', to: '/company/api-docs' },
        { label: 'Careers & Opportunities', to: '/company/careers' }
      ]
    },
    {
      title: 'Governance',
      links: [
        { label: 'Privacy Policy', to: '/company/privacy' },
        { label: 'Terms of Protocol', to: '/company/terms' },
        { label: 'How It Works', to: '/how-it-works' },
        { label: 'Farmers AI (HarvestGuard)', to: '/farmers-ai' }
      ]
    }
  ];

  return (
    <section 
      className="relative w-full flex flex-col justify-end bg-cover bg-center overflow-hidden border-t border-border-subtle"
      style={{ backgroundImage: 'url("/footer_landscape.png")' }}
    >
      {/* Top Gradient Blend */}
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-bg-canvas via-bg-canvas/80 to-transparent z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />

      {/* Hero CTA Block */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center text-center px-6 py-12 md:py-16 max-w-4xl mx-auto">
        <span className="font-mono text-xs text-accent uppercase tracking-widest font-bold px-3 py-1 bg-black/50 border border-accent/30 rounded-full mb-6 inline-flex items-center gap-2 backdrop-blur-md">
          <Activity size={12} className="animate-pulse" />
          <span>NATIONAL SOVEREIGN DEPLOYMENT</span>
        </span>
        <h2 className="font-sans font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1] mb-6 drop-shadow-xl">
          {t('footer.ctaTitle', 'Accelerate Bangladesh to Net-Zero Transparency')}
        </h2>
        <p className="font-sans text-base sm:text-lg text-white/90 max-w-2xl mb-8 leading-relaxed drop-shadow-md">
          {t('footer.ctaSubtext', 'Connect directly to verified rural carbon projects, calculate corporate scopes, and audit real-time dMRV satellite evidence.')}
        </p>
        <Link 
          to="/platform/saas-dashboard" 
          className="group inline-flex items-center gap-3 bg-accent hover:bg-accent-hover text-fg-primary font-sans font-bold text-sm sm:text-base px-8 py-4 rounded-full transition-all duration-300 shadow-[0_0_30px_rgba(0,200,83,0.35)] hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>{t('footer.ctaButton', 'Launch Enterprise Workspace')}</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Main Glassmorphic Footer Body */}
      <footer className="relative z-10 w-full bg-bg-surface/85 backdrop-blur-2xl border-t border-border-subtle pt-10 sm:pt-14 rounded-t-[2.5rem]">
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto w-full">
          
          {/* Brand + Status Top Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-border-subtle mb-10">
            <div className="space-y-2 max-w-md">
              <Link to="/" className="flex items-center gap-2">
                <span className="serif-drama text-2xl font-bold tracking-wider text-fg-primary">
                  Carbon<span className="text-accent">Zero</span>
                </span>
                <span className="font-mono text-[9px] bg-accent/15 border border-accent/30 text-accent px-1.5 py-0.5 rounded tracking-widest uppercase font-bold">
                  BD
                </span>
              </Link>
              <p className="text-xs text-fg-secondary leading-relaxed font-sans">
                Bangladesh's sovereign digital Measurement, Reporting, and Verification (dMRV) carbon ledger. 97% direct farmer liquidity rails with cryptographic proof.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-elevated border border-border-subtle text-accent">
                <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                <span className="font-semibold">Protocol v2.4.0 Online</span>
              </div>
              <button
                type="button"
                onClick={scrollToTop}
                aria-label="Back to top"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-elevated border border-border-subtle text-fg-secondary hover:text-fg-primary transition-colors cursor-pointer"
              >
                <span>Back to top</span>
                <ArrowUp size={12} />
              </button>
            </div>
          </div>

          {/* Navigation Links Grid (Desktop 4-Col, Mobile Accordion) */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {footerGroups.map((group) => (
              <div key={group.title} className="flex flex-col space-y-3 min-w-0">
                <h3 className="font-mono text-xs uppercase tracking-widest text-fg-muted font-bold">
                  {group.title}
                </h3>
                <ul className="space-y-2 font-sans text-xs sm:text-sm">
                  {group.links.map((link) => (
                    <li key={link.to}>
                      <Link 
                        to={link.to} 
                        className="text-fg-secondary hover:text-accent transition-colors block py-0.5 truncate"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Mobile Accordion Links */}
          <div className="md:hidden space-y-2 mb-8">
            {footerGroups.map((group) => {
              const isOpen = openSection === group.title;
              return (
                <div key={group.title} className="border border-border-subtle rounded-xl overflow-hidden bg-bg-elevated/40">
                  <button
                    type="button"
                    onClick={() => toggleSection(group.title)}
                    className="w-full flex items-center justify-between p-3.5 text-left text-xs font-mono uppercase tracking-wider text-fg-primary font-bold min-h-[44px]"
                    aria-expanded={isOpen}
                  >
                    <span>{group.title}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-accent' : 'text-fg-muted'}`} />
                  </button>
                  {isOpen && (
                    <ul className="px-3.5 pb-3.5 pt-1 space-y-2 text-xs font-sans border-t border-border-subtle/50">
                      {group.links.map((link) => (
                        <li key={link.to}>
                          <Link 
                            to={link.to} 
                            className="text-fg-secondary hover:text-accent transition-colors block py-1.5"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Row: Legal, Language & Theme Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-border-subtle text-xs text-fg-muted font-sans">
            <div>
              &copy; {currentYear} CarbonOS Inc. & Bangladesh Climate Exchange. All rights reserved.
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'bn' : 'en')}
                aria-label="Switch language"
                className="px-2.5 py-1 rounded-md border border-border-subtle text-fg-secondary hover:text-fg-primary transition-colors cursor-pointer min-h-[32px] flex items-center gap-1 font-mono text-[11px]"
              >
                <Globe size={11} />
                <span>{i18n.language === 'en' ? 'বাংলা' : 'EN'}</span>
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="px-2.5 py-1 rounded-md border border-border-subtle text-fg-secondary hover:text-fg-primary transition-colors cursor-pointer min-h-[32px] flex items-center gap-1 font-mono text-[11px]"
              >
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Subtle Watermark at very bottom */}
        <div className="w-full overflow-hidden flex justify-center -mb-2 select-none pointer-events-none opacity-20 dark:opacity-10">
          <span className="font-sans font-extrabold text-[12vw] leading-[0.8] text-fg-primary tracking-tighter uppercase whitespace-nowrap">
            CARBON ZERO BD
          </span>
        </div>
      </footer>
    </section>
  );
};

export default Footer;
