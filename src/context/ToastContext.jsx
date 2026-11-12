import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((type, message, options = {}) => {
    const id = options.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const duration = options.duration !== undefined ? options.duration : 4000;
    const title = options.title || null;

    const newToast = { id, type, message, title, duration };

    setToasts((prev) => [...prev.slice(-4), newToast]); // Keep maximum 5 toasts

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const toast = useMemo(() => {
    const fn = (message, options) => addToast('info', message, options);
    fn.success = (message, options) => addToast('success', message, options);
    fn.error = (message, options) => addToast('error', message, options);
    fn.warning = (message, options) => addToast('warning', message, options);
    fn.info = (message, options) => addToast('info', message, options);
    fn.dismiss = removeToast;
    return fn;
  }, [addToast, removeToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

const TOAST_ICONS = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald shrink-0" aria-hidden="true" />,
  error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" aria-hidden="true" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" aria-hidden="true" />,
  info: <Info className="w-5 h-5 text-cyan-400 shrink-0" aria-hidden="true" />,
};

const TOAST_BORDER_COLORS = {
  success: 'border-emerald/40',
  error: 'border-rose-500/40',
  warning: 'border-amber-500/40',
  info: 'border-cyan-400/40',
};

const ToastContainer = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((item) => {
        const isAlert = item.type === 'error';
        return (
          <div
            key={item.id}
            role={isAlert ? 'alert' : 'status'}
            aria-live={isAlert ? 'assertive' : 'polite'}
            aria-atomic="true"
            className={`pointer-events-auto toast-surface keep-white flex items-start gap-3 p-4 rounded-2xl bg-bg-canvas/95 dark:bg-bg-canvas/95 text-white border ${
              TOAST_BORDER_COLORS[item.type] || 'border-white/10'
            } shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5`}
          >
            {TOAST_ICONS[item.type]}
            <div className="flex-1 min-w-0">
              {item.title && (
                <p className="font-sans font-semibold text-xs tracking-wide uppercase text-white/90 mb-0.5">
                  {item.title}
                </p>
              )}
              <p className="font-sans text-xs text-white/80 leading-relaxed break-words">
                {item.message}
              </p>
            </div>
            <button
              onClick={() => onDismiss(item.id)}
              className="text-white/40 hover:text-white transition-colors p-1.5 -mr-1 -mt-1 rounded-lg focus-visible:ring-2 focus-visible:ring-emerald/60 focus:outline-none min-w-[32px] min-h-[32px] flex items-center justify-center"
              aria-label="Close notification"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContext;
