import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { fmt } from './activityData';

export function EvidenceDetailModal({
  selectedEvidence,
  onClose,
  activeClient,
  isLight = false
}) {
  if (!selectedEvidence) return null;

  return (
    <Modal
      isOpen={Boolean(selectedEvidence)}
      onClose={onClose}
      title={selectedEvidence.title}
      subtitle={`Official verification record under ISAE 3410 assurance for ${activeClient?.name || 'Client'}.`}
      size="lg"
      footer={
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Audit Record
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-accent font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Primary Evidence Audit Trail</span>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-black/30 border border-border-subtle text-xs">
          <div>
            <span className="text-gray-400 text-[10px] block">DOCUMENT IDENTIFIER</span>
            <span className="font-mono font-bold text-white text-sm">{selectedEvidence.id}</span>
          </div>
          <div>
            <span className="text-gray-400 text-[10px] block">ISSUING AUTHORITY</span>
            <span className="font-semibold text-white">{selectedEvidence.issuer}</span>
          </div>
          <div>
            <span className="text-gray-400 text-[10px] block">REGISTRATION / METER REF</span>
            <span className="font-mono text-white">{selectedEvidence.documentNumber}</span>
          </div>
          <div>
            <span className="text-gray-400 text-[10px] block">AUDIT PERIOD</span>
            <span className="font-mono text-white">{selectedEvidence.period}</span>
          </div>
          <div>
            <span className="text-gray-400 text-[10px] block">VERIFIED MONETARY AMOUNT</span>
            <span className="font-mono font-bold text-accent text-sm">
              {selectedEvidence.amountBdt > 0 ? `BDT ${fmt(selectedEvidence.amountBdt, 0)}` : 'Internal Census / Free'}
            </span>
          </div>
          <div>
            <span className="text-gray-400 text-[10px] block">ATTESTING AUDITOR</span>
            <span className="font-semibold text-emerald-300">{selectedEvidence.verifiedBy}</span>
          </div>
        </div>

        {/* Cryptographic SHA-256 Stamp */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-border-subtle font-mono text-[11px] space-y-1">
          <span className="text-gray-400 text-[10px] block">SHA-256 CRYPTOGRAPHIC PROVENANCE HASH</span>
          <span className="text-accent-hover break-all select-all font-mono">
            {selectedEvidence.sha256}
          </span>
        </div>

        {/* Notes */}
        <div className="p-3.5 rounded-xl bg-black/20 border border-border-subtle text-xs leading-relaxed text-gray-300">
          <span className="font-bold text-white block mb-0.5">Assurance Note:</span>
          {selectedEvidence.notes}
        </div>
      </div>
    </Modal>
  );
}

export default EvidenceDetailModal;
