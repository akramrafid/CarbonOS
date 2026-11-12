import React from 'react';
import { WifiOff, Map as MapIcon, Sun, ArrowRight } from 'lucide-react';
import LocalRiskMap from '../../../components/farmers-ai/LocalRiskMap';

export function FeaturesGridAndCta({ text }) {
  return (
    <>
      {/* Features Grid */}
      <div className="mb-24">
        <h3 className="text-2xl font-bold text-white mb-8 text-center">{text.featuresTitle}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 p-8 rounded-3xl hover:border-lime-400/30 transition-all duration-300 hover:scale-[1.01]">
            <WifiOff className="text-lime-400 w-12 h-12 mb-6" />
            <h4 className="text-xl font-bold text-white mb-3">{text.featureOffline}</h4>
            <p className="text-white/60 leading-relaxed">{text.featureOfflineDesc}</p>
          </div>
          
          <a href="#local-risk-map" className="block bg-gradient-to-b from-white/5 to-transparent border border-white/10 p-8 rounded-3xl hover:border-lime-400/30 transition-all duration-300 hover:scale-[1.01] group">
            <MapIcon className="text-lime-400 w-12 h-12 mb-6 group-hover:scale-110 transition-transform" />
            <h4 className="text-xl font-bold text-white mb-3 flex items-center justify-between">
              {text.featureRisk}
              <ArrowRight className="w-5 h-5 text-lime-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h4>
            <p className="text-white/60 leading-relaxed">{text.featureRiskDesc}</p>
          </a>

          <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 p-8 rounded-3xl hover:border-lime-400/30 transition-all duration-300 hover:scale-[1.01]">
            <Sun className="text-lime-400 w-12 h-12 mb-6" />
            <h4 className="text-xl font-bold text-white mb-3">{text.featureWeather}</h4>
            <p className="text-white/60 leading-relaxed">{text.featureWeatherDesc}</p>
          </div>
        </div>
      </div>

      {/* Local Risk Map Section */}
      <div id="local-risk-map" className="mb-24 relative z-10 scroll-mt-28">
        <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 p-6 md:p-8 rounded-3xl shadow-xl">
          <LocalRiskMap isEmbedded={true} />
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative border border-white/10 rounded-3xl p-12 text-center overflow-hidden bg-cover bg-center min-h-[300px] flex flex-col justify-center items-center shadow-2xl" style={{ backgroundImage: 'url(/farmers_hero_banner.png)' }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-carbon via-transparent to-transparent" />
        <h2 className="text-3xl md:text-5xl font-sans font-extrabold text-white mb-8 relative z-10 tracking-tight leading-tight max-w-2xl">
          {text.readyText}
        </h2>
        <a 
          href="#ai-scanner"
          className="inline-flex items-center space-x-2 bg-lime-400 text-black font-sans font-bold text-lg px-8 py-4 rounded-full relative z-10 hover:scale-105 transition-all shadow-lg hover:shadow-[0_0_30px_rgba(204,255,0,0.3)] cursor-pointer"
        >
          <span>{text.startScanning}</span>
          <ArrowRight size={20} />
        </a>
      </div>
    </>
  );
}

export default FeaturesGridAndCta;
