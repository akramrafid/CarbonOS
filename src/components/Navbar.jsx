import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import RequestDemoModal from './RequestDemoModal';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const mobileDrawerRef = useRef(null);
  const mobileToggleRef = useRef(null);
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'bn' : 'en');
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  // Lock body scroll + Escape & Tab focus trap when mobile drawer is open
  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = '';
      return undefined;
    }

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        mobileToggleRef.current?.focus();
        return;
      }
      if (e.key === 'Tab' && mobileDrawerRef.current) {
        const focusable = mobileDrawerRef.current.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    const focusTimer = setTimeout(() => {
      const firstLink = mobileDrawerRef.current?.querySelector('a[href], button:not([disabled])');
      firstLink?.focus();
    }, 50);

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Helper: scroll to a hash target on the home page
  const scrollToHash = useCallback((hash) => {
    const el = document.getElementById(hash);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Handle hash-based nav clicks (Platform, Sectors, Pricing)
  const handleHashClick = useCallback((e, hash) => {
    e.preventDefault();
    closeMenu();

    if (location.pathname === '/') {
      scrollToHash(hash);
    } else {
      navigate(`/#${hash}`);
    }
  }, [location.pathname, navigate, scrollToHash]);

  useEffect(() => {
    const sentinel = document.getElementById('hero-sentinel');
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Handle initial hash on page load
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const hash = location.hash.replace('#', '');
      setTimeout(() => scrollToHash(hash), 200);
    }
  }, [location, scrollToHash]);

  const navLinks = [
    { id: 'Platform', key: 'platform', path: '/platform/saas-dashboard' },
    { id: 'Farmers AI', key: 'farmersAi', path: '/farmers-ai' },
    { id: 'Carbon Credit', key: 'carbonCredit', path: '/carbon-monitoring' },
    { id: 'Marketplace', key: 'marketplace', path: '/platform/marketplace' },
    { id: 'Carbon Registry', key: 'carbonRegistry', path: '/platform/carbon-registry' },
    { id: 'Sectors', key: 'sectors', isHash: true },
    { id: 'Pricing', key: 'pricing', isHash: true },
  ];

  return (
    <nav className="fixed bottom-3 sm:bottom-6 left-0 w-full z-50 flex justify-center px-2 sm:px-6 pointer-events-none">
      <div
        className={`w-full max-w-[1780px] rounded-full border transition-all duration-300 ease-out flex items-center justify-between px-3.5 sm:px-6 py-2 sm:py-2.5 pointer-events-auto gap-2 sm:gap-4 ${scrolled
            ? 'bg-bg-surface dark:bg-bg-elevated border-emerald/30 shadow-[0_12px_40px_rgba(0,0,0,0.6)]'
            : 'bg-bg-surface/95 dark:bg-bg-elevated/95 border-border-strong/60 shadow-[0_12px_40px_rgba(0,0,0,0.45)]'
          }`}
      >
        {/* Left Side: Brand Logo */}
        <div className="flex items-center space-x-3 shrink-0">
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="serif-drama text-lg sm:text-2xl font-bold tracking-wider text-white group-hover:text-emerald transition-colors whitespace-nowrap">
              Carbon<span className="text-emerald">Zero</span>
            </span>
            <span className="font-mono text-[9px] bg-emerald/10 border border-emerald/20 text-emerald px-1.5 py-0.5 rounded tracking-widest uppercase whitespace-nowrap">
              BD
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links (xl+ only to prevent 1024px overflow) */}
        <div className="hidden xl:flex items-center space-x-1 bg-bg-canvas/80 border border-border-subtle rounded-full p-1.5 shrink-0">
          {navLinks.map((item) => {
            const isActive = item.path && location.pathname === item.path;
            const hash = item.id.toLowerCase();

            if (item.path) {
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`font-sans text-[13px] font-medium px-3.5 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap ${isActive
                      ? 'bg-emerald/20 text-emerald border border-emerald/30 shadow-[0_0_10px_rgba(0,200,83,0.15)] font-semibold'
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {t(`nav.${item.key}`, item.id)}
                </Link>
              );
            } else if (item.isHash) {
              return (
                <a
                  key={item.id}
                  href={`/#${hash}`}
                  onClick={(e) => handleHashClick(e, hash)}
                  className="font-sans text-[13px] font-medium text-white/80 hover:text-white px-3.5 py-1.5 rounded-full transition-all duration-200 hover:bg-white/5 cursor-pointer whitespace-nowrap"
                >
                  {t(`nav.${item.key}`, item.id)}
                </a>
              );
            } else {
              return (
                <button
                  key={item.id}
                  className="font-sans text-[13px] font-medium text-white/80 hover:text-white px-3.5 py-1.5 rounded-full transition-all duration-200 hover:bg-white/5 cursor-pointer whitespace-nowrap"
                >
                  {t(`nav.${item.key}`, item.id)}
                </button>
              );
            }
          })}

          {/* Request Demo Pill Button */}
          <button
            type="button"
            onClick={() => setIsDemoModalOpen(true)}
            className="font-mono text-[11px] font-bold text-white bg-bg-elevated hover:bg-accent hover:text-bg-canvas border border-border-strong/40 px-3.5 py-1.5 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(0,200,83,0.15)] ml-2 whitespace-nowrap shrink-0 cursor-pointer min-h-[44px] inline-flex items-center"
          >
            {t('nav.requestDemo', '[Request Demo]')}
          </button>
        </div>

        {/* Right Side: Language Switcher, Theme Toggle, Login, Mobile Menu Toggle */}
        <div className="flex items-center justify-end space-x-1 sm:space-x-3 shrink-0 z-50">

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            aria-label={`Current language is ${i18n.language === 'en' ? 'English' : 'Bengali'}. Click to switch language`}
            className="ghost-btn font-sans font-bold text-xs px-2.5 py-1.5 min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center space-x-1 sm:space-x-2 focus-visible:ring-2 focus-visible:ring-emerald/60 focus:outline-none cursor-pointer"
          >
            <span className={i18n.language === 'en' ? 'text-white drop-shadow-sm' : 'text-white/40'}>EN</span>
            <span className="text-white/20">|</span>
            <span className={i18n.language === 'bn' ? 'text-white drop-shadow-sm' : 'text-white/40'}>বাংলা</span>
          </button>

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="theme-toggle min-w-[44px] min-h-[44px] focus-visible:ring-2 focus-visible:ring-emerald/60 focus:outline-none cursor-pointer"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <Sun size={16} className="icon icon-sun text-amber" />
            <Moon size={16} className="icon icon-moon text-emerald" />
          </button>

          {/* Desktop Login */}
          {/* [COMMENTED OUT FOR PERSONAL REFERENCE — Login routed to farmer earnings page instead of ESG Auth Workspace] */}
          {/* <Link to="/dashboard/farmer/earnings" ...> */}
          <Link to="/platform/esg" className="hidden sm:flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity group min-h-[44px] px-2">
            <span className="font-sans text-[13px] font-medium text-white/80 group-hover:text-white transition-colors">Login</span>
            <LogIn size={16} className="text-white/80 group-hover:text-white transition-colors" />
          </Link>

          {/* Mobile Menu Toggle - Accessible Animated Morphing Hamburger */}
          <button
            ref={mobileToggleRef}
            className="xl:hidden min-w-[44px] min-h-[44px] p-2 flex flex-col items-center justify-center text-white/80 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-emerald/60 focus:outline-none rounded-lg cursor-pointer space-y-1.5"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu-drawer"
          >
            <span
              className={`w-6 h-0.5 bg-white rounded-full transition-transform duration-300 transform origin-center ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`}
            />
            <span
              className={`w-6 h-0.5 bg-white rounded-full transition-opacity duration-200 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}
            />
            <span
              className={`w-6 h-0.5 bg-white rounded-full transition-transform duration-300 transform origin-center ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
            />
          </button>

        </div>
      </div>

      {/* Mobile Menu Drawer - Responsive with Vertical Scrolling & Scroll-Lock */}
      <div
        ref={mobileDrawerRef}
        id="mobile-menu-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
        className={`fixed inset-0 top-0 pt-16 bg-bg-canvas transition-[transform,opacity] duration-300 z-40 flex flex-col items-center xl:hidden overflow-y-auto max-h-[100dvh] pb-[max(5rem,env(safe-area-inset-bottom,5rem))] ${isMobileMenuOpen
            ? 'translate-x-0 opacity-100 visible pointer-events-auto'
            : 'translate-x-full opacity-0 invisible pointer-events-none'
          }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="flex flex-col items-center space-y-5 w-full px-6 py-4">
          {navLinks.map((item) => {
            const isActive = item.path && location.pathname === item.path;
            const hash = item.id.toLowerCase();

            if (item.path) {
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={closeMenu}
                  className={`font-sans font-bold text-xl transition-colors tracking-wide text-center w-full border-b border-white/10 pb-3 min-h-[44px] flex items-center justify-center ${isActive ? 'text-emerald' : 'text-white/90 hover:text-white'
                    }`}
                >
                  {t(`nav.${item.key}`, item.id)}
                </Link>
              );
            } else if (item.isHash) {
              return (
                <a
                  key={item.id}
                  href={`/#${hash}`}
                  onClick={(e) => handleHashClick(e, hash)}
                  className="font-sans font-bold text-xl text-white/90 hover:text-white transition-colors tracking-wide text-center w-full border-b border-white/10 pb-3 cursor-pointer min-h-[44px] flex items-center justify-center"
                >
                  {t(`nav.${item.key}`, item.id)}
                </a>
              );
            } else {
              return (
                <Link
                  key={item.id}
                  to="/how-it-works"
                  onClick={closeMenu}
                  className="font-sans font-bold text-xl text-white/90 hover:text-white transition-colors tracking-wide text-center w-full border-b border-white/10 pb-3 min-h-[44px] flex items-center justify-center"
                >
                  {t(`nav.${item.key}`, item.id)}
                </Link>
              );
            }
          })}

          <button
            type="button"
            onClick={() => {
              closeMenu();
              setIsDemoModalOpen(true);
            }}
            className="w-full max-w-sm mt-4 bg-emerald text-carbon font-sans font-bold text-base px-6 py-3.5 rounded-full transition-colors shadow-lg flex items-center justify-center cursor-pointer min-h-[48px]"
          >
            {t('nav.requestDemo', '[Request Demo]')}
          </button>

          <Link
            to="/platform/esg"
            onClick={closeMenu}
            className="w-full max-w-sm mt-2 ghost-btn border border-white/20 text-white font-sans font-bold text-base px-6 py-3.5 rounded-full flex items-center justify-center space-x-2 transition-colors min-h-[48px]"
          >
            <span>Login to Registry</span>
            <LogIn size={18} />
          </Link>
        </div>
      </div>

      {/* Enterprise Demo Request Modal - Preserved from main */}
      <RequestDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />

    </nav>
  );
};

export default Navbar;
