import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  PAGE_TRANSITION_MECHANISM,
  PAGE_TRANSITION_TIMING,
  getRouteDepth,
  computeRouteDirection,
  createRouteTransitionVariants,
  getSharedElementLayoutId,
} from '../../src/lib/motion.js';
import {
  ROUTE_CHUNK_LOADERS,
  normalizeRoutePath,
} from '../../src/lib/routePrefetch.js';

const ROOT = path.resolve('.');

test('Phase 6 Transition Mechanism & Timing: AnimatePresence only, 120ms exit, 220ms enter, 8px translate', () => {
  assert.equal(PAGE_TRANSITION_MECHANISM, 'framer-motion-animate-presence');
  assert.equal(PAGE_TRANSITION_TIMING.exitMs, 120);
  assert.equal(PAGE_TRANSITION_TIMING.enterMs, 220);
  assert.equal(PAGE_TRANSITION_TIMING.exitSec, 0.12);
  assert.equal(PAGE_TRANSITION_TIMING.enterSec, 0.22);
  assert.equal(PAGE_TRANSITION_TIMING.translatePx, 8);
  assert.equal(PAGE_TRANSITION_TIMING.progressDelayMs, 150);

  const outletCode = fs.readFileSync(
    path.join(ROOT, 'src/components/layout/RouteTransitionOutlet.jsx'),
    'utf-8'
  );
  assert.ok(outletCode.includes('AnimatePresence'), 'Must use Framer Motion AnimatePresence');
  assert.ok(
    !outletCode.includes('startViewTransition'),
    'Must not combine native View Transitions with AnimatePresence'
  );
});

test('Phase 6 Direction-Aware & Reduced-Motion Variants: forward (+8px), backward (-8px), and fade-only', () => {
  assert.equal(getRouteDepth('/'), 0);
  assert.equal(getRouteDepth('/farmers-ai'), 1);
  assert.equal(getRouteDepth('/farmers-ai/camera'), 2);
  assert.equal(getRouteDepth('/harvestguard/risk-analysis/batch-1'), 3);

  // Deeper sub-route moves forward (+1)
  assert.equal(computeRouteDirection('/farmers-ai', '/farmers-ai/camera', 'PUSH'), 1);
  // Shallower route reverses (-1)
  assert.equal(computeRouteDirection('/farmers-ai/camera', '/farmers-ai', 'PUSH'), -1);
  // Browser back (POP) reverses (-1)
  assert.equal(computeRouteDirection('/platform/mrv-dashboard', '/platform/saas-dashboard', 'POP'), -1);

  const forwardVariants = createRouteTransitionVariants({ direction: 1, reducedMotion: false });
  assert.equal(forwardVariants.initial.opacity, 0);
  assert.equal(forwardVariants.initial.y, 8);
  assert.equal(forwardVariants.animate.y, 0);
  assert.equal(forwardVariants.exit.y, -8);

  const backVariants = createRouteTransitionVariants({ direction: -1, reducedMotion: false });
  assert.equal(backVariants.initial.y, -8);
  assert.equal(backVariants.exit.y, 8);

  const reducedVariants = createRouteTransitionVariants({ direction: 1, reducedMotion: true });
  assert.equal(reducedVariants.initial.opacity, 0);
  assert.equal(reducedVariants.initial.y, undefined, 'Reduced motion must be fade-only without translate');
  assert.equal(reducedVariants.exit.y, undefined, 'Reduced motion exit must be fade-only without translate');
});

test('Phase 6 Route Chunk Prefetch Registry: covers all routes and supports hover, focus, and viewport idle prefetch', () => {
  const appCode = fs.readFileSync(path.join(ROOT, 'src/App.jsx'), 'utf-8');
  const routeRegex = /<Route\s+path="([^"]+)"/g;
  let match;
  const missingLoaders = [];

  while ((match = routeRegex.exec(appCode)) !== null) {
    const routePath = match[1];
    if (routePath === '*') continue;
    if (!ROUTE_CHUNK_LOADERS[routePath]) {
      missingLoaders.push(routePath);
    }
  }

  assert.deepEqual(
    missingLoaders,
    [],
    `Missing chunk loaders in routePrefetch.js for routes: ${missingLoaders.join(', ')}`
  );

  assert.equal(normalizeRoutePath('/platform/saas-dashboard?tab=overview#top'), '/platform/saas-dashboard');
  assert.equal(normalizeRoutePath('/harvestguard/risk-analysis/B-102'), '/harvestguard/risk-analysis/:batchId');
  assert.equal(normalizeRoutePath('https://external.example.com/page'), null);

  const prefetchCode = fs.readFileSync(path.join(ROOT, 'src/lib/routePrefetch.js'), 'utf-8');
  assert.ok(prefetchCode.includes("addEventListener('mouseover'"), 'Must prefetch on link hover');
  assert.ok(prefetchCode.includes("addEventListener('focusin'"), 'Must prefetch on link focus');
  assert.ok(prefetchCode.includes('IntersectionObserver'), 'Must prefetch when links enter viewport');
  assert.ok(prefetchCode.includes('requestIdleCallback'), 'Must schedule viewport prefetch in idle time');
});

test('Phase 6 No Blank Flash, 150ms Progress Bar, and Layout-Matched Skeleton', () => {
  const outletCode = fs.readFileSync(
    path.join(ROOT, 'src/components/layout/RouteTransitionOutlet.jsx'),
    'utf-8'
  );
  assert.ok(outletCode.includes('useTransition'), 'RouteTransitionOutlet must use React useTransition');
  assert.ok(outletCode.includes('startTransition'), 'RouteTransitionOutlet must wrap route updates in startTransition');
  assert.ok(outletCode.includes('<TopProgressBar'), 'RouteTransitionOutlet must render TopProgressBar');
  assert.ok(outletCode.includes('<PageSkeleton'), 'RouteTransitionOutlet must use PageSkeleton as Suspense fallback');

  const progressCode = fs.readFileSync(
    path.join(ROOT, 'src/components/layout/TopProgressBar.jsx'),
    'utf-8'
  );
  assert.ok(
    progressCode.includes('PAGE_TRANSITION_TIMING.progressDelayMs'),
    'TopProgressBar must wait 150ms before showing'
  );
  assert.ok(progressCode.includes('role="progressbar"'), 'TopProgressBar must have accessible progressbar role');

  const skeletonCode = fs.readFileSync(
    path.join(ROOT, 'src/components/layout/PageSkeleton.jsx'),
    'utf-8'
  );
  assert.ok(
    skeletonCode.includes("mode === 'marketing'"),
    'PageSkeleton must support marketing and dashboard layout shapes'
  );
});

test('Phase 6 Scroll Restoration, Heading Focus, Aria-Live Announcement, and Shared-Element LayoutId', () => {
  const outletCode = fs.readFileSync(
    path.join(ROOT, 'src/components/layout/RouteTransitionOutlet.jsx'),
    'utf-8'
  );
  assert.ok(outletCode.includes("navigationType === 'POP'"), 'Must restore scroll position on POP navigation');
  assert.ok(outletCode.includes('getSavedScrollPosition'), 'Must read saved scroll position from sessionStorage');
  assert.ok(outletCode.includes("querySelector('h1')"), 'Must locate main h1 heading on route change');
  assert.ok(outletCode.includes('heading.focus({ preventScroll: true })'), 'Must focus main heading without jumping scroll');
  assert.ok(outletCode.includes('aria-live="polite"'), 'Must announce route change via polite aria-live region');
  assert.ok(outletCode.includes('Navigated to '), 'Must format screen-reader route announcement');

  assert.equal(
    getSharedElementLayoutId('sidebar', 'active-pill'),
    'carbonos-shared-sidebar-active-pill'
  );

  const sidebarCode = fs.readFileSync(
    path.join(ROOT, 'src/components/layout/DashboardSidebar.jsx'),
    'utf-8'
  );
  assert.ok(
    sidebarCode.includes("getSharedElementLayoutId('sidebar', 'active-pill')"),
    'DashboardSidebar must use shared-element layoutId for active pill indicator'
  );
});

