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
  className = '',
  titleClassName = '',
  align = 'left'
}) {
  const isCentered = align === 'center';
  return (
    <header className={`w-full mb-6 pb-6 ${isCentered ? 'text-center' : 'border-b border-carbon-border/60 dark:border-border-subtle/60'} ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-xs text-mist mb-2 ${isCentered ? 'justify-center' : ''}`}>
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.path || crumb.label}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-mist/40 shrink-0" aria-hidden="true" />}
                {isLast ? (
                  <span className="text-registry font-medium dark:text-fg-primary" aria-current="page">
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
      <div className={`flex flex-col ${isCentered ? 'items-center justify-center' : 'sm:flex-row sm:items-center sm:justify-between'} gap-4`}>
        <div className={`flex flex-col gap-1 min-w-0 ${isCentered ? 'items-center' : ''}`}>
          <div className={`flex items-center gap-3 flex-wrap ${isCentered ? 'justify-center' : ''}`}>
            {badge && isCentered && <div className="mb-2">{badge}</div>}
            <h1 className={`text-2xl sm:text-3xl font-sans font-bold text-registry tracking-tight dark:text-fg-primary ${titleClassName}`}>
              {title}
            </h1>
            {badge && !isCentered && <span className="inline-flex shrink-0">{badge}</span>}
          </div>
          {description && (
            <p className={`text-sm text-mist font-sans max-w-3xl leading-relaxed dark:text-fg-secondary ${isCentered ? 'mx-auto' : ''}`}>
              {description}
            </p>
          )}
        </div>

        {/* Action Group: Max 1 Primary Action */}
        {(primaryAction || secondaryActions) && (
          <div className={`flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap ${isCentered ? 'justify-center' : ''}`}>
            {secondaryActions}
            {primaryAction}
          </div>
        )}
      </div>
    </header>
  );
}

export default PageHeader;

