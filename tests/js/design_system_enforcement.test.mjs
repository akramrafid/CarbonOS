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
