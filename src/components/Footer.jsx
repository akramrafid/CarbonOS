import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <section 
      className="relative w-full min-h-[100dvh] flex flex-col justify-end bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: 'url("/footer_landscape.png")' }}
    >
      {/* Gradient fade to blend with the dark section above it */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#040A06] via-[#040A06]/80 to-transparent z-0 pointer-events-none"></div>

      {/* Light overlay for text readability if needed */}
      <div className="absolute inset-0 bg-black/10 z-0 pointer-events-none"></div>

      {/* CTA Section (Top part of the landscape) */}
      <div className="relative z-10 w-full flex-grow flex flex-col items-center justify-center text-center px-6 py-24">
        <h2 className="font-sans font-bold text-4xl lg:text-6xl text-white max-w-4xl tracking-tight leading-[1.1] mb-6 drop-shadow-lg">
          {t('footer.ctaTitle')}
        </h2>
        <p className="font-sans text-lg text-white/90 max-w-2xl mb-10 drop-shadow-md">
          {t('footer.ctaSubtext')}
        </p>
        <button className="bg-white text-carbon font-sans font-bold text-sm px-8 py-4 rounded-full flex items-center space-x-3 hover:bg-gray-100 transition-colors shadow-2xl">
          <span>{t('footer.ctaButton')}</span>
          <div className="bg-carbon text-white rounded-full p-1">
            <ArrowRight size={14} />
          </div>
        </button>
      </div>

      {/* Glassmorphic Footer (Bottom part) */}
      <footer className="relative z-10 w-full bg-white/10 backdrop-blur-2xl border-t border-white/20 pt-8 rounded-t-[2.5rem]">
        <div className="w-full px-6 lg:px-12 mx-auto">
          
          {/* Top Line */}
          <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-12">
            <span className="font-sans text-xs text-white/70">{t('footer.copyright')}</span>
            <span className="font-sans text-xs text-white/70">{t('footer.rights')}</span>
          </div>

          {/* Links Grid - 6 Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
            
            {/* Col 1 */}
            <div className="flex flex-col space-y-4">
              <span className="font-mono text-[10px] text-white/40 tracking-widest uppercase mb-2">Platform</span>
              <Link to="/platform/project-onboarding" className="font-sans text-sm text-white/90 hover:text-white transition-colors">Project Onboarding</Link>
              <Link to="/platform/mrv-dashboard" className="font-sans text-sm text-white/90 hover:text-white transition-colors">MRV Dashboard</Link>
              <Link to="/platform/carbon-registry" className="font-sans text-sm text-white/90 hover:text-white transition-colors">Carbon Registry</Link>
            </div>

            {/* Col 2 */}
            <div className="flex flex-col space-y-4">
              <span className="font-mono text-[10px] text-transparent tracking-widest uppercase mb-2 select-none">-</span>
              <Link to="/platform/verification-workflow" className="font-sans text-sm text-white/90 hover:text-white transition-colors">Verification Workflow</Link>
              <Link to="/platform/marketplace" className="font-sans text-sm text-white/90 hover:text-white transition-colors">Marketplace</Link>
              <Link to="/platform/ai-detection" className="font-sans text-sm text-white/90 hover:text-white transition-colors">AI Detection</Link>
            </div>

            {/* Col 3 */}
            <div className="flex flex-col space-y-4">
              <span className="font-mono text-[10px] text-white/40 tracking-widest uppercase mb-2">Sectors</span>
              <Link to="/sectors/solar-irrigation" className="font-sans text-sm text-white/90 hover:text-white transition-colors">Solar Irrigation</Link>
              <Link to="/sectors/rice-methane" className="font-sans text-sm text-white/90 hover:text-white transition-colors">Rice Methane</Link>
              <Link to="/sectors/clean-cookstoves" className="font-sans text-sm text-white/90 hover:text-white transition-colors">Clean Cookstoves</Link>
            </div>

            {/* Col 4 */}
            <div className="flex flex-col space-y-4">
              <span className="font-mono text-[10px] text-transparent tracking-widest uppercase mb-2 select-none">-</span>
              <Link to="/sectors/waste-to-energy" className="font-sans text-sm text-white/90 hover:text-white transition-colors">Waste-to-Energy</Link>
              <Link to="/sectors/mangrove-carbon" className="font-sans text-sm text-white/90 hover:text-white transition-colors">Mangrove Carbon</Link>
              <Link to="/sectors/brick-kilns" className="font-sans text-sm text-white/90 hover:text-white transition-colors">Brick Kilns</Link>
            </div>

            {/* Col 5 */}
            <div className="flex flex-col space-y-4">
              <span className="font-mono text-[10px] text-white/40 tracking-widest uppercase mb-2">Company</span>
              <Link to="/company/about" className="font-sans text-sm text-white/90 hover:text-white transition-colors">About</Link>
              <Link to="/company/framework-docs" className="font-sans text-sm text-white/90 hover:text-white transition-colors">Framework Docs</Link>
              <Link to="/company/api-docs" className="font-sans text-sm text-white/90 hover:text-white transition-colors">API Docs</Link>
            </div>

            {/* Col 6 */}
            <div className="flex flex-col space-y-4">
              <span className="font-mono text-[10px] text-transparent tracking-widest uppercase mb-2 select-none">-</span>
              <Link to="/company/careers" className="font-sans text-sm text-white/90 hover:text-white transition-colors">Careers</Link>
              <Link to="/company/privacy" className="font-sans text-sm text-white/90 hover:text-white transition-colors">Privacy</Link>
              <Link to="/company/terms" className="font-sans text-sm text-white/90 hover:text-white transition-colors">Terms</Link>
            </div>

          </div>
        </div>

        {/* Giant Bottom Text */}
        <div className="w-full overflow-hidden flex justify-center -mb-2 opacity-90 select-none pointer-events-none">
          <span className="font-sans font-bold text-[24vw] leading-[0.75] text-white tracking-tighter">
            CarbonOS
          </span>
        </div>
      </footer>
    </section>
  );
};

export default Footer;
