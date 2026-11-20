import React from 'react';
import { Button } from './Button';

/**
 * EmptyState (Phase 7.2)
 * Purposeful empty state with an inline vector illustration, clear explanation,
 * and at most ONE primary action.
 */
export function EmptyState({
  title = 'No records found',
  description = 'Get started by creating a new entry or adjusting your active filters.',
  actionLabel,
  onAction,
  icon,
  className = '',
}) {
  return (
    <div
      className={`w-full rounded-2xl border border-border-subtle bg-bg-surface p-8 text-center flex flex-col items-center justify-center space-y-4 ${className}`.trim()}
    >
      <div
        className="w-16 h-16 rounded-2xl bg-bg-elevated border border-border-subtle flex items-center justify-center text-accent"
        aria-hidden="true"
      >
        {icon || (
          <svg
            viewBox="0 0 48 48"
            fill="none"
            className="w-9 h-9 text-accent"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="6"
              y="10"
              width="36"
              height="28"
              rx="5"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            <path
              d="M16 24H32M24 16V32"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      <div className="space-y-1.5 max-w-md">
        <h3 className="text-base font-sans font-semibold text-fg-primary">{title}</h3>
        <p className="text-xs sm:text-sm font-sans text-fg-secondary leading-relaxed">
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <div className="pt-1">
          <Button variant="primary" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export default EmptyState;
