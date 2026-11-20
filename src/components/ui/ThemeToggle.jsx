import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Accessible Animated Theme Toggle Component (Phase 9)
 * Supports:
 * - `variant="icon"`: compact 44x44px animated Sun/Moon button
 * - `variant="segmented"`: 3-way Light / Dark / System mode selector
 */
export function ThemeToggle({ variant = 'icon', className = '', id }) {
  const { theme, mode, setTheme, toggleTheme } = useTheme();

  if (variant === 'segmented') {
    const options = [
      { id: 'light', label: 'Light', icon: Sun },
      { id: 'dark', label: 'Dark', icon: Moon },
      { id: 'system', label: 'System', icon: Monitor },
    ];

    return (
      <div
        id={id}
        role="radiogroup"
        aria-label="Color theme mode"
        className={`inline-flex items-center rounded-full bg-bg-elevated border border-border-subtle p-1 gap-0.5 ${className}`}
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = mode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${opt.label} theme`}
              onClick={() => setTheme(opt.id)}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-mono transition-colors min-h-[44px] min-w-[44px] cursor-pointer focus-ring-standard ${
                isSelected
                  ? 'bg-accent text-fg-inverse font-semibold shadow-sm'
                  : 'text-fg-secondary hover:text-fg-primary'
              }`}
            >
              <Icon size={13} aria-hidden="true" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  const nextLabel = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      id={id}
      type="button"
      onClick={toggleTheme}
      aria-label={nextLabel}
      title={`${nextLabel} (current: ${mode === 'system' ? `system / ${theme}` : theme})`}
      className={`theme-toggle min-w-[44px] min-h-[44px] focus-ring-standard cursor-pointer ${className}`}
    >
      <Sun size={16} className="icon icon-sun text-amber" aria-hidden="true" />
      <Moon size={16} className="icon icon-moon text-emerald" aria-hidden="true" />
    </button>
  );
}

export default ThemeToggle;

