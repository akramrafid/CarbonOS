import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

/**
 * Universal EmptyState Component
 * Follows Design Principle: Left-align by default; center only hero and empty states
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-carbon-border dark:border-border-subtle bg-carbon-surface/30 dark:bg-bg-surface/30 ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-carbon-surface-raised flex items-center justify-center text-mist mb-4 border border-carbon-border/60 dark:bg-bg-elevated dark:border-border-subtle dark:text-fg-secondary" aria-hidden="true">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base sm:text-lg font-sans font-semibold text-registry mb-1 dark:text-fg-primary">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-mist max-w-sm mb-6 leading-relaxed dark:text-fg-secondary">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;

