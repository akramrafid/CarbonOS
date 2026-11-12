import React from 'react';
import {
  Cpu,
  Lock,
  Copy,
  Check,
  CheckCircle2,
  Globe,
  FileSpreadsheet,
  ArrowUpRight,
  Send,
  Database
} from 'lucide-react';
import Button from '@/components/ui/Button';

export function RegistryOverviewTab({
  projects,
  selectedProjectId,
  setSelectedProjectId,
  selectedProject,
  handleCopyHash,
  copiedHash,
  handleOpenJcmExport,
  setActiveTab,
  submissionFeedback,
  setShowSubmissionModal,
  isSubmitting,
  submissions
}) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Project Portfolio Switcher */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((proj) => {
          const isSelected = proj.id === selectedProjectId;
          return (
            <div
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-[#08130C] border-[#00C853] shadow-[0_0_24px_rgba(0,200,83,0.15)] ring-1 ring-[#00C853]'
                  : 'bg-[#08130C]/60 border-[#152B1D] hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#00C853] bg-[#0D2B1A] border border-[#00C853]/30 px-2 py-0.5 rounded">
                  {proj.sector} • {proj.mitigation_type}
                </span>
                <span className="font-mono text-[11px] text-white/50">
                  {proj.external_project_id}
                </span>
              </div>
              <h3 className="font-sans font-bold text-base text-white mb-2 line-clamp-1">
                {proj.project_name}
              </h3>
              <div className="flex items-center justify-between text-xs text-white/60 pt-3 border-t border-[#152B1D]">
                <span className="font-mono">{proj.metrics.tonnes_co2e.toLocaleString()} tCO2e</span>
                <span className="inline-flex items-center text-[#00C853] font-mono text-[11px]">
                  <CheckCircle2 size={12} className="mr-1" />
                  Positive List
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Stage: Inbound dMRV Telemetry + Outbound National Submission Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: dMRV Inbound Remote Sensing & Multi-Pool Stocks (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Real-time Ingestion Feed */}
          <div className="bg-[#08130C] border border-[#152B1D] rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#152B1D]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#0D2B1A] border border-[#00C853]/30 flex items-center justify-center text-[#00C853]">
                  <Cpu size={20} />
                </div>
                <div>
                  <h2 className="font-sans font-bold text-lg text-white">
                    Inbound dMRV Sensor Telemetry
                  </h2>
                  <span className="font-mono text-xs text-white/50">
                    Multispectral Satellite + GEDI LiDAR Pipeline (inference/carbon_monitoring)
                  </span>
                </div>
              </div>
              <span className="font-mono text-xs bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20 px-2.5 py-1 rounded-full flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-ping mr-1"></span>
                Synchronized
              </span>
            </div>

            {/* Remote Sensing Indices Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-[#040906] border border-[#152B1D] p-3 rounded-xl">
                <span className="font-mono text-[10px] text-white/50 block">Sentinel-2 NDVI</span>
                <span className="font-mono text-xl font-bold text-[#00C853] mt-1 block">
                  {selectedProject.metrics.ndvi.toFixed(2)}
                </span>
                <span className="font-sans text-[10px] text-white/40">Healthy Canopy</span>
              </div>

              <div className="bg-[#040906] border border-[#152B1D] p-3 rounded-xl">
                <span className="font-mono text-[10px] text-white/50 block">Sentinel-1 SAR</span>
                <span className="font-mono text-xl font-bold text-white mt-1 block">
                  {selectedProject.metrics.s1_ratio.toFixed(2)}
                </span>
                <span className="font-sans text-[10px] text-white/40">Cross-Pol Ratio</span>
              </div>

              <div className="bg-[#040906] border border-[#152B1D] p-3 rounded-xl">
                <span className="font-mono text-[10px] text-white/50 block">GEDI Canopy Height</span>
                <span className="font-mono text-xl font-bold text-white mt-1 block">
                  {selectedProject.metrics.canopy_height_m}m
                </span>
                <span className="font-sans text-[10px] text-white/40">RH98 Waveform</span>
              </div>

              <div className="bg-[#040906] border border-[#152B1D] p-3 rounded-xl">
                <span className="font-mono text-[10px] text-white/50 block">Conformal Bound</span>
                <span className="font-mono text-base font-bold text-[#00C853] mt-1 block">
                  90% CI
                </span>
                <span className="font-sans text-[10px] text-white/40">Conservative</span>
              </div>
            </div>

            {/* Multi-Pool Carbon Stocks */}
            <div className="bg-[#040906] border border-[#152B1D] rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-white/70 font-bold uppercase tracking-wider">
                  IPCC Multi-Pool Carbon Stock Distribution
                </span>
                <span className="font-mono text-xs text-[#00C853]">
                  Total: {selectedProject.metrics.carbon_tc_ha.toFixed(1)} tC/ha
                </span>
              </div>

              <div className="w-full h-3 bg-[#0D2B1A] rounded-full overflow-hidden flex mb-3">
                <div style={{ width: '52%' }} className="bg-[#00C853] h-full" title="Above-Ground Biomass (AGB)"></div>
                <div style={{ width: '18%' }} className="bg-[#00E676] opacity-80 h-full" title="Below-Ground Biomass (BGB)"></div>
                <div style={{ width: '30%' }} className="bg-[#15803d] h-full" title="Soil Organic Carbon (SOC)"></div>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00C853]"></span>
                  <span className="text-white/60">AGB:</span>
                  <span className="text-white font-bold">{selectedProject.metrics.carbon_agb_tc_ha} tC/ha</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00E676] opacity-80"></span>
                  <span className="text-white/60">BGB:</span>
                  <span className="text-white font-bold">{selectedProject.metrics.carbon_bgb_tc_ha} tC/ha</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#15803d]"></span>
                  <span className="text-white/60">SOC:</span>
                  <span className="text-white font-bold">{selectedProject.metrics.carbon_soc_tc_ha} tC/ha</span>
                </div>
              </div>
            </div>

            {/* Cryptographic Provenance Root Seal */}
            <div className="bg-[#0D2B1A]/40 border border-[#00C853]/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <Lock size={18} className="text-[#00C853] shrink-0" />
                <div>
                  <span className="font-mono text-[10px] text-[#00C853] uppercase tracking-wider block">
                    Cryptographic Provenance Chain Hash (Constraint 1)
                  </span>
                  <span className="font-mono text-xs text-white/90 break-all select-all">
                    {selectedProject.metrics.provenance_hash}
                  </span>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCopyHash(selectedProject.metrics.provenance_hash)}
                leftIcon={copiedHash ? <Check size={12} className="text-[#00C853]" /> : <Copy size={12} />}
                className="font-mono text-xs shrink-0"
              >
                {copiedHash ? 'Copied' : 'Copy Hash'}
              </Button>
            </div>
          </div>

          {/* Article 6 Bilateral Quick Export Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              role="button"
              tabIndex={0}
              onClick={handleOpenJcmExport}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenJcmExport(); }}
              className="p-4 rounded-xl border border-[#152B1D] bg-[#08130C] hover:bg-[#0D2B1A] transition-all flex items-center justify-between text-left group cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald outline-none"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[#00C853] group-hover:scale-110 transition-transform">
                  <Globe size={18} />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-sm text-white">Generate JCM Bilateral Document</h4>
                  <span className="font-mono text-xs text-white/50">Form JCM_BD_F_MoR (50/50 Split)</span>
                </div>
              </div>
              <ArrowUpRight size={16} className="text-white/40 group-hover:text-white transition-colors" />
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => setActiveTab('btr')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab('btr'); }}
              className="p-4 rounded-xl border border-[#152B1D] bg-[#08130C] hover:bg-[#0D2B1A] transition-all flex items-center justify-between text-left group cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald outline-none"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[#00C853] group-hover:scale-110 transition-transform">
                  <FileSpreadsheet size={18} />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-sm text-white">UNFCCC BTR Structured Summary</h4>
                  <span className="font-mono text-xs text-white/50">Article 13 ETF / 6.2 Accounting</span>
                </div>
              </div>
              <ArrowUpRight size={16} className="text-white/40 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>

        {/* Right Column: Outbound National Registry Submission Engine (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Submission Control Panel */}
          <div className="bg-[#08130C] border border-[#152B1D] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-2">
                <Send size={18} className="text-[#00C853]" />
                <h3 className="font-sans font-bold text-base text-white">
                  National Registry Transmission Bridge
                </h3>
              </div>
              <p className="font-sans text-xs text-white/70 leading-relaxed">
                Packages telemetry from dMRV into an authenticated JSON bundle per UNDP National Carbon Registry API
                specifications. Cryptographic signature and SHA-256 state hash are immutably signed.
              </p>

              <div className="space-y-2 pt-2 border-t border-[#152B1D]">
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Target Endpoint:</span>
                  <span className="font-mono text-white">POST /national-api/v1/monitoring</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Attached Provenance:</span>
                  <span className="font-mono text-[#00C853] flex items-center">
                    <CheckCircle2 size={12} className="mr-1" />
                    Validated
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Positive List Clearance:</span>
                  <span className="font-mono text-[#00C853] flex items-center">
                    <CheckCircle2 size={12} className="mr-1" />
                    Approved (DOE Gazette)
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Reporting Tonnes:</span>
                  <span className="font-mono font-bold text-white">
                    {selectedProject.metrics.tonnes_co2e.toLocaleString()} tCO2e
                  </span>
                </div>
              </div>
            </div>

            {submissionFeedback && (
              <div
                className={`p-3.5 rounded-xl border text-xs mb-4 font-mono ${
                  submissionFeedback.status === 'success'
                    ? 'bg-[#0D2B1A] border-[#00C853]/40 text-[#00C853]'
                    : 'bg-red-950/40 border-red-500/40 text-red-400'
                }`}
              >
                {submissionFeedback.message}
              </div>
            )}

            <Button
              variant="secondary"
              size="lg"
              onClick={() => setShowSubmissionModal(true)}
              disabled={isSubmitting}
              className="w-full"
            >
              <Send size={16} className="mr-2" />
              <span>Submit Monitoring Report to Registry</span>
            </Button>
          </div>

          {/* Outbound Submissions Ledger */}
          <div className="bg-[#08130C] border border-[#152B1D] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sans font-bold text-sm text-white flex items-center space-x-2">
                <Database size={15} className="text-[#00C853]" />
                <span>Outbound Audit Ledger</span>
              </h3>
              <span className="font-mono text-xs text-white/50">{submissions.length} Recorded</span>
            </div>

            <div className="space-y-3">
              {submissions.map((sub, index) => (
                <div
                  key={sub.id || index}
                  className="bg-[#040906] border border-[#152B1D] p-3 rounded-xl space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#00C853]">{sub.external_id}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#0D2B1A] text-[#00C853] border border-[#00C853]/30 uppercase">
                      HTTP {sub.response_status || 201} OK
                    </span>
                  </div>
                  <div className="font-sans text-xs text-white/80 line-clamp-1">{sub.project_name}</div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-white/40 pt-1 border-t border-[#152B1D]">
                    <span>{new Date(sub.submitted_at).toLocaleDateString()}</span>
                    <span className="truncate max-w-[140px] text-white/60">
                      {sub.provenance_hash.substring(0, 16)}...
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistryOverviewTab;
