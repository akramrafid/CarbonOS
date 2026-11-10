import React, { useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import IconButton from './IconButton';

/**
 * Universal Drawer Component
 * Accessible slide-over panel with focus trap, ESC key dismissal, and backdrop blur
 */
export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  position = 'right', // 'right' | 'left'
  size = 'md', // 'sm' (320px) | 'md' (420px) | 'lg' (560px)
  showClose = true,
  className = ''
}) {
  const drawerRef = useRef(null);
  const previousActiveElement = useRef(null);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    const timer = setTimeout(() => {
      if (drawerRef.current) {
        const focusable = drawerRef.current.querySelector(
          'button:not([disabled]), [href], input:not([disabled])'
        );
        if (focusable) focusable.focus();
        else drawerRef.current.focus();
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-xs',
    md: 'max-w-md',
    lg: 'max-w-lg'
  }[size] || 'max-w-md';

  const positionClasses = position === 'left'
    ? 'left-0 translate-x-0'
    : 'right-0 translate-x-0';

  return (
    <div
      className="fixed inset-0 z-[100] flex bg-black/60 backdrop-blur-sm transition-opacity duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={drawerRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`
          fixed top-0 bottom-0 ${positionClasses} w-full ${sizeClasses}
          bg-carbon-surface dark:bg-[#0D1812] border-l border-carbon-border dark:border-[#1E3326]
          shadow-2xl flex flex-col focus:outline-none transition-transform duration-200
          ${className}
        `.trim()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-carbon-border dark:border-[#1E3326]">
          <div>
            <h2 className="text-lg font-sans font-bold text-registry dark:text-[#E2ECE5]">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-mist font-sans mt-0.5 dark:text-[#7A9A85]">
                {subtitle}
              </p>
            )}
          </div>
          {showClose && (
            <IconButton
              icon={<X className="w-5 h-5" />}
              aria-label="Close drawer"
              onClick={onClose}
              size="sm"
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Drawer;
