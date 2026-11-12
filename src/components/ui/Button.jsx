import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Universal Button Component
 * Strictly enforces design principles:
 * - Variants: 'primary', 'secondary', 'ghost', 'destructive', 'link'
 * - Sizes: 'sm' (32px), 'md' (40px), 'lg' (48px)
 * - Minimum 44px touch targets on mobile
 * - Uniform height and border-radius shared with Input
 * - Loading state preserves button dimensions (no width jump)
 */
export const Button = React.forwardRef(function Button(
  {
    children,
    variant = 'secondary',
    size = 'md',
    loading = false,
    disabled = false,
    className = '',
    leftIcon,
    rightIcon,
    type = 'button',
    ...props
  },
  ref
) {
  // Height and padding tokens
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs min-h-[44px] sm:min-h-[32px]',
    md: 'h-10 px-4 text-sm min-h-[44px] sm:min-h-[40px]',
    lg: 'h-12 px-6 text-base min-h-[48px]'
  }[size] || 'h-10 px-4 text-sm min-h-[44px] sm:min-h-[40px]';

  // Variant tokens adhering to 90% neutral discipline
  const variantClasses = {
    primary:
      'bg-emerald text-carbon font-semibold shadow-sm hover:bg-emerald-glow active:scale-[0.98] border border-emerald/20 focus-visible:ring-emerald dark:bg-emerald dark:text-carbon dark:hover:bg-emerald-glow',
    secondary:
      'bg-carbon-surface text-registry border border-carbon-border hover:bg-carbon-surface-raised active:scale-[0.98] focus-visible:ring-emerald dark:bg-[#0D1812] dark:text-[#E2ECE5] dark:border-[#1E3326] dark:hover:bg-[#13241B]',
    ghost:
      'bg-transparent text-mist hover:text-registry hover:bg-carbon-surface active:scale-[0.98] focus-visible:ring-emerald dark:text-[#7A9A85] dark:hover:text-[#E2ECE5] dark:hover:bg-[#0D1812]',
    destructive:
      'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 active:scale-[0.98] focus-visible:ring-red-500 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/40',
    link:
      'bg-transparent text-emerald hover:underline p-0 h-auto min-h-0 focus-visible:ring-emerald font-medium'
  }[variant] || '';

  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      data-variant={variant}
      className={`
        relative inline-flex items-center justify-center gap-2 rounded-lg font-sans transition-all duration-150 select-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-carbon
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${sizeClasses}
        ${variantClasses}
        ${className}
      `.trim()}
      {...props}
    >
      {/* Loading overlay preserves exact width without jumping */}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin text-current" aria-hidden="true" />
        </span>
      )}
      <span className={`inline-flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {leftIcon && <span className="inline-flex shrink-0 items-center">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="inline-flex shrink-0 items-center">{rightIcon}</span>}
      </span>
    </button>
  );
});

export { IconButton } from './IconButton';
export default Button;

