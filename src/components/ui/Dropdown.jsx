import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Universal Dropdown / Popover Primitive (Phase 3: Zero-Clipping Portal Overlay)
 * - Rendered in a portal to prevent clipping by ancestor overflow: hidden
 * - Computes fixed position from trigger bounding rect
 * - Accessible menu toggle with keyboard focus and click-outside dismissal
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
  const menuRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState({});

  const updatePosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const top = rect.bottom + 8;
    const left = align === 'left' ? rect.left : align === 'center' ? rect.left + rect.width / 2 : rect.right;

    setMenuStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      transform: align === 'right' ? 'translateX(-100%)' : align === 'center' ? 'translateX(-50%)' : 'none',
      zIndex: 9999
    });
  };

  const toggleOpen = () => {
    const next = !open;
    if (next) updatePosition();
    if (!isControlled) setInternalIsOpen(next);
    onOpenChange?.(next);
  };

  const close = () => {
    if (!isControlled) setInternalIsOpen(false);
    onOpenChange?.(false);
  };

  useEffect(() => {
    if (open) {
      updatePosition();
      const handleScrollOrResize = () => updatePosition();
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);

      const handleClickOutside = (e) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target) &&
          (!menuRef.current || !menuRef.current.contains(e.target))
        ) {
          close();
        }
      };

      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && open) {
          close();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [open]);

  return (
    <div ref={containerRef} className={`relative inline-block text-left min-w-0 ${className}`}>
      <div 
        onClick={toggleOpen}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {trigger}
      </div>

      {open && typeof document !== 'undefined' && createPortal(
        <div 
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          style={menuStyle}
          className="min-w-[12rem] rounded-2xl border border-border-subtle bg-bg-elevated text-fg-primary p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 focus:outline-none"
        >
          {children}
        </div>,
        document.body
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
          : 'text-fg-primary hover:bg-bg-surface dark:hover:bg-white/5'
      } ${className}`}
    >
      {icon && <span className="w-4 h-4 shrink-0 text-current">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
    </button>
  );
};

export default Dropdown;
