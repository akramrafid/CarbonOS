import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');

// -------------------------------------------------------------
// 1. ErrorBoundary Contract
// -------------------------------------------------------------
test('ErrorBoundary: implements error catching, stack masking in prod, and dual-theme recovery UI', () => {
  const filePath = path.join(ROOT, 'src/components/ErrorBoundary.jsx');
  const code = fs.readFileSync(filePath, 'utf-8');

  assert.ok(code.includes('getDerivedStateFromError'), 'Must implement getDerivedStateFromError');
  assert.ok(code.includes('componentDidCatch'), 'Must implement componentDidCatch');
  assert.ok(code.includes('handleReset'), 'Must provide a reset / try again mechanism');
  assert.ok(code.includes('handleCopyDetails') || code.includes('Diagnostics'), 'Must provide diagnostic export/copy');
  assert.ok(code.includes('import.meta.env?.PROD') || code.includes('isProd'), 'Must sanitize error messages in production');
  assert.ok(code.includes('role="alert"'), 'Must have role="alert" for screen readers');
  assert.ok(code.includes('isLight'), 'Must support dual-theme styling');
});

// -------------------------------------------------------------
// 2. 404 & 403 Routing and Component Contracts
// -------------------------------------------------------------
test('Routing: App.jsx registers 404 NotFound, 403 Forbidden, and 401 Unauthorized', () => {
  const appPath = path.join(ROOT, 'src/App.jsx');
  const code = fs.readFileSync(appPath, 'utf-8');

  assert.ok(code.includes('path="*"') && code.includes('NotFound'), 'Must have catch-all 404 route');
  assert.ok(code.includes('path="/forbidden"') && code.includes('Forbidden'), 'Must have /forbidden route');
  assert.ok(code.includes('path="/unauthorized"') && code.includes('Forbidden'), 'Must have /unauthorized route');
  assert.ok(code.includes('<OfflineBanner />'), 'Must include global OfflineBanner');
});

test('Forbidden Page: on-brand 403 status, reason handling, and dual-theme styling', () => {
  const forbiddenPath = path.join(ROOT, 'src/pages/Forbidden.jsx');
  const code = fs.readFileSync(forbiddenPath, 'utf-8');

  assert.ok(code.includes('Status 403'), 'Must display Status 403 header');
  assert.ok(code.includes('getReasonText') || code.includes('reason'), 'Must handle dynamic access denial reasons');
  assert.ok(code.includes('useTheme') && code.includes('isLight'), 'Must support dual themes');
  assert.ok(code.includes('Return to Home') || code.includes('to="/"'), 'Must provide primary rescue link');
  assert.ok(code.includes('Go Back') || code.includes('navigate(-1)'), 'Must allow user to return to previous page');
});

test('NotFound Page: on-brand 404 status, dual-theme styling, and rescue pathways', () => {
  const notFoundPath = path.join(ROOT, 'src/pages/NotFound.jsx');
  const code = fs.readFileSync(notFoundPath, 'utf-8');

  assert.ok(code.includes('Status 404'), 'Must display Status 404 header');
  assert.ok(code.includes('useTheme') && code.includes('isLight'), 'Must support dual themes');
  assert.ok(code.includes('location.pathname'), 'Must reflect attempted invalid path');
  assert.ok(code.includes('Return to Home') || code.includes('to="/"'), 'Must provide rescue link to Home');
});

// -------------------------------------------------------------
// 3. Global Loading UI & Accessibility
// -------------------------------------------------------------
test('LoadingSpinner: provides screen, container, and skeleton variants with reduced-motion safety', () => {
  const spinnerPath = path.join(ROOT, 'src/components/LoadingSpinner.jsx');
  const code = fs.readFileSync(spinnerPath, 'utf-8');

  assert.ok(code.includes("variant === 'skeleton'"), 'Must support skeleton variant');
  assert.ok(code.includes("variant === 'inline'"), 'Must support inline variant');
  assert.ok(code.includes('role="status"'), 'Must have role="status" for accessibility');
  assert.ok(code.includes('aria-live="polite"'), 'Must have aria-live="polite"');
  assert.ok(code.includes('motion-reduce:animate-none'), 'Must disable heavy spinning when reduced motion is preferred');
});

// -------------------------------------------------------------
// 4. Offline State Detection
// -------------------------------------------------------------
test('OfflineBanner: monitors navigator.onLine and window online/offline events', () => {
  const bannerPath = path.join(ROOT, 'src/components/OfflineBanner.jsx');
  const code = fs.readFileSync(bannerPath, 'utf-8');

  assert.ok(code.includes("navigator.onLine"), 'Must check navigator.onLine');
  assert.ok(code.includes("window.addEventListener('online'"), 'Must listen for online event');
  assert.ok(code.includes("window.addEventListener('offline'"), 'Must listen for offline event');
  assert.ok(code.includes('role="status"'), 'Must have role="status"');
  assert.ok(code.includes('isLight'), 'Must support dual themes');
});
