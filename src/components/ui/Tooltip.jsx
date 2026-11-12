import React, { useState, useRef } from 'react';

/**
 * Tooltip Primitive
 * Accessible hover/focus helper with zero layout shift and ARIA link.
 */
export const Tooltip = ({
  content,
  children,
  position = 'top',
  delay = 200,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).substr(2, 9)}`);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }[position] || 'bottom-full left-1/2 -translate-x-1/2 mb-2';

  return (
    <div 
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      aria-describedby={isVisible ? tooltipId.current : undefined}
    >
      {children}

      {isVisible && content && (
        <div
          id={tooltipId.current}
          role="tooltip"
          className={`absolute z-50 px-2.5 py-1.5 text-[11px] font-sans font-medium text-white bg-slate-900/95 dark:bg-bg-canvas dark:border dark:border-emerald/40 rounded-lg shadow-xl pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 ${positionClasses}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;

