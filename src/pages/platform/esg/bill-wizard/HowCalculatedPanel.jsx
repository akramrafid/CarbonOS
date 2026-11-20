import React, { useState } from 'react';
import { Button } from '../ui';
import { KpiTicker } from '../../../../components/ui/KpiTicker';

/**
 * Phase 7: Guided ESG Flow — Animated Footprint Breakdown & Expandable
 * "How was this calculated?" (Activity Data × Emission Factor = CO₂e) panel.
 */
export function HowCalculatedPanel({ estimateData, t }) {
  const [expanded, setExpanded] = useState(false);

  if (!estimateData?.emissions) return null;

  const total = Number(estimateData.emissions.total_tco2e) || 0;
  const scope2 = Number(estimateData.emissions.scope2_location_tco2e) || 0;
  const scope1 = Number(estimateData.emissions.scope1_tco2e) || 0;
  const denom = Math.max(total, scope1 + scope2, 0.0001);
  const scope2Pct = Math.min(100, Math.round((scope2 / denom) * 100));
  const scope1Pct = Math.min(100, Math.round((scope1 / denom) * 100));

  return (
    <div className="space-y-4" data-testid="esg-how-calculated-panel">
      {/* Footprint Metrics Grid with KpiTicker */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-forest/60 rounded-xl border border-emerald/20">
          <div className="text-[11px] font-mono text-mist uppercase">{t.totalFootprintLabel}</div>
          <div className="text-lg font-bold text-emerald-400 mt-1 tabular-nums">
            <KpiTicker value={String(estimateData.emissions.total_tco2e)} />{' '}
            <span className="text-xs font-normal text-mist">tCO2e</span>
          </div>
        </div>
        <div className="p-3 bg-forest/60 rounded-xl border border-emerald/20">
          <div className="text-[11px] font-mono text-mist uppercase">{t.scope2LocLabel}</div>
          <div className="text-lg font-bold text-registry mt-1 tabular-nums">
            <KpiTicker value={String(estimateData.emissions.scope2_location_tco2e)} />{' '}
            <span className="text-xs font-normal text-mist">tCO2e</span>
          </div>
        </div>
        <div className="p-3 bg-forest/60 rounded-xl border border-emerald/20">
          <div className="text-[11px] font-mono text-mist uppercase">{t.scope1Label}</div>
          <div className="text-lg font-bold text-registry mt-1 tabular-nums">
            <KpiTicker value={String(estimateData.emissions.scope1_tco2e)} />{' '}
            <span className="text-xs font-normal text-mist">tCO2e</span>
          </div>
        </div>
      </div>

      {/* Animated SVG Bar Breakdown Draw-In */}
      <div className="p-3 bg-carbon/60 rounded-xl border border-emerald/15 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-mist">
          <span>Scope Share Breakdown</span>
          <span className="tabular-nums">
            Scope 2: {scope2Pct}% · Scope 1: {scope1Pct}%
          </span>
        </div>
        <svg
          viewBox="0 0 300 18"
          className="w-full h-4 rounded-full overflow-hidden bg-forest/70"
          role="img"
          aria-label={`Emissions breakdown: Scope 2 ${scope2Pct} percent, Scope 1 ${scope1Pct} percent`}
        >
          <rect
            x="0"
            y="0"
            width={Math.max(4, (scope2Pct / 100) * 300)}
            height="18"
            rx="4"
            fill="var(--color-accent-default)"
            className="transition-all duration-300 ease-out"
          />
          <rect
            x={(scope2Pct / 100) * 300}
            y="0"
            width={Math.max(0, (scope1Pct / 100) * 300)}
            height="18"
            fill="var(--color-status-info)"
            className="transition-all duration-300 ease-out"
          />
        </svg>
      </div>

      {/* Expandable "How was this calculated?" Panel */}
      <div className="rounded-xl border border-emerald/20 bg-carbon/70 p-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-xs font-semibold text-registry">How was this calculated?</div>
            <div className="text-[11px] font-mono text-mist">
              Activity Data × Emission Factor = CO₂e (with provenance citations)
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            aria-expanded={expanded}
            onClick={() => setExpanded((prev) => !prev)}
            className="text-xs font-mono"
          >
            {expanded ? 'Hide Formula' : 'Inspect Formula'}
          </Button>
        </div>

        {expanded && (
          <div className="space-y-3 pt-2 border-t border-emerald/10">
            {estimateData.lines?.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-mono uppercase text-mist">{t.linesTitle}</h4>
                {estimateData.lines.map((ln, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-forest/50 border border-emerald/15 rounded-lg flex flex-col sm:flex-row justify-between gap-1 font-mono text-xs"
                  >
                    <span className="text-mist">{ln.formula}</span>
                    <span className="text-emerald-400 font-semibold tabular-nums">
                      = {ln.emissions_kg} kgCO2e
                    </span>
                  </div>
                ))}
              </div>
            )}

            {estimateData.factor_citations?.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-mono uppercase text-mist">{t.factorsTitle}</h4>
                <div className="space-y-1 font-mono text-[11px] text-mist/90 bg-carbon/50 p-2.5 rounded-lg border border-emerald/10">
                  {estimateData.factor_citations.map((c, idx) => (
                    <div
                      key={idx}
                      className="flex flex-wrap justify-between gap-2 border-b border-emerald/5 last:border-0 py-1"
                    >
                      <span>
                        {c.family} v{c.version} ({c.status})
                      </span>
                      <span className="text-registry tabular-nums">
                        {c.kgco2e_per_unit} kgCO2e/{c.unit} [{c.source_publisher}]
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HowCalculatedPanel;

