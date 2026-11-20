import { chromium } from '@playwright/test';
import { preview } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('qa/phase-9');

const ROUTES_TO_AUDIT = [
  '/',
  '/how-it-works',
  '/technology',
  '/platform/saas-dashboard',
  '/platform/marketplace',
  '/platform/carbon-registry',
  '/platform/mrv-dashboard',
  '/platform/impact',
  '/platform/esg/overview',
  '/platform/esg/bill-wizard',
  '/carbon-monitoring',
  '/farmers-ai',
  '/farmers-ai/dashboard',
];

const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

async function getCdpMetrics(cdp) {
  try {
    await cdp.send('HeapProfiler.collectGarbage');
  } catch {
    // ignore if unsupported
  }
  const { metrics } = await cdp.send('Performance.getMetrics');
  const map = Object.fromEntries(metrics.map((m) => [m.name, m.value]));
  return {
    jsHeapUsedMB: Number(((map.JSHeapUsedSize || 0) / (1024 * 1024)).toFixed(2)),
    jsEventListeners: map.JSEventListeners || 0,
    nodes: map.Nodes || 0,
  };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const server = await preview({
    preview: { host: '127.0.0.1', port: 0 },
  });
  const address = server.httpServer.address();
  const BASE_URL = `http://127.0.0.1:${address.port}`;

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

    // Stub external CDN requests (Google Fonts, Carto/OSM tiles, Cloudflare marker icons)
    // so sandbox offline environment doesn't emit network block errors for external assets.
    await context.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/i, async (route) => {
      const url = route.request().url();
      if (url.includes('fonts.googleapis.com')) {
        await route.fulfill({ status: 200, contentType: 'text/css', body: '' });
      } else if (/\.(png|jpg|jpeg|webp|svg)/i.test(url) || url.includes('basemaps.cartocdn.com')) {
        await route.fulfill({ status: 200, contentType: 'image/png', body: TRANSPARENT_PNG });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
    });

    const page = await context.newPage();
    const consoleIssues = [];
    const pageErrors = [];

    page.on('console', (msg) => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        const text = msg.text();
        if (text.includes('Download the React DevTools')) return;
        consoleIssues.push({ type, text, url: page.url() });
      }
    });

    page.on('pageerror', (err) => {
      pageErrors.push({ message: err.message, url: page.url() });
    });

    // 1. Verify Theme System (light / dark / system, colorScheme, cross-tab storage sync, 200ms class)
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    const initialThemeState = await page.evaluate(() => ({
      dataTheme: document.documentElement.getAttribute('data-theme'),
      dataThemeMode: document.documentElement.getAttribute('data-theme-mode'),
      colorScheme: document.documentElement.style.colorScheme,
    }));

    // Toggle theme via #theme-toggle-btn and verify .theme-transitioning is applied then removed
    const duringTransition = await page.evaluate(() => {
      const btn = document.querySelector('#theme-toggle-btn');
      if (btn) btn.click();
      return {
        hasTransitionClass: document.documentElement.classList.contains('theme-transitioning'),
        dataTheme: document.documentElement.getAttribute('data-theme'),
        colorScheme: document.documentElement.style.colorScheme,
      };
    });
    // Wait for the ~200ms transition class to be cleared
    await page.waitForFunction(
      () => !document.documentElement.classList.contains('theme-transitioning'),
      { timeout: 2000 }
    );
    const afterTransition = await page.evaluate(() => ({
      hasTransitionClass: document.documentElement.classList.contains('theme-transitioning'),
      dataTheme: document.documentElement.getAttribute('data-theme'),
    }));

    // Test cross-tab synchronization via storage event ("system", "light", "dark")
    await page.evaluate(() => {
      localStorage.setItem('carbonos-theme', 'system');
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'carbonos-theme',
          newValue: 'system',
        })
      );
    });
    await page.waitForTimeout(50);
    const systemSyncedMode = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme-mode')
    );

    // 2. Audit all representative routes in both Dark and Light themes
    for (const theme of ['dark', 'light']) {
      await page.evaluate((t) => {
        localStorage.setItem('carbonos-theme', t);
        window.dispatchEvent(
          new StorageEvent('storage', { key: 'carbonos-theme', newValue: t })
        );
      }, theme);
      await page.waitForTimeout(220);

      for (const route of ROUTES_TO_AUDIT) {
        await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(180);
      }

      // Capture verification screenshots for Landing, Dashboard, and Carbon Monitoring
      for (const snap of [
        { route: '/', name: `landing-${theme}.png` },
        { route: '/platform/saas-dashboard', name: `saas-dashboard-${theme}.png` },
        { route: '/carbon-monitoring', name: `carbon-monitoring-${theme}.png` },
      ]) {
        await page.goto(`${BASE_URL}${snap.route}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(220);
        await page.screenshot({ path: path.join(OUT_DIR, snap.name) });
      }
    }

    // 3. CDP 20-Navigation Memory & Listener Leak Verification
    const cdp = await context.newCDPSession(page);
    await cdp.send('Performance.enable');
    await cdp.send('HeapProfiler.enable');

    await page.goto(`${BASE_URL}/platform/saas-dashboard`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(250);

    const navCycleRoutes = [
      '/platform/saas-dashboard',
      '/platform/marketplace',
      '/platform/carbon-registry',
      '/platform/mrv-dashboard',
      '/platform/impact',
      '/platform/esg/overview',
      '/platform/esg/bill-wizard',
      '/carbon-monitoring',
      '/farmers-ai',
      '/',
    ];

    const cdpSamples = [];
    // Warm-up navigation before baseline measurement
    await page.evaluate((r) => {
      window.history.pushState({}, '', r);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, navCycleRoutes[0]);
    await page.waitForTimeout(180);

    const baselineMetrics = await getCdpMetrics(cdp);
    cdpSamples.push({ step: 0, route: navCycleRoutes[0], ...baselineMetrics });

    for (let i = 1; i <= 20; i++) {
      const nextRoute = navCycleRoutes[i % navCycleRoutes.length];
      await page.evaluate((r) => {
        window.history.pushState({}, '', r);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, nextRoute);
      await page.waitForTimeout(160);

      if (i % 5 === 0) {
        const sample = await getCdpMetrics(cdp);
        cdpSamples.push({ step: i, route: nextRoute, ...sample });
      }
    }

    const firstAfterWarmup = cdpSamples[1]; // step 5 (full cycle warm)
    const finalSample = cdpSamples[cdpSamples.length - 1]; // step 20
    const heapDeltaMB = Number((finalSample.jsHeapUsedMB - firstAfterWarmup.jsHeapUsedMB).toFixed(2));
    const listenerDelta = finalSample.jsEventListeners - firstAfterWarmup.jsEventListeners;

    const report = {
      timestamp: new Date().toISOString(),
      themeChecks: {
        initialThemeState,
        duringTransition,
        afterTransition,
        systemSyncedMode,
      },
      routesAuditedPerTheme: ROUTES_TO_AUDIT.length,
      consoleErrorCount: consoleIssues.filter((c) => c.type === 'error').length,
      consoleWarningCount: consoleIssues.filter((c) => c.type === 'warning').length,
      pageErrorCount: pageErrors.length,
      consoleIssues,
      pageErrors,
      cdpLeakAudit: {
        totalNavigations: 20,
        samples: cdpSamples,
        heapDeltaFromStep5To20MB: heapDeltaMB,
        listenerDeltaFromStep5To20: listenerDelta,
        boundedHeap: heapDeltaMB < 15,
        boundedListeners: listenerDelta < 150,
      },
    };

    fs.writeFileSync(path.join(OUT_DIR, 'phase9-report.json'), JSON.stringify(report, null, 2));

    console.log(JSON.stringify(report, null, 2));

    if (
      report.consoleErrorCount > 0 ||
      report.consoleWarningCount > 0 ||
      report.pageErrorCount > 0 ||
      !duringTransition.hasTransitionClass ||
      afterTransition.hasTransitionClass ||
      systemSyncedMode !== 'system' ||
      !report.cdpLeakAudit.boundedHeap ||
      !report.cdpLeakAudit.boundedListeners
    ) {
      process.exitCode = 1;
    }
  } finally {
    await browser.close();
    server.httpServer.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
