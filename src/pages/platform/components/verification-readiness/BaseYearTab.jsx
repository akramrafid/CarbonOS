import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function BaseYearTab({
  isLight = false,
  baseYear,
  setBaseYear,
  baseYearEmissions,
  setBaseYearEmissions,
  structuralChangeTco2e,
  setStructuralChangeTco2e,
  structuralChangeReason,
  setStructuralChangeReason,
  isAuditorLocked,
  baseYearRecalculation,
  client,
  showToast
}) {
  return (
    <div
      className="rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6 bg-bg-surface border-border-subtle"
    >
      <div>
        <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-accent font-bold">
          <span>GHG Protocol Corporate Standard Chapter 5</span>
        </div>
          <h3 className="font-bold text-lg text-fg-primary mt-0.5">Base Year Emissions Recalculation Policy</h3>
          <p className="text-xs text-fg-secondary mt-1 max-w-2xl leading-relaxed">
            Mandatory adjustment protocol for corporate baseline emissions. When structural alterations (facility acquisitions, divestitures, or insourcing/outsourcing) exceed the <strong>5.0% cumulative threshold</strong>, historic baselines must be restated to ensure like-for-like comparability.
          </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Controls */}
            <div className="space-y-4 p-5 rounded-2xl bg-bg-elevated/60 border border-border-subtle">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-fg-secondary uppercase font-mono mb-1">Baseline Year</label>
                  <input
                    type="number"
                    value={baseYear}
                    onChange={(e) => setBaseYear(parseInt(e.target.value) || 2024)}
                    disabled={isAuditorLocked}
                    className="w-full text-xs font-mono p-2.5 rounded-xl border border-border-subtle bg-bg-canvas text-fg-primary focus:outline-none focus:border-border-strong"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-fg-secondary uppercase font-mono mb-1">Initial Baseline (tCO₂e)</label>
                  <input
                    type="number"
                    value={baseYearEmissions}
                    onChange={(e) => setBaseYearEmissions(parseFloat(e.target.value) || 0)}
                    disabled={isAuditorLocked}
                    className="w-full text-xs font-mono p-2.5 rounded-xl border border-border-subtle bg-bg-canvas text-fg-primary focus:outline-none focus:border-border-strong"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-fg-secondary uppercase font-mono mb-1">Structural Adjustment (+/- tCO₂e)</label>
                <input
                  type="number"
                  placeholder="+120 (Acquisition) or -80 (Divestiture)"
                  value={structuralChangeTco2e || ''}
                  onChange={(e) => setStructuralChangeTco2e(parseFloat(e.target.value) || 0)}
                  disabled={isAuditorLocked}
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-border-subtle bg-bg-canvas text-fg-primary focus:outline-none focus:border-border-strong"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-fg-secondary uppercase font-mono mb-1">Structural Event Rationale</label>
                <input
                  type="text"
                  value={structuralChangeReason}
                  onChange={(e) => setStructuralChangeReason(e.target.value)}
                  disabled={isAuditorLocked}
                  className="w-full text-xs font-sans p-2.5 rounded-xl border border-border-subtle bg-bg-canvas text-fg-primary focus:outline-none focus:border-border-strong"
                />
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  showToast(`Base year ${baseYear} restated to ${baseYearRecalculation.adjustedTotal.toFixed(2)} tCO₂e in audit ledger`, 'success');
                }}
                disabled={isAuditorLocked}
                className="w-full font-mono text-xs"
              >
                Apply Baseline Restatement
              </Button>
            </div>

            {/* Recalculation Output Card */}
              <div className="p-6 rounded-2xl bg-bg-canvas border border-border-subtle flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-xs text-gray-400 font-mono">Significance Threshold:</span>
                    <span className="text-xs font-bold font-mono text-white">5.00% Net Cumulative</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-xs text-gray-400 font-mono">Calculated Structural Variance:</span>
                    <span className={`text-sm font-bold font-mono ${baseYearRecalculation.exceedsThreshold ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {baseYearRecalculation.percentChange}%
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-gray-400 uppercase block">Restatement Status</span>
                    <div className="flex items-center space-x-2">
                      {baseYearRecalculation.exceedsThreshold ? (
                        <>
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="text-xs font-bold text-amber-300">Mandatory Recalculation Triggered (≥ 5.0%)</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-xs font-bold text-emerald-300">Within Threshold (&lt; 5.0% - Optional)</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] font-mono text-gray-400 uppercase block">Audited Baseline Comparison</span>
                    <div className="flex items-baseline space-x-3 mt-1">
                      <span className="text-lg font-mono text-gray-400 line-through">{baseYearRecalculation.original.toFixed(2)}</span>
                      <span className="text-2xl font-mono font-bold text-white">{baseYearRecalculation.adjustedTotal.toFixed(2)} tCO₂e</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-gray-500 font-mono pt-3 border-t border-white/10">
                  Audit Trail Stamp: Restatement logged by CarbonZero BD ISO-Assurance Engine under corporate ID: {client.id}
                </div>
              </div>
            </div>
          </div>
          );
}

          export default BaseYearTab;
