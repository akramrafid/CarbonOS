import React from 'react';
import { Camera, LayoutDashboard, ArrowRight } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';

export function FarmersHero({ lang, text }) {
  return (
    <div
      className="keep-white relative rounded-[32px] overflow-hidden mb-12 bg-cover bg-center min-h-[520px] md:min-h-[600px] flex items-center border border-white/10 shadow-3xl"
      style={{ backgroundImage: 'url(/farmers_hero_banner.png)' }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to right, rgba(8,15,11,0.92), rgba(8,15,11,0.75), rgba(8,15,11,0.35))' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
        <div className="lg:col-span-7 text-left space-y-6 rounded-3xl p-4 sm:p-6" style={{ backgroundColor: 'rgba(8, 15, 11, 0.72)' }}>
          <PageHeader
            badge={
              <div className="inline-flex items-center space-x-2 bg-red-500/20 border border-red-400/40 px-4 py-2 rounded-full">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                <span className="text-red-300 font-sans text-xs font-semibold uppercase tracking-wider">{text.problemTitle}</span>
              </div>
            }
            title={<>{lang === 'en' ? 'Bringing Innovation to' : 'ফসল সুরক্ষায় আনুন'} <br /><span className="text-lime-400">{lang === 'en' ? 'Your Farming Journey' : 'টেকসই ও আধুনিক প্রযুক্তি'}</span></>}
            description={text.problemDesc}
            className="border-none mb-0 pb-0"
            titleClassName="!text-3xl sm:!text-4xl md:!text-6xl font-sans !font-extrabold !text-white !leading-tight !tracking-tight"
          />

          <div className="flex flex-wrap gap-4 pt-4">
            <a
              href="#ai-scanner"
              className="inline-flex items-center justify-center space-x-2 bg-accent hover:bg-accent-hover text-fg-inverse font-sans font-bold text-base px-8 py-4 rounded-full transition-all hover:scale-105 shadow-lg cursor-pointer"
            >
              <Camera size={20} />
              <span>{text.ctaCamera}</span>
            </a>

            <a
              href="#harvestguard-dashboard"
              className="inline-flex items-center justify-center space-x-2 text-white border border-white/25 font-sans font-bold text-base px-8 py-4 rounded-full transition-all hover:border-lime-400 cursor-pointer"
              style={{ backgroundColor: 'rgba(8, 15, 11, 0.78)' }}
            >
              <LayoutDashboard size={20} className="text-lime-400" />
              <span>{text.ctaDashboard}</span>
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 backdrop-blur-md border border-white/15 p-8 rounded-[28px] text-left space-y-4 hover:border-lime-400/40 transition-all duration-300 shadow-xl relative overflow-hidden group" style={{ backgroundColor: 'rgba(8, 15, 11, 0.82)' }}>
          <div className="text-white/60 text-xs font-bold uppercase tracking-wider">{text.solutionTitle}</div>
          <h3 className="text-2xl font-bold text-lime-400">
            {lang === 'en' ? 'Sustainable Farming Tech' : 'টেকসই কৃষি প্রযুক্তি'}
          </h3>
          <p className="text-sm text-white/80 leading-relaxed font-sans">
            {text.solutionDesc}
          </p>
          <div className="pt-6 border-t border-white/10 flex items-center justify-between">
            <a href="#harvestguard-dashboard" className="text-white hover:text-lime-400 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors">
              <span>{lang === 'en' ? 'Learn More' : 'আরও জানুন'}</span>
              <ArrowRight size={14} className="text-lime-400" />
            </a>
            <div className="flex space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FarmersHero;
