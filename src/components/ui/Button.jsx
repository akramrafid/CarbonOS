import React, { useState } from 'react';
import { Loader2, Check } from 'lucide-react';
import { getPrefersReducedMotion } from '../../lib/motion';

/**
 * Universal Button Component (Phase 1 & Phase 7)
 * Strictly enforces design principles:
 * - Variants: 'primary', 'secondary', 'ghost', 'destructive', 'link'
 * - Sizes: 'sm' (32px / h-8), 'md' (40px / h-10), 'lg' (48px / h-12)
 * - Minimum 44px touch targets on mobile (`min-h-[44px]`)
 * - Uniform height and border-radius shared with Input
 * - In-place `loading` and `success` states preserve exact button dimensions (no width jump)
 * - Optional `magnetic` micro-interaction enabled ONLY on `variant="primary"` under `@media (hover: hover)`
 */
export const Button = React.forwardRef(function Button(
  {
    children,
    variant = 'secondary',
    size = 'md',
    loading = false,
    success = false,
    magnetic = false,
    disabled = false,
    className = '',
    leftIcon,
    rightIcon,
    type = 'button',
    onPointerMove,
    onPointerLeave,
    style,
    ...props
  },
  ref
) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Height and padding tokens
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs min-h-[44px] sm:min-h-[32px]',
    md: 'h-10 px-4 text-sm min-h-[44px] sm:min-h-[40px]',
    lg: 'h-12 px-6 text-base min-h-[48px]',
  }[size] || 'h-10 px-4 text-sm min-h-[44px] sm:min-h-[40px]';

  // Variant tokens adhering to 90% neutral discipline
  const variantClasses = {
    primary:
      'bg-accent text-fg-inverse font-semibold shadow-sm hover:bg-accent-hover active:scale-[0.98] border border-accent/20 focus-visible:ring-emerald',
    secondary:
      'bg-carbon-surface text-registry border border-carbon-border hover:bg-carbon-surface-raised active:scale-[0.98] focus-visible:ring-emerald dark:bg-bg-surface dark:text-fg-primary dark:border-border-subtle dark:hover:bg-bg-elevated',
    ghost:
      'bg-transparent text-mist hover:text-registry hover:bg-carbon-surface active:scale-[0.98] focus-visible:ring-emerald dark:text-fg-secondary dark:hover:text-fg-primary dark:hover:bg-bg-surface',
    destructive:
      'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 active:scale-[0.98] focus-visible:ring-red-500 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/40',
    link:
      'bg-transparent text-emerald hover:underline p-0 h-auto min-h-0 focus-visible:ring-emerald font-medium',
  }[variant] || '';

  const isDisabled = disabled || loading;
  const allowMagnetic = magnetic && variant === 'primary' && !isDisabled;

  const handlePointerMove = (e) => {
    if (allowMagnetic && e.pointerType === 'mouse' && !getPrefersReducedMotion()) {
      const rect = e.currentTarget.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.16;
      const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.16;
      setOffset({
        x: Math.max(-5, Math.min(5, dx)),
        y: Math.max(-3, Math.min(3, dy)),
      });
    }
    if (onPointerMove) onPointerMove(e);
  };

  const handlePointerLeave = (e) => {
    if (offset.x !== 0 || offset.y !== 0) {
      setOffset({ x: 0, y: 0 });
    }
    if (onPointerLeave) onPointerLeave(e);
  };

  const mergedStyle =
    offset.x !== 0 || offset.y !== 0
      ? { ...style, transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }
      : style;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      data-variant={variant}
      aria-busy={loading || undefined}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={mergedStyle}
      className={`
        relative inline-flex items-center justify-center gap-2 rounded-lg font-sans transition-[background-color,border-color,color,box-shadow,opacity] duration-150 select-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-carbon
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${sizeClasses}
        ${variantClasses}
        ${className}
      `.trim()}
      {...props}
    >
      {/* In-place loading or success check overlay preserves exact width without jumping */}
      {(loading || success) && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-current" aria-hidden="true" />
          ) : (
            <Check className="w-4 h-4 text-current" aria-hidden="true" />
          )}
        </span>
      )}
      <span
        className={`inline-flex items-center gap-2 ${
          loading || success ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {leftIcon && <span className="inline-flex shrink-0 items-center">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="inline-flex shrink-0 items-center">{rightIcon}</span>}
      </span>
    </button>
  );
});

export { IconButton } from './IconButton';
export default Button;
