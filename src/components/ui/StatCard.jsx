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
    up: 'text-emerald dark:text-[#38D37E]',
    down: 'text-red-500 dark:text-red-400',
    neutral: 'text-mist dark:text-[#7A9A85]'
  }[trend] || 'text-mist';

  const TrendIcon = {
    up: ArrowUpRight,
    down: ArrowDownRight,
    neutral: Minus
  }[trend] || Minus;

  return (
    <Card
      variant={featured ? 'featured' : 'default'}
      className={`flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-xs sm:text-sm font-sans font-medium text-mist dark:text-[#7A9A85]">
          {title}
        </span>
        {icon && (
          <span className="p-1.5 rounded-md bg-carbon-surface-raised border border-carbon-border/50 text-mist dark:bg-[#13241B] dark:border-[#2A4736] shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl sm:text-3xl font-mono font-bold text-registry tracking-tight tabular-nums dark:text-[#E2ECE5]">
          {value}
        </span>
        {unit && (
          <span className="text-xs sm:text-sm font-mono text-mist dark:text-[#7A9A85]">
            {unit}
          </span>
        )}
      </div>

      {(change || subtitle) && (
        <div className="flex items-center gap-2 text-xs">
          {change && (
            <span className={`inline-flex items-center gap-0.5 font-mono font-semibold ${trendColor}`}>
              <TrendIcon className="w-3.5 h-3.5" aria-hidden="true" />
              {change}
            </span>
          )}
          {subtitle && (
            <span className="text-mist/70 truncate dark:text-[#7A9A85]/70">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}

export default StatCard;
