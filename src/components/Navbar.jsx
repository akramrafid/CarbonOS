import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'bn' : 'en');
  };

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

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 h-20 flex items-center px-6 lg:px-12 ${
        scrolled
          ? 'bg-[#040A06]/85 backdrop-blur-[20px] border-b border-[#00C853]/10'
          : 'bg-transparent'
      }`}
    >
      <div className="flex items-center w-full justify-between max-w-[1400px] mx-auto relative h-full">
        
        {/* Left: Logo */}
        <div className="flex items-center space-x-3 w-1/4">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <span className="font-sans font-bold text-registry text-2xl tracking-tight drop-shadow-sm">CarbonOS</span>
            <span className="text-xl drop-shadow-sm">🇧🇩</span>
          </Link>
        </div>

        {/* Center: Glassmorphic Navigation Pill */}
        <div className="hidden lg:flex items-center bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] rounded-full pl-8 pr-2 py-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-8 mr-8">
            {[
              { id: 'Platform', key: 'platform' }, 
              { id: 'Sectors', key: 'sectors' }, 
              { id: 'How It Works', key: 'howItWorks' }, 
              { id: 'Pricing', key: 'pricing' }
            ].map((item) => {
              const isHash = ['Platform', 'Sectors', 'Pricing'].includes(item.id);
              let path = '';
              if (isHash) path = `/#${item.id.toLowerCase()}`;
              else if (item.id === 'How It Works') path = `/how-it-works`;

              return isHash ? (
                <a
                  key={item.id}
                  href={path}
                  className="font-sans font-medium text-[13px] text-white/80 hover:text-white transition-colors tracking-wide"
                >
                  {t(`nav.${item.key}`)}
                </a>
              ) : (
                <Link
                  key={item.id}
                  to={path}
                  className="font-sans font-medium text-[13px] text-white/80 hover:text-white transition-colors tracking-wide"
                >
                  {t(`nav.${item.key}`)}
                </Link>
              );
            })}
          </div>

          {/* Pill CTA Button */}
          <button className="bg-[#0A1F13] text-emerald border border-emerald/20 font-sans font-bold text-[13px] px-6 py-2.5 rounded-full btn-magnetic hover:bg-[#0D2B1A] transition-colors shadow-inner">
            {t('nav.requestDemo')}
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end space-x-6 w-1/4">
          
          <button 
            onClick={toggleLanguage}
            className="ghost-btn font-sans font-bold text-xs px-3 py-1.5 rounded flex items-center space-x-2"
          >
            <span className={i18n.language === 'en' ? 'text-white drop-shadow-sm' : 'text-white/40'}>EN</span>
            <span className="text-white/20">|</span>
            <span className={i18n.language === 'bn' ? 'text-white drop-shadow-sm' : 'text-white/40'}>বাংলা</span>
          </button>
          
          <div className="hidden sm:flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity group">
            <span className="font-sans text-[13px] font-medium text-white/80 group-hover:text-white transition-colors">Login</span>
            <LogIn size={16} className="text-white/80 group-hover:text-white transition-colors" />
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
