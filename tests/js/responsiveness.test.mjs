import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');

// -------------------------------------------------------------
// 1. Viewport Height Contract (100dvh for mobile address bars)
// -------------------------------------------------------------
test('Mobile Viewport Height: Hero & sticky alignment cards use 100dvh', () => {
  const heroPath = path.join(ROOT, 'src/components/Hero.jsx');
  const heroCode = fs.readFileSync(heroPath, 'utf-8');
  assert.ok(
    heroCode.includes('100dvh'),
    'Hero.jsx should use 100dvh to prevent mobile address bar clipping'
  );

  const faPath = path.join(ROOT, 'src/components/FrameworkAlignment.jsx');
  const faCode = fs.readFileSync(faPath, 'utf-8');
  assert.ok(
    faCode.includes('100dvh'),
    'FrameworkAlignment.jsx sticky cards should use 100dvh to prevent clipping on mobile viewports'
  );
  assert.ok(
    !faCode.includes('className="w-full h-screen'),
    'FrameworkAlignment.jsx must not contain raw unadapted h-screen'
  );
});

// -------------------------------------------------------------
// 2. Data Table Horizontal Scroll Isolation
// -------------------------------------------------------------
test('Table Responsiveness: Wide data tables are wrapped in touch-pan-x overflow containers', () => {
  const filesToCheck = [
    'src/pages/platform/components/ActivityEvidenceWorkspace.jsx',
    'src/pages/platform/components/EsgReportGenerator.jsx',
    'src/pages/platform/CarbonRegistry.jsx'
  ];

  for (const relPath of filesToCheck) {
    const fullPath = path.join(ROOT, relPath);
    const code = fs.readFileSync(fullPath, 'utf-8');
    
    // Check that any min-w-[...px] table is accompanied by overflow-x-auto and touch-pan-x
    assert.ok(
      code.includes('overflow-x-auto') && code.includes('touch-pan-x'),
      `${relPath} should wrap tables in overflow-x-auto touch-pan-x container`
    );
  }
});

// -------------------------------------------------------------
// 3. Touch Target Minimums (WCAG 2.5.5 >= 44px)
// -------------------------------------------------------------
test('Mobile Touch Targets: Key navigation toggles and buttons meet 44px minimum', () => {
  const navPath = path.join(ROOT, 'src/components/Navbar.jsx');
  const navCode = fs.readFileSync(navPath, 'utf-8');

  assert.ok(
    navCode.includes('min-h-[44px]') && navCode.includes('min-w-[44px]'),
    'Navbar buttons (language, theme, mobile menu) must have min-h-[44px] and min-w-[44px]'
  );

  const saasPath = path.join(ROOT, 'src/pages/platform/SaaSDashboard.jsx');
  let saasCode = fs.readFileSync(saasPath, 'utf-8');
  const saasFeaturesDir = path.join(ROOT, 'src/features/saas/components');
  if (fs.existsSync(saasFeaturesDir)) {
    for (const f of fs.readdirSync(saasFeaturesDir)) {
      saasCode += fs.readFileSync(path.join(saasFeaturesDir, f), 'utf-8');
    }
  }
  assert.ok(
    saasCode.includes('min-w-[44px]') && saasCode.includes('min-h-[44px]'),
    'SaaSDashboard action buttons must have min 44px touch targets'
  );
});

// -------------------------------------------------------------
// 4. Ultra-Wide Container Constraints (1440px / 1920px bounds)
// -------------------------------------------------------------
test('Ultra-Wide Monitor Bounds: Layouts contain max-w constraints to prevent text stretching', () => {
  const checkLayoutFiles = [
    'src/components/Navbar.jsx',
    'src/pages/platform/CarbonMonitoring.jsx',
    'src/components/FrameworkAlignment.jsx'
  ];

  for (const relPath of checkLayoutFiles) {
    const fullPath = path.join(ROOT, relPath);
    const code = fs.readFileSync(fullPath, 'utf-8');
    const hasConstraint = code.includes('max-w-[1780px]') || code.includes('max-w-7xl') || code.includes('max-w-6xl');
    assert.ok(
      hasConstraint,
      `${relPath} must have a container max-width constraint to prevent blowout at 1920px+`
    );
  }
});

// -------------------------------------------------------------
// 5. 320px Ultra-Narrow Fluid Typography
// -------------------------------------------------------------
test('Ultra-Narrow 320px Support: Hero heading scales gracefully without overflowing', () => {
  const heroPath = path.join(ROOT, 'src/components/Hero.jsx');
  const heroCode = fs.readFileSync(heroPath, 'utf-8');
  assert.ok(
    heroCode.includes('text-3xl sm:text-5xl'),
    'Hero heading should start at text-3xl for 320px/375px screens'
  );
});

