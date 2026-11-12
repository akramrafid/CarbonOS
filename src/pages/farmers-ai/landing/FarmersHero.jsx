import React from 'react';
import { Camera, LayoutDashboard, ArrowRight } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';

export function FarmersHero({ lang, text }) {
  return (
    <div 
      className="relative rounded-[32px] overflow-hidden mb-20 bg-cover bg-center min-h-[550px] md:min-h-[620px] flex items-center border border-white/10 shadow-3xl"
      style={{ backgroundImage: 'url(/farmers_hero_banner.png)' }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-carbon via-carbon/85 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-carbon via-transparent to-black/35" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
        <div className="lg:col-span-7 text-left space-y-6">
          <PageHeader
            badge={
              <div className="inline-flex items-center space-x-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-red-400 font-sans text-xs font-semibold uppercase tracking-wider">{text.problemTitle}</span>
              </div>
            }
            title={<>{lang === 'en' ? 'Bringing Innovation to' : 'ফসল সুরক্ষায় আনুন'} <br /><span className="text-lime-400">{lang === 'en' ? 'Your Farming Journey' : 'টেকসই ও আধুনিক প্রযুক্তি'}</span></>}
            description={text.problemDesc}
            className="border-none mb-0 pb-0"
            titleClassName="!text-4xl md:!text-6xl font-sans !font-extrabold !text-white !leading-tight !tracking-tight"
          />
          
          <div className="flex flex-wrap gap-4 pt-4">
            <a 
              href="#ai-scanner" 
              className="inline-flex items-center justify-center space-x-2 bg-lime-400 text-black font-sans font-bold text-base px-8 py-4 rounded-full transition-all hover:scale-105 hover:bg-lime-500 hover:shadow-[0_0_30px_rgba(204,255,0,0.3)] shadow-lg cursor-pointer"
            >
              <Camera size={20} />
              <span>{text.ctaCamera}</span>
            </a>
            
            <a 
              href="#harvestguard-dashboard" 
              className="inline-flex items-center justify-center space-x-2 bg-white/5 text-white border border-white/20 font-sans font-bold text-base px-8 py-4 rounded-full transition-all hover:bg-white/10 hover:border-lime-400 cursor-pointer"
            >
              <LayoutDashboard size={20} className="text-lime-400" />
              <span>{text.ctaDashboard}</span>
            </a>
          </div>
        </div>

        {/* Right Side: Glassmorphic Value Proposition Card */}
        <div className="lg:col-span-5 bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[28px] text-left space-y-4 hover:border-lime-400/40 transition-all duration-300 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-lime-400/5 blur-2xl rounded-full pointer-events-none" />
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
