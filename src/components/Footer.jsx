import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <section 
      className="relative w-full min-h-[100dvh] flex flex-col justify-end bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: 'url("/footer_landscape.png")' }}
    >
      {/* Gradient fade to blend smoothly with the section above it */}
      {isLight ? (
        <>
          <div className="absolute top-0 left-0 w-full h-72 bg-gradient-to-b from-[#F2F3EE] via-[#F2F3EE]/80 to-transparent z-0 pointer-events-none"></div>
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 50% at 50% 35%, rgba(242, 243, 238, 0.85) 0%, rgba(242, 243, 238, 0.35) 65%, rgba(242, 243, 238, 0.15) 100%)',
            }}
          ></div>
        </>
      ) : (
        <>
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#040A06] via-[#040A06]/80 to-transparent z-0 pointer-events-none"></div>
          <div className="absolute inset-0 bg-black/10 z-0 pointer-events-none"></div>
        </>
      )}

      {/* CTA Section (Top part of the landscape) */}
      <div className="relative z-10 w-full flex-grow flex flex-col items-center justify-center text-center px-4 sm:px-6 py-16 sm:py-24">
        <h2 className={`font-sans font-bold text-3xl sm:text-4xl lg:text-6xl max-w-4xl tracking-tight leading-[1.1] mb-4 sm:mb-6 ${
          isLight ? 'text-[#0F291B]' : 'text-white drop-shadow-lg'
        }`}>
          {t('footer.ctaTitle')}
        </h2>
        <p className={`font-sans text-base sm:text-lg max-w-2xl mb-8 sm:mb-10 ${
          isLight ? 'text-[#26382E] font-medium' : 'text-white/90 drop-shadow-md'
        }`}>
          {t('footer.ctaSubtext')}
        </p>
        <Link
          to="/platform/esg"
          className={`font-sans font-bold text-sm px-7 sm:px-8 py-3.5 sm:py-4 rounded-full flex items-center space-x-3 transition-all min-h-[44px] ${
            isLight
              ? 'bg-[#15803d] hover:bg-[#166534] text-white shadow-[0_12px_28px_-6px_rgba(21,128,61,0.45)]'
              : 'bg-white text-carbon hover:bg-gray-100 shadow-2xl'
          }`}
        >
          <span>{t('footer.ctaButton')}</span>
          <div className={`rounded-full p-1 ${isLight ? 'bg-white arrow-emerald-wrap' : 'bg-carbon text-white'}`}>
            <ArrowRight size={14} />
          </div>
        </Link>
      </div>

      {/* Glassmorphic Footer (Bottom part) */}
      <footer className={`relative z-10 w-full backdrop-blur-2xl border-t pt-8 pb-[env(safe-area-inset-bottom)] rounded-t-[2rem] sm:rounded-t-[2.5rem] ${
        isLight
          ? 'bg-[#F8FAF7]/[0.96] border-[#0F291B]/12 text-[#26382E] shadow-[0_-12px_40px_-10px_rgba(15,41,27,0.10)]'
          : 'bg-white/10 border-white/20'
      }`}>
        <div className="w-full px-4 sm:px-6 lg:px-12 mx-auto">
          
          {/* Top Line */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-6 mb-10 sm:mb-12 ${
            isLight ? 'border-[#0F291B]/10' : 'border-white/10'
          }`}>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <BrandLogo variant="auto" heightClass="h-6 sm:h-7" showBdBadge={true} />
              <span className={`font-sans text-xs ${isLight ? 'text-[#4A5D52]' : 'text-white/70'}`}>{t('footer.copyright')}</span>
            </div>
            <span className={`font-sans text-xs ${isLight ? 'text-[#4A5D52]' : 'text-white/70'}`}>{t('footer.rights')}</span>
          </div>

          {/* Links Grid - 6 Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-8 mb-12 sm:mb-16">
            
            {/* Col 1 */}
            <div className="flex flex-col space-y-4">
              <span className={`font-mono text-[10px] tracking-widest uppercase mb-2 font-semibold ${isLight ? 'text-[#26382E]' : 'text-white/40'}`}>Platform</span>
              <Link to="/platform/project-onboarding" className={`font-sans text-sm transition-colors ${isLight ? 'text-[#26382E] hover:text-[#15803d]' : 'text-white/90 hover:text-white'}`}>Project Onboarding</Link>
              <Link to="/platform/mrv-dashboard" className={`font-sans text-sm transition-colors ${isLight ? 'text-[#26382E] hover:text-[#15803d]' : 'text-white/90 hover:text-white'}`}>MRV Dashboard</Link>
              <Link to="/platform/carbon-registry" className={`font-sans text-sm transition-colors ${isLight ? 'text-[#26382E] hover:text-[#15803d]' : 'text-white/90 hover:text-white'}`}>Carbon Registry</Link>
            </div>

            {/* Col 2 */}
            <div className="flex flex-col space-y-4">
              <span className="font-mono text-[10px] text-transparent tracking-widest uppercase mb-2 select-none">-</span>
              <Link to="/platform/verification-workflow" className={`font-sans text-sm transition-colors ${isLight ? 'text-[#26382E] hover:text-[#15803d]' : 'text-white/90 hover:text-white'}`}>Verification Workflow</Link>
              <Link to="/platform/marketplace" className={`font-sans text-sm transition-colors ${isLight ? 'text-[#26382E] hover:text-[#15803d]' : 'text-white/90 hover:text-white'}`}>Marketplace</Link>
              <Link to="/platform/ai-detection" className={`font-sans text-sm transition-colors ${isLight ? 'text-[#26382E] hover:text-[#15803d]' : 'text-white/90 hover:text-white'}`}>AI Detection</Link>
            </div>

            {/* Col 3 */}
            <div className="flex flex-col space-y-4">
              <span className={`font-mono text-[10px] tracking-widest uppercase mb-2 font-semibold ${isLight ? 'text-[#26382E]' : 'text-white/40'}`}>Sectors</span>
              <Link to="/sectors/solar-irrigation" className={`font-sans text-sm transition-colors ${isLight ? 'text-[#26382E] hover:text-[#15803d]' : 'text-white/90 hover:text-white'}`}>Solar Irrigation</Link>
              <Link to="/sectors/rice-methane" className={`font-sans text-sm transition-colors ${isLight ? 'text-[#26382E] hover:text-[#15803d]' : 'text-white/90 hover:text-white'}`}>Rice Methane</Link>
              <Link to="/sectors/clean-cookstoves" className={`font-sans text-sm transition-colors ${isLight ? 'text-[#26382E] hover:text-[#15803d]' : 'text-white/90 hover:text-white'}`}>Clean Cookstoves</Link>
            </div>

            {/* Col 4 */}
            <div className="flex flex-col space-y-4">
              <span className="font-mono text-[10px] text-transparent tracking-widest uppercase mb-2 select-none">-</span>
              <Link to="/sectors/waste-to-energy" className={`font-sans text-sm transition-colors ${isLight ? 'text-[#26382E] hover:text-[#15803d]' : 'text-white/90 hover:text-white'}`}>Waste-to-Energy</Link>
              <Link to="/sectors/mangrove-carbon" className={`font-sans text-sm transition-colors ${isLight ? 'text-[#26382E] hover:text-[#15803d]' : 'text-white/90 hover:text-white'}`}>Mangrove Carbon</Link>
              <Link to="/sectors/brick-kilns" className={`font-sans text-sm transition-colors ${isLight ? 'text-[#26382E] hover:text-[#15803d]' : 'text-white/90 hover:text-white'}`}>Brick Kilns</Link>
            </div>

            {/* Col 5 */}
            <div className="flex flex-col space-y-4">
              <span className={`font-mono text-[10px] tracking-widest uppercase mb-2 font-semibold ${isLight ? 'text-[#26382E]' : 'text-white/40'}`}>Company</span>
              <Link to="/company/about" className={`font-sans text-sm transition-colors ${isLight ? 'text-[#26382E] hover:text-[#15803d]' : 'text-white/90 hover:text-white'}`}>About</Link>
              <Link to="/company/framework-docs" className={`font-sans text-sm transition-colors ${isLight ? 'text-[#26382E] hover:text-[#15803d]' : 'text-white/90 hover:text-white'}`}>Framework Docs</Link>
              <Link to="/company/api-docs" className={`font-sans text-sm transition-colors ${isLight ? 'text-[#26382E] hover:text-[#15803d]' : 'text-white/90 hover:text-white'}`}>API Docs</Link>
            </div>

            {/* Col 6 */}
            <div className="flex flex-col space-y-4">
              <span className="font-mono text-[10px] text-transparent tracking-widest uppercase mb-2 select-none">-</span>
              <Link to="/company/careers" className={`font-sans text-sm transition-colors ${isLight ? 'text-[#26382E] hover:text-[#15803d]' : 'text-white/90 hover:text-white'}`}>Careers</Link>
              <Link to="/company/privacy" className={`font-sans text-sm transition-colors ${isLight ? 'text-[#26382E] hover:text-[#15803d]' : 'text-white/90 hover:text-white'}`}>Privacy</Link>
              <Link to="/company/terms" className={`font-sans text-sm transition-colors ${isLight ? 'text-[#26382E] hover:text-[#15803d]' : 'text-white/90 hover:text-white'}`}>Terms</Link>
            </div>

          </div>
        </div>

        {/* Giant Bottom Text */}
        <div className={`w-full overflow-hidden flex justify-center -mb-2 select-none pointer-events-none ${isLight ? 'opacity-100' : 'opacity-85'}`}>
          <span className={`font-sans font-bold text-[13vw] leading-[0.8] tracking-tighter uppercase whitespace-nowrap ${
            isLight ? 'text-[#0F291B]/[0.08]' : 'text-white'
          }`}>
            Carbon Zero BD
          </span>
        </div>
      </footer>
    </section>
  );
};

export default Footer;
