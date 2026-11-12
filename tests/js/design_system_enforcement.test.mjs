import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

// -------------------------------------------------------------
// 1. Universal UI Primitives: Design Principles Validation
// -------------------------------------------------------------

test('Universal Button: variants, heights, and mobile 44px minimum tap target', () => {
  const btnPath = path.join(ROOT, 'src/components/ui/Button.jsx');
  const btnCode = fs.readFileSync(btnPath, 'utf-8');

  // Check variants
  assert.ok(btnCode.includes('primary:'), 'Button must support primary variant');
  assert.ok(btnCode.includes('secondary:'), 'Button must support secondary variant');
  assert.ok(btnCode.includes('ghost:'), 'Button must support ghost variant');
  assert.ok(btnCode.includes('destructive:'), 'Button must support destructive variant');
  assert.ok(btnCode.includes('link:'), 'Button must support link variant');

  // Check heights: sm 32px (h-8), md 40px (h-10), lg 48px (h-12)
  assert.ok(btnCode.includes('h-8'), 'sm button must be 32px (h-8)');
  assert.ok(btnCode.includes('h-10'), 'md button must be 40px (h-10)');
  assert.ok(btnCode.includes('h-12'), 'lg button must be 48px (h-12)');

  // Check mobile tap target: min-h-[44px]
  assert.ok(btnCode.includes('min-h-[44px]'), 'Button must enforce >= 44px touch target on mobile');
});

test('Universal IconButton: requires aria-label and >= 44px hit area', () => {
  const iconBtnPath = path.join(ROOT, 'src/components/ui/IconButton.jsx');
  const iconBtnCode = fs.readFileSync(iconBtnPath, 'utf-8');

  assert.ok(iconBtnCode.includes('aria-label='), 'IconButton must require and forward aria-label');
  assert.ok(iconBtnCode.includes('min-h-[44px]') && iconBtnCode.includes('min-w-[44px]'), 'IconButton must have min 44px hit target');
});

test('Universal Input: shares height and focus ring tokens with Button', () => {
  const inputPath = path.join(ROOT, 'src/components/ui/Input.jsx');
  const inputCode = fs.readFileSync(inputPath, 'utf-8');

  // Height tokens match Button
  assert.ok(inputCode.includes('h-8'), 'Input sm must be 32px (h-8)');
  assert.ok(inputCode.includes('h-10'), 'Input md must be 40px (h-10)');
  assert.ok(inputCode.includes('h-12'), 'Input lg must be 48px (h-12)');

  // Shared focus-visible styling
  assert.ok(inputCode.includes('focus-visible:ring'), 'Input must share standard focus-visible ring token');
});

test('PageHeader: renders semantic hierarchy with exactly one <h1>', () => {
  const headerPath = path.join(ROOT, 'src/components/ui/PageHeader.jsx');
  const headerCode = fs.readFileSync(headerPath, 'utf-8');

  const codeWithoutComments = headerCode.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
  const h1Matches = codeWithoutComments.match(/<h1[\s>]/g);
  assert.strictEqual(h1Matches?.length, 1, 'PageHeader must contain exactly 1 h1 JSX element');
});

test('StatCard: enforces tabular-nums and font-mono for quantitative telemetry', () => {
  const statPath = path.join(ROOT, 'src/components/ui/StatCard.jsx');
  const statCode = fs.readFileSync(statPath, 'utf-8');

  assert.ok(statCode.includes('tabular-nums'), 'StatCard numbers must use tabular-nums');
  assert.ok(statCode.includes('font-mono'), 'StatCard numbers must use font-mono');
});

// -------------------------------------------------------------
// 2. Persistent Layout Architecture
// -------------------------------------------------------------

test('Persistent Layout Shells: MarketingLayout and DashboardLayout contain persistent containers', () => {
  const mktgPath = path.join(ROOT, 'src/components/layout/MarketingLayout.jsx');
  const mktgCode = fs.readFileSync(mktgPath, 'utf-8');
  assert.ok(mktgCode.includes('<Navbar'), 'MarketingLayout must contain persistent Navbar');
  assert.ok(mktgCode.includes('<Footer'), 'MarketingLayout must contain persistent Footer');
  assert.ok(mktgCode.includes('<Outlet'), 'MarketingLayout must render Outlet for route content');

  const dashPath = path.join(ROOT, 'src/components/layout/DashboardLayout.jsx');
  const dashCode = fs.readFileSync(dashPath, 'utf-8');
  assert.ok(dashCode.includes('<Outlet'), 'DashboardLayout must render Outlet for route content');
});

test('DevGridOverlay: exists and supports "G" key shortcut for 12-column grid and 4px rhythm', () => {
  const gridPath = path.join(ROOT, 'src/components/ui/DevGridOverlay.jsx');
  const gridCode = fs.readFileSync(gridPath, 'utf-8');

  assert.ok(gridCode.includes("e.key === 'g' || e.key === 'G'"), 'DevGridOverlay must toggle with "G" key');
  assert.ok(gridCode.includes('grid-cols-12'), 'DevGridOverlay must render 12-column grid');
});

// -------------------------------------------------------------
// 3. Page-Level Design System Enforcement
// -------------------------------------------------------------

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.jsx') || file.endsWith('.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const targetDirs = [path.join(ROOT, 'src/pages'), path.join(ROOT, 'src/features')];
let allPageAndFeatureFiles = [];
targetDirs.forEach((dir) => {
  allPageAndFeatureFiles = allPageAndFeatureFiles.concat(walk(dir));
});

test('Enforcement: no raw <button> with className styling outside src/components/ui', () => {
  const violations = [];
  allPageAndFeatureFiles.forEach((f) => {
    const content = fs.readFileSync(f, 'utf8');
    const matches = content.match(/<button[\s\S]*?>/g) || [];
    const withClass = matches.filter((m) => /className\s*=/i.test(m));
    if (withClass.length > 0) {
      violations.push(`${path.relative(ROOT, f)} (${withClass.length} raw buttons)`);
    }
  });
  assert.strictEqual(
    violations.length,
    0,
    `Raw <button> with className found outside src/components/ui:\n${violations.join('\n')}`
  );
});

test('Enforcement: at most ONE variant="primary" Button per page or panel file', () => {
  const violations = [];
  allPageAndFeatureFiles.forEach((f) => {
    const content = fs.readFileSync(f, 'utf8');
    const matches = content.match(/variant\s*=\s*["']primary["']/g) || [];
    if (matches.length > 1) {
      violations.push(`${path.relative(ROOT, f)} (${matches.length} primary buttons)`);
    }
  });
  assert.strictEqual(
    violations.length,
    0,
    `Multiple variant="primary" Buttons found in single page or panel:\n${violations.join('\n')}`
  );
});

test('Enforcement: no raw <h1> outside PageHeader in src/pages and src/features', () => {
  const violations = [];
  allPageAndFeatureFiles.forEach((f) => {
    const content = fs.readFileSync(f, 'utf8');
    const stripped = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    const matches = stripped.match(/<h1[\s>]/g) || [];
    if (matches.length > 0) {
      violations.push(`${path.relative(ROOT, f)} (${matches.length} h1 elements)`);
    }
  });
  assert.strictEqual(
    violations.length,
    0,
    `Raw <h1> found outside PageHeader:\n${violations.join('\n')}`
  );
});

test('Enforcement: zero files over 400 lines in src/pages and src/features', () => {
  const violations = [];
  allPageAndFeatureFiles.forEach((f) => {
    const lines = fs.readFileSync(f, 'utf8').split('\n').length;
    if (lines > 400) {
      violations.push(`${path.relative(ROOT, f)} (${lines} lines)`);
    }
  });
  assert.strictEqual(
    violations.length,
    0,
    `Files exceeding 400 lines in src/pages and src/features:\n${violations.join('\n')}`
  );
});

test('Enforcement: all modal components (*Modal.jsx) must be built on ui/Modal', () => {
  const modalFiles = allPageAndFeatureFiles.filter((f) => /Modal\.jsx$/i.test(path.basename(f)));
  const violations = [];
  modalFiles.forEach((f) => {
    const content = fs.readFileSync(f, 'utf8');
    const importsModal = content.includes('/components/ui/Modal') || content.includes('@/components/ui/Modal');
    if (!importsModal) {
      violations.push(path.relative(ROOT, f));
    }
  });
  assert.strictEqual(
    violations.length,
    0,
    `Modal files not built on ui/Modal:\n${violations.join('\n')}`
  );
});
