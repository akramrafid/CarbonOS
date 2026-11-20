import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Phase 10.1: Fluid Typography Scale defines clamp() for all heading levels', () => {
  const tokensCss = fs.readFileSync(path.resolve('src/styles/tokens.css'), 'utf8');
  assert.match(tokensCss, /--type-display:\s*clamp\(/, '--type-display must use clamp()');
  assert.match(tokensCss, /--type-h1:\s*clamp\(/, '--type-h1 must use clamp()');
  assert.match(tokensCss, /--type-h2:\s*clamp\(/, '--type-h2 must use clamp()');
  assert.match(tokensCss, /--type-h3:\s*clamp\(/, '--type-h3 must use clamp()');
  assert.match(tokensCss, /--type-body:\s*clamp\(/, '--type-body must use clamp()');
});

test('Phase 10.2: Dynamic Viewport Height (dvh) standard configured in tailwind.config.js', () => {
  const tailwindConfig = fs.readFileSync(path.resolve('tailwind.config.js'), 'utf8');
  assert.match(
    tailwindConfig,
    /minHeight:\s*\{\s*screen:\s*\['100vh',\s*'100dvh'\]/,
    'tailwind.config.js must define minHeight.screen fallback with 100dvh'
  );
  assert.match(
    tailwindConfig,
    /height:\s*\{\s*screen:\s*\['100vh',\s*'100dvh'\]/,
    'tailwind.config.js must define height.screen fallback with 100dvh'
  );
});

test('Phase 10.3: Safe-Area Insets applied on mobile fixed navigation and drawers', () => {
  const mobileTabBar = fs.readFileSync(path.resolve('src/components/layout/MobileTabBar.jsx'), 'utf8');
  assert.match(
    mobileTabBar,
    /safe-area-inset-bottom/,
    'MobileTabBar must incorporate safe-area-inset-bottom'
  );

  const mobileDrawer = fs.readFileSync(path.resolve('src/components/layout/MobileDrawer.jsx'), 'utf8');
  assert.match(
    mobileDrawer,
    /safe-area-inset-bottom/,
    'MobileDrawer must incorporate safe-area-inset-bottom'
  );

  const navbar = fs.readFileSync(path.resolve('src/components/Navbar.jsx'), 'utf8');
  assert.match(
    navbar,
    /safe-area-inset-bottom/,
    'Navbar mobile drawer must incorporate safe-area-inset-bottom'
  );
});

test('Phase 10.4: DataTable implements responsive touch-pan-x and sticky column pattern', () => {
  const dataTable = fs.readFileSync(path.resolve('src/components/ui/DataTable.jsx'), 'utf8');
  assert.match(dataTable, /touch-pan-x/, 'DataTable must wrap rows in touch-pan-x container');
  assert.match(dataTable, /stickyFirstColumn/, 'DataTable must support stickyFirstColumn prop');
  assert.match(dataTable, /sticky left-0/, 'DataTable must apply sticky left-0 positioning to pinned columns');
});

test('Phase 10.5: Persistent layout shells guard against horizontal page overflow with overflow-x-clip and min-w-0', () => {
  const marketingLayout = fs.readFileSync(path.resolve('src/components/layout/MarketingLayout.jsx'), 'utf8');
  assert.match(marketingLayout, /overflow-x-clip/, 'MarketingLayout must enforce overflow-x-clip');
  assert.match(marketingLayout, /min-w-0/, 'MarketingLayout must enforce min-w-0');

  const dashboardLayout = fs.readFileSync(path.resolve('src/components/layout/DashboardLayout.jsx'), 'utf8');
  assert.match(dashboardLayout, /overflow-x-clip/, 'DashboardLayout must enforce overflow-x-clip');
  assert.match(dashboardLayout, /min-w-0/, 'DashboardLayout must enforce min-w-0');
});

