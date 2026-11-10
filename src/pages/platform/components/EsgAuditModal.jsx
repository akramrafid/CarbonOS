import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Leaf, 
  Users, 
  Scale, 
  FileText, 
  Download, 
  Building, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

export function EsgAuditModal({
  isOpen,
  onClose,
  isLight = false,
  activeClient,
  esgMetrics,
  results,
  inputs,
  ef,
  marketFactor
}) {
  const [selectedPillar, setSelectedPillar] = useState('ALL');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !esgMetrics) return null;

  const filteredCriteria = esgMetrics.criteria.filter((c) => {
    if (selectedPillar === 'ALL') return true;
    return c.pillar === selectedPillar;
  });

  const activeCount = esgMetrics.criteria.filter(c => c.active).length;
  const envActiveCount = esgMetrics.criteria.filter(c => c.pillar === 'E' && c.active).length;
  const socActiveCount = esgMetrics.criteria.filter(c => c.pillar === 'S' && c.active).length;
  const govActiveCount = esgMetrics.criteria.filter(c => c.pillar === 'G' && c.active).length;

  const handleExportJSON = () => {
    const report = {
      tenant: activeClient.name,
      legalName: activeClient.legalName,
      sector: activeClient.sector,
      standard: activeClient.reportingStandard,
      assignedAuditor: activeClient.assignedAuditor,
      auditTimestamp: new Date().toISOString(),
      score: {
        total: esgMetrics.totalScore,
        aiRating: esgMetrics.aiRating,
        tier: esgMetrics.tier,
        pillars: {
          environmental: { score: esgMetrics.envScore, max: 50 },
          social: { score: esgMetrics.socScore, max: 25 },
          governance: { score: esgMetrics.govScore, max: 25 }
        }
      },
      operationalEmissionsTco2e: results,
      criteriaAudit: esgMetrics.criteria
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeClient.id}-esg-audit-dossier.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md bg-black/70 overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl border transition-all my-auto overflow-hidden ${
          isLight ? 'bg-white border-[#E2E8E3] text-[#0F2417]' : 'bg-[#08130C] border-[#152B1D] text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className={`p-6 border-b flex items-start justify-between gap-4 shrink-0 ${
          isLight ? 'border-[#E8ECE8] bg-[#F7FAF7]' : 'border-[#152B1D] bg-[#0A1910]'
        }`}>
          <div>
            <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-[#00C853] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Audited ESG Score Justification & Methodology Dossier</span>
            </div>
            <h2 className="font-sans font-black text-xl sm:text-2xl mt-1 tracking-tight">
              {activeClient.name} — ESG Assurance Audit
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-[#7C9A88]">
              <span><strong>Sector:</strong> {activeClient.sector}</span>
              <span>•</span>
              <span><strong>Reporting:</strong> {activeClient.reportingStandard}</span>
              <span>•</span>
              <span><strong>Auditor:</strong> {activeClient.assignedAuditor || 'Certified ESG Lead'}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isLight ? 'hover:bg-gray-200 text-gray-500' : 'hover:bg-white/10 text-gray-400 hover:text-white'
            }`}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL SCROLLABLE BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TOP SUMMARY ROW: SCORE + 3 PILLARS */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            
            {/* Overall Score Badge */}
            <div className={`sm:col-span-4 rounded-2xl p-5 border flex flex-col justify-between ${
              isLight ? 'bg-[#EAF7EE] border-[#00C853]/30 text-[#0B4D26]' : 'bg-[#00C853]/10 border-[#00C853]/40 text-[#4ADE80]'
            }`}>
              <div>
                <span className="text-[11px] font-mono uppercase font-bold tracking-wider">
                  Aggregated Score
                </span>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="font-sans font-black text-4xl sm:text-5xl tracking-tight text-[#00C853]">
                    {esgMetrics.totalScore}
                  </span>
                  <span className="text-base font-mono font-bold text-gray-400">/ 100</span>
                </div>
                <div className="mt-2 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#00C853]/20 text-[#00C853]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{esgMetrics.tier}</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#00C853]/20 text-[11px] font-mono">
                AI Rating: <strong>{esgMetrics.aiRating} / 10.0</strong> • <strong>{activeCount} of 24</strong> criteria active
              </div>
            </div>

            {/* Pillar 1: Environmental */}
            <div className={`sm:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3`}>
              
              <div className={`rounded-2xl p-4 border flex flex-col justify-between ${
                isLight ? 'bg-[#F9FBFA] border-[#E8ECE8]' : 'bg-[#0B1A11] border-[#152B1D]'
              }`}>
                <div>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-[#00C853]">
                    <Leaf className="w-3.5 h-3.5" />
                    <span>Environmental</span>
                  </div>
                  <div className="mt-2 font-sans font-extrabold text-2xl tracking-tight">
                    {esgMetrics.envScore} <span className="text-xs font-mono font-normal text-gray-400">/ 50</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#7C9A88] leading-snug">
                    Intensity: <strong>{esgMetrics.actualIntensity}</strong> tCO2e/FTE (Target: {esgMetrics.benchmarkIntensity})
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-[#00C853]">
                  {envActiveCount}/12 Criteria Verified
                </div>
              </div>

              {/* Pillar 2: Social */}
              <div className={`rounded-2xl p-4 border flex flex-col justify-between ${
                isLight ? 'bg-[#F9FBFA] border-[#E8ECE8]' : 'bg-[#0B1A11] border-[#152B1D]'
              }`}>
                <div>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-sky-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>Social</span>
                  </div>
                  <div className="mt-2 font-sans font-extrabold text-2xl tracking-tight">
                    {esgMetrics.socScore} <span className="text-xs font-mono font-normal text-gray-400">/ 25</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#7C9A88] leading-snug">
                    Workforce: <strong>{inputs?.employees || 0}</strong> FTE under Labour Act 2006 fair wages
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-sky-400">
                  {socActiveCount}/6 Criteria Verified
                </div>
              </div>

              {/* Pillar 3: Governance */}
              <div className={`rounded-2xl p-4 border flex flex-col justify-between ${
                isLight ? 'bg-[#F9FBFA] border-[#E8ECE8]' : 'bg-[#0B1A11] border-[#152B1D]'
              }`}>
                <div>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Governance</span>
                  </div>
                  <div className="mt-2 font-sans font-extrabold text-2xl tracking-tight">
                    {esgMetrics.govScore} <span className="text-xs font-mono font-normal text-gray-400">/ 25</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#7C9A88] leading-snug">
                    Standards: <strong>{activeClient.reportingStandard ? 'ISO/GHG' : 'Internal'}</strong> with assigned auditor
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-amber-400">
                  {govActiveCount}/6 Criteria Verified
                </div>
              </div>

            </div>

          </div>

          {/* SCIENTIFIC JUSTIFICATION ACCORDION */}
          <div className={`p-4.5 rounded-2xl border text-xs leading-relaxed space-y-2.5 ${
            isLight ? 'bg-[#F4F6F4] border-[#E8ECE8] text-[#243E30]' : 'bg-[#06120A] border-[#162D1F] text-[#B0C8B8]'
          }`}>
            <div className="flex items-center space-x-2 font-mono font-bold text-[11px] uppercase tracking-wider text-[#00C853]">
              <Info className="w-4 h-4 text-[#00C853]" />
              <span>Scientific & Mathematical Formulation</span>
            </div>
            <p>
              This corporate ESG score is computed dynamically from primary operational telemetry without synthetic estimation:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-[#E2E8E3]' : 'bg-[#0A170F] border-[#152B1D]'}`}>
                <div className="font-mono font-bold text-[#00C853] text-[10px]">ENVIRONMENTAL FORMULA (50 PTS)</div>
                <div className="mt-1 font-mono text-[11px]">
                  Score = Intensity (20) + Scope 2 Green Tariff (15) + Insets (15)
                </div>
                <div className="mt-1 text-[10px] text-gray-400">
                  Evaluates {results.total} tCO2e gross footprint across {inputs.employees} FTE against Bangladesh sector benchmark ({esgMetrics.benchmarkIntensity} t/FTE).
                </div>
              </div>

              <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-[#E2E8E3]' : 'bg-[#0A170F] border-[#152B1D]'}`}>
                <div className="font-mono font-bold text-amber-400 text-[10px]">GOVERNANCE & SOCIAL (50 PTS)</div>
                <div className="mt-1 font-mono text-[11px]">
                  Social (25) + Governance (25) = 50 pts
                </div>
                <div className="mt-1 text-[10px] text-gray-400">
                  Substantiated with primary PDF invoice: <code>{activeClient.sampleInvoiceName || 'DESCO Substation Bill'}</code> and ISO 14064-1 verification.
                </div>
              </div>
            </div>
          </div>

          {/* 24-CAPSULE CRITERIA EXPLORER */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-sans font-bold text-sm uppercase tracking-wide flex items-center space-x-2">
                <span>The 24 Standardized Disclosure Capsules</span>
                <span className="text-xs font-mono font-normal text-[#7C9A88]">
                  ({activeCount}/24 active)
                </span>
              </h3>

              {/* Pillar Filter Tabs */}
              <div className={`inline-flex p-1 rounded-xl border text-xs font-mono ${
                isLight ? 'bg-[#F2F5F2] border-[#E8ECE8]' : 'bg-[#09170E] border-[#152B1D]'
              }`}>
                {[
                  { id: 'ALL', label: `All (24)` },
                  { id: 'E', label: `Environmental (12)` },
                  { id: 'S', label: `Social (6)` },
                  { id: 'G', label: `Governance (6)` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedPillar(tab.id)}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      selectedPillar === tab.id
                        ? 'bg-[#00C853] text-white font-bold shadow-xs'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Criteria Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {filteredCriteria.map((c) => (
                <div
                  key={c.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    c.active
                      ? (isLight 
                          ? 'bg-white border-[#E8ECE8] shadow-xs' 
                          : 'bg-[#0B1A11] border-[#173822] shadow-xs')
                      : (isLight 
                          ? 'bg-[#FAFAFA] border-[#EBEBEB] opacity-60' 
                          : 'bg-[#060D08] border-[#121F16] opacity-60')
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#00C853]/15 text-[#00C853] font-bold">
                        {c.code}
                      </span>
                      <span className={`text-[10px] font-mono font-bold flex items-center space-x-1 ${
                        c.active ? 'text-[#00C853]' : 'text-amber-500'
                      }`}>
                        {c.active ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>VERIFIED ACTIVE</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>PENDING EVIDENCE</span>
                          </>
                        )}
                      </span>
                    </div>

                    <h4 className="font-sans font-bold text-xs mt-2 text-inherit">
                      {c.title}
                    </h4>

                    <div className="mt-1 text-[10px] font-mono text-[#7C9A88]">
                      Standard: {c.standard}
                    </div>

                    <p className={`mt-2 text-[11px] leading-relaxed ${isLight ? 'text-[#445D4F]' : 'text-[#8AA694]'}`}>
                      {c.justification}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className={`p-4 sm:p-5 border-t flex flex-wrap items-center justify-between gap-3 shrink-0 ${
          isLight ? 'border-[#E8ECE8] bg-[#F7FAF7]' : 'border-[#152B1D] bg-[#0A1910]'
        }`}>
          <div className="flex items-center space-x-2 text-xs text-[#7C9A88] font-mono">
            <span className="w-2 h-2 rounded-full bg-[#00C853]"></span>
            <span>Aligned with GHG Protocol Corporate Standard & IPCC AR6</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportJSON}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold border flex items-center space-x-1.5 transition-all ${
                isLight 
                  ? 'bg-white hover:bg-gray-100 border-[#D5DDD6] text-[#0F2417]' 
                  : 'bg-[#122418] hover:bg-[#1A3323] border-[#1D4A2F] text-white'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit JSON</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#00C853] hover:bg-[#00E676] text-white font-sans font-bold text-xs transition-colors shadow-md cursor-pointer"
            >
              Close Dossier
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

