import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

/**
 * Toast Primitive
 * Universal notification capsule with role="status" and aria-live announcements.
 */
export const Toast = ({
  message,
  type = 'success',
  onClose,
  className = ''
}) => {
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald" />,
    error: <AlertCircle className="w-4 h-4 text-red-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    info: <Info className="w-4 h-4 text-sky-500" />
  };

  const borders = {
    success: 'border-emerald/40',
    error: 'border-red-500/40',
    warning: 'border-amber-500/40',
    info: 'border-sky-500/40'
  };

  return (
    <div
      role="status"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={`fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-2xl bg-carbon-surface-raised dark:bg-[#0D1F14] border shadow-2xl flex items-center gap-3 text-carbon-text dark:text-[#E2ECE5] text-xs font-sans animate-in slide-in-from-bottom-3 duration-200 ${borders[type] || borders.success} ${className}`}
    >
      <span className="shrink-0">{icons[type] || icons.success}</span>
      <span className="font-medium">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="ml-2 text-carbon-text-muted hover:text-carbon-text transition-colors p-1 rounded-lg cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default Toast;

