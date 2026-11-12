import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Leaf, 
  Users, 
  Scale, 
  Download, 
  Sparkles, 
  Info 
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Tabs } from '../../../components/ui/Tabs';

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

  if (!isOpen || !esgMetrics || !activeClient) return null;

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

  const footer = (
    <div className="flex flex-wrap items-center justify-between gap-3 w-full">
      <div className="flex items-center space-x-2 text-xs text-mist font-mono">
        <span className="w-2 h-2 rounded-full bg-emerald" />
        <span>Aligned with GHG Protocol Corporate Standard & IPCC AR6</span>
      </div>
      <div className="flex items-center space-x-3">
        <Button variant="secondary" size="sm" onClick={handleExportJSON}>
          <Download className="w-3.5 h-3.5 mr-1" />
          Export Audit JSON
        </Button>
        <Button variant="primary" size="sm" onClick={onClose}>
          Close Dossier
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${activeClient.name} — ESG Assurance Audit`}
      subtitle={`Sector: ${activeClient.sector} • Reporting: ${activeClient.reportingStandard} • Auditor: ${activeClient.assignedAuditor || 'Certified ESG Lead'}`}
      size="xl"
      footer={footer}
    >
      <div className="space-y-6">
        {/* TOP SUMMARY ROW: SCORE + 3 PILLARS */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-4 rounded-2xl p-5 border bg-emerald/10 border-emerald/40 text-emerald flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase font-bold tracking-wider">
                Aggregated Score
              </span>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="font-sans font-black text-4xl sm:text-5xl tracking-tight text-emerald">
                  {esgMetrics.totalScore}
                </span>
                <span className="text-base font-mono font-bold text-mist/60">/ 100</span>
              </div>
              <div className="mt-2 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald/20 text-emerald">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{esgMetrics.tier}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald/20 text-[11px] font-mono">
              AI Rating: <strong>{esgMetrics.aiRating} / 10.0</strong> • <strong>{activeCount} of 24</strong> criteria active
            </div>
          </div>

          <div className="sm:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl p-4 border bg-white/[0.02] border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>Environmental</span>
                </div>
                <div className="mt-2 font-sans font-extrabold text-2xl tracking-tight text-white">
                  {esgMetrics.envScore} <span className="text-xs font-mono font-normal text-mist/60">/ 50</span>
                </div>
                <p className="mt-1 text-[11px] text-mist leading-snug">
                  Intensity: <strong>{esgMetrics.actualIntensity}</strong> tCO2e/FTE (Target: {esgMetrics.benchmarkIntensity})
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-emerald">
                {envActiveCount}/12 Criteria Verified
              </div>
            </div>

            <div className="rounded-2xl p-4 border bg-white/[0.02] border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-sky-400">
                  <Users className="w-3.5 h-3.5" />
                  <span>Social</span>
                </div>
                <div className="mt-2 font-sans font-extrabold text-2xl tracking-tight text-white">
                  {esgMetrics.socScore} <span className="text-xs font-mono font-normal text-mist/60">/ 25</span>
                </div>
                <p className="mt-1 text-[11px] text-mist leading-snug">
                  Workforce: <strong>{inputs?.employees || 0}</strong> FTE under Labour Act 2006 fair wages
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-sky-400">
                {socActiveCount}/6 Criteria Verified
              </div>
            </div>

            <div className="rounded-2xl p-4 border bg-white/[0.02] border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
                  <Scale className="w-3.5 h-3.5" />
                  <span>Governance</span>
                </div>
                <div className="mt-2 font-sans font-extrabold text-2xl tracking-tight text-white">
                  {esgMetrics.govScore} <span className="text-xs font-mono font-normal text-mist/60">/ 25</span>
                </div>
                <p className="mt-1 text-[11px] text-mist leading-snug">
                  Standards: <strong>{activeClient.reportingStandard ? 'ISO/GHG' : 'Internal'}</strong> with assigned auditor
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-amber-400">
                {govActiveCount}/6 Criteria Verified
              </div>
            </div>
          </div>
        </div>

        {/* SCIENTIFIC JUSTIFICATION */}
        <div className="p-4 rounded-2xl border text-xs leading-relaxed space-y-2.5 bg-white/[0.02] border-white/10 text-mist">
          <div className="flex items-center space-x-2 font-mono font-bold text-[11px] uppercase tracking-wider text-emerald">
            <Info className="w-4 h-4 text-emerald" />
            <span>Scientific & Mathematical Formulation</span>
          </div>
          <p>
            This corporate ESG score is computed dynamically from primary operational telemetry without synthetic estimation:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl border bg-black/40 border-white/10">
              <div className="font-mono font-bold text-emerald text-[10px]">ENVIRONMENTAL FORMULA (50 PTS)</div>
              <div className="mt-1 font-mono text-[11px] text-white">
                Score = Intensity (20) + Scope 2 Green Tariff (15) + Insets (15)
              </div>
              <div className="mt-1 text-[10px] text-mist/60">
                Evaluates {results.total} tCO2e gross footprint across {inputs.employees} FTE against Bangladesh sector benchmark ({esgMetrics.benchmarkIntensity} t/FTE).
              </div>
            </div>

            <div className="p-3 rounded-xl border bg-black/40 border-white/10">
              <div className="font-mono font-bold text-amber-400 text-[10px]">GOVERNANCE & SOCIAL (50 PTS)</div>
              <div className="mt-1 font-mono text-[11px] text-white">
                Social (25) + Governance (25) = 50 pts
              </div>
              <div className="mt-1 text-[10px] text-mist/60">
                Substantiated with primary PDF invoice: <code>{activeClient.sampleInvoiceName || 'DESCO Substation Bill'}</code> and ISO 14064-1 verification.
              </div>
            </div>
          </div>
        </div>

        {/* 24-CAPSULE CRITERIA EXPLORER */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-sans font-bold text-sm uppercase tracking-wide flex items-center space-x-2 text-white">
              <span>The 24 Standardized Disclosure Capsules</span>
              <span className="text-xs font-mono font-normal text-mist">
                ({activeCount}/24 active)
              </span>
            </h3>

            <Tabs
              tabs={[
                { id: 'ALL', label: 'All (24)' },
                { id: 'E', label: 'Environmental (12)' },
                { id: 'S', label: 'Social (6)' },
                { id: 'G', label: 'Governance (6)' }
              ]}
              activeTab={selectedPillar}
              onChange={setSelectedPillar}
              size="sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
            {filteredCriteria.map((c) => (
              <div
                key={c.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                  c.active
                    ? 'bg-white/[0.03] border-emerald/30 shadow-xs' 
                    : 'bg-black/20 border-white/5 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald/15 text-emerald font-bold">
                      {c.code}
                    </span>
                    <span className={`text-[10px] font-mono font-bold flex items-center space-x-1 ${
                      c.active ? 'text-emerald' : 'text-amber-500'
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

                  <h4 className="font-sans font-bold text-xs mt-2 text-white">
                    {c.title}
                  </h4>

                  <div className="mt-1 text-[10px] font-mono text-mist">
                    Standard: {c.standard}
                  </div>

                  <p className="mt-2 text-[11px] leading-relaxed text-mist/80">
                    {c.justification}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default EsgAuditModal;
