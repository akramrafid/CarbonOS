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
      'bg-carbon-surface border border-carbon-border text-registry dark:bg-[#0D1812] dark:border-[#1E3326] dark:text-[#E2ECE5]',
    raised:
      'bg-carbon-surface-raised border border-carbon-border/80 shadow-md text-registry dark:bg-[#13241B] dark:border-[#2A4736] dark:text-[#E2ECE5]',
    subtle:
      'bg-carbon-surface/50 border border-carbon-border/40 text-registry dark:bg-[#09120D] dark:border-[#14231A] dark:text-[#E2ECE5]',
    featured:
      'bg-gradient-to-b from-carbon-surface to-carbon-surface-raised border border-emerald/30 shadow-lg text-registry dark:from-[#0D1812] dark:to-[#13241B] dark:border-emerald/40'
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
