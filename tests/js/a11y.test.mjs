import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');

// -------------------------------------------------------------
// 1. Modal Focus Trap & Accessible Dialog Pattern (WCAG 2.1 AA)
// -------------------------------------------------------------
test('Modal: implements focus trap, Escape key handling, and ARIA dialog semantics', () => {
  const modalPath = path.join(ROOT, 'src/components/Modal.jsx');
  const code = fs.readFileSync(modalPath, 'utf-8');

  assert.ok(code.includes('role="dialog"'), 'Modal must have role="dialog"');
  assert.ok(code.includes('aria-modal="true"'), 'Modal must have aria-modal="true"');
  assert.ok(code.includes("e.key === 'Escape'"), 'Modal must handle Escape key dismissal');
  assert.ok(code.includes("e.key === 'Tab'"), 'Modal must trap keyboard Tab navigation');
  assert.ok(code.includes('previousActiveElement'), 'Modal must restore focus to trigger element on close');
  assert.ok(code.includes('aria-label="Close modal"'), 'Close button must have an accessible name');
  assert.ok(code.includes('min-w-[44px] min-h-[44px]'), 'Close button must satisfy minimum 44px touch target');
});

// -------------------------------------------------------------
// 2. Toast Live Region Semantics (WCAG 4.1.3 Status Messages)
// -------------------------------------------------------------
test('ToastContext: provides aria-live announcements and accessible region', () => {
  const toastPath = path.join(ROOT, 'src/context/ToastContext.jsx');
  const code = fs.readFileSync(toastPath, 'utf-8');

  assert.ok(code.includes('role="region"'), 'ToastContainer must have role="region"');
  assert.ok(code.includes('aria-label="Notifications"'), 'ToastContainer must have accessible label');
  assert.ok(code.includes('aria-live='), 'Toasts must specify aria-live for screen readers');
  assert.ok(code.includes('role='), 'Toasts must specify role status or alert');
  assert.ok(code.includes('aria-label="Close notification"'), 'Toast dismiss button must have accessible label');
});

// -------------------------------------------------------------
// 3. Icon-Only Action Buttons Accessible Names (WCAG 1.3.1 / 4.1.2)
// -------------------------------------------------------------
test('Action Buttons: icon-only controls have explicit aria-label and >= 44px tap target', () => {
  const saasPath = path.join(ROOT, 'src/pages/platform/SaaSDashboard.jsx');
  const saasCode = fs.readFileSync(saasPath, 'utf-8');

  assert.ok(saasCode.includes('aria-label="Inspect ESG calculation methodology"'), 'Impact overview info button must have aria-label');
  assert.ok(saasCode.includes('aria-label="Inspect carbon target methodology"'), 'Target progress info button must have aria-label');
  assert.ok(saasCode.includes('aria-label="More telemetry options"'), 'Active telemetry options button must have aria-label');

  const cmPath = path.join(ROOT, 'src/pages/platform/CarbonMonitoring.jsx');
  const cmCode = fs.readFileSync(cmPath, 'utf-8');
  assert.ok(cmCode.includes('aria-label="Search coordinates"'), 'Coordinates search button must have aria-label');
});

// -------------------------------------------------------------
// 4. Keyboard Navigation: Visible Focus Rings (WCAG 2.4.7)
// -------------------------------------------------------------
test('Keyboard Focus: global stylesheet defines crisp :focus-visible indicators', () => {
  const cssPath = path.join(ROOT, 'src/index.css');
  const cssCode = fs.readFileSync(cssPath, 'utf-8');

  assert.ok(cssCode.includes(':focus-visible'), 'Stylesheet must define :focus-visible rules');
  assert.ok(cssCode.includes('outline: 2px solid'), 'Must provide at least 2px solid visible outline');
  assert.ok(cssCode.includes('outline-offset: 2px'), 'Must provide outline-offset for visual separation');
});

// -------------------------------------------------------------
// 5. Text Encoding Integrity
// -------------------------------------------------------------
test('Encoding Integrity: labels contain valid localized text without corruption', () => {
  const hgPath = path.join(ROOT, 'src/pages/farmers-ai/HarvestGuardDashboard.jsx');
  const hgCode = fs.readFileSync(hgPath, 'utf-8');

  assert.ok(hgCode.includes('Password / পাসওয়ার্ড'), 'Password label must contain valid Bengali characters');
  assert.ok(!hgCode.includes('????'), 'Source must not contain corrupted replacement question marks');
});

// -------------------------------------------------------------
// 6. Production Console Hygiene
// -------------------------------------------------------------
test('Console Hygiene: zero un-guarded console.log statements in src/', () => {
  const checkDir = (dir) => {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        checkDir(full);
      } else if (f.endsWith('.jsx') || f.endsWith('.js')) {
        const content = fs.readFileSync(full, 'utf-8');
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.includes('console.log(')) {
            assert.fail(`Found un-guarded console.log in ${full}:${i + 1}`);
          }
        }
      }
    }
  };

  checkDir(path.join(ROOT, 'src'));
});
