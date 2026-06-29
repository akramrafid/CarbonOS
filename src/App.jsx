import React, { useEffect, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import LoadingSpinner from './components/LoadingSpinner';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
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

function App() {
  return (
    <div className="bg-carbon min-h-screen text-registry font-sans selection:bg-emerald selection:text-carbon">
      <ScrollToTop />
      <Navbar />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          
          {/* Platform Routes */}
          <Route path="/platform/project-onboarding" element={<ProjectOnboarding />} />
          <Route path="/platform/mrv-dashboard" element={<MRVDashboard />} />
          <Route path="/platform/carbon-registry" element={<CarbonRegistry />} />
          <Route path="/platform/verification-workflow" element={<VerificationWorkflow />} />
          <Route path="/platform/marketplace" element={<MarketplaceBrowse />} />
          <Route path="/platform/ai-detection" element={<AIDetection />} />
          <Route path="/platform/saas-dashboard" element={<SaaSDashboard />} />
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
        </Routes>
      </Suspense>
      <Footer />
    </div>
  );
}

export default App;
