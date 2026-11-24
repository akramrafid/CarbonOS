import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, X, ArrowRight, CornerDownLeft, Sparkles } from 'lucide-react';
import { getAllSearchableItems } from '../../config/nav.config';

/**
 * Universal Command Palette (Ctrl+K / Cmd+K)
 * Portaled to document.body with fuzzy/keyword search, category grouping,
 * and full keyboard navigation (Up, Down, Enter, Esc).
 */
export function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const allItems = useMemo(() => getAllSearchableItems(), []);

  // Filter items based on query (show all searchable items without silent truncation)
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    // [COMMENTED OUT FOR PERSONAL REFERENCE — truncated list at 12 items when query was empty]
    // if (!q) return allItems.slice(0, 12);
    if (!q) return allItems;

    return allItems.filter((item) => {
      const matchLabel = item.label.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      const matchRoute = item.route.toLowerCase().includes(q);
      const matchKeywords = item.keywords.some((kw) => kw.toLowerCase().includes(q));
      return matchLabel || matchCategory || matchRoute || matchKeywords;
    });
  }, [query, allItems]);

  // Reset selected index when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle keyboard navigation within the palette
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (selected) {
        navigate(selected.route);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('nav.commandPalette', 'Command Palette')}
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-bg-surface border border-border-subtle rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80dvh] min-w-0"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-subtle bg-bg-surface shrink-0">
          <Search className="w-5 h-5 text-fg-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-listbox"
            aria-activedescendant={filteredItems[selectedIndex] ? `cmd-option-${selectedIndex}` : undefined}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('nav.searchPlaceholder', 'Search routes, tools, telemetry (⌘K)...')}
            className="flex-1 bg-transparent border-0 text-fg-primary placeholder:text-fg-muted text-base sm:text-sm focus:outline-none focus:ring-0 min-w-0"
            aria-autocomplete="list"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded text-fg-muted hover:text-fg-primary"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-mono font-medium text-fg-muted bg-bg-canvas border border-border-subtle rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          id="command-palette-listbox"
          ref={listRef}
          role="listbox"
          aria-label="Navigation results"
          className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-fg-muted text-sm flex flex-col items-center gap-2">
              <Sparkles className="w-6 h-6 text-fg-muted/60" />
              <span>{t('nav.noResults', 'No routes or commands matched your search.')}</span>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon || ArrowRight;
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={item.id + item.route}
                  id={`cmd-option-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  data-index={index}
                  onClick={() => {
                    navigate(item.route);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`
                    flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-colors min-h-[44px]
                    ${isSelected ? 'bg-accent text-fg-inverse font-medium' : 'text-fg-secondary hover:text-fg-primary hover:bg-bg-elevated'}
                  `.trim()}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-white/20 text-fg-inverse' : 'bg-bg-canvas text-accent'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-sm">
                        {item.labelKey ? t(item.labelKey, item.label) : item.label}
                      </span>
                      <span className={`text-[11px] font-mono truncate ${isSelected ? 'text-fg-inverse/80' : 'text-fg-muted'}`}>
                        {item.route}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      isSelected ? 'border-white/30 text-fg-inverse' : 'border-border-subtle text-fg-muted bg-bg-canvas'
                    }`}>
                      {item.category}
                    </span>
                    {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-fg-inverse shrink-0" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 border-t border-border-subtle bg-bg-canvas/50 text-xs text-fg-muted flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-bg-surface border border-border-subtle rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-bg-surface border border-border-subtle rounded">↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-bg-surface border border-border-subtle rounded">↵</kbd> Select
            </span>
          </div>
          <span className="font-mono text-[11px]">CarbonOS v2.4</span>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default CommandPalette;
