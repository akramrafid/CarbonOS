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

// -------------------------------------------------------------
// 4. Phase 2: Design Language (Tokens, Spacing, Gradients & Effects)
// -------------------------------------------------------------

test('Phase 2 Tokens: tokens.css defines complete dual-theme palette, typography, and effects', () => {
  const tokensPath = path.join(ROOT, 'src/styles/tokens.css');
  assert.ok(fs.existsSync(tokensPath), 'src/styles/tokens.css must exist');
  const tokensCode = fs.readFileSync(tokensPath, 'utf-8');

  // Dark theme canvas and surfaces
  assert.ok(tokensCode.includes('--color-bg-canvas: #080F0B'), 'Dark canvas must be #080F0B');
  assert.ok(tokensCode.includes('--color-bg-surface: #0D1812'), 'Dark surface must be #0D1812');
  assert.ok(tokensCode.includes('--color-fg-primary: #F0F4F1'), 'Dark primary fg must be #F0F4F1');

  // Light theme canvas and surfaces
  assert.ok(tokensCode.includes('[data-theme="light"]'), 'Light theme selector must be defined');
  assert.ok(tokensCode.includes('--color-bg-canvas: #F2F3EE'), 'Light canvas must be #F2F3EE linen');
  assert.ok(tokensCode.includes('--color-bg-surface: #FFFFFF'), 'Light surface must be #FFFFFF crisp card');
  assert.ok(tokensCode.includes('--color-fg-primary: #181414'), 'Light primary fg must be #181414');

  // Fluid typography scale and font families
  assert.ok(tokensCode.includes('--font-display:'), 'Display font token must be defined');
  assert.ok(tokensCode.includes('--font-ui:'), 'UI font token must be defined');
  assert.ok(tokensCode.includes('--font-data:'), 'Data font token must be defined');
  assert.ok(tokensCode.includes('clamp('), 'Fluid typography must use clamp() scale');

  // Non-Latin Bangla script tuning
  assert.ok(tokensCode.includes(':lang(bn)'), 'Bangla lang selector must be tuned');
  assert.ok(tokensCode.includes('letter-spacing: normal'), 'Bangla must enforce normal letter-spacing');
  assert.ok(tokensCode.includes('line-height: 1.65'), 'Bangla must enforce line-height >= 1.65');

  // Two brand gradients max
  assert.ok(tokensCode.includes('.bg-gradient-aurora'), 'Aurora gradient must be defined');
  assert.ok(tokensCode.includes('.bg-gradient-sunrise'), 'Sunrise gradient must be defined');

  // Premium effects
  assert.ok(tokensCode.includes('.bg-noise'), 'Hardware-accelerated noise texture must be defined');
  assert.ok(tokensCode.includes('.glass-panel'), 'Glassmorphism surface token must be defined');
  assert.ok(tokensCode.includes('.card-glow-hover'), 'Card glow micro-interaction token must be defined');
  assert.ok(tokensCode.includes('.focus-ring-standard'), 'Standard focus ring token must be defined');
});

test('Phase 2 Enforcement: Zero raw hex class literals in src/ (outside allowed layerConfig and tokens)', () => {
  const allowed = new Set([
    path.normalize(path.join(ROOT, 'src/styles/tokens.css')),
    path.normalize(path.join(ROOT, 'src/features/carbon-monitoring/constants/layerConfig.js'))
  ]);

  function scanDir(dir) {
    let files = [];
    if (!fs.existsSync(dir)) return files;
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(scanDir(full));
      } else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
        files.push(full);
      }
    });
    return files;
  }

  const allSrcFiles = scanDir(path.join(ROOT, 'src'));
  const hexClassRegex = /\b(?:bg|text|border|from|to|via)-\[#[0-9a-fA-F]{3,8}\]/g;
  const violations = [];

  allSrcFiles.forEach((f) => {
    if (allowed.has(path.normalize(f))) return;
    const content = fs.readFileSync(f, 'utf-8');
    const matches = content.match(hexClassRegex);
    if (matches && matches.length > 0) {
      violations.push(`${path.relative(ROOT, f)} (${matches.length} raw hex classes: ${matches.slice(0, 3).join(', ')})`);
    }
  });

  assert.strictEqual(
    violations.length,
    0,
    `Raw hex class literals found in src/:\n${violations.join('\n')}`
  );
});

test('Phase 2 Enforcement: Zero arbitrary spacing classes in src/pages, src/features, and src/components', () => {
  const allUiFiles = [
    ...walk(path.join(ROOT, 'src/pages')),
    ...walk(path.join(ROOT, 'src/features')),
    ...walk(path.join(ROOT, 'src/components'))
  ];

  const arbSpacingRegex = /\b(?:p|py|px|pt|pb|pl|pr|m|my|mx|mt|mb|ml|mr|gap)-\[\d+(?:px|rem)?\]/g;
  const violations = [];

  allUiFiles.forEach((f) => {
    const content = fs.readFileSync(f, 'utf-8');
    const matches = content.match(arbSpacingRegex);
    if (matches && matches.length > 0) {
      violations.push(`${path.relative(ROOT, f)} (${matches.join(', ')})`);
    }
  });

  assert.strictEqual(
    violations.length,
    0,
    `Arbitrary spacing classes found in UI files:\n${violations.join('\n')}`
  );
});

test('Phase 2 Enforcement: Inter-module vertical spacing capped at py-16 (64px) / py-10 (40px mobile)', () => {
  const allUiFiles = [
    ...walk(path.join(ROOT, 'src/pages')),
    ...walk(path.join(ROOT, 'src/features')),
    ...walk(path.join(ROOT, 'src/components'))
  ];

  const excessiveVerticalRegex = /\b(?:py|my)-(?:20|24|28|32|36|40|44|48|52|56|60|64)\b/g;
  const violations = [];

  allUiFiles.forEach((f) => {
    const content = fs.readFileSync(f, 'utf-8');
    const matches = content.match(excessiveVerticalRegex);
    if (matches && matches.length > 0) {
      violations.push(`${path.relative(ROOT, f)} (${matches.join(', ')})`);
    }
  });

  assert.strictEqual(
    violations.length,
    0,
    `Excessive inter-module vertical spacing exceeding py-16 found:\n${violations.join('\n')}`
  );
});

test('Phase 2 Tailwind Config: maps semantic tokens and MFS brands', () => {
  const twPath = path.join(ROOT, 'tailwind.config.js');
  const twCode = fs.readFileSync(twPath, 'utf-8');

  assert.ok(twCode.includes("canvas: 'var(--color-bg-canvas)'"), 'tailwind.config.js must wire bg.canvas');
  assert.ok(twCode.includes("surface: 'var(--color-bg-surface)'"), 'tailwind.config.js must wire bg.surface');
  assert.ok(twCode.includes("primary: 'var(--color-fg-primary)'"), 'tailwind.config.js must wire fg.primary');
  assert.ok(twCode.includes("bkash: 'var(--color-brand-bkash)'"), 'tailwind.config.js must wire brand bkash');
  assert.ok(twCode.includes("nagad: 'var(--color-brand-nagad)'"), 'tailwind.config.js must wire brand nagad');
  assert.ok(twCode.includes("rocket: 'var(--color-brand-rocket)'"), 'tailwind.config.js must wire brand rocket');
});
