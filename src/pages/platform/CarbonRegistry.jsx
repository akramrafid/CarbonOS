import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  ShieldCheck,
  Globe,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { useRegistryState } from './registry/useRegistryState';
import RegistryHeader from './registry/RegistryHeader';
import RegistryOverviewTab from './registry/RegistryOverviewTab';
import RegistryRulesTab from './registry/RegistryRulesTab';
import RegistryJcmTab from './registry/RegistryJcmTab';
import RegistryAdjustmentsTab from './registry/RegistryAdjustmentsTab';
import RegistryBtrTab from './registry/RegistryBtrTab';
import { SubmissionModal, JcmModal, BtrJsonModal } from './registry/RegistryModals';
import { Tabs } from '../../components/ui/Tabs';

const CarbonRegistry = () => {
  const { t } = useTranslation();
  const state = useRegistryState();

  const {
    activeTab,
    setActiveTab,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    selectedProject,
    rules,
    submissions,
    adjustments,
    isLiveConnected,
    isLoading,
    copiedHash,
    isSubmitting,
    submissionFeedback,
    showSubmissionModal,
    setShowSubmissionModal,
    showJcmModal,
    setShowJcmModal,
    showBtrJsonModal,
    setShowBtrJsonModal,
    jcmData,
    testSector,
    setTestSector,
    testMitigation,
    setTestMitigation,
    testNdc,
    setTestNdc,
    testResult,
    fetchRegistryData,
    handleCopyHash,
    handleSubmitMonitoringReport,
    handleTestEligibility,
    handleConfirmAdjustment,
    handleDownloadBtrCsv,
    handleOpenJcmExport
  } = state;

  return (
    <div className="pt-16 pb-12 min-h-screen bg-bg-canvas text-white selection:bg-accent selection:text-fg-primary">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#00C85308_1px,transparent_1px),linear-gradient(to_bottom,#00C85308_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_10%,#000_60%,transparent_100%)] pointer-events-none z-0"></div>

      <div className="max-w-[1720px] mx-auto px-4 sm:px-8 relative z-10">
        <RegistryHeader
          isLiveConnected={isLiveConnected}
          isLoading={isLoading}
          fetchRegistryData={fetchRegistryData}
          handleDownloadBtrCsv={handleDownloadBtrCsv}
        />

        {/* Sub-Navigation Tabs */}
        <div className="overflow-x-auto pb-4 mb-6 border-b border-border-subtle scrollbar-none">
          <Tabs
            tabs={[
              { id: 'overview', label: '1. Overview & dMRV Ingestion Hub', icon: <Activity size={14} /> },
              { id: 'rules', label: `2. DOE Positive/Negative List Engine (${rules.length})`, icon: <ShieldCheck size={14} /> },
              { id: 'jcm', label: '3. Japan-BD JCM Bilateral (Article 6.2)', icon: <Globe size={14} /> },
              { id: 'adjustments', label: '4. Corresponding Adjustment (CA) Ledger', icon: <FileSpreadsheet size={14} /> },
              { id: 'btr', label: '5. UNFCCC Biennial Transparency Report (BTR)', icon: <FileText size={14} /> }
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="bg-bg-elevated border-border-subtle"
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <RegistryOverviewTab
            projects={projects}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
            selectedProject={selectedProject}
            handleCopyHash={handleCopyHash}
            copiedHash={copiedHash}
            handleOpenJcmExport={handleOpenJcmExport}
            setActiveTab={setActiveTab}
            submissionFeedback={submissionFeedback}
            setShowSubmissionModal={setShowSubmissionModal}
            isSubmitting={isSubmitting}
            submissions={submissions}
          />
        )}

        {activeTab === 'rules' && (
          <RegistryRulesTab
            rules={rules}
            testSector={testSector}
            setTestSector={setTestSector}
            testMitigation={testMitigation}
            setTestMitigation={setTestMitigation}
            testNdc={testNdc}
            setTestNdc={setTestNdc}
            handleTestEligibility={handleTestEligibility}
            testResult={testResult}
          />
        )}

        {activeTab === 'jcm' && (
          <RegistryJcmTab handleOpenJcmExport={handleOpenJcmExport} />
        )}

        {activeTab === 'adjustments' && (
          <RegistryAdjustmentsTab
            adjustments={adjustments}
            handleConfirmAdjustment={handleConfirmAdjustment}
          />
        )}

        {activeTab === 'btr' && (
          <RegistryBtrTab
            setShowBtrJsonModal={setShowBtrJsonModal}
            handleDownloadBtrCsv={handleDownloadBtrCsv}
          />
        )}
      </div>

      {/* Modals using ui/Modal */}
      <SubmissionModal
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        selectedProject={selectedProject}
        isSubmitting={isSubmitting}
        onSubmit={() => {
          setShowSubmissionModal(false);
          handleSubmitMonitoringReport();
        }}
      />

      <JcmModal
        isOpen={showJcmModal}
        onClose={() => setShowJcmModal(false)}
        jcmData={jcmData}
      />

      <BtrJsonModal
        isOpen={showBtrJsonModal}
        onClose={() => setShowBtrJsonModal(false)}
      />
    </div>
  );
};

export default CarbonRegistry;
