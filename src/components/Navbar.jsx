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
    { id: 'Marketplace', key: 'marketplace', path: '/platform/marketplace' },
    { id: 'Sectors', key: 'sectors' }, 
    { id: 'How It Works', key: 'howItWorks' }, 
    { id: 'Pricing', key: 'pricing' }
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 h-20 flex items-center px-6 lg:px-12 ${
        scrolled || isMobileMenuOpen
          ? 'bg-[#040A06]/85 backdrop-blur-[20px] border-b border-[#00C853]/10'
          : 'bg-transparent'
      }`}
    >
      <div className="flex items-center w-full justify-between max-w-[1400px] mx-auto relative h-full">
        
        {/* Left: Logo */}
        <div className="flex items-center space-x-3 w-1/2 lg:w-1/4 z-50">
          <Link to="/" onClick={closeMenu} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <span className="font-sans font-bold text-registry text-2xl tracking-tight drop-shadow-sm">CarbonOS</span>
            <span className="text-xl drop-shadow-sm">🇧🇩</span>
          </Link>
        </div>

        {/* Center: Glassmorphic Navigation Pill (Desktop Only) */}
        <div className="hidden lg:flex items-center bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] rounded-full pl-8 pr-2 py-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-8 mr-8">
            {navLinks.map((item) => {
              const isHash = ['Platform', 'Sectors', 'Pricing'].includes(item.id);
              const hash = item.id.toLowerCase();

              if (item.path) {
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className="font-sans font-medium text-[13px] text-white/80 hover:text-white transition-colors tracking-wide whitespace-nowrap"
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
                    className="font-sans font-medium text-[13px] text-white/80 hover:text-white transition-colors tracking-wide cursor-pointer whitespace-nowrap"
                  >
                    {t(`nav.${item.key}`)}
                  </a>
                );
              } else {
                return (
                  <Link
                    key={item.id}
                    to="/how-it-works"
                    className="font-sans font-medium text-[13px] text-white/80 hover:text-white transition-colors tracking-wide whitespace-nowrap"
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                );
              }
            })}
          </div>

          {/* Pill CTA Button */}
          <Link to="/how-it-works" className="bg-[#0A1F13] text-emerald border border-emerald/20 font-sans font-bold text-[13px] px-6 py-2.5 rounded-full btn-magnetic hover:bg-[#0D2B1A] transition-colors shadow-inner flex items-center justify-center whitespace-nowrap">
            {t('nav.requestDemo')}
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end space-x-3 sm:space-x-4 w-1/2 lg:w-1/4 z-50">
          
          {/* Language Toggle */}
          <button 
            onClick={toggleLanguage}
            className="ghost-btn font-sans font-bold text-xs px-2 py-1.5 rounded flex items-center space-x-1 sm:space-x-2"
          >
            <span className={i18n.language === 'en' ? 'text-white drop-shadow-sm' : 'text-white/40'}>EN</span>
            <span className="text-white/20">|</span>
            <span className={i18n.language === 'bn' ? 'text-white drop-shadow-sm' : 'text-white/40'}>বাংলা</span>
          </button>

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <Sun size={16} className="icon icon-sun text-amber" />
            <Moon size={16} className="icon icon-moon text-emerald" />
          </button>
          
          {/* Desktop Login */}
          <Link to="/dashboard/farmer/earnings" className="hidden sm:flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity group">
            <span className="font-sans text-[13px] font-medium text-white/80 group-hover:text-white transition-colors">Login</span>
            <LogIn size={16} className="text-white/80 group-hover:text-white transition-colors" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-white/80 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div 
        className={`fixed inset-0 top-0 pt-24 bg-[#040A06]/95 backdrop-blur-3xl transition-transform duration-300 z-40 flex flex-col items-center space-y-8 lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
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
