import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MarketingLayout from '../components/layout/MarketingLayout';
import DashboardLayout from '../components/layout/DashboardLayout';

// Marketing / Brand Routes (Lazy-loaded)
const Home = React.lazy(() => import('../pages/Home'));
const HowItWorks = React.lazy(() => import('../pages/HowItWorks'));
const Technology = React.lazy(() => import('../pages/Technology'));

// Sector Routes
const SolarIrrigation = React.lazy(() => import('../pages/sectors/SolarIrrigation'));
const RiceMethane = React.lazy(() => import('../pages/sectors/RiceMethane'));
const CleanCookstoves = React.lazy(() => import('../pages/sectors/CleanCookstoves'));
const WasteToEnergy = React.lazy(() => import('../pages/sectors/WasteToEnergy'));
const MangroveCarbon = React.lazy(() => import('../pages/sectors/MangroveCarbon'));
const BrickKilns = React.lazy(() => import('../pages/sectors/BrickKilns'));

// Company Routes
const About = React.lazy(() => import('../pages/company/About'));
const FrameworkDocs = React.lazy(() => import('../pages/company/FrameworkDocs'));
const APIDocs = React.lazy(() => import('../pages/company/APIDocs'));
const Careers = React.lazy(() => import('../pages/company/Careers'));
const Privacy = React.lazy(() => import('../pages/company/Privacy'));
const Terms = React.lazy(() => import('../pages/company/Terms'));
const Forbidden = React.lazy(() => import('../pages/Forbidden'));
const NotFound = React.lazy(() => import('../pages/NotFound'));

// Product / Dashboard Routes (Lazy-loaded)
const ProjectOnboarding = React.lazy(() => import('../pages/platform/ProjectOnboarding'));
const MRVDashboard = React.lazy(() => import('../pages/platform/MRVDashboard'));
const CarbonRegistry = React.lazy(() => import('../pages/platform/CarbonRegistry'));
const VerificationWorkflow = React.lazy(() => import('../pages/platform/VerificationWorkflow'));
const AIDetection = React.lazy(() => import('../pages/platform/AIDetection'));
const SaaSDashboard = React.lazy(() => import('../pages/platform/SaaSDashboard'));
const EsgWorkspace = React.lazy(() => import('../pages/platform/esg/EsgWorkspace'));
const EsgCallback = React.lazy(() => import('../pages/platform/esg/EsgWorkspace').then((m) => ({ default: m.EsgCallback })));
const Impact = React.lazy(() => import('../pages/platform/Impact'));
const CarbonMonitoring = React.lazy(() => import('../pages/platform/CarbonMonitoring'));
const MarketplaceBrowse = React.lazy(() => import('../components/marketplace/MarketplaceBrowse'));
const FarmerCreditsWidget = React.lazy(() => import('../components/dashboard/FarmerCreditsWidget'));
const FarmerEarnings = React.lazy(() => import('../pages/platform/FarmerEarnings'));

// Farmers AI Routes
const FarmersAILanding = React.lazy(() => import('../pages/farmers-ai/FarmersAILanding'));
const CameraCapture = React.lazy(() => import('../pages/farmers-ai/CameraCapture'));
const DiagnosisResult = React.lazy(() => import('../pages/farmers-ai/DiagnosisResult'));
const HarvestGuardDashboard = React.lazy(() => import('../pages/farmers-ai/HarvestGuardDashboard'));
const BatchRegistration = React.lazy(() => import('../pages/farmers-ai/BatchRegistration'));
const WeatherRiskWidget = React.lazy(() => import('../components/farmers-ai/WeatherRiskWidget'));
const LocalRiskMap = React.lazy(() => import('../components/farmers-ai/LocalRiskMap'));

export function AppRouter() {
  return (
    <Routes>
      {/* Brand & Marketing Shell (Navbar + Footer persistent across transitions) */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/technology" element={<Technology />} />

        {/* Sector Pages */}
        <Route path="/sectors/solar-irrigation" element={<SolarIrrigation />} />
        <Route path="/sectors/rice-methane" element={<RiceMethane />} />
        <Route path="/sectors/clean-cookstoves" element={<CleanCookstoves />} />
        <Route path="/sectors/waste-to-energy" element={<WasteToEnergy />} />
        <Route path="/sectors/mangrove-carbon" element={<MangroveCarbon />} />
        <Route path="/sectors/brick-kilns" element={<BrickKilns />} />

        {/* Company Pages */}
        <Route path="/company/about" element={<About />} />
        <Route path="/company/framework-docs" element={<FrameworkDocs />} />
        <Route path="/company/api-docs" element={<APIDocs />} />
        <Route path="/company/careers" element={<Careers />} />
        <Route path="/company/privacy" element={<Privacy />} />
        <Route path="/company/terms" element={<Terms />} />

        {/* Error / Edge Pages */}
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="/unauthorized" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Product Dashboard Shell (Sidebar + Top Bar persistent across transitions) */}
      <Route element={<DashboardLayout />}>
        <Route path="/platform/project-onboarding" element={<ProjectOnboarding />} />
        <Route path="/platform/mrv-dashboard" element={<MRVDashboard />} />
        <Route path="/platform/carbon-registry" element={<CarbonRegistry />} />
        <Route path="/carbon-registry" element={<CarbonRegistry />} />
        <Route path="/platform/verification-workflow" element={<VerificationWorkflow />} />
        <Route path="/platform/marketplace" element={<MarketplaceBrowse />} />
        <Route path="/platform/ai-detection" element={<AIDetection />} />
        <Route path="/platform/saas-dashboard" element={<SaaSDashboard />} />
        <Route path="/platform/saas" element={<SaaSDashboard />} />
        <Route path="/esg" element={<SaaSDashboard />} />
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

        {/* Direct Farmer Ledger */}
        <Route path="/dashboard/farmer" element={<FarmerCreditsWidget />} />
        <Route path="/dashboard/farmer/earnings" element={<FarmerEarnings />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;

