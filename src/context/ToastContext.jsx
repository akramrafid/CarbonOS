import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
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
  const timersRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    const t = timersRef.current.get(id);
    if (t) {
      clearTimeout(t);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  React.useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const addToast = useCallback(
    (type, message, options = {}) => {
      const id = options.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const duration = options.duration !== undefined ? options.duration : 4000;
      const title = options.title || null;

      const newToast = { id, type, message, title, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]); // Keep maximum 5 toasts

      if (duration > 0) {
        const timer = setTimeout(() => {
          removeToast(id);
        }, duration);
        timersRef.current.set(id, timer);
      }
      return id;
    },
    [removeToast]
  );

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

function SwipeableToastItem({ item, onDismiss }) {
  const isAlert = item.type === 'error';
  const startXRef = useRef(null);
  const [dragX, setDragX] = useState(0);

  const handlePointerDown = (e) => {
    startXRef.current = e.clientX;
  };

  const handlePointerMove = (e) => {
    if (startXRef.current === null) return;
    const delta = e.clientX - startXRef.current;
    if (delta > -20) {
      setDragX(delta);
    }
  };

  const handlePointerUp = () => {
    if (dragX > 80) {
      onDismiss(item.id);
    } else {
      setDragX(0);
    }
    startXRef.current = null;
  };

  return (
    <div
      role={isAlert ? 'alert' : 'status'}
      aria-live={isAlert ? 'assertive' : 'polite'}
      aria-atomic="true"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={
        dragX !== 0
          ? {
              transform: `translate3d(${dragX}px, 0, 0)`,
              opacity: Math.max(0.25, 1 - Math.abs(dragX) / 160),
            }
          : undefined
      }
      className={`pointer-events-auto toast-surface flex items-start gap-3 p-4 rounded-2xl bg-bg-surface/95 text-fg-primary border ${
        TOAST_BORDER_COLORS[item.type] || 'border-border-subtle'
      } shadow-2xl backdrop-blur-xl transition-colors duration-200 touch-pan-y select-none`}
    >
      {TOAST_ICONS[item.type]}
      <div className="flex-1 min-w-0">
        {item.title && (
          <p className="font-sans font-semibold text-xs tracking-wide uppercase text-fg-primary mb-0.5">
            {item.title}
          </p>
        )}
        <p className="font-sans text-xs text-fg-secondary leading-relaxed break-words">
          {item.message}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="text-fg-muted hover:text-fg-primary transition-colors p-1.5 -mr-1 -mt-1 rounded-lg focus-visible:ring-2 focus-visible:ring-emerald/60 focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Close notification"
      >
        <X size={15} />
      </button>
    </div>
  );
}

const ToastContainer = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((item) => (
        <SwipeableToastItem key={item.id} item={item} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export default ToastContext;
