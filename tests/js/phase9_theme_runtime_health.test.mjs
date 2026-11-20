import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { runContrastAudit } from '../../scripts/check_contrast.mjs';

const ROOT = path.resolve('.');

test('Phase 9.1 Theme System: supports light/dark/system, cross-tab storage sync, matchMedia listener, color-scheme, and 200ms temporary class', () => {
  const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.ok(
    indexHtml.includes("saved === 'light' || saved === 'dark' || saved === 'system'"),
    'index.html inline script must support light, dark, and system modes before first paint'
  );
  assert.ok(
    indexHtml.includes('root.style.colorScheme = resolved'),
    'index.html inline script must set color-scheme before first paint'
  );

  const themeCtx = fs.readFileSync(path.join(ROOT, 'src/context/ThemeContext.jsx'), 'utf8');
  assert.ok(
    themeCtx.includes("VALID_THEME_MODES = ['light', 'dark', 'system']"),
    'ThemeContext must support light, dark, and system modes'
  );
  assert.ok(
    themeCtx.includes('THEME_TRANSITION_MS = 200'),
    'ThemeContext must define ~200ms theme crossfade duration'
  );
  assert.ok(
    themeCtx.includes("root.classList.add('theme-transitioning')"),
    'ThemeContext must apply temporary .theme-transitioning class on theme switch'
  );
  assert.ok(
    themeCtx.includes("root.classList.remove('theme-transitioning')"),
    'ThemeContext must remove .theme-transitioning class after ~200ms'
  );
  assert.ok(
    themeCtx.includes("window.addEventListener('storage', handleStorage)"),
    'ThemeContext must sync theme changes across tabs via storage event'
  );
  assert.ok(
    themeCtx.includes("window.matchMedia('(prefers-color-scheme: dark)')"),
    'ThemeContext must listen to OS prefers-color-scheme changes'
  );
  assert.ok(
    themeCtx.includes('root.style.colorScheme = resolvedTheme'),
    'ThemeContext must set root.style.colorScheme'
  );

  const themeToggle = fs.readFileSync(path.join(ROOT, 'src/components/ui/ThemeToggle.jsx'), 'utf8');
  assert.ok(
    themeToggle.includes('role="radiogroup"') && themeToggle.includes('role="radio"'),
    'ThemeToggle must provide accessible segmented radiogroup for Light / Dark / System'
  );
});

test('Phase 9.2 Dual-Theme CSS Safeguards: color-scheme, ~200ms crossfade, autofill, scrollbars, and code blocks', () => {
  const tokensCss = fs.readFileSync(path.join(ROOT, 'src/styles/tokens.css'), 'utf8');
  assert.ok(tokensCss.includes('color-scheme: dark;'), 'tokens.css must set color-scheme: dark');
  assert.ok(tokensCss.includes('color-scheme: light;'), 'tokens.css must set color-scheme: light');
  assert.ok(
    tokensCss.includes('html.theme-transitioning') &&
      tokensCss.includes('transition-duration: 200ms !important;'),
    'tokens.css must scope 200ms crossfade to html.theme-transitioning'
  );
  assert.ok(
    tokensCss.includes('input:-webkit-autofill'),
    'tokens.css must style browser autofill in both themes'
  );
  assert.ok(
    tokensCss.includes('scrollbar-color:') && tokensCss.includes('::-webkit-scrollbar-thumb'),
    'tokens.css must style scrollbars in both themes'
  );

  const indexCss = fs.readFileSync(path.join(ROOT, 'src/index.css'), 'utf8');
  assert.ok(
    !indexCss.includes('transition-duration: 0.35s;'),
    'index.css must not force permanent 0.35s universal * transitions'
  );
});

test('Phase 9.3 WCAG AA Contrast Audit: all 74 token pairs pass >= 4.5:1 across Dark and Light themes', () => {
  const { results, failures } = runContrastAudit();
  assert.ok(results.length >= 70, `Expected at least 70 audited token pairs, got ${results.length}`);
  assert.equal(
    failures.length,
    0,
    `WCAG AA contrast violations found:\n${failures.join('\n')}`
  );
});

test('Phase 9.4 Visibility-Aware Polling & Effect Cleanup: all recurring timers pause when document.visibilityState === "hidden"', () => {
  const pollingFiles = [
    'src/components/Hero.jsx',
    'src/components/CorporateSaaSPipeline.jsx',
    'src/components/LiveMetrics.jsx',
    'src/pages/platform/Impact.jsx',
    'src/pages/platform/MRVDashboard.jsx',
    'src/hooks/useRealtimeStatus.js',
  ];

  for (const relPath of pollingFiles) {
    const content = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
    assert.ok(
      content.includes("document.visibilityState === 'hidden'"),
      `${relPath} must pause polling/timers when document.visibilityState === 'hidden'`
    );
    assert.ok(
      content.includes('clearInterval') || content.includes('clearTimeout'),
      `${relPath} must clean up its timers on unmount`
    );
  }
});

