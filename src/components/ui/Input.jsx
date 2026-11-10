import React from 'react';

/**
 * Universal Input Component
 * Shares exact height, radius, border, and focus-ring tokens with Button
 */
export const Input = React.forwardRef(function Input(
  {
    size = 'md',
    error = false,
    errorMessage,
    leftIcon,
    rightIcon,
    className = '',
    disabled = false,
    ...props
  },
  ref
) {
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs min-h-[44px] sm:min-h-[32px]',
    md: 'h-10 px-4 text-sm min-h-[44px] sm:min-h-[40px]',
    lg: 'h-12 px-6 text-base min-h-[48px]'
  }[size] || 'h-10 px-4 text-sm min-h-[44px] sm:min-h-[40px]';

  return (
    <div className="w-full flex flex-col gap-1">
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <span className="absolute left-3 text-mist pointer-events-none flex items-center">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={`
            w-full rounded-lg bg-carbon-surface text-registry border font-sans placeholder:text-mist/50
            transition-colors duration-150
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-carbon
            disabled:opacity-50 disabled:cursor-not-allowed
            dark:bg-[#0D1812] dark:text-[#E2ECE5] dark:placeholder-[#4B6B56]
            ${leftIcon ? 'pl-9' : ''}
            ${rightIcon ? 'pr-9' : ''}
            ${error ? 'border-red-500 focus-visible:ring-red-500' : 'border-carbon-border focus-visible:ring-emerald dark:border-[#1E3326]'}
            ${sizeClasses}
            ${className}
          `.trim()}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 text-mist pointer-events-none flex items-center">
            {rightIcon}
          </span>
        )}
      </div>
      {error && errorMessage && (
        <span className="text-xs text-red-500 font-sans" role="alert">
          {errorMessage}
        </span>
      )}
    </div>
  );
});

export default Input;
