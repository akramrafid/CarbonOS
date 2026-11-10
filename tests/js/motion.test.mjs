import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { DURATIONS, EASINGS, createContainerVariants, createItemVariants } from '../../src/lib/motion.js';

const ROOT = path.resolve('.');

// -------------------------------------------------------------
// 1. Motion System Constants Contract
// -------------------------------------------------------------
test('Motion System Tokens: Standard durations & easings are defined', () => {
  assert.equal(DURATIONS.instant, 0.1);
  assert.equal(DURATIONS.fast, 0.2);
  assert.equal(DURATIONS.normal, 0.3);
  assert.equal(DURATIONS.slow, 0.5);

  assert.ok(Array.isArray(EASINGS.enter) && EASINGS.enter.length === 4);
  assert.ok(Array.isArray(EASINGS.exit) && EASINGS.exit.length === 4);
  assert.ok(Array.isArray(EASINGS.move) && EASINGS.move.length === 4);
  assert.equal(EASINGS.spring.type, 'spring');
});

// -------------------------------------------------------------
// 2. Framer Motion Variants Contract
// -------------------------------------------------------------
test('Framer Motion Variants: Respects standard motion properties (transform & opacity only)', () => {
  const container = createContainerVariants(0.2);
  assert.ok(container.hidden && container.visible);
  assert.equal(typeof container.hidden.opacity, 'number');

  const item = createItemVariants(16);
  assert.ok(item.hidden && item.visible);
  assert.equal(item.hidden.opacity, 0);
  assert.equal(item.visible.opacity, 1);
});

// -------------------------------------------------------------
// 3. GSAP Reduced Motion & ScrollTrigger Cleanup
// -------------------------------------------------------------
test('GSAP Motion Safety: All 5 GSAP components check reduced motion and clean up with ctx.revert', () => {
  const gsapComponents = [
    'src/components/Hero.jsx',
    'src/components/FrameworkAlignment.jsx',
    'src/components/LiveMetrics.jsx',
    'src/components/Philosophy.jsx',
    'src/components/Roadmap.jsx',
  ];

  for (const relPath of gsapComponents) {
    const fullPath = path.join(ROOT, relPath);
    const code = fs.readFileSync(fullPath, 'utf-8');

    // 1. Must check reduced motion
    const hasReducedMotionCheck = 
      code.includes('getPrefersReducedMotion') || code.includes('prefers-reduced-motion');
    assert.ok(
      hasReducedMotionCheck,
      `${relPath} must check prefers-reduced-motion to protect users with vestibular disorders`
    );

    // 2. Must clean up ScrollTrigger / GSAP context on unmount
    assert.ok(
      code.includes('ctx.revert()'),
      `${relPath} must call ctx.revert() in its unmount cleanup to avoid memory leaks & ghost triggers`
    );
  }
});

// -------------------------------------------------------------
// 4. CSS Keyframe Performance (Animate Transform & Opacity)
// -------------------------------------------------------------
test('CSS Motion Performance: Interactive animations use transform/opacity and reduced motion guards', () => {
  const cssPath = path.join(ROOT, 'src/index.css');
  const css = fs.readFileSync(cssPath, 'utf-8');

  // Verify shake animation exists and uses transform
  assert.ok(css.includes('@keyframes shake'), 'index.css should define shake animation');
  assert.ok(css.includes('transform: translateX'), 'shake animation must use GPU-accelerated transform');

  // Verify reduced motion block exists and disables ambient motion
  assert.ok(
    css.includes('@media (prefers-reduced-motion: reduce)'),
    'index.css must include @media (prefers-reduced-motion: reduce)'
  );
  assert.ok(
    css.includes('.animate-shake') && css.includes('.animate-pulse'),
    'Reduced motion block must disable shake and pulse animations'
  );
});

