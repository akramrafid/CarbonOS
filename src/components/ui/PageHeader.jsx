import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Universal PageHeader Component
 * Enforces Design Principle 1 (Focus & Hierarchy):
 * - Exactly one <h1> per page
 * - One-line contextual subtitle
 * - At most ONE primary action button
 * - Optional secondary actions and breadcrumb hierarchy
 */
export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  primaryAction,
  secondaryActions,
  badge,
  className = ''
}) {
  return (
    <header className={`w-full mb-6 pb-6 border-b border-carbon-border/60 dark:border-[#1E3326]/60 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-mist mb-2">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.path || crumb.label}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-mist/40 shrink-0" aria-hidden="true" />}
                {isLast ? (
                  <span className="text-registry font-medium dark:text-[#E2ECE5]" aria-current="page">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="hover:text-emerald transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald rounded"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Title & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-sans font-bold text-registry tracking-tight truncate dark:text-[#E2ECE5]">
              {title}
            </h1>
            {badge && <span className="inline-flex shrink-0">{badge}</span>}
          </div>
          {description && (
            <p className="text-sm text-mist font-sans max-w-3xl leading-relaxed dark:text-[#7A9A85]">
              {description}
            </p>
          )}
        </div>

        {/* Action Group: Max 1 Primary Action */}
        {(primaryAction || secondaryActions) && (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
            {secondaryActions}
            {primaryAction}
          </div>
        )}
      </div>
    </header>
  );
}

export default PageHeader;
