import React from 'react';
import { Send, Globe, FileText } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export function SubmissionModal({
  isOpen,
  onClose,
  selectedProject,
  isSubmitting,
  onSubmit
}) {
  if (!selectedProject) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Transmission to National Registry"
      size="md"
      footer={
        <div className="flex items-center justify-end space-x-3 w-full">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Transmitting...' : 'Confirm & Send'}
          </Button>
        </div>
      }
    >
      <div className="space-y-3 font-mono text-xs">
        <div className="p-3 bg-bg-canvas rounded-xl border border-border-subtle space-y-2">
          <div className="flex justify-between">
            <span className="text-white/50">Target Registry:</span>
            <span className="text-white">UNDP National Carbon Registry</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Project ID:</span>
            <span className="text-accent">{selectedProject.external_project_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Reported Volume:</span>
            <span className="text-white font-bold">{selectedProject.metrics?.tonnes_co2e} tCO2e</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Provenance Hash:</span>
            <span className="text-accent font-mono text-[11px] truncate max-w-[200px]">
              {selectedProject.metrics?.provenance_hash}
            </span>
          </div>
        </div>

        <p className="font-sans text-xs text-white/60 leading-relaxed">
          By transmitting, an immutable audit entry will be signed with the agency's ECDSA key and logged
          into the national ledger.
        </p>
      </div>
    </Modal>
  );
}

export function JcmModal({
  isOpen,
  onClose,
  jcmData
}) {
  if (!jcmData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Japan-Bangladesh JCM Monitoring Form Formatted Output"
      size="lg"
      footer={
        <div className="flex items-center justify-end w-full">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="overflow-y-auto max-h-[60vh] font-mono text-xs space-y-4 pr-1">
        <div className="p-3 bg-bg-canvas rounded-xl border border-border-subtle space-y-1.5">
          <div className="text-accent font-bold">DOCUMENT METADATA</div>
          <div className="text-white/70">Type: {jcmData.document_metadata?.document_type}</div>
          <div className="text-white/70">Secretariat: {jcmData.document_metadata?.secretariat}</div>
        </div>

        <div className="p-3 bg-bg-canvas rounded-xl border border-border-subtle space-y-1.5">
          <div className="text-accent font-bold">EMISSION REDUCTIONS (ER_p = RE_p - PE_p)</div>
          <div className="text-white/70">Formula: {jcmData.emission_reduction_calculation?.formula}</div>
          <div className="text-white/70">
            Reference Emissions: {jcmData.emission_reduction_calculation?.reference_emissions_re_p_tco2e} tCO2e
          </div>
          <div className="text-white/70">
            Project Emissions: {jcmData.emission_reduction_calculation?.project_emissions_pe_p_tco2e} tCO2e
          </div>
          <div className="text-accent font-bold">
            Net Emission Reductions: {jcmData.emission_reduction_calculation?.net_emission_reductions_er_p_tco2e} tCO2e
          </div>
        </div>

        <div className="p-3 bg-bg-canvas rounded-xl border border-border-subtle space-y-1.5">
          <div className="text-accent font-bold">BILATERAL ALLOCATION SPLIT</div>
          <div className="text-white/70">
            Bangladesh NDC Retention (50%):{' '}
            {jcmData.emission_reduction_calculation?.bilateral_allocation_split?.bangladesh_retained_credits_tco2e} tCO2e
          </div>
          <div className="text-white/70">
            Japan ITMO Transfer (50%):{' '}
            {jcmData.emission_reduction_calculation?.bilateral_allocation_split?.japan_transferred_credits_tco2e} tCO2e
          </div>
        </div>

        <div className="p-3 bg-bg-canvas rounded-xl border border-border-subtle space-y-1.5">
          <div className="text-accent font-bold">PROVENANCE SEAL</div>
          <div className="text-white/70 break-all">
            {jcmData.cryptographic_verification?.provenance_hash_attached}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function BtrJsonModal({
  isOpen,
  onClose
}) {
  const btrData = {
    reporting_party: "People's Republic of Bangladesh",
    designated_national_authority: "Ministry of Environment, Forest and Climate Change (MoEFCC)",
    biennial_transparency_report_cycle: "BTR1 (2024-2026)",
    framework_mandate: "UNFCCC Article 13 Enhanced Transparency Framework (ETF) & Article 6.2",
    structured_summary: {
      total_itmos_authorized_tco2e: 5000.0,
      total_corresponding_adjustments_applied_tco2e: 5000.0,
      sovereign_ndc_reserve_retained_tco2e: 5000.0,
      sectoral_inventory_adjustments: {
        LULUCF_Forestry: 10000.0,
        Agriculture: 0.0,
        Energy: 0.0,
        Waste: 0.0,
        IPPU: 0.0
      },
      authorized_transfer_partners: ["Government of Japan (JCM Secretariart)"],
      cryptographic_provenance_validation: "VERIFIED_100_PERCENT_CHAIN_INTEGRITY"
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="UNFCCC Article 13 & 6.2 Structured Summary (JSON)"
      size="lg"
      footer={
        <div className="flex items-center justify-end w-full">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="overflow-y-auto max-h-[60vh] font-mono text-xs bg-bg-canvas p-4 rounded-xl border border-border-subtle text-accent">
        <pre className="whitespace-pre-wrap">{JSON.stringify(btrData, null, 2)}</pre>
      </div>
    </Modal>
  );
}
