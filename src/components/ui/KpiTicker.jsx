import React, { useState, useEffect, useRef } from 'react';
import {
  getPrefersReducedMotion,
  MOTION_DURATIONS,
  parseTickerValue,
  formatTickerNumber,
} from '../../lib/motion';

export { parseTickerValue, formatTickerNumber };

/**
 * KpiTicker (Phase 7.2)
 * - Uses `font-mono tabular-nums` so digits never jitter horizontally.
 * - Announces ONLY the final value to screen readers (`sr-only` + `aria-hidden="true"` on animated frames).
 * - Jumps immediately to the final value under `prefers-reduced-motion: reduce`.
 * - Never re-animates on polling/refetch when the numeric value has not changed.
 */
export function KpiTicker({
  value,
  durationMs = MOTION_DURATIONS.narrativeMs,
  className = '',
}) {
  const parsed = parseTickerValue(value);
  const reducedMotion = getPrefersReducedMotion();
  const prevValueRef = useRef(parsed.isNumeric ? parsed.number : value);
  const hasAnimatedInitialRef = useRef(false);

  const [displayNumber, setDisplayNumber] = useState(() => {
    if (!parsed.isNumeric || reducedMotion) return parsed.number ?? 0;
    return 0;
  });

  useEffect(() => {
    if (!parsed.isNumeric) return undefined;

    if (reducedMotion) {
      setDisplayNumber(parsed.number);
      prevValueRef.current = parsed.number;
      hasAnimatedInitialRef.current = true;
      return undefined;
    }

    // Do not re-animate on polling if the numeric target is unchanged
    if (hasAnimatedInitialRef.current && prevValueRef.current === parsed.number) {
      return undefined;
    }

    const startValue = hasAnimatedInitialRef.current ? (prevValueRef.current ?? 0) : 0;
    const endValue = parsed.number;
    prevValueRef.current = endValue;
    hasAnimatedInitialRef.current = true;

    let rafId = null;
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      // Standard ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = startValue + (endValue - startValue) * eased;
      setDisplayNumber(current);

      if (t < 1) {
        rafId = window.requestAnimationFrame(step);
      } else {
        setDisplayNumber(endValue);
      }
    };

    rafId = window.requestAnimationFrame(step);
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [parsed.isNumeric, parsed.number, reducedMotion, durationMs]);

  if (!parsed.isNumeric) {
    return <span className={`font-mono tabular-nums ${className}`.trim()}>{parsed.rawText}</span>;
  }

  const finalFormatted = formatTickerNumber(parsed.number, parsed);
  const animatedFormatted = formatTickerNumber(displayNumber, parsed);

  return (
    <span className={`font-mono tabular-nums inline-block ${className}`.trim()}>
      {/* Screen readers announce ONLY the final value */}
      <span className="sr-only">{finalFormatted}</span>
      <span aria-hidden="true">{animatedFormatted}</span>
    </span>
  );
}

/**
 * LivePulseDot (Phase 7.2)
 * Allowed continuous pulse indicator for real-time telemetry streams;
 * pauses under prefers-reduced-motion.
 */
export function LivePulseDot({ label = 'Live', tone = 'emerald' }) {
  const colorMap = {
    emerald: 'bg-accent',
    amber: 'bg-amber-400',
    red: 'bg-red-500',
  };
  const dotColor = colorMap[tone] || colorMap.emerald;

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-fg-secondary">
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span
          className={`animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}
        />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
      </span>
      {label && <span>{label}</span>}
    </span>
  );
}

/**
 * StaleDataBadge (Phase 7.2)
 * Displays a calm indicator when telemetry timestamps exceed the freshness window.
 */
export function StaleDataBadge({ isStale = false, updatedLabel = 'Just now' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] border ${
        isStale
          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          : 'bg-bg-elevated text-fg-muted border-border-subtle'
      }`}
      title={isStale ? 'Telemetry feed exceeds freshness threshold' : 'Telemetry feed is current'}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${isStale ? 'bg-amber-400' : 'bg-accent'}`}
        aria-hidden="true"
      />
      <span>{isStale ? `Stale · ${updatedLabel}` : updatedLabel}</span>
    </span>
  );
}

export default KpiTicker;
