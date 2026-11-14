import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Universal Tooltip Primitive (Phase 3: Zero-Clipping Portal Overlay)
 * - Rendered in a portal to prevent clipping by ancestor overflow: hidden
 * - Computes fixed position from trigger bounding rect
 * - Strictly avoids layout shift and overflow
 */
export const Tooltip = ({
  content,
  children,
  position = 'top',
  delay = 150,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).substr(2, 9)}`);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    let top = 0;
    let left = 0;

    if (position === 'top') {
      top = rect.top - 8;
      left = rect.left + rect.width / 2;
    } else if (position === 'bottom') {
      top = rect.bottom + 8;
      left = rect.left + rect.width / 2;
    } else if (position === 'left') {
      top = rect.top + rect.height / 2;
      left = rect.left - 8;
    } else if (position === 'right') {
      top = rect.top + rect.height / 2;
      left = rect.right + 8;
    }
    setCoords({ top, left });
  };

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      calculatePosition();
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      const handleScrollOrResize = () => calculatePosition();
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
      };
    }
  }, [isVisible]);

  return (
    <div
      ref={triggerRef}
      className={`inline-flex items-center min-w-0 ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      aria-describedby={isVisible ? tooltipId.current : undefined}
    >
      {children}

      {isVisible && content && typeof document !== 'undefined' && createPortal(
        <div
          id={tooltipId.current}
          role="tooltip"
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            transform:
              position === 'top'
                ? 'translate(-50%, -100%)'
                : position === 'bottom'
                ? 'translate(-50%, 0)'
                : position === 'left'
                ? 'translate(-100%, -50%)'
                : 'translate(0, -50%)',
            zIndex: 9999,
            pointerEvents: 'none'
          }}
          className="px-2.5 py-1.5 text-[11px] font-sans font-medium text-fg-primary bg-bg-surface border border-border-subtle rounded-lg shadow-xl animate-in fade-in duration-150 max-w-[280px] break-words"
        >
          {content}
        </div>,
        document.body
      )}
    </div>
  );
};

export default Tooltip;
