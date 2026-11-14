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
      'bg-bg-surface border border-border-subtle text-fg-primary',
    raised:
      'bg-bg-elevated border border-border-subtle shadow-md text-fg-primary',
    subtle:
      'bg-bg-muted border border-border-subtle text-fg-primary',
    featured:
      'bg-bg-surface border border-accent/40 shadow-lg text-fg-primary'
  }[variant] || 'bg-bg-surface border border-border-subtle text-fg-primary';

  const interactiveClasses = interactive
    ? 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-accent/50 card-glow-hover focus-ring-standard'
    : '';

  return (
    <Component
      ref={ref}
      className={`
        relative rounded-xl min-w-0 @container break-words [overflow-wrap:anywhere]
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

