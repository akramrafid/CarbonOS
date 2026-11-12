import React from 'react';
import { useVerificationReadinessState } from './verification-readiness/useVerificationReadinessState';
import { ReadinessHeader } from './verification-readiness/ReadinessHeader';
import { ChecklistTab } from './verification-readiness/ChecklistTab';
import { DataGapsTab } from './verification-readiness/DataGapsTab';
import { InquiriesTab } from './verification-readiness/InquiriesTab';
import { BaseYearTab } from './verification-readiness/BaseYearTab';
import { CbamTab } from './verification-readiness/CbamTab';
import { SignoffTab } from './verification-readiness/SignoffTab';
import { Tabs } from '../../../components/ui/Tabs';

export const VerificationReadinessCenter = ({
  activeClientId = 'polyjute',
  isLight = false,
  locale = 'en',
  currency = 'BDT',
  showToast = (msg, type) => {
    if (import.meta.env?.DEV) console.debug(msg, type);
  }
}) => {
  const {
    activeTab,
    setActiveTab,
    isAuditorLocked,
    setIsAuditorLocked,
    copiedKey,
    client,
    baseYear,
    setBaseYear,
    baseYearEmissions,
    setBaseYearEmissions,
    structuralChangeTco2e,
    setStructuralChangeTco2e,
    structuralChangeReason,
    setStructuralChangeReason,
    cbamSector,
    setCbamSector,
    cbamExportTons,
    setCbamExportTons,
    cbamElectricityOrigin,
    checklist,
    inquiries,
    newInquiryQuestion,
    setNewInquiryQuestion,
    newInquiryVerifier,
    setNewInquiryVerifier,
    handleToggleChecklistStatus,
    handleAddInquiry,
    readinessStats,
    dataGapSummary,
    baseYearRecalculation,
    cbamResult,
    copyToClipboard
  } = useVerificationReadinessState(activeClientId, showToast);

  const tabs = [
    { id: 'checklist', label: '1. ISO 14064 Checklist', count: checklist.length },
    {
      id: 'datagaps',
      label: '2. Data Gap Analyzer',
      count: dataGapSummary.totalGaps,
      badgeColor: dataGapSummary.totalGaps > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
    },
    { id: 'inquiries', label: '3. Verifier Inquiries (Q&A)', count: inquiries.length },
    { id: 'baseyear', label: '4. Base Year Recalculation (>5%)' },
    { id: 'cbam', label: '5. EU CBAM Customs Export' },
    { id: 'signoff', label: '6. Attestation Statement' }
  ];

  return (
    <div className={`space-y-8 font-sans ${isLight ? 'text-slate-900' : 'text-white'}`}>
      {/* Header Banner & Controls */}
      <ReadinessHeader
        isLight={isLight}
        client={client}
        readinessStats={readinessStats}
        isAuditorLocked={isAuditorLocked}
        setIsAuditorLocked={setIsAuditorLocked}
        onOpenSignoff={() => setActiveTab('signoff')}
        dataGapSummary={dataGapSummary}
        showToast={showToast}
      />

      {/* Workspace Sub-Navigation Tabs */}
      <div className="border-b border-white/10 pb-2 overflow-x-auto">
        <Tabs
          tabs={tabs.map(tab => ({
            id: tab.id,
            label: tab.label,
            badge: tab.count !== undefined ? tab.count : undefined
          }))}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="border-0 bg-transparent"
        />
      </div>

      {/* Tab 1: ISO 14064 Checklist */}
      {activeTab === 'checklist' && (
        <ChecklistTab
          isLight={isLight}
          checklist={checklist}
          onToggleStatus={handleToggleChecklistStatus}
        />
      )}

      {/* Tab 2: Data Gap Analyzer */}
      {activeTab === 'datagaps' && (
        <DataGapsTab
          isLight={isLight}
          dataGapSummary={dataGapSummary}
          showToast={showToast}
        />
      )}

      {/* Tab 3: Verifier Inquiries (Q&A) */}
      {activeTab === 'inquiries' && (
        <InquiriesTab
          isLight={isLight}
          inquiries={inquiries}
          newInquiryVerifier={newInquiryVerifier}
          setNewInquiryVerifier={setNewInquiryVerifier}
          newInquiryQuestion={newInquiryQuestion}
          setNewInquiryQuestion={setNewInquiryQuestion}
          onAddInquiry={handleAddInquiry}
          showToast={showToast}
        />
      )}

      {/* Tab 4: Base Year Recalculation */}
      {activeTab === 'baseyear' && (
        <BaseYearTab
          isLight={isLight}
          baseYear={baseYear}
          setBaseYear={setBaseYear}
          baseYearEmissions={baseYearEmissions}
          setBaseYearEmissions={setBaseYearEmissions}
          structuralChangeTco2e={structuralChangeTco2e}
          setStructuralChangeTco2e={setStructuralChangeTco2e}
          structuralChangeReason={structuralChangeReason}
          setStructuralChangeReason={setStructuralChangeReason}
          isAuditorLocked={isAuditorLocked}
          baseYearRecalculation={baseYearRecalculation}
          client={client}
          showToast={showToast}
        />
      )}

      {/* Tab 5: EU CBAM Customs Export */}
      {activeTab === 'cbam' && (
        <CbamTab
          isLight={isLight}
          cbamSector={cbamSector}
          setCbamSector={setCbamSector}
          cbamExportTons={cbamExportTons}
          setCbamExportTons={setCbamExportTons}
          cbamElectricityOrigin={cbamElectricityOrigin}
          cbamResult={cbamResult}
          client={client}
          showToast={showToast}
        />
      )}

      {/* Tab 6: Attestation Statement */}
      {activeTab === 'signoff' && (
        <SignoffTab
          isLight={isLight}
          client={client}
          copiedKey={copiedKey}
          onCopyOpinion={() =>
            copyToClipboard(
              `INDEPENDENT AUDIT VERIFICATION OPINION\nClient: ${client.name}\nReporting Year: 2026\nStandard: ISO 14064-1:2018 / GHG Protocol\nAssurance Level: Limited Assurance\nSHA-256 Digest: c9b8f5e3d7a1e0b4c8a2f1e6b9c7d0a3`,
              'opinion'
            )
          }
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default VerificationReadinessCenter;
