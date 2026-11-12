import React from 'react';

/**
 * Universal Card Component
 * Strictly avoids destructive `overflow-hidden` wrappers that clip shadows and dropdowns
 * Provides standard elevation, surface tokens, and interactive hover states
 */
export const Card = React.forwardRef(function Card(
  {
    children,
    variant = 'default',
    interactive = false,
    className = '',
    padding = 'md',
    as: Component = 'div',
    ...props
  },
  ref
) {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5',
    lg: 'p-6 sm:p-8'
  }[padding] || 'p-4 sm:p-5';

  const variantClasses = {
    default:
      'bg-carbon-surface border border-carbon-border text-registry dark:bg-bg-surface dark:border-border-subtle dark:text-fg-primary',
    raised:
      'bg-carbon-surface-raised border border-carbon-border/80 shadow-md text-registry dark:bg-bg-elevated dark:border-border-subtle dark:text-fg-primary',
    subtle:
      'bg-carbon-surface/50 border border-carbon-border/40 text-registry dark:bg-bg-muted dark:border-border-subtle dark:text-fg-primary',
    featured:
      'bg-gradient-to-b from-carbon-surface to-carbon-surface-raised border border-emerald/30 shadow-lg text-registry dark:from-bg-surface dark:to-bg-elevated dark:border-emerald/40'
  }[variant] || '';

  const interactiveClasses = interactive
    ? 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-emerald/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald'
    : '';

  return (
    <Component
      ref={ref}
      className={`
        relative rounded-xl
        ${variantClasses}
        ${paddingClasses}
        ${interactiveClasses}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </Component>
  );
});

export default Card;

