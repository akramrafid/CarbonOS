import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  return <footer className="border-t border-mist/20 bg-forest/15">
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-7 border-b border-mist/20 pb-10"><div><h2 className="max-w-2xl font-serif text-3xl text-registry sm:text-4xl">{t('footer.ctaTitle')}</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-mist">{t('footer.ctaSubtext')}</p></div><Link to="/platform/esg" className="inline-flex min-h-[48px] items-center gap-3 rounded-lg bg-emerald px-5 py-3 font-semibold text-carbon">{t('footer.ctaButton')}<ArrowUpRight size={18} aria-hidden="true" /></Link></div>
      <div className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div><Link to="/#hero" className="font-serif text-3xl font-semibold text-registry">Carbon<span className="text-emerald">OS</span></Link><p className="mt-3 max-w-xs text-sm leading-relaxed text-mist">Evidence-led factory ESG reporting for Bangladesh. A working prototype, evaluated with synthetic examples.</p></div>
        <nav aria-label="Product links" className="flex flex-col items-start gap-1 text-sm text-registry [&_a]:inline-flex [&_a]:min-h-[44px] [&_a]:items-center"><span className="font-mono text-xs text-mist">Product</span><Link to="/how-it-works">How it works</Link><Link to="/technology">Technology & deployment</Link><Link to="/platform/esg">ESG workspace</Link><Link to="/platform/esg?view=evidence">Evidence assistant</Link><Link to="/#pricing">Plan a pilot</Link></nav>
        <nav aria-label="Project and data links" className="flex flex-col items-start gap-1 text-sm text-registry [&_a]:inline-flex [&_a]:min-h-[44px] [&_a]:items-center"><span className="font-mono text-xs text-mist">Project & data</span><Link to="/company/about">About CarbonOS</Link><Link to="/company/trust">Trust & data</Link><Link to="/company/framework-docs">Standards & scope</Link><Link to="/company/privacy">Data-use notice</Link><Link to="/company/terms">Prototype service status</Link></nav>
      </div>
      <details className="border-t border-mist/20 py-4 text-sm text-mist"><summary className="min-h-[44px] cursor-pointer py-3 font-semibold text-registry">Additional prototypes and research routes</summary><p className="max-w-3xl pb-4 text-xs leading-relaxed">These routes explore separate concepts. Claims, model accuracy, field performance, integrations, and transactions on legacy interfaces require independent validation.</p><div className="grid grid-cols-1 gap-3 pb-4 sm:grid-cols-3">{[
        ['Crop diagnosis', '/farmers-ai'], ['Carbon monitoring', '/carbon-monitoring'], ['Illustrative dashboard', '/platform/saas-dashboard'], ['Project onboarding', '/platform/project-onboarding'], ['MRV dashboard', '/platform/mrv-dashboard'], ['Registry concept', '/platform/carbon-registry'], ['Verification workflow', '/platform/verification-workflow'], ['Marketplace concept', '/platform/marketplace'], ['AI detection', '/platform/ai-detection'],
        ['Solar irrigation', '/sectors/solar-irrigation'], ['Rice methane', '/sectors/rice-methane'], ['Cookstoves', '/sectors/clean-cookstoves'], ['Waste-to-energy', '/sectors/waste-to-energy'], ['Mangroves', '/sectors/mangrove-carbon'], ['Brick kilns', '/sectors/brick-kilns'], ['API concepts', '/company/api-docs'], ['Careers', '/company/careers'],
      ].map(([label, url]) => <Link key={url} to={url} className="inline-flex min-h-[44px] items-center">{label}</Link>)}</div></details>
      <p className="border-t border-mist/20 pt-5 font-mono text-xs text-mist">CarbonOS · Bangladesh · Prototype demonstration</p>
    </div>
  </footer>;
}
