import React, { useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showClose = true,
  closeOnBackdrop = true,
  closeOnEsc = true,
  footer = null,
  className = '',
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Focus trap and ESC key handler
  const handleKeyDown = useCallback(
    (e) => {
      if (closeOnEsc && e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [closeOnEsc, onClose]
  );

  // Lock body scroll, manage focus trap, and restore focus on dismiss
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    // Initial focus on first interactive element or modal container
    const timer = setTimeout(() => {
      if (modalRef.current) {
        const focusable = modalRef.current.querySelector(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable) {
          focusable.focus();
        } else {
          modalRef.current.focus();
        }
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
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] sm:max-w-5xl',
  }[size] || 'max-w-lg';

  const titleId = title ? `modal-title-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative w-full ${sizeClasses} bg-white dark:bg-bg-elevated text-gray-900 dark:text-white border border-border-strong dark:border-emerald/30 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.65)] overflow-hidden flex flex-col max-h-[90vh] outline-none ${className}`}
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click from inner content
      >
        {/* Modal Header */}
        {(title || showClose) && (
          <div className="flex items-start justify-between p-6 sm:p-7 border-b border-gray-100 dark:border-white/10 shrink-0">
            <div>
              {title && (
                <h3
                  id={titleId}
                  className="font-sans font-bold text-xl sm:text-2xl text-gray-900 dark:text-white tracking-tight"
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="font-sans text-xs sm:text-sm text-gray-600 dark:text-white/70 mt-1 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                className="p-2 -mr-2 -mt-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-emerald/60 focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-7 overflow-y-auto overscroll-contain flex-1 text-gray-800 dark:text-white/90 font-sans text-sm leading-relaxed">
          {children}
        </div>

        {/* Optional Modal Footer */}
        {footer && (
          <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-black/20 flex flex-wrap items-center justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/15 text-gray-700 dark:text-white/80 font-sans font-medium text-xs sm:text-sm hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px]"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl font-sans font-bold text-xs sm:text-sm text-white transition-all shadow-md disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                : 'bg-accent hover:bg-accent-active dark:bg-emerald dark:hover:bg-emerald/90 dark:text-fg-primary shadow-emerald/30'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </>
      }
    >
      <p className="text-gray-600 dark:text-white/80 text-sm leading-relaxed">{message}</p>
    </Modal>
  );
};

export default Modal;
