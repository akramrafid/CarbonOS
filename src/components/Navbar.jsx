import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import BrandLogo from './BrandLogo';
import RequestDemoModal from './RequestDemoModal';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';
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

  // Handle hash-based nav clicks (Platform, Sectors)
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

  // Close mobile menu on route change or Escape
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileMenuOpen]);

  const navLinks = [
    { id: 'Farmers AI', key: 'farmersAi', path: '/farmers-ai' },
    { id: 'Carbon Credit', key: 'carbonCredit', path: '/carbon-monitoring' },
    { id: 'Marketplace', key: 'marketplace', path: '/platform/marketplace' },
    { id: 'Carbon Registry', key: 'carbonRegistry', path: '/platform/carbon-registry' },
    { id: 'ESG', key: 'esg', path: '/esg' }
  ];

  return (
    <>
    <nav className="fixed top-3 sm:top-5 left-0 w-full z-50 flex justify-center px-2.5 sm:px-5 xl:px-8 pointer-events-none pt-[env(safe-area-inset-top)]">
      <div 
        className={`w-full max-w-[1780px] rounded-full border transition-all duration-500 ease-out flex items-center justify-between px-3 sm:px-5 lg:px-6 xl:px-8 py-1.5 sm:py-2.5 pointer-events-auto gap-1.5 sm:gap-3 ${
          isLight
            ? 'bg-white/92 backdrop-blur-xl border-[#0F291B]/12 shadow-[0_10px_30px_-10px_rgba(15,41,27,0.10)]'
            : scrolled 
              ? 'bg-[#040A06]/85 dark:bg-[#040A06]/85 backdrop-blur-xl border-emerald/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)]' 
              : 'bg-[#040A06]/60 dark:bg-[#040A06]/60 backdrop-blur-md border-white/10'
        }`}
      >
        {/* Left Side: Brand Logo */}
        <div className="flex items-center shrink-0 min-w-0">
          <Link to="/" aria-label="CarbonZero BD Home" className="flex items-center group min-h-[40px] sm:min-h-[44px]">
            <BrandLogo
              variant="auto"
              heightClass="h-[22px] min-[375px]:h-6 sm:h-7"
              showBdBadge={true}
            />
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <div className="hidden lg:flex items-center space-x-0.5 xl:space-x-1 bg-white/[0.03] border border-white/5 rounded-full p-1 xl:p-1.5 backdrop-blur-sm min-w-0">
          {navLinks.map((item) => {
            const isHash = ['Platform', 'Sectors'].includes(item.id);
            const hash = item.id.toLowerCase();

            if (item.path) {
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className="font-sans text-[11.5px] xl:text-[13px] font-medium text-white/80 hover:text-white px-2 xl:px-3.5 py-1.5 rounded-full transition-all duration-300 hover:bg-white/5 whitespace-nowrap"
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
                  className="font-sans text-[11.5px] xl:text-[13px] font-medium text-white/80 hover:text-white px-2 xl:px-3.5 py-1.5 rounded-full transition-all duration-300 hover:bg-white/5 cursor-pointer whitespace-nowrap"
                >
                  {t(`nav.${item.key}`)}
                </a>
              );
            } else {
              return (
                <button
                  key={item.id}
                  className="font-sans text-[11.5px] xl:text-[13px] font-medium text-white/80 hover:text-white px-2 xl:px-3.5 py-1.5 rounded-full transition-all duration-300 hover:bg-white/5 cursor-pointer whitespace-nowrap"
                >
                  {t(`nav.${item.key}`)}
                </button>
              );
            }
          })}

          {/* Request Demo Pill Button */}
          <button
            type="button"
            onClick={() => setIsDemoModalOpen(true)}
            className="font-mono text-[10px] xl:text-[11px] font-bold text-white bg-[#0A1F13] hover:bg-[#00C853] hover:text-[#0A1F13] border border-[#00C853]/40 px-2.5 xl:px-3.5 py-1.5 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(0,200,83,0.15)] ml-1 xl:ml-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t('nav.requestDemo', '[Request Demo]')}
          </button>
        </div>

        {/* Right Side: Language Switcher, Theme Toggle, Login, Mobile Menu Toggle */}
        <div className="flex items-center justify-end space-x-1 sm:space-x-2 xl:space-x-3 shrink-0 z-50">
          
          {/* Language Toggle */}
          <button 
            onClick={toggleLanguage}
            aria-label={`Current language is ${i18n.language === 'en' ? 'English' : 'Bengali'}. Click to switch language`}
            className="ghost-btn font-sans font-bold text-[11px] sm:text-xs px-2 sm:px-2.5 py-1.5 min-h-[40px] sm:min-h-[44px] min-w-[40px] sm:min-w-[44px] rounded-lg flex items-center justify-center space-x-1 focus-visible:ring-2 focus-visible:ring-emerald/60 focus:outline-none whitespace-nowrap"
          >
            <span className={i18n.language === 'en' ? 'text-white drop-shadow-sm' : 'text-white/40'}>EN</span>
            <span className="text-white/20">|</span>
            <span className={i18n.language === 'bn' ? 'text-white drop-shadow-sm' : 'text-white/40'}>বাংলা</span>
          </button>

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="theme-toggle min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] shrink-0 focus-visible:ring-2 focus-visible:ring-emerald/60 focus:outline-none"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <Sun size={16} className="icon icon-sun text-amber" />
            <Moon size={16} className="icon icon-moon text-emerald" />
          </button>
          
          {/* Desktop Login */}
          <Link
            to="/dashboard/farmer/earnings"
            aria-label="Login"
            title="Login to Registry"
            className="hidden sm:flex items-center space-x-1.5 xl:space-x-2 cursor-pointer hover:opacity-80 transition-opacity group min-h-[44px] min-w-[40px] px-1.5 xl:px-2 shrink-0"
          >
            <span className="hidden xl:inline font-sans text-[13px] font-medium text-white/80 group-hover:text-white transition-colors">Login</span>
            <LogIn size={16} className="text-white/80 group-hover:text-white transition-colors" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] p-1.5 sm:p-2 flex items-center justify-center text-white/80 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-emerald/60 focus:outline-none rounded-lg shrink-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu-drawer"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div 
        id="mobile-menu-drawer"
        className={`fixed inset-0 top-0 pt-20 pb-[max(2rem,env(safe-area-inset-bottom))] bg-[#040A06]/95 backdrop-blur-3xl transition-all duration-300 z-40 flex flex-col items-center overflow-y-auto lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0 opacity-100 visible pointer-events-auto' : 'translate-x-full opacity-0 invisible pointer-events-none'
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <button
          type="button"
          onClick={closeMenu}
          aria-label="Dismiss navigation drawer"
          className="fixed top-5 right-5 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center border border-white/20 bg-white/10 text-white hover:border-emerald transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
        <div className="flex flex-col items-center space-y-3 sm:space-y-5 w-full max-w-md px-5 my-auto">
          <BrandLogo variant="auto" heightClass="h-7" showBdBadge={true} className="mb-2" />
          {navLinks.map((item) => {
            const isHash = ['Platform', 'Sectors'].includes(item.id);
            const hash = item.id.toLowerCase();

            if (item.path) {
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={closeMenu}
                  className="font-sans font-bold text-lg sm:text-2xl text-white/90 hover:text-white transition-colors tracking-wide text-center w-full border-b border-white/10 py-3"
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
                  className="font-sans font-bold text-lg sm:text-2xl text-white/90 hover:text-white transition-colors tracking-wide text-center w-full border-b border-white/10 py-3 cursor-pointer"
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
                  className="font-sans font-bold text-lg sm:text-2xl text-white/90 hover:text-white transition-colors tracking-wide text-center w-full border-b border-white/10 py-3"
                >
                  {t(`nav.${item.key}`)}
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
            className="w-full mt-3 bg-emerald text-carbon font-sans font-bold text-base sm:text-lg px-6 py-3.5 rounded-full transition-colors shadow-lg flex items-center justify-center cursor-pointer min-h-[48px]"
          >
            {t('nav.requestDemo', '[Request Demo]')}
          </button>
          
          <Link to="/dashboard/farmer/earnings" onClick={closeMenu} className="w-full mt-2 ghost-btn border border-white/20 text-white font-sans font-bold text-base sm:text-lg px-6 py-3.5 rounded-full flex items-center justify-center space-x-2 transition-colors min-h-[48px]">
            <span>Login to Registry</span>
            <LogIn size={18} />
          </Link>
        </div>
      </div>

    </nav>

      {/* Enterprise Demo Request Modal (outside pointer-events-none nav stacking context) */}
      <RequestDemoModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;
