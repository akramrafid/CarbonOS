import React from 'react';
import Card from './Card';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

/**
 * Universal StatCard / KPI Tile Component
 * Enforces Design Principles:
 * - Data: JetBrains Mono with tabular-nums
 * - Semantic trend indicators with high contrast
 * - Compact and dense presentation in Product Mode
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
  className = ''
}) {
  const trendColor = {
    up: 'text-accent',
    down: 'text-red-500 dark:text-red-400',
    neutral: 'text-fg-secondary'
  }[trend] || 'text-fg-secondary';

  const TrendIcon = {
    up: ArrowUpRight,
    down: ArrowDownRight,
    neutral: Minus
  }[trend] || Minus;

  return (
    <Card
      variant={featured ? 'featured' : 'default'}
      className={`flex flex-col justify-between min-w-0 ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2 min-w-0">
        <span className="text-xs sm:text-sm font-sans font-medium text-fg-secondary truncate">
          {title}
        </span>
        {icon && (
          <span className="p-1.5 rounded-md bg-bg-elevated border border-border-subtle text-fg-secondary shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1 min-w-0 flex-wrap">
        <span className="text-2xl sm:text-3xl font-mono font-bold text-fg-primary tracking-tight tabular-nums truncate">
          {value}
        </span>
        {unit && (
          <span className="text-xs sm:text-sm font-mono text-fg-secondary shrink-0">
            {unit}
          </span>
        )}
      </div>

      {(change || subtitle) && (
        <div className="flex items-center gap-2 text-xs min-w-0">
          {change && (
            <span className={`inline-flex items-center gap-0.5 font-mono font-semibold shrink-0 ${trendColor}`}>
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
      )}
    </Card>
  );
}

export default StatCard;

