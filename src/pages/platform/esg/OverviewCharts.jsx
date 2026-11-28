// Extracted animated KPI & Scope/Facility chart widgets for OverviewPanel (<= 400 line guardrail).
import { useEffect, useState } from 'react';
import { getPrefersReducedMotion } from '../../../lib/motion';
import { Button } from './ui';
import { formatTonnes } from './overviewHelpers';

const SVG_RING_RADIUS = 44;
const SVG_CIRCUMFERENCE = 2 * Math.PI * SVG_RING_RADIUS;

export function KpiCard({ eyebrow, valueText, subtitle, badge, actionLabel, onAction }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-emerald/15 bg-forest/40 p-4 sm:p-5">
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-mist">{eyebrow}</span>
          {badge}
        </div>
        <div className="mt-2 font-sans text-2xl sm:text-3xl font-bold tabular-nums text-registry">{valueText}</div>
        {subtitle && <p className="mt-1.5 text-xs text-mist">{subtitle}</p>}
      </div>
      {actionLabel && onAction && (
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={onAction}
          className="mt-2 self-start px-0 font-mono text-[11px]"
        >
          {actionLabel} →
        </Button>
      )}
    </div>
  );
}

export function ScopeDonutChart({ shares, totalTonnes, hasRun, onOpenReports }) {
  const [mounted, setMounted] = useState(() => getPrefersReducedMotion());

  useEffect(() => {
    if (getPrefersReducedMotion()) {
      setMounted(true);
      return undefined;
    }
    const id = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(id);
  }, [hasRun, totalTonnes]);

  if (!hasRun) {
    return (
      <div className="flex flex-col items-start justify-center rounded-xl border border-dashed border-mist/30 bg-carbon/30 p-5 text-sm text-mist">
        <p>No calculation run exists for this period yet. Approve activity records and emission factors, then run a deterministic calculation.</p>
        <Button variant="secondary" className="mt-3" onClick={onOpenReports}>Open Calculation &amp; reports</Button>
      </div>
    );
  }

  let cumulativeOffset = 0;
  const segments = shares.map((item) => {
    const length = mounted ? (item.pct / 100) * SVG_CIRCUMFERENCE : 0;
    const dashOffset = -cumulativeOffset;
    cumulativeOffset += length;
    return { ...item, length, dashOffset };
  });

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="relative mx-auto h-36 w-36 shrink-0 sm:mx-0">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" role="img" aria-label="GHG inventory share by scope">
          <title>GHG inventory breakdown by Scope</title>
          <circle cx="60" cy="60" r={SVG_RING_RADIUS} fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="14" />
          {segments.map((seg) => (
            <circle
              key={seg.key}
              cx="60"
              cy="60"
              r={SVG_RING_RADIUS}
              fill="none"
              stroke={seg.color}
              strokeWidth="14"
              strokeDasharray={`${seg.length} ${SVG_CIRCUMFERENCE - seg.length}`}
              strokeDashoffset={seg.dashOffset}
              style={{ transition: 'stroke-dasharray 700ms cubic-bezier(0.22, 1, 0.36, 1), stroke-dashoffset 700ms ease' }}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-[10px] uppercase text-mist">Total</span>
          <span className="font-mono text-sm font-bold tabular-nums text-registry">{formatTonnes(totalTonnes, 2) ?? '0'}</span>
          <span className="font-mono text-[10px] text-mist">tCO₂e</span>
        </div>
      </div>

      <div className="flex-1 space-y-3">
        {shares.map((item) => (
          <div key={item.key} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium text-registry">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
                {item.label}
              </span>
              <span className="font-mono tabular-nums text-mist">
                {formatTonnes(item.tonnes)} tCO₂e ({item.pct.toFixed(1)}%)
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-carbon/80">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: mounted ? `${Math.min(100, Math.max(item.pct, item.tonnes > 0 ? 2 : 0))}%` : '0%',
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FacilityBars({ rows, hasRun }) {
  if (!rows.length) {
    return <p className="rounded-lg border border-dashed border-mist/30 px-3 py-4 text-sm text-mist">No facilities registered yet.</p>;
  }
  const maxVal = Math.max(...rows.map((r) => r.totalTonnes || 0), 0.001);

  return (
    <div className="space-y-3">
      {rows.map((fac) => {
        const s1Pct = hasRun ? (fac.scope1Tonnes / maxVal) * 100 : 0;
        const s2Pct = hasRun ? (fac.scope2LocationTonnes / maxVal) * 100 : 0;
        return (
          <div key={fac.id} className="space-y-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
              <span className="font-medium text-registry">
                {fac.name} <span className="font-mono text-[10px] text-mist">({fac.gridRegion})</span>
              </span>
              <span className="font-mono tabular-nums text-mist">
                {hasRun ? `${formatTonnes(fac.totalTonnes)} tCO₂e` : 'Awaiting calculation'}
              </span>
            </div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-carbon/80">
              <div className="h-full bg-emerald transition-all duration-700 ease-out" style={{ width: `${s1Pct}%` }} title={`Scope 1: ${formatTonnes(fac.scope1Tonnes)} tCO₂e`} />
              <div className="h-full bg-sky-400 transition-all duration-700 ease-out" style={{ width: `${s2Pct}%` }} title={`Scope 2 Location: ${formatTonnes(fac.scope2LocationTonnes)} tCO₂e`} />
            </div>
            {hasRun && (
              <p className="font-mono text-[10px] tabular-nums text-mist/80">
                S1: {formatTonnes(fac.scope1Tonnes)} t · S2 Location: {formatTonnes(fac.scope2LocationTonnes)} t
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
