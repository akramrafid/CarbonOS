import React from 'react';
import { ShieldCheck, Lock, Unlock, FileCheck } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';

export function ReadinessHeader({
  isLight = false,
  client,
  readinessStats,
  isAuditorLocked,
  setIsAuditorLocked,
  onOpenSignoff,
  dataGapSummary,
  showToast
}) {
  return (
    <div
      className={`rounded-3xl p-6 sm:p-8 border shadow-2xl relative overflow-hidden transition-all ${
        isLight ? 'bg-white border-[#E2E8E3]' : 'bg-[#08130C] border-[#152B1D]'
      }`}
    >
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative z-10">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-[#00C853] font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>ISO 14064-1 &amp; GHG Protocol Assurance Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1 flex items-center gap-3">
            <span>Verification Readiness Center</span>
            <span
              className={`text-xs px-3 py-1 rounded-full font-mono font-bold border ${
                readinessStats.score >= 80
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {readinessStats.score}% Assurance Ready
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
            Auditor-grade verification workspace for{' '}
            <strong className="text-white font-semibold">{client.name}</strong>. Reconciles primary activity evidence, gap analyses, base-year recalculations, and verifier inquiry trails prior to external third-party assurance.
          </p>
        </div>

        {/* Action Tools & Lock Toggle */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Auditor View Lock */}
          <div
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl border transition-all ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#040906] border-[#152B1D]'
            }`}
          >
            <span className="text-xs font-bold">Auditor View Lock:</span>
            <Button
              variant={isAuditorLocked ? 'primary' : 'secondary'}
              size="sm"
              aria-label="Toggle Auditor View Lock"
              onClick={() => {
                setIsAuditorLocked(!isAuditorLocked);
                showToast(
                  !isAuditorLocked
                    ? 'Auditor View Lock enabled. All metrics and inventory states frozen for verification.'
                    : 'Auditor View Lock disabled. Editing and uploading unlocked.',
                  'info'
                );
              }}
              leftIcon={isAuditorLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              className="text-xs h-auto min-h-0 py-1 px-2.5"
            >
              {isAuditorLocked ? 'Locked' : 'Unlocked'}
            </Button>
          </div>

          {/* Quick Export Statement */}
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenSignoff}
            className="flex items-center space-x-2"
          >
            <FileCheck className="w-4 h-4" />
            <span>Verifier Statement</span>
          </Button>
        </div>
      </div>

      {/* Dynamic Metric Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
        <StatCard
          title="Assurance Target"
          value="Reasonable"
          unit="ISAE 3410"
          subtitle="ISO 14064-3 Protocol"
        />

        <StatCard
          title="Checklist Verified"
          value={`${readinessStats.verifiedCount}/${readinessStats.total}`}
          unit="items"
          subtitle={`${readinessStats.readyCount} pending final review`}
          trend={readinessStats.verifiedCount > 5 ? 'up' : 'neutral'}
        />

        <StatCard
          title="Primary Evidence"
          value="96.4%"
          unit="coverage"
          subtitle="Exceeds 95% threshold"
          trend="up"
        />

        <StatCard
          title="Active Data Gaps"
          value={String(dataGapSummary.totalGaps)}
          unit="identified"
          subtitle={`${dataGapSummary.missingEvidence.length} missing docs`}
          trend={dataGapSummary.totalGaps === 0 ? 'up' : 'down'}
        />
      </div>
    </div>
  );
}

export default ReadinessHeader;
