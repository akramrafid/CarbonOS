import React from 'react';
import { ShieldCheck, Check, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUtilityExtractorState } from './utility-extractor/useUtilityExtractorState';
import { ExtractorHeader } from './utility-extractor/ExtractorHeader';
import { AuditTrailDrawer } from './utility-extractor/AuditTrailDrawer';
import { UploadSection } from './utility-extractor/UploadSection';
import { SegmentsTable } from './utility-extractor/SegmentsTable';
import { EditSegmentModal } from './utility-extractor/EditSegmentModal';
import { AddSegmentModal } from './utility-extractor/AddSegmentModal';

export const UniversalUtilityExtractor = ({
  isLight = false,
  locale = {},
  activeClientId = 'east-delta-university',
  onApplyToLedger = () => {}
}) => {
  const {
    activeClient,
    activeInvoice,
    segments,
    activeSegments,
    isProcessing,
    isCommitted,
    showAddSegmentModal,
    setShowAddSegmentModal,
    showEditModal,
    setShowEditModal,
    editingSegment,
    setEditingSegment,
    auditLog,
    showAuditDrawer,
    setShowAuditDrawer,
    auditSeal,
    isSimulationMode,
    newSegment,
    setNewSegment,
    scope1Total,
    scope2Total,
    scope3Total,
    grandTotal,
    scope2Missing,
    grandCost,
    handleLoadClientTemplate,
    handleUploadFile,
    handleOpenEdit,
    handleSaveCorrection,
    handleToggleReject,
    handleAddCustomSegment,
    handleCommitToLedger
  } = useUtilityExtractorState(activeClientId, onApplyToLedger);

  return (
    <div
      className={`space-y-8 rounded-3xl p-6 lg:p-8 border transition-all duration-300 ${
        isLight ? 'bg-white border-[#E8ECE8] text-[#0F2417]' : 'bg-[#08130C] border-[#152B1D] text-white'
      }`}
    >
      {/* Header Banner & 4 StatCards */}
      <ExtractorHeader
        isLight={isLight}
        activeClient={activeClient}
        isSimulationMode={isSimulationMode}
        auditLogLength={auditLog.length}
        showAuditDrawer={showAuditDrawer}
        setShowAuditDrawer={setShowAuditDrawer}
        scope1Total={scope1Total}
        scope2Total={scope2Total}
        scope2Missing={scope2Missing}
        grandTotal={grandTotal}
        grandCost={grandCost}
        activeSegmentsCount={activeSegments.length}
        totalSegmentsCount={segments.length}
      />

      {/* Audit Log Drawer if open */}
      {showAuditDrawer && (
        <AuditTrailDrawer
          auditLog={auditLog}
          onClose={() => setShowAuditDrawer(false)}
        />
      )}

      {/* Upload Box & Template Quick Selectors */}
      <UploadSection
        isLight={isLight}
        isProcessing={isProcessing}
        activeInvoice={activeInvoice}
        onUploadFile={handleUploadFile}
        onOpenAddSegment={() => setShowAddSegmentModal(true)}
        onSelectTemplate={handleLoadClientTemplate}
      />

      {/* Detected Segments Table */}
      <SegmentsTable
        isLight={isLight}
        segments={segments}
        auditSeal={auditSeal}
        onOpenEdit={handleOpenEdit}
        onToggleReject={handleToggleReject}
      />

      {/* Action Footer: Approve & Commit */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <ShieldCheck className="w-4 h-4 text-[#00C853]" />
          <span>Line items follow the GHG Protocol Corporate Standard. Nothing here is audited, verified or assured.</span>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleCommitToLedger}
          disabled={isCommitted}
          className="flex items-center space-x-2"
        >
          {isCommitted ? (
            <>
              <Check className="w-4 h-4" />
              <span>Sealed to {activeClient.name} Ledger ({auditSeal || 'SEALED'})</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Sign Off &amp; Seal to Ledger ({scope2Missing ? 'Scope 2 factor pending' : `${grandTotal.toFixed(2)} tCO₂e`})
              </span>
            </>
          )}
        </Button>
      </div>

      {/* Human-in-the-Loop Edit Modal */}
      <EditSegmentModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        editingSegment={editingSegment}
        setEditingSegment={setEditingSegment}
        onSave={handleSaveCorrection}
      />

      {/* Add Custom Segment Modal */}
      <AddSegmentModal
        isOpen={showAddSegmentModal}
        onClose={() => setShowAddSegmentModal(false)}
        newSegment={newSegment}
        setNewSegment={setNewSegment}
        onAdd={handleAddCustomSegment}
      />
    </div>
  );
};

export default UniversalUtilityExtractor;
