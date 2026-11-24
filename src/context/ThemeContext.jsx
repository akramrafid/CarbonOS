import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const ThemeContext = createContext();

export const THEME_STORAGE_KEY = 'carbonos-theme';
export const VALID_THEME_MODES = ['light', 'dark', 'system'];
export const THEME_TRANSITION_MS = 200;

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

  const setTheme = useCallback(
    (nextMode) => {
      const normalized = VALID_THEME_MODES.includes(nextMode) ? nextMode : 'dark';
      const nextResolved = resolveThemeMode(normalized, getSystemTheme());
      triggerThemeCrossfade();
      applyThemeToDom(normalized, nextResolved);
      setModeState(normalized);
    },
    [triggerThemeCrossfade]
  );

  const toggleTheme = useCallback(() => {
    triggerThemeCrossfade();
    setModeState((prev) => {
      const currentResolved = resolveThemeMode(prev, getSystemTheme());
      const nextMode = currentResolved === 'dark' ? 'light' : 'dark';
      applyThemeToDom(nextMode, nextMode);
      return nextMode;
    });
  }, [triggerThemeCrossfade]);

  const cycleTheme = useCallback(() => {
    triggerThemeCrossfade();
    setModeState((prev) => {
      const nextMode = prev === 'dark' ? 'light' : prev === 'light' ? 'system' : 'dark';
      const nextResolved = resolveThemeMode(nextMode, getSystemTheme());
      applyThemeToDom(nextMode, nextResolved);
      return nextMode;
    });
  }, [triggerThemeCrossfade]);

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
