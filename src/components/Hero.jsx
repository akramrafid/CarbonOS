import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Zap, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Hero = () => {
  const containerRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Background fade
      tl.fromTo('.hero-bg', 
        { scale: 1.05, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 1.5, ease: 'power2.out' }, 
        0
      );

      // Watermark
      tl.fromTo('.hero-watermark',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, ease: 'power3.out' },
        0.2
      );

      // Pill
      tl.fromTo('.hero-pill', 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 
        0.4
      );

      // Headline
      tl.fromTo('.hero-h1', 
        { y: 40, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.15 }, 
        0.5
      );

      // Body & CTA
      tl.fromTo(['.hero-body', '.hero-cta'], 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.1 }, 
        0.8
      );

      // Stat Cards
      tl.fromTo('.hero-stat-card', 
        { x: 40, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.15 }, 
        0.9
      );

      // Awards
      tl.fromTo('.hero-award', 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.1 }, 
        1.1
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div 
        className="hero-bg absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("/hero_landscape.png")' }}
      ></div>
      
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#080F0B]/40 via-transparent to-[#080F0B]/90 mix-blend-multiply"></div>
      <div className="absolute inset-0 z-0 bg-black/20"></div>

      {/* Giant Watermark Text */}
      <div className="hero-watermark absolute top-[15%] left-0 w-full text-center z-0 pointer-events-none select-none overflow-hidden">
        <span className="font-sans font-bold text-[18vw] leading-none text-white/10 tracking-tighter mix-blend-overlay">
          CARBONOS
        </span>
      </div>

      <div className="relative z-10 container mx-auto px-6 lg:px-12 pt-32 pb-12 w-full h-full flex flex-col justify-between">
        
        <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between w-full h-full gap-12 lg:gap-8 mt-auto mb-16 lg:mb-24">
          
          {/* Left Column - Main Content */}
          <div className="w-full lg:w-3/5 flex flex-col items-start text-left pt-12 lg:pt-0">
            
            {/* User Pill */}
            <div className="hero-pill flex items-center space-x-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-1.5 pl-1.5 pr-4 mb-6 lg:mb-8 shadow-lg">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-emerald flex items-center justify-center border-2 border-[#0D2B1A] z-30">
                  <span className="text-[10px] font-bold text-carbon">👨‍🌾</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center border-2 border-[#0D2B1A] z-20">
                  <span className="text-[10px] font-bold text-white">👩‍💼</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-amber flex items-center justify-center border-2 border-[#0D2B1A] z-10">
                  <span className="text-xl font-bold text-carbon">+</span>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex text-amber text-[10px]">★★★★★</div>
                <span className="font-sans text-[10px] font-medium text-white">{t('hero.users')}</span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="flex flex-col mb-4 lg:mb-6 w-full">
              <span className="hero-h1 font-sans font-bold text-4xl sm:text-[48px] lg:text-[72px] leading-[1.1] text-white tracking-tight">
                {t('hero.title1')} <br className="hidden sm:block"/>
                {t('hero.title2')}
              </span>
              <span className="hero-h1 serif-drama italic text-5xl sm:text-[56px] lg:text-[84px] leading-[1.1] lg:leading-[1] text-emerald mt-1">
                {t('hero.title3')}
              </span>
            </h1>

            {/* Description */}
            <p className="hero-body font-sans text-base sm:text-lg lg:text-xl text-white/90 max-w-[500px] leading-relaxed mb-8 drop-shadow-md">
              {t('hero.description')}
            </p>

            {/* CTA */}
            <Link 
              to="/platform/carbon-registry" 
              className="hero-cta bg-[#D4FF00] text-[#0A1F13] font-sans font-bold text-sm sm:text-base px-6 sm:px-8 py-3.5 sm:py-4 rounded-full flex items-center justify-center space-x-3 hover:bg-[#BDE600] transition-transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(212,255,0,0.3)] w-fit"
            >
              <span>{t('hero.cta')}</span>
              <Zap size={18} className="fill-current sm:w-5 sm:h-5" />
            </Link>
          </div>

          {/* Right Column - Stats & Awards */}
          <div className="w-full lg:w-2/5 flex flex-col items-start lg:items-end space-y-8 lg:space-y-12 mt-8 lg:mt-0">
            
            {/* Stat Cards */}
            <div className="flex flex-row gap-4 w-full justify-start lg:justify-end">
              <div className="hero-stat-card w-1/2 max-w-[160px] lg:max-w-[180px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl lg:rounded-[2rem] p-5 lg:p-6 shadow-2xl flex flex-col justify-between aspect-square">
                <span className="font-sans font-bold text-2xl sm:text-3xl lg:text-4xl text-white">{t('hero.stat1Value')}</span>
                <span className="font-sans text-xs sm:text-sm text-white/80 leading-tight mt-2 lg:mt-4">{t('hero.stat1Label')}</span>
              </div>
              <div className="hero-stat-card w-1/2 max-w-[160px] lg:max-w-[180px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl lg:rounded-[2rem] p-5 lg:p-6 shadow-2xl flex flex-col justify-between aspect-square">
                <span className="font-sans font-bold text-2xl sm:text-3xl lg:text-4xl text-white">{t('hero.stat2Value')}</span>
                <span className="font-sans text-xs sm:text-sm text-white/80 leading-tight mt-2 lg:mt-4">{t('hero.stat2Label')}</span>
              </div>
            </div>

            {/* Awards */}
            <div className="flex flex-row justify-start lg:justify-end space-x-4 sm:space-x-6 w-full pt-4 border-t border-white/20">
              <div className="hero-award flex flex-col items-center text-center max-w-[100px]">
                <ShieldCheck size={28} className="text-emerald mb-2 opacity-80" />
                <span className="font-sans text-[10px] font-bold text-white uppercase tracking-wider">{t('hero.award1')}</span>
              </div>
              <div className="hero-award flex flex-col items-center text-center max-w-[100px]">
                <CheckCircle2 size={28} className="text-emerald mb-2 opacity-80" />
                <span className="font-sans text-[10px] font-bold text-white uppercase tracking-wider">{t('hero.award2')}</span>
              </div>
              <div className="hero-award flex flex-col items-center text-center max-w-[100px]">
                <Award size={28} className="text-emerald mb-2 opacity-80" />
                <span className="font-sans text-[10px] font-bold text-white uppercase tracking-wider">{t('hero.award3')}</span>
              </div>
            </div>

          </div>

        </div>
      </div>
      
      {/* Sentinel for Navbar */}
      <div id="hero-sentinel" className="absolute bottom-0 w-full h-1"></div>
    </section>
  );
};

export default Hero;
