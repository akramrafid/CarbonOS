import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'bn' : 'en');
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

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
      // Already on home — just scroll
      scrollToHash(hash);
    } else {
      // Let React Router handle the navigation + the useEffect below handles the scroll
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

  // Handle initial hash on page load (e.g. user lands on /#platform)
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const hash = location.hash.replace('#', '');
      setTimeout(() => scrollToHash(hash), 200);
    }
  }, [location, scrollToHash]);

  const navLinks = [
    { id: 'Platform', key: 'platform' }, 
    { id: 'Farmers AI', key: 'farmersAi', path: '/farmers-ai' },
    { id: 'Carbon Credit', key: 'carbonCredit', path: '/carbon-monitoring' },
    { id: 'Marketplace', key: 'marketplace', path: '/platform/marketplace' },
    { id: 'Sectors', key: 'sectors' }, 
    { id: 'How It Works', key: 'howItWorks', path: '/how-it-works' }, 
    { id: 'Pricing', key: 'pricing' }
  ];

  return (
    <nav className="fixed top-6 left-0 w-full z-50 flex justify-center px-4 sm:px-8 pointer-events-none">
      <div 
        className={`w-full max-w-[1780px] rounded-full border transition-all duration-500 ease-out flex items-center justify-between px-6 sm:px-8 py-2.5 sm:py-3 pointer-events-auto gap-4 ${
          scrolled 
            ? 'bg-[#040A06]/85 dark:bg-[#040A06]/85 backdrop-blur-xl border-emerald/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)]' 
            : 'bg-[#040A06]/60 dark:bg-[#040A06]/60 backdrop-blur-md border-white/10'
        }`}
      >
        {/* Left Side: Brand Logo */}
        <div className="flex items-center space-x-3 shrink-0">
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="serif-drama text-2xl font-bold tracking-wider text-white group-hover:text-emerald transition-colors whitespace-nowrap">
              Carbon<span className="text-emerald">Zero</span>
            </span>
            <span className="font-mono text-[9px] bg-emerald/10 border border-emerald/20 text-emerald px-1.5 py-0.5 rounded tracking-widest uppercase whitespace-nowrap">
              BD
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <div className="hidden lg:flex items-center space-x-1 bg-white/[0.03] border border-white/5 rounded-full p-1.5 backdrop-blur-sm shrink-0">
          {navLinks.map((item) => {
            const isHash = ['Platform', 'Sectors', 'Pricing'].includes(item.id);
            const hash = item.id.toLowerCase();

            if (item.path) {
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className="font-sans text-[13px] font-medium text-white/80 hover:text-white px-3.5 py-1.5 rounded-full transition-all duration-300 hover:bg-white/5 whitespace-nowrap"
                >
                  {t(`nav.${item.key}`, item.id)}
                </Link>
              );
            } else if (isHash) {
              return (
                <a
                  key={item.id}
                  href={`/#${hash}`}
                  onClick={(e) => handleHashClick(e, hash)}
                  className="font-sans text-[13px] font-medium text-white/80 hover:text-white px-3.5 py-1.5 rounded-full transition-all duration-300 hover:bg-white/5 cursor-pointer whitespace-nowrap"
                >
                  {t(`nav.${item.key}`)}
                </a>
              );
            } else {
              return (
                <button
                  key={item.id}
                  className="font-sans text-[13px] font-medium text-white/80 hover:text-white px-3.5 py-1.5 rounded-full transition-all duration-300 hover:bg-white/5 cursor-pointer whitespace-nowrap"
                >
                  {t(`nav.${item.key}`)}
                </button>
              );
            }
          })}

          {/* Request Demo Pill Button */}
          <Link
            to="/platform/saas"
            className="font-mono text-[11px] font-bold text-white bg-[#0A1F13] hover:bg-[#00C853] hover:text-[#0A1F13] border border-[#00C853]/40 px-3.5 py-1.5 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(0,200,83,0.15)] ml-2 whitespace-nowrap shrink-0"
          >
            [Request Demo]
          </Link>
        </div>

        {/* Right Side: Language Switcher, Theme Toggle, Login, Mobile Menu Toggle */}
        <div className="flex items-center justify-end space-x-2 sm:space-x-3 shrink-0 z-50">
          
          {/* Language Toggle */}
          <button 
            onClick={toggleLanguage}
            aria-label={`Current language is ${i18n.language === 'en' ? 'English' : 'Bengali'}. Click to switch language`}
            className="ghost-btn font-sans font-bold text-xs px-2.5 py-1.5 min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center space-x-1 sm:space-x-2 focus-visible:ring-2 focus-visible:ring-emerald/60 focus:outline-none"
          >
            <span className={i18n.language === 'en' ? 'text-white drop-shadow-sm' : 'text-white/40'}>EN</span>
            <span className="text-white/20">|</span>
            <span className={i18n.language === 'bn' ? 'text-white drop-shadow-sm' : 'text-white/40'}>বাংলা</span>
          </button>

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="theme-toggle min-w-[44px] min-h-[44px] focus-visible:ring-2 focus-visible:ring-emerald/60 focus:outline-none"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <Sun size={16} className="icon icon-sun text-amber" />
            <Moon size={16} className="icon icon-moon text-emerald" />
          </button>
          
          {/* Desktop Login */}
          <Link to="/dashboard/farmer/earnings" className="hidden sm:flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity group min-h-[44px] px-2">
            <span className="font-sans text-[13px] font-medium text-white/80 group-hover:text-white transition-colors">Login</span>
            <LogIn size={16} className="text-white/80 group-hover:text-white transition-colors" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden min-w-[44px] min-h-[44px] p-2 flex items-center justify-center text-white/80 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-emerald/60 focus:outline-none rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu-drawer"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div 
        id="mobile-menu-drawer"
        className={`fixed inset-0 top-0 pt-24 bg-[#040A06]/95 backdrop-blur-3xl transition-transform duration-300 z-40 flex flex-col items-center space-y-8 lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="flex flex-col items-center space-y-6 w-full px-6">
          {navLinks.map((item) => {
            const isHash = ['Platform', 'Sectors', 'Pricing'].includes(item.id);
            const hash = item.id.toLowerCase();

            if (item.path) {
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={closeMenu}
                  className="font-sans font-bold text-2xl text-white/90 hover:text-white transition-colors tracking-wide text-center w-full border-b border-white/10 pb-4"
                >
                  {t(`nav.${item.key}`, item.id)}
                </Link>
              );
            } else if (isHash) {
              return (
                <a
                  key={item.id}
                  href={`/#${hash}`}
                  onClick={(e) => handleHashClick(e, hash)}
                  className="font-sans font-bold text-2xl text-white/90 hover:text-white transition-colors tracking-wide text-center w-full border-b border-white/10 pb-4 cursor-pointer"
                >
                  {t(`nav.${item.key}`)}
                </a>
              );
            } else {
              return (
                <Link
                  key={item.id}
                  to="/how-it-works"
                  onClick={closeMenu}
                  className="font-sans font-bold text-2xl text-white/90 hover:text-white transition-colors tracking-wide text-center w-full border-b border-white/10 pb-4"
                >
                  {t(`nav.${item.key}`)}
                </Link>
              );
            }
          })}
          
          <Link to="/how-it-works" onClick={closeMenu} className="w-full max-w-sm mt-4 bg-emerald text-carbon font-sans font-bold text-lg px-8 py-4 rounded-full transition-colors shadow-lg flex items-center justify-center">
            {t('nav.requestDemo')}
          </Link>
          
          <Link to="/dashboard/farmer/earnings" onClick={closeMenu} className="w-full max-w-sm mt-2 ghost-btn border border-white/20 text-white font-sans font-bold text-lg px-8 py-4 rounded-full flex items-center justify-center space-x-2 transition-colors">
            <span>Login to Registry</span>
            <LogIn size={20} />
          </Link>
        </div>
      </div>

    </nav>
  );
};

export default Navbar;
