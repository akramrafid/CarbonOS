import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  MOTION_DURATIONS,
  EASINGS,
  SPRING_PRESETS,
  MAX_STAGGER_DELAY_SEC,
  MAX_STAGGER_ITEMS,
  getBoundedStaggerDelay,
  parseTickerValue,
  formatTickerNumber,
} from '../../src/lib/motion.js';

const ROOT = process.cwd();

test('Phase 7.1: motion.js tokens, spring presets, and bounded stagger (<=50ms, max 8 items)', () => {
  assert.equal(MOTION_DURATIONS.instant, 0.1);
  assert.equal(MOTION_DURATIONS.fast, 0.15);
  assert.equal(MOTION_DURATIONS.base, 0.22);
  assert.equal(MOTION_DURATIONS.slow, 0.32);
  assert.equal(MOTION_DURATIONS.narrative, 0.6);

  assert.deepEqual(EASINGS.easeOut, [0.22, 1, 0.36, 1]);
  assert.equal(SPRING_PRESETS.snappy.stiffness, 420);
  assert.equal(SPRING_PRESETS.snappy.damping, 28);
  assert.equal(SPRING_PRESETS.gentle.stiffness, 220);
  assert.equal(SPRING_PRESETS.gentle.damping, 26);

  assert.ok(MAX_STAGGER_DELAY_SEC <= 0.05, 'Stagger delay must never exceed 50ms');
  assert.equal(MAX_STAGGER_ITEMS, 8, 'Stagger items must be capped at 8');
  assert.equal(getBoundedStaggerDelay(0, 0.05), 0);
  assert.equal(getBoundedStaggerDelay(4, 0.05), 0.2);
  assert.equal(
    getBoundedStaggerDelay(25, 0.05),
    0.35,
    'Items beyond index 7 must clamp to max stagger delay'
  );
});

test('Phase 7.1b: main.jsx wraps app in MotionConfig reducedMotion="user" and LazyMotion', () => {
  const mainSrc = fs.readFileSync(path.join(ROOT, 'src/main.jsx'), 'utf8');
  assert.match(mainSrc, /MotionConfig\s+reducedMotion="user"/);
  assert.match(mainSrc, /LazyMotion\s+strict\s+features=\{domMax\}/);
});

test('Phase 7.2: KpiTicker parses formatted telemetry values and exposes sr-only final announcement', () => {
  const parsedCurrency = parseTickerValue('৳12,450.75');
  assert.equal(parsedCurrency.prefix, '৳');
  assert.equal(parsedCurrency.number, 12450.75);
  assert.equal(parsedCurrency.decimals, 2);
  assert.equal(parsedCurrency.useCommas, true);
  assert.equal(formatTickerNumber(parsedCurrency.number, parsedCurrency), '৳12,450.75');

  const parsedTonnes = parseTickerValue('18,420 tCO₂e');
  assert.equal(parsedTonnes.number, 18420);
  assert.equal(parsedTonnes.suffix, ' tCO₂e');

  const tickerSrc = fs.readFileSync(path.join(ROOT, 'src/components/ui/KpiTicker.jsx'), 'utf8');
  assert.match(tickerSrc, /className="sr-only"/, 'Must announce only final value to screen readers');
  assert.match(tickerSrc, /aria-hidden="true"/, 'Animated intermediate numbers must be aria-hidden');
  assert.match(tickerSrc, /tabular-nums/, 'Must enforce tabular-nums');
});

test('Phase 7.3: Hero features interactive Bangladesh satellite scan SVG and 4-stage storytelling', () => {
  const heroSrc = fs.readFileSync(path.join(ROOT, 'src/components/Hero.jsx'), 'utf8');
  const svgSrc = fs.readFileSync(
    path.join(ROOT, 'src/components/hero/BangladeshSatelliteScanSvg.jsx'),
    'utf8'
  );

  assert.match(heroSrc, /BangladeshSatelliteScanSvg/);
  assert.match(heroSrc, /KpiTicker/);
  assert.match(svgSrc, /label:\s*'Upload'/);
  assert.match(svgSrc, /label:\s*'Verify'/);
  assert.match(svgSrc, /label:\s*'Credit'/);
  assert.match(svgSrc, /label:\s*'Registry'/);
  assert.match(svgSrc, /Sundarbans Mangrove Reserve/);
});

test('Phase 7.4: Asymmetric 12-column Bento Grid with varied spans and micro-visuals', () => {
  const bentoSrc = fs.readFileSync(
    path.join(ROOT, 'src/components/platform-modules/BentoModulesGrid.jsx'),
    'utf8'
  );
  assert.match(bentoSrc, /lg:col-span-7/);
  assert.match(bentoSrc, /lg:col-span-5/);
  assert.match(bentoSrc, /md:col-span-4/);
  assert.match(bentoSrc, /ndvi-curve/);
  assert.match(bentoSrc, /esg-stepper/);
  assert.match(bentoSrc, /hash-chain/);
  assert.match(bentoSrc, /mfs-bars/);
  assert.match(bentoSrc, /crop-gauge/);

  const platformModulesSrc = fs.readFileSync(
    path.join(ROOT, 'src/components/PlatformModules.jsx'),
    'utf8'
  );
  assert.match(platformModulesSrc, /BentoModulesGrid/);
});

test('Phase 7.5: Guided ESG Flow driven by real state and expandable HowCalculatedPanel', () => {
  const wizardSrc = fs.readFileSync(
    path.join(ROOT, 'src/pages/platform/esg/BillIntakeWizard.jsx'),
    'utf8'
  );
  const step3Src = fs.readFileSync(
    path.join(ROOT, 'src/pages/platform/esg/bill-wizard/Step3FillGaps.jsx'),
    'utf8'
  );
  const howCalcSrc = fs.readFileSync(
    path.join(ROOT, 'src/pages/platform/esg/bill-wizard/HowCalculatedPanel.jsx'),
    'utf8'
  );

  assert.match(wizardSrc, /fields complete/);
  assert.match(wizardSrc, /esg-semantic-stepper/);
  assert.match(wizardSrc, /esg-scan-shimmer/);
  assert.match(step3Src, /firstInput\.focus/);
  assert.match(step3Src, /handleFieldBlur/);
  assert.match(howCalcSrc, /How was this calculated\?/);
  assert.match(howCalcSrc, /KpiTicker/);
});

test('Phase 7.6: Satellite dMRV & Crop AI self-drawing polygon, layer crossfade, and Grad-CAM opacity slider', () => {
  const gradCamSrc = fs.readFileSync(
    path.join(ROOT, 'src/features/carbon-monitoring/components/GradCamComparisonCard.jsx'),
    'utf8'
  );
  const diagnosisSrc = fs.readFileSync(
    path.join(ROOT, 'src/pages/farmers-ai/DiagnosisResult.jsx'),
    'utf8'
  );

  assert.match(gradCamSrc, /strokeDasharray="600"/);
  assert.match(gradCamSrc, /Grad-CAM heatmap opacity/);
  assert.match(diagnosisSrc, /Crop Grad-CAM heatmap opacity/);
});

test('Phase 7.7: Micro-interactions, @media (hover: hover), swipeable Toast, and EmptyState', () => {
  const tokensCss = fs.readFileSync(path.join(ROOT, 'src/styles/tokens.css'), 'utf8');
  const buttonSrc = fs.readFileSync(path.join(ROOT, 'src/components/ui/Button.jsx'), 'utf8');
  const toastSrc = fs.readFileSync(path.join(ROOT, 'src/context/ToastContext.jsx'), 'utf8');
  const emptySrc = fs.readFileSync(path.join(ROOT, 'src/components/ui/EmptyState.jsx'), 'utf8');

  assert.match(tokensCss, /@media\s*\(hover:\s*hover\)/);
  assert.match(buttonSrc, /magnetic/);
  assert.match(buttonSrc, /success/);
  assert.match(toastSrc, /onPointerMove/);
  assert.match(emptySrc, /EmptyState/);
});
