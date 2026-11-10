import React, { useState, useRef, useEffect } from 'react';

/**
 * Dropdown / Popover Primitive
 * Accessible menu toggle with keyboard focus and click-outside dismissal.
 */
export const Dropdown = ({
  trigger,
  children,
  align = 'right',
  className = '',
  isOpen: controlledIsOpen,
  onOpenChange
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const open = isControlled ? controlledIsOpen : internalIsOpen;
  const containerRef = useRef(null);

  const toggleOpen = () => {
    const next = !open;
    if (!isControlled) setInternalIsOpen(next);
    onOpenChange?.(next);
  };

  const close = () => {
    if (!isControlled) setInternalIsOpen(false);
    onOpenChange?.(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        close();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        close();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const alignClasses = {
    left: 'left-0 origin-top-left',
    right: 'right-0 origin-top-right',
    center: 'left-1/2 -translate-x-1/2 origin-top'
  }[align] || 'right-0 origin-top-right';

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <div 
        onClick={toggleOpen}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {trigger}
      </div>

      {open && (
        <div 
          role="menu"
          tabIndex={-1}
          className={`absolute z-50 mt-2 min-w-[12rem] rounded-2xl border border-carbon-border bg-carbon-surface-raised dark:bg-[#0C1910] dark:border-[#1E3A27] text-carbon-text p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 focus:outline-none ${alignClasses}`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({
  children,
  onClick,
  disabled = false,
  destructive = false,
  icon,
  className = ''
}) => {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-sans font-medium text-left transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        destructive
          ? 'text-red-500 hover:bg-red-500/10 dark:text-red-400'
          : 'text-carbon-text hover:bg-carbon-surface dark:text-[#E2ECE5] dark:hover:bg-white/5'
      } ${className}`}
    >
      {icon && <span className="w-4 h-4 shrink-0 text-current">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
    </button>
  );
};

export default Dropdown;
