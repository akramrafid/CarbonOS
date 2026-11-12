import React from 'react';

/**
 * Universal Skeleton Loader Component
 * Replaces jarring layout shift with accessible placeholder geometry
 */
export function Skeleton({
  variant = 'text', // 'text' | 'rect' | 'circle' | 'card'
  width,
  height,
  className = '',
  ...props
}) {
  const baseClasses = 'animate-pulse bg-carbon-surface-raised/70 dark:bg-bg-elevated/70 rounded';

  const variantClasses = {
    text: 'h-4 w-full rounded',
    rect: 'h-24 w-full rounded-xl',
    circle: 'rounded-full',
    card: 'h-40 w-full rounded-xl border border-carbon-border/50 dark:border-border-subtle/50'
  }[variant] || 'h-4 w-full rounded';

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      aria-hidden="true"
      className={`${baseClasses} ${variantClasses} ${className}`}
      style={style}
      {...props}
    />
  );
}

export default Skeleton;

