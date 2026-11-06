import React from 'react';
import { AlertCircle, RotateCcw, X } from 'lucide-react';

export const DynamicErrorAlert = ({
  title = 'Operation Error',
  message,
  onRetry = null,
  onDismiss = null,
  className = '',
}) => {
  if (!message) return null;

  return (
    <div
      className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-rose-900 dark:text-rose-200 backdrop-blur-md shadow-sm transition-colors ${className}`}
      role="alert"
    >
      <div className="flex items-start space-x-3 min-w-0">
        <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
        <div>
          {title && (
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-rose-800 dark:text-rose-300">
              {title}
            </h4>
          )}
          <p className="font-sans text-xs sm:text-sm text-rose-700 dark:text-rose-200/90 leading-relaxed break-words">
            {message}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 text-rose-800 dark:text-rose-200 font-sans text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <RotateCcw size={13} />
            <span>Retry</span>
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-rose-600 hover:text-rose-900 hover:bg-rose-100 dark:text-rose-400 dark:hover:text-rose-100 dark:hover:bg-rose-500/20 transition-colors focus-visible:ring-2 focus-visible:ring-rose-400"
            aria-label="Dismiss error"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </div>
  );
};

export default DynamicErrorAlert;
