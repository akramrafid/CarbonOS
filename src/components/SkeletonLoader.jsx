import React from 'react';

/**
 * Dual-theme accessible skeleton placeholder.
 * Automatically adapts pulse animations and respect prefers-reduced-motion.
 */
export const SkeletonLoader = ({
  variant = 'text', // 'text' | 'card' | 'table' | 'metric' | 'circle'
  className = '',
  rows = 3,
  height,
  width,
}) => {
  const baseClasses = "bg-gray-200 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-xl transition-colors";
  const pulseClasses = "animate-pulse";

  if (variant === 'circle') {
    return (
      <div 
        className={`${baseClasses} ${pulseClasses} rounded-full ${className}`}
        style={{ width: width || '44px', height: height || '44px' }}
        aria-hidden="true"
      />
    );
  }

  if (variant === 'metric') {
    return (
      <div className={`p-4 rounded-2xl ${baseClasses} ${pulseClasses} flex flex-col justify-between ${className}`} aria-hidden="true">
        <div className="flex justify-between items-center mb-3">
          <div className="h-3 w-20 bg-gray-300 dark:bg-white/10 rounded" />
          <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-white/10" />
        </div>
        <div className="h-8 w-28 bg-gray-300 dark:bg-white/10 rounded mb-2" />
        <div className="h-3 w-16 bg-gray-300 dark:bg-white/10 rounded" />
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-6 rounded-3xl ${baseClasses} ${pulseClasses} space-y-4 ${className}`} aria-hidden="true">
        <div className="h-4 w-1/3 bg-gray-300 dark:bg-white/10 rounded" />
        <div className="h-24 w-full bg-gray-300 dark:bg-white/10 rounded-2xl" />
        <div className="space-y-2 pt-2">
          <div className="h-3 w-full bg-gray-300 dark:bg-white/10 rounded" />
          <div className="h-3 w-4/5 bg-gray-300 dark:bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`space-y-3 w-full ${className}`} aria-hidden="true">
        {/* Table Header Placeholder */}
        <div className={`h-10 w-full ${baseClasses} ${pulseClasses} rounded-lg`} />
        {/* Table Rows Placeholder */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className={`h-12 w-full ${baseClasses} ${pulseClasses} rounded-lg flex items-center px-4 space-x-4`}>
            <div className="h-3 w-1/6 bg-gray-300 dark:bg-white/10 rounded" />
            <div className="h-3 w-2/6 bg-gray-300 dark:bg-white/10 rounded" />
            <div className="h-3 w-2/6 bg-gray-300 dark:bg-white/10 rounded" />
            <div className="h-3 w-1/6 bg-gray-300 dark:bg-white/10 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Default: text variant
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div 
          key={i} 
          className={`h-4 ${baseClasses} ${pulseClasses} ${i === rows - 1 ? 'w-2/3' : 'w-full'}`}
          style={{ width: i === 0 && width ? width : undefined, height: height || undefined }}
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;

