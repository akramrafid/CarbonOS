import React from 'react';
import Card from './Card';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { KpiTicker, LivePulseDot, StaleDataBadge } from './KpiTicker';

/**
 * Universal StatCard / KPI Tile Component (Phase 1 & Phase 7)
 * Enforces Design Principles:
 * - Data: JetBrains Mono with tabular-nums (`KpiTicker` announces only final value to screen readers)
 * - Semantic trend indicators with high contrast
 * - Optional live status pulse dot (`livePulse`) and stale data badge (`isStale`, `updatedLabel`)
 */
export function StatCard({
  title,
  value,
  unit,
  change,
  trend = 'neutral', // 'up' | 'down' | 'neutral'
  subtitle,
  icon,
  featured = false,
  animateValue = true,
  livePulse = false,
  isStale = false,
  updatedLabel,
  className = '',
}) {
  const trendColor = {
    up: 'text-accent',
    down: 'text-red-500 dark:text-red-400',
    neutral: 'text-fg-secondary',
  }[trend] || 'text-fg-secondary';

  const TrendIcon = {
    up: ArrowUpRight,
    down: ArrowDownRight,
    neutral: Minus,
  }[trend] || Minus;

  return (
    <Card
      variant={featured ? 'featured' : 'default'}
      className={`flex flex-col justify-between min-w-0 ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs sm:text-sm font-sans font-medium text-fg-secondary truncate">
            {title}
          </span>
          {livePulse && <LivePulseDot label="" />}
        </div>
        {icon && (
          <span
            className="p-1.5 rounded-md bg-bg-elevated border border-border-subtle text-fg-secondary shrink-0"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1 min-w-0 flex-wrap">
        <span className="text-2xl sm:text-3xl font-mono font-bold text-fg-primary tracking-tight tabular-nums truncate">
          {animateValue && (typeof value === 'string' || typeof value === 'number') ? (
            <KpiTicker value={value} />
          ) : (
            value
          )}
        </span>
        {unit && (
          <span className="text-xs sm:text-sm font-mono text-fg-secondary shrink-0">
            {unit}
          </span>
        )}
      </div>

      {(change || subtitle || updatedLabel) && (
        <div className="flex items-center justify-between gap-2 text-xs min-w-0 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            {change && (
              <span
                className={`inline-flex items-center gap-0.5 font-mono font-semibold shrink-0 ${trendColor}`}
              >
                <TrendIcon className="w-3.5 h-3.5" aria-hidden="true" />
                {change}
              </span>
            )}
            {subtitle && (
              <span className="text-fg-muted truncate" title={subtitle}>
                {subtitle}
              </span>
            )}
          </div>
          {updatedLabel && <StaleDataBadge isStale={isStale} updatedLabel={updatedLabel} />}
        </div>
      )}
    </Card>
  );
}

export default StatCard;
