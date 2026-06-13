import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Platform Pages
import ProjectOnboarding from './pages/platform/ProjectOnboarding';
import MRVDashboard from './pages/platform/MRVDashboard';
import CarbonRegistry from './pages/platform/CarbonRegistry';
import VerificationWorkflow from './pages/platform/VerificationWorkflow';
import AIDetection from './pages/platform/AIDetection';

// The new integrated features
import Technology from './pages/Technology';
import MarketplaceBrowse from './components/marketplace/MarketplaceBrowse';
import FarmerCreditsWidget from './components/dashboard/FarmerCreditsWidget';
import FarmerEarnings from './pages/platform/FarmerEarnings';

// Sector Pages
import SolarIrrigation from './pages/sectors/SolarIrrigation';
import RiceMethane from './pages/sectors/RiceMethane';
import CleanCookstoves from './pages/sectors/CleanCookstoves';
import WasteToEnergy from './pages/sectors/WasteToEnergy';
import MangroveCarbon from './pages/sectors/MangroveCarbon';
import BrickKilns from './pages/sectors/BrickKilns';

// Company Pages
import About from './pages/company/About';
import FrameworkDocs from './pages/company/FrameworkDocs';
import APIDocs from './pages/company/APIDocs';
import Careers from './pages/company/Careers';
import Privacy from './pages/company/Privacy';
import Terms from './pages/company/Terms';

function App() {
  return (
    <div className="bg-carbon min-h-screen text-registry font-sans selection:bg-emerald selection:text-carbon">
      <ScrollToTop />
      <Navbar />
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
      <Footer />
    </div>
  );
}

export default App;
