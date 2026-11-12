import React from 'react';

/**
 * Universal Badge / Tag Component
 * Strict color discipline: 90% neutrals; semantic colors reserved only for status
 */
export function Badge({
  children,
  variant = 'neutral', // 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'emerald'
  size = 'sm',
  className = '',
  dot = false,
  ...props
}) {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1'
  }[size] || 'text-[11px] px-2 py-0.5';

  const variantClasses = {
    neutral:
      'bg-carbon-surface-raised text-mist border border-carbon-border dark:bg-[#13241B] dark:text-[#7A9A85] dark:border-[#2A4736]',
    emerald:
      'bg-emerald/10 text-emerald border border-emerald/20 dark:bg-emerald/15 dark:text-[#38D37E]',
    success:
      'bg-green-500/10 text-green-600 border border-green-500/20 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/40',
    warning:
      'bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40',
    danger:
      'bg-red-500/10 text-red-600 border border-red-500/20 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/40',
    info:
      'bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/40'
  }[variant] || '';

  const dotColor = {
    neutral: 'bg-mist',
    emerald: 'bg-emerald',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500'
  }[variant] || 'bg-mist';

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-mono font-medium tracking-tight select-none
        ${sizeClasses}
        ${variantClasses}
        ${className}
      `.trim()}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />}
      {children}
    </span>
  );
}

export default Badge;

