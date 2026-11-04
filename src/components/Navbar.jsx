import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navLinks = [
  { label: 'Platform', key: 'platform', to: '/#platform' },
  { label: 'Evidence assistant', key: 'evidence', to: '/platform/esg?view=evidence' },
  { label: 'Trust & data', key: 'trust', to: '/company/trust' },
  { label: 'Plan a pilot', key: 'pricing', to: '/#pricing' },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dialogRef = useRef(null);
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const closeMenu = () => setIsMobileMenuOpen(false);
  const isEnglish = i18n.language.startsWith('en');

  useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

  useEffect(() => {
    if (!location.hash || location.pathname !== '/') return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [location]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const dialog = dialogRef.current;
    // Native modal behavior contains keyboard focus and makes the page behind it inert.
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const desktop = window.matchMedia('(min-width: 1280px)');
    const onResize = () => { if (desktop.matches) setIsMobileMenuOpen(false); };
    desktop.addEventListener('change', onResize);
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      desktop.removeEventListener('change', onResize);
    };
  }, [isMobileMenuOpen]);

  const languageButton = (
    <button type="button" onClick={() => i18n.changeLanguage(isEnglish ? 'bn' : 'en')}
      aria-label={`Current language is ${isEnglish ? 'English' : 'Bengali'}. Click to switch language`}
      className="min-h-[44px] rounded-lg px-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
      <span lang="en">EN</span><span aria-hidden="true" className="mx-2 opacity-40">/</span><span lang="bn">বাংলা</span>
    </button>
  );

  const renderLink = (item, mobile = false) => {
    const active = location.pathname + location.search + location.hash === item.to;
    return (
      <Link key={item.key} to={item.to} onClick={closeMenu} aria-current={active ? 'page' : undefined}
        className={mobile
          ? `flex min-h-[48px] items-center rounded-xl px-4 text-base font-medium ${active ? 'bg-emerald/15 text-emerald' : 'text-white/90 hover:bg-white/5'}`
          : `flex min-h-[44px] items-center whitespace-nowrap rounded-full px-3 text-[13px] font-medium ${active ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}>
        {t(`nav.${item.key}`, item.label)}
      </Link>
    );
  };

  return (
    <nav aria-label="Main navigation" className="site-navigation fixed inset-x-0 top-3 z-50 px-3 sm:top-5 sm:px-6">
      <div className="mx-auto flex w-full max-w-[1680px] items-center justify-between gap-2 rounded-full border border-white/15 bg-[var(--color-nav-bg)] px-4 py-2 shadow-xl backdrop-blur-xl sm:px-6">
        <Link to="/#hero" aria-label="CarbonOS home" className="flex min-h-[44px] shrink-0 items-center gap-2">
          <span className="serif-drama text-2xl font-bold tracking-wide text-white">Carbon<span className="text-emerald">OS</span></span>
          <span className="rounded border border-emerald/30 px-1.5 py-0.5 font-mono text-[9px] text-emerald">BD</span>
        </Link>

        <div className="hidden min-w-0 items-center xl:flex">
          {navLinks.map((item) => renderLink(item))}
          <Link to="/platform/esg" className="ml-2 flex min-h-[44px] shrink-0 items-center rounded-full border border-emerald/40 px-4 font-mono text-xs font-bold text-emerald hover:bg-emerald/10">
            {t('nav.requestDemo', 'Request Demo')}
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <div className="hidden sm:block">{languageButton}</div>
          <button type="button" id="theme-toggle-btn" onClick={toggleTheme}
            className="theme-toggle min-h-[44px] min-w-[44px]"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <Sun size={16} className="icon icon-sun text-amber" /><Moon size={16} className="icon icon-moon text-emerald" />
          </button>
          <Link to="/platform/esg" className="hidden min-h-[44px] items-center gap-2 px-2 text-sm text-white/80 hover:text-white xl:flex">
            Workspace <LogIn size={16} aria-hidden="true" />
          </Link>
          <button type="button" className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-white hover:bg-white/10 xl:hidden"
            onClick={() => setIsMobileMenuOpen(true)} aria-label="Open navigation menu"
            aria-expanded={isMobileMenuOpen} aria-controls="mobile-menu-drawer">
            <Menu size={22} aria-hidden="true" />
          </button>
        </div>
      </div>

      <dialog ref={dialogRef} id="mobile-menu-drawer" aria-labelledby="mobile-menu-title"
        onCancel={closeMenu} onClose={closeMenu}
        className="site-menu fixed inset-x-0 bottom-auto top-3 m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-lg overflow-y-auto overscroll-contain rounded-3xl border border-white/15 bg-carbon p-4 text-white shadow-2xl backdrop:bg-black/70 sm:top-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
          <h2 id="mobile-menu-title" className="text-lg font-semibold">{t('nav.platform', 'Platform')}</h2>
          <button type="button" autoFocus onClick={closeMenu} aria-label="Close navigation menu"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full hover:bg-white/10">
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-1">{navLinks.map((item) => renderLink(item, true))}</div>
        <div className="mt-4 grid gap-2 border-t border-white/10 pt-4">
          <Link to="/platform/esg" onClick={closeMenu} className="flex min-h-[48px] items-center justify-center rounded-xl bg-emerald px-4 font-semibold text-carbon">
            {t('nav.requestDemo', 'Request Demo')}
          </Link>
          <Link to="/#sectors" onClick={closeMenu} className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/20 px-4 text-sm">
            Explore other prototypes <LogIn size={16} aria-hidden="true" />
          </Link>
          <div className="flex justify-center sm:hidden">{languageButton}</div>
        </div>
      </dialog>
    </nav>
  );
}
