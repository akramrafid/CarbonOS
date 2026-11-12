import React, { useState } from 'react';
import { createContainerVariants, createItemVariants } from '../../lib/motion';
import CameraCapture from './CameraCapture';
import HarvestGuardDashboard from './HarvestGuardDashboard';
import BatchRegistration from './BatchRegistration';
import WeatherRiskWidget from '../../components/farmers-ai/WeatherRiskWidget';
import DiagnosisResult from './DiagnosisResult';
import { LANDING_TEXTS } from './landing/cropsData';
import { FarmersHero } from './landing/FarmersHero';
import { WorkflowCards } from './landing/WorkflowCards';
import { SupportedCropsSection } from './landing/SupportedCropsSection';
import { FeaturesGridAndCta } from './landing/FeaturesGridAndCta';
import { Tabs } from '../../components/ui/Tabs';

const FarmersAILanding = () => {
  const [lang, setLang] = useState('en');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanImage, setScanImage] = useState(null);
  const [dashboardSection, setDashboardSection] = useState('inventory');
  const [dashboardBatchId, setDashboardBatchId] = useState(null);

  const text = LANDING_TEXTS[lang];

  const containerVariants = createContainerVariants(0.2);
  const itemVariants = createItemVariants(16);

  return (
    <div className="min-h-screen bg-carbon pt-16 pb-12 px-4 lg:px-12 font-sans selection:bg-emerald selection:text-carbon overflow-hidden">
      {/* Language Toggle */}
      <div className="max-w-7xl mx-auto flex justify-end mb-8 relative z-20">
        <Tabs
          tabs={[
            { id: 'en', label: 'English' },
            { id: 'bn', label: 'বাংলা' }
          ]}
          activeTab={lang}
          onChange={setLang}
          size="sm"
        />
      </div>

      <div className="max-w-7xl mx-auto">
        <FarmersHero lang={lang} text={text} />

        <WorkflowCards
          lang={lang}
          text={text}
          containerVariants={containerVariants}
          itemVariants={itemVariants}
        />

        {/* AI Scanner Section */}
        <div id="ai-scanner" className="mb-32 relative z-10 scroll-mt-28">
          <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 p-6 md:p-8 rounded-3xl shadow-xl hover:border-lime-400/20 transition-all duration-300">
            {scanResult === null ? (
              <CameraCapture 
                isInline={true} 
                onScanComplete={(result, imgBlob) => {
                  setScanResult(result);
                  setScanImage(imgBlob);
                }}
              />
            ) : (
              <DiagnosisResult 
                isInline={true}
                onBack={() => {
                  setScanResult(null);
                  setScanImage(null);
                }}
                inlineResult={scanResult}
                inlineImageBlob={scanImage}
              />
            )}
          </div>
        </div>

        <SupportedCropsSection
          lang={lang}
          text={text}
          selectedCrop={selectedCrop}
          onSelectCrop={setSelectedCrop}
          containerVariants={containerVariants}
          itemVariants={itemVariants}
        />

        {/* HarvestGuard Dashboard Section */}
        <div id="harvestguard-dashboard" className="mb-32 relative z-10 scroll-mt-28">
          <div className="bg-bg-elevated/90 border border-lime-400/20 p-6 md:p-8 rounded-3xl shadow-xl">
            {dashboardSection === 'inventory' && (
              <HarvestGuardDashboard 
                isInline={true}
                onAddBatchClick={() => setDashboardSection('add-batch')}
                onViewRiskClick={(batchId) => {
                  setDashboardBatchId(batchId);
                  setDashboardSection('risk-details');
                }}
              />
            )}
            {dashboardSection === 'add-batch' && (
              <BatchRegistration 
                isInline={true}
                onBack={() => setDashboardSection('inventory')}
                onSaveBatch={() => setDashboardSection('inventory')}
              />
            )}
            {dashboardSection === 'risk-details' && (
              <WeatherRiskWidget 
                isInline={true}
                onBack={() => setDashboardSection('inventory')}
                inlineBatchId={dashboardBatchId}
              />
            )}
          </div>
        </div>

        <FeaturesGridAndCta text={text} />
      </div>
    </div>
  );
};

export default FarmersAILanding;
