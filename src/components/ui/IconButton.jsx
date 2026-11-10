import React from 'react';

/**
 * Universal IconButton Component
 * Strictly enforces design principles:
 * - Requires explicit aria-label for screen reader accessibility
 * - Minimum 44px hit area across mobile and desktop
 * - Shares radius, border, and focus-ring tokens with standard Button
 */
export const IconButton = React.forwardRef(function IconButton(
  {
    icon,
    'aria-label': ariaLabel,
    variant = 'ghost',
    size = 'md',
    className = '',
    type = 'button',
    disabled = false,
    ...props
  },
  ref
) {
  if (!ariaLabel) {
    console.warn('IconButton rendered without an aria-label. Accessible name is mandatory.');
  }

  const variantClasses = {
    primary:
      'bg-emerald text-carbon hover:bg-emerald-glow active:scale-95 border border-emerald/20 focus-visible:ring-emerald dark:bg-emerald dark:text-carbon',
    secondary:
      'bg-carbon-surface text-registry border border-carbon-border hover:bg-carbon-surface-raised active:scale-95 focus-visible:ring-emerald dark:bg-[#0D1812] dark:text-[#E2ECE5] dark:border-[#1E3326]',
    ghost:
      'bg-transparent text-mist hover:text-registry hover:bg-carbon-surface active:scale-95 focus-visible:ring-emerald dark:text-[#7A9A85] dark:hover:text-[#E2ECE5] dark:hover:bg-[#0D1812]',
    destructive:
      'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 active:scale-95 focus-visible:ring-red-500'
  }[variant] || '';

  return (
    <button
      ref={ref}
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`
        relative inline-flex items-center justify-center rounded-lg min-w-[44px] min-h-[44px] p-2
        transition-all duration-150 select-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-carbon
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variantClasses}
        ${className}
      `.trim()}
      {...props}
    >
      <span className="inline-flex items-center justify-center pointer-events-none">
        {icon}
      </span>
    </button>
  );
});

export default IconButton;
