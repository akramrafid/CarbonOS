import React, { useEffect, Suspense } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import LoadingSpinner from './components/LoadingSpinner';
import RouteErrorBoundary from './components/RouteErrorBoundary';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Lazy loaded pages
const HowItWorks = React.lazy(() => import('./pages/HowItWorks'));

// Platform Pages
const ProjectOnboarding = React.lazy(() => import('./pages/platform/ProjectOnboarding'));
const MRVDashboard = React.lazy(() => import('./pages/platform/MRVDashboard'));
const CarbonRegistry = React.lazy(() => import('./pages/platform/CarbonRegistry'));
const VerificationWorkflow = React.lazy(() => import('./pages/platform/VerificationWorkflow'));
const AIDetection = React.lazy(() => import('./pages/platform/AIDetection'));
const SaaSDashboard = React.lazy(() => import('./pages/platform/SaaSDashboard'));
const EsgWorkspace = React.lazy(() => import('./pages/platform/esg/EsgWorkspace'));
const EsgCallback = React.lazy(() => import('./pages/platform/esg/EsgWorkspace').then((m) => ({ default: m.EsgCallback })));
const Impact = React.lazy(() => import('./pages/platform/Impact'));
const CarbonMonitoring = React.lazy(() => import('./pages/platform/CarbonMonitoring'));

// The new integrated features
const Technology = React.lazy(() => import('./pages/Technology'));
const MarketplaceBrowse = React.lazy(() => import('./components/marketplace/MarketplaceBrowse'));
const FarmerCreditsWidget = React.lazy(() => import('./components/dashboard/FarmerCreditsWidget'));
const FarmerEarnings = React.lazy(() => import('./pages/platform/FarmerEarnings'));

// Farmer's AI / HarvestGuard
const FarmersAILanding = React.lazy(() => import('./pages/farmers-ai/FarmersAILanding'));
const CameraCapture = React.lazy(() => import('./pages/farmers-ai/CameraCapture'));
const DiagnosisResult = React.lazy(() => import('./pages/farmers-ai/DiagnosisResult'));
const HarvestGuardDashboard = React.lazy(() => import('./pages/farmers-ai/HarvestGuardDashboard'));
const BatchRegistration = React.lazy(() => import('./pages/farmers-ai/BatchRegistration'));
const WeatherRiskWidget = React.lazy(() => import('./components/farmers-ai/WeatherRiskWidget'));
const LocalRiskMap = React.lazy(() => import('./components/farmers-ai/LocalRiskMap'));

// Sector Pages
const SolarIrrigation = React.lazy(() => import('./pages/sectors/SolarIrrigation'));
const RiceMethane = React.lazy(() => import('./pages/sectors/RiceMethane'));
const CleanCookstoves = React.lazy(() => import('./pages/sectors/CleanCookstoves'));
const WasteToEnergy = React.lazy(() => import('./pages/sectors/WasteToEnergy'));
const MangroveCarbon = React.lazy(() => import('./pages/sectors/MangroveCarbon'));
const BrickKilns = React.lazy(() => import('./pages/sectors/BrickKilns'));

// Company Pages
const About = React.lazy(() => import('./pages/company/About'));
const FrameworkDocs = React.lazy(() => import('./pages/company/FrameworkDocs'));
const APIDocs = React.lazy(() => import('./pages/company/APIDocs'));
const Careers = React.lazy(() => import('./pages/company/Careers'));
const Privacy = React.lazy(() => import('./pages/company/Privacy'));
const Terms = React.lazy(() => import('./pages/company/Terms'));
const Trust = React.lazy(() => import('./pages/company/Trust'));

function PageMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const titles = { '/how-it-works': 'How it works', '/company/trust': 'Trust & data', '/company/about': 'About',
      '/company/privacy': 'Prototype data use', '/company/terms': 'Prototype service status', '/technology': 'Technology & deployment', '/platform/esg': 'ESG workspace' };
    const descriptions = {
      '/technology': 'Explore the CarbonOS evidence, review, calculation and reporting workflow, research boundaries and requirements for a business pilot.',
      '/company/trust': 'Review the CarbonOS prototype controls, source provenance, AI boundaries, and deployment decisions before a business pilot.',
      '/company/privacy': 'Understand prototype file storage, optional external AI processing, and the privacy decisions required before real-data use.',
      '/company/terms': 'Understand the CarbonOS demonstration scope and the commercial service commitments that have not been established.',
      '/how-it-works': 'Follow a synthetic factory bill through human review, Scope 1 and 2 calculation, separate lock approval, and reproducible export.',
    };
    const title = titles[pathname] ? `${titles[pathname]} | CarbonOS` : 'CarbonOS | Evidence-led ESG reporting for Bangladesh';
    const description = descriptions[pathname] || 'A working prototype for source-linked ESG activity data, human review, Scope 1 and 2 calculations, and reproducible reports. Explore with synthetic sample data.';
    document.title = title;
    for (const [selector, content] of [
      ['meta[name="description"]', description], ['meta[property="og:title"]', title],
      ['meta[property="og:description"]', description], ['meta[property="twitter:title"]', title],
      ['meta[property="twitter:description"]', description],
    ]) document.head.querySelector(selector)?.setAttribute('content', content);
    const publicPage = pathname === '/' || pathname === '/how-it-works' || pathname === '/technology' || pathname.startsWith('/company/') && pathname in titles;
    document.head.querySelector('meta[name="robots"]')?.setAttribute('content', publicPage ? 'index, follow' : 'noindex, follow');
  }, [pathname]);
  return null;
}

function App() {
  const { pathname } = useLocation();
  return (
    <div className="bg-carbon min-h-screen text-registry font-sans selection:bg-emerald selection:text-carbon">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <ScrollToTop />
      <PageMetadata />
      <Navbar />
      <div id="main-content" tabIndex={-1}>
      <RouteErrorBoundary key={pathname}>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          
          {/* Platform Routes */}
          <Route path="/platform/project-onboarding" element={<ProjectOnboarding />} />
          <Route path="/platform/mrv-dashboard" element={<MRVDashboard />} />
          <Route path="/platform/carbon-registry" element={<CarbonRegistry />} />
          <Route path="/carbon-registry" element={<CarbonRegistry />} />
          <Route path="/platform/verification-workflow" element={<VerificationWorkflow />} />
          <Route path="/platform/marketplace" element={<MarketplaceBrowse />} />
          <Route path="/platform/ai-detection" element={<AIDetection />} />
          <Route path="/platform/saas-dashboard" element={<SaaSDashboard />} />
          <Route path="/platform/saas" element={<Navigate to="/platform/esg" replace />} />
          <Route path="/platform/esg" element={<EsgWorkspace />} />
          <Route path="/platform/esg/callback" element={<EsgCallback />} />
          <Route path="/platform/impact" element={<Impact />} />
          <Route path="/carbon-monitoring" element={<CarbonMonitoring />} />

          {/* Farmer's AI & HarvestGuard */}
          <Route path="/farmers-ai" element={<FarmersAILanding />} />
          <Route path="/farmers-ai/camera" element={<CameraCapture />} />
          <Route path="/farmers-ai/result" element={<DiagnosisResult />} />
          <Route path="/harvestguard/dashboard" element={<HarvestGuardDashboard />} />
          <Route path="/harvestguard/register-batch" element={<BatchRegistration />} />
          <Route path="/harvestguard/risk-analysis/:batchId" element={<WeatherRiskWidget />} />
          <Route path="/harvestguard/risk-map" element={<LocalRiskMap />} />

          {/* Integrated Features */}
          <Route path="/technology" element={<Technology />} />
          <Route path="/dashboard/farmer" element={
            <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto"><FarmerCreditsWidget farmerId="farmer-123" /></div>
          } />
          <Route path="/dashboard/farmer/earnings" element={<FarmerEarnings />} />

          {/* Sector Routes */}
          <Route path="/sectors/solar-irrigation" element={<SolarIrrigation />} />
          <Route path="/sectors/rice-methane" element={<RiceMethane />} />
          <Route path="/sectors/clean-cookstoves" element={<CleanCookstoves />} />
          <Route path="/sectors/waste-to-energy" element={<WasteToEnergy />} />
          <Route path="/sectors/mangrove-carbon" element={<MangroveCarbon />} />
          <Route path="/sectors/brick-kilns" element={<BrickKilns />} />

          {/* Company Routes */}
          <Route path="/company/about" element={<About />} />
          <Route path="/company/framework-docs" element={<FrameworkDocs />} />
          <Route path="/company/api-docs" element={<APIDocs />} />
          <Route path="/company/careers" element={<Careers />} />
          <Route path="/company/privacy" element={<Privacy />} />
          <Route path="/company/terms" element={<Terms />} />
          <Route path="/company/trust" element={<Trust />} />
          <Route path="*" element={
            <main className="mx-auto max-w-3xl px-6 pb-24 pt-36">
              <p className="font-mono text-sm text-emerald">404</p>
              <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">Page not found</h1>
              <p className="mt-4 text-mist">This address does not match a CarbonOS page.</p>
              <Link to="/" className="mt-6 inline-flex min-h-[44px] items-center rounded-full bg-emerald px-6 font-semibold text-carbon">Back to home</Link>
            </main>
          } />
        </Routes>
      </Suspense>
      </RouteErrorBoundary>
      </div>
      <Footer />
    </div>
  );
}

export default App;
