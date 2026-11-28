import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';
import { getPrefersReducedMotion } from '../lib/motion';

const ThemeContext = createContext();

export const THEME_STORAGE_KEY = 'carbonos-theme';
export const VALID_THEME_MODES = ['light', 'dark', 'system'];
export const THEME_TRANSITION_MS = 200;

function getSpreadOrigin(event) {
  if (typeof window === 'undefined') return { x: 0, y: 0, radius: 0 };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let x = vw - 36;
  let y = 32;

  if (event?.currentTarget?.getBoundingClientRect) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }
  } else if (typeof event?.clientX === 'number' && typeof event?.clientY === 'number' && (event.clientX || event.clientY)) {
    x = event.clientX;
    y = event.clientY;
  }

  const radius = Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y));
  return { x, y, radius };
}

export function getSystemTheme() {
  // [COMMENTED OUT FOR PERSONAL REFERENCE — defaulted OS-query fallback to dark; light-first follows prefers-color-scheme: dark]
  // return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveThemeMode(mode, systemTheme = getSystemTheme()) {
  if (mode === 'light' || mode === 'dark') return mode;
  return systemTheme === 'light' ? 'light' : 'dark';
}

export function applyThemeToDom(mode, resolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', resolvedTheme);
  root.setAttribute('data-theme-mode', mode);
  root.style.colorScheme = resolvedTheme;

  if (resolvedTheme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Storage unavailable or disabled
  }
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [mode, setModeState] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
      // [COMMENTED OUT FOR PERSONAL REFERENCE — defaulted initial theme to 'dark' instead of 'system']
      // return 'dark';
      return 'system';
    } catch {
      // return 'dark';
      return 'system';
    }
  });

  const [systemTheme, setSystemTheme] = useState(() => getSystemTheme());
  const transitionTimerRef = useRef(null);

  const resolvedTheme = resolveThemeMode(mode, systemTheme);

  const triggerThemeCrossfade = useCallback(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.add('theme-transitioning');
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }
    transitionTimerRef.current = setTimeout(() => {
      root.classList.remove('theme-transitioning');
      transitionTimerRef.current = null;
    }, THEME_TRANSITION_MS);
  }, []);

  // Apply resolved theme and color-scheme to documentElement
  useEffect(() => {
    applyThemeToDom(mode, resolvedTheme);
  }, [mode, resolvedTheme]);

  // Listen to OS color-scheme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleMediaChange = (e) => {
      const nextSys = e.matches ? 'dark' : 'light';
      setSystemTheme(nextSys);
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleMediaChange);
      return () => mediaQuery.removeEventListener('change', handleMediaChange);
    }
    return undefined;
  }, []);

  // Sync theme preference across browser tabs via storage event
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleStorage = (e) => {
      if ((e.key === THEME_STORAGE_KEY || e.key === 'theme') && VALID_THEME_MODES.includes(e.newValue)) {
        const nextMode = e.newValue;
        const nextResolved = resolveThemeMode(nextMode, getSystemTheme());
        triggerThemeCrossfade();
        applyThemeToDom(nextMode, nextResolved);
        setModeState(nextMode);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [triggerThemeCrossfade]);

  // Cleanup crossfade timer on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const runWithVenomSpread = useCallback((applyUpdate, event) => {
    if (typeof document === 'undefined' || getPrefersReducedMotion()) {
      applyUpdate();
      return;
    }

    const { x, y, radius } = getSpreadOrigin(event);

    if (typeof document.startViewTransition === 'function') {
      try {
        const transition = document.startViewTransition(() => {
          flushSync(() => {
            applyUpdate();
          });
        });

        transition.ready.then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${radius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 620,
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              pseudoElement: '::view-transition-new(root)',
            }
          );
        }).catch(() => {});
        return;
      } catch {
        // Fall through to CSS radial pulse fallback
      }
    }

    triggerThemeCrossfade();
    applyUpdate();
    const wave = document.createElement('div');
    wave.className = 'venom-theme-overlay';
    wave.style.setProperty('--venom-x', `${x}px`);
    wave.style.setProperty('--venom-y', `${y}px`);
    document.body.appendChild(wave);
    window.setTimeout(() => wave.remove(), 540);
  }, [triggerThemeCrossfade]);

  const setTheme = useCallback(
    (nextMode, event) => {
      const normalized = VALID_THEME_MODES.includes(nextMode) ? nextMode : 'dark';
      const nextResolved = resolveThemeMode(normalized, getSystemTheme());
      runWithVenomSpread(() => {
        applyThemeToDom(normalized, nextResolved);
        setModeState(normalized);
      }, event);
    },
    [runWithVenomSpread]
  );

  const toggleTheme = useCallback(
    (event) => {
      runWithVenomSpread(() => {
        setModeState((prev) => {
          const currentResolved = resolveThemeMode(prev, getSystemTheme());
          const nextMode = currentResolved === 'dark' ? 'light' : 'dark';
          applyThemeToDom(nextMode, nextMode);
          return nextMode;
        });
      }, event);
    },
    [runWithVenomSpread]
  );

  const cycleTheme = useCallback(
    (event) => {
      runWithVenomSpread(() => {
        setModeState((prev) => {
          const nextMode = prev === 'dark' ? 'light' : prev === 'light' ? 'system' : 'dark';
          const nextResolved = resolveThemeMode(nextMode, getSystemTheme());
          applyThemeToDom(nextMode, nextResolved);
          return nextMode;
        });
      }, event);
    },
    [runWithVenomSpread]
  );

  return (
    <ThemeContext.Provider
      value={{
        theme: resolvedTheme,
        resolvedTheme,
        mode,
        themeMode: mode,
        setTheme,
        toggleTheme,
        cycleTheme,
        isDark: resolvedTheme === 'dark',
        isLight: resolvedTheme === 'light',
        isSystem: mode === 'system',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
