import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowUp, ChevronDown, Globe, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ui/ThemeToggle';
import { footerConfig } from '../config/footer.config';
import { getPrefersReducedMotion } from '../lib/motion';

export const Footer = ({ variant = 'full' }) => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const currentYear = new Date().getFullYear();
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (sectionId) => {
    setOpenSection((prev) => (prev === sectionId ? null : sectionId));
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      if (getPrefersReducedMotion()) {
        window.scrollTo(0, 0);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleLanguageSwitch = () => {
    const nextLang = i18n.language === 'en' ? 'bn' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const { brand, cta, columns, contact, features } = footerConfig;
  const legalColumn = columns.find((col) => col.id === 'legal');

  // Slim footer variant for Product / Dashboard mode
  if (variant === 'slim') {
    return (
      <footer
        aria-label="Workspace footer"
        className="relative w-full bg-bg-canvas text-fg-muted font-sans text-xs mt-auto"
      >
        {/* Top Gradient Hairline */}
        <div
          aria-hidden="true"
          className="h-px w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent"
        />
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-fg-secondary">
              {brand.namePrimary}
              <span className="text-accent">{brand.nameAccent}</span> {brand.badge}
            </span>
            <span>&middot;</span>
            <span>
              &copy; {currentYear} {t(brand.copyrightEntityKey, brand.copyrightEntityDefault)}.{' '}
              {t('footer.rights', 'All rights reserved.')}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {legalColumn?.links.map((link) => (
              <Link
                key={link.id}
                to={link.to}
                className="text-fg-secondary hover:text-accent transition-colors focus-ring-standard rounded px-2 py-2 min-h-[44px] inline-flex items-center"
              >
                {t(link.labelKey, link.defaultLabel)}
              </Link>
            ))}
            <button
              type="button"
              onClick={scrollToTop}
              aria-label={t('footer.backToTop', 'Back to top')}
              className="inline-flex items-center gap-1 text-fg-secondary hover:text-fg-primary transition-colors cursor-pointer focus-ring-standard rounded px-3 py-2 min-h-[44px]"
            >
              <span>{t('footer.backToTop', 'Back to top')}</span>
              <ArrowUp size={12} />
            </button>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <section
      className="relative w-full flex flex-col justify-end bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: 'url("/footer_landscape.png")' }}
    >
      {/* Top Gradient Hairline */}
      <div
        aria-hidden="true"
        className="relative z-20 h-px w-full bg-gradient-to-r from-transparent via-accent/60 to-transparent"
      />

      {/* Top Gradient Blend */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-bg-canvas via-bg-canvas/80 to-transparent z-0 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ backgroundColor: 'rgba(8, 15, 11, 0.56)' }}
      />

      {/* Hero CTA Block */}
        <div
          className="relative z-10 w-full flex flex-col items-center justify-center text-center px-6 py-12 md:py-16 max-w-4xl mx-auto keep-white rounded-3xl my-4"
          style={{ backgroundColor: 'rgba(8, 15, 11, 0.72)' }}
        >
          <span
            className="font-mono text-xs text-emerald-300 uppercase tracking-widest font-bold px-3 py-1 border border-emerald-400/35 rounded-full mb-6 inline-flex items-center gap-2 backdrop-blur-md"
            style={{ backgroundColor: 'rgba(8, 15, 11, 0.72)' }}
          >
            <span>{t(cta.badgeKey, cta.badgeDefault)}</span>
          </span>
          <h2 className="font-sans font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1] mb-6 drop-shadow-xl">
            {t(cta.titleKey, cta.titleDefault)}
          </h2>
          <p className="font-sans text-base sm:text-lg text-white/90 max-w-2xl mb-8 leading-relaxed drop-shadow-md">
            {t(cta.subtextKey, cta.subtextDefault)}
          </p>
          <Link
            to={cta.to}
            className="group inline-flex items-center gap-3 bg-accent hover:bg-accent-hover text-fg-inverse font-sans font-bold text-sm sm:text-base px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:scale-[1.02] active:scale-[0.98] focus-ring-standard min-h-[44px]"
          >
            <span>{t(cta.buttonKey, cta.buttonDefault)}</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Main Glassmorphic Footer Body */}
        <footer
          id="footer-section"
          aria-label="Site footer"
          className="relative z-10 w-full bg-bg-surface/95 backdrop-blur-2xl pt-10 sm:pt-14 pb-20 xl:pb-16 rounded-t-[2.5rem] border-t border-border-subtle"
        >
          {/* Inner Gradient Hairline at Top of Footer Card */}
          <div
            aria-hidden="true"
            className="h-px w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent mb-8"
          />

          <div className="max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto w-full">
            {/* Brand Block + Switchers & Back-to-Top Row */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-8 border-b border-border-subtle mb-10">
              <div className="space-y-3 max-w-lg">
                <Link
                  to={brand.homeRoute}
                  className="inline-flex items-center gap-2 focus-ring-standard rounded-lg"
                >
                  <span className="serif-drama text-2xl font-bold tracking-wider text-fg-primary">
                    {brand.namePrimary}
                    <span className="text-accent">{brand.nameAccent}</span>
                  </span>
                  <span className="font-mono text-[10px] bg-accent/15 border border-accent/30 text-accent px-1.5 py-0.5 rounded tracking-widest uppercase font-bold">
                    {brand.badge}
                  </span>
                </Link>
                <p className="text-xs sm:text-sm text-fg-secondary leading-relaxed font-sans">
                  {t(brand.missionKey, brand.missionDefault)}
                </p>
                {contact?.email && (
                  <p className="text-xs font-mono text-fg-muted">
                    <a
                      href={`mailto:${contact.email}`}
                      className="hover:text-accent transition-colors focus-ring-standard rounded"
                    >
                      {contact.email}
                    </a>
                  </p>
                )}
              </div>

              {/* Utility Controls: Language Switcher, Theme Switcher, Back to Top */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                <button
                  type="button"
                  onClick={handleLanguageSwitch}
                  aria-label={t('footer.switchLanguage', 'Switch language')}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-full bg-bg-elevated border border-border-subtle text-fg-secondary hover:text-fg-primary hover:border-border-strong transition-colors cursor-pointer min-h-[44px] min-w-[44px] focus-ring-standard"
                >
                  <Globe size={14} className="text-accent" />
                  <span>{i18n.language === 'en' ? 'বাংলা' : 'EN'}</span>
                </button>

                <ThemeToggle variant="segmented" />

                {/* [COMMENTED OUT FOR PERSONAL REFERENCE — duplicate theme toggle button next to ThemeToggle segmented control]
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={t('footer.toggleTheme', 'Toggle theme')}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-full bg-bg-elevated border border-border-subtle text-fg-secondary hover:text-fg-primary hover:border-border-strong transition-colors cursor-pointer min-h-[44px] min-w-[44px] focus-ring-standard"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun size={14} className="text-accent" />
                    <span>{t('footer.lightMode', 'Light')}</span>
                  </>
                ) : (
                  <>
                    <Moon size={14} className="text-accent" />
                    <span>{t('footer.darkMode', 'Dark')}</span>
                  </>
                )}
              </button>
              */}

                <button
                  type="button"
                  onClick={scrollToTop}
                  aria-label={t('footer.backToTop', 'Back to top')}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-bg-elevated border border-border-subtle text-fg-secondary hover:text-fg-primary hover:border-border-strong transition-colors cursor-pointer min-h-[44px] focus-ring-standard"
                >
                  <span>{t('footer.backToTop', 'Back to top')}</span>
                  <ArrowUp size={14} />
                </button>
              </div>
            </div>

            {/* Desktop 4-Column Navigation Links Grid */}
            <nav
              aria-label="Footer navigation"
              className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
            >
              {columns.map((col) => (
                <div key={col.id} className="flex flex-col space-y-3 min-w-0">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-fg-muted font-bold">
                    {t(col.titleKey, col.defaultTitle)}
                  </h3>
                  <ul className="space-y-2.5 font-sans text-xs sm:text-sm">
                    {col.links.map((link) => (
                      <li key={link.id}>
                        <Link
                          to={link.to}
                          className="text-fg-secondary hover:text-accent transition-colors block py-0.5 truncate focus-ring-standard rounded"
                        >
                          {t(link.labelKey, link.defaultLabel)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            {/* Mobile Accordion Navigation Columns (<768px) */}
            <nav
              aria-label="Mobile footer navigation"
              className="md:hidden space-y-2 mb-8"
            >
              {columns.map((col) => {
                const isOpen = openSection === col.id;
                const panelId = `footer-accordion-${col.id}`;
                return (
                  <div
                    key={col.id}
                    className="border border-border-subtle rounded-xl overflow-hidden bg-bg-elevated/40"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(col.id)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="w-full flex items-center justify-between p-3.5 text-left text-xs font-mono uppercase tracking-wider text-fg-primary font-bold min-h-[44px] focus-ring-standard"
                    >
                      <span>{t(col.titleKey, col.defaultTitle)}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-accent' : 'text-fg-muted'
                          }`}
                      />
                    </button>
                    {isOpen && (
                      <ul
                        id={panelId}
                        className="px-3.5 pb-3.5 pt-1 space-y-2 text-xs font-sans border-t border-border-subtle/50"
                      >
                        {col.links.map((link) => (
                          <li key={link.id}>
                            <Link
                              to={link.to}
                              className="text-fg-secondary hover:text-accent transition-colors flex items-center min-h-[44px] py-1.5 focus-ring-standard rounded"
                            >
                              {t(link.labelKey, link.defaultLabel)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Optional Social Links Row (only rendered if configured with verified URLs) */}
            {Array.isArray(contact?.socialLinks) && contact.socialLinks.length > 0 && (
              <div className="flex items-center gap-4 pb-6">
                {contact.socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="text-xs font-mono text-fg-secondary hover:text-accent transition-colors min-h-[44px] inline-flex items-center px-2 focus-ring-standard rounded"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            )}

            {/* Bottom Legal & Dynamic Copyright Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-border-subtle text-xs text-fg-muted font-sans">
              <div>
                &copy; {currentYear} {t(brand.copyrightEntityKey, brand.copyrightEntityDefault)}.{' '}
                {t('footer.rights', 'All rights reserved.')}
              </div>

              {features?.hasLiveStatusEndpoint && (
                <div className="text-xs font-mono text-fg-secondary">
                  {/* Reserved for verified live backend status endpoint */}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4">
                {legalColumn?.links.map((link) => (
                  <Link
                    key={link.id}
                    to={link.to}
                    className="text-fg-secondary hover:text-accent transition-colors focus-ring-standard rounded px-1 py-0.5"
                  >
                    {t(link.labelKey, link.defaultLabel)}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Large Faded Wordmark with Soft Vertical Gradient Mask at Bottom */}
          <div
            aria-hidden="true"
            className="w-full overflow-hidden flex justify-center pt-2 pb-1 select-none pointer-events-none [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.42),transparent)] [-webkit-mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.42),transparent)]"
          >
            <span className="font-sans font-extrabold text-[11vw] leading-[0.82] text-fg-primary/25 dark:text-fg-primary/15 tracking-tighter uppercase whitespace-nowrap">
              {brand.wordmark}
            </span>
          </div>
        </footer>
    </section>
  );
};

export default Footer;
