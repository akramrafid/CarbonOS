import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const OUTPUT_DIR = path.resolve('qa/before');
const REPORT_PATH = path.resolve('qa/baseline-report.md');
const STREAM_PATH = path.resolve('qa/baseline-stream.jsonl');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { width: 375, height: 667, name: '375px' },
  { width: 768, height: 1024, name: '768px' },
  { width: 1024, height: 768, name: '1024px' },
  { width: 1440, height: 900, name: '1440px' }
];

const THEMES = ['dark', 'light'];

const ALL_ROUTES = [
  { path: '/', name: 'home' },
  { path: '/how-it-works', name: 'how-it-works' },
  { path: '/platform/project-onboarding', name: 'project-onboarding' },
  { path: '/platform/mrv-dashboard', name: 'mrv-dashboard' },
  { path: '/platform/carbon-registry', name: 'carbon-registry' },
  { path: '/platform/verification-workflow', name: 'verification-workflow' },
  { path: '/platform/marketplace', name: 'marketplace' },
  { path: '/platform/ai-detection', name: 'ai-detection' },
  { path: '/platform/saas-dashboard', name: 'saas-dashboard' },
  { path: '/platform/esg', name: 'esg-workspace' },
  { path: '/platform/impact', name: 'impact' },
  { path: '/carbon-monitoring', name: 'carbon-monitoring' },
  { path: '/farmers-ai', name: 'farmers-ai' },
  { path: '/farmers-ai/camera', name: 'camera' },
  { path: '/farmers-ai/result', name: 'diagnosis-result' },
  { path: '/harvestguard/dashboard', name: 'harvestguard-dashboard' },
  { path: '/harvestguard/register-batch', name: 'register-batch' },
  { path: '/harvestguard/risk-analysis/batch-001', name: 'risk-analysis' },
  { path: '/harvestguard/risk-map', name: 'risk-map' },
  { path: '/technology', name: 'technology' },
  { path: '/dashboard/farmer', name: 'farmer-dashboard' },
  { path: '/dashboard/farmer/earnings', name: 'farmer-earnings' },
  { path: '/sectors/solar-irrigation', name: 'solar-irrigation' },
  { path: '/sectors/rice-methane', name: 'rice-methane' },
  { path: '/sectors/clean-cookstoves', name: 'clean-cookstoves' },
  { path: '/sectors/waste-to-energy', name: 'waste-to-energy' },
  { path: '/sectors/mangrove-carbon', name: 'mangrove-carbon' },
  { path: '/sectors/brick-kilns', name: 'brick-kilns' },
  { path: '/company/about', name: 'about' },
  { path: '/company/framework-docs', name: 'framework-docs' },
  { path: '/company/api-docs', name: 'api-docs' },
  { path: '/company/careers', name: 'careers' },
  { path: '/company/privacy', name: 'privacy' },
  { path: '/company/terms', name: 'terms' },
  { path: '/forbidden', name: 'forbidden' },
  { path: '/404-nonexistent', name: 'not-found' }
];

// Load existing findings from stream if available
const existingKeys = new Set();
const allFindings = [];

if (fs.existsSync(STREAM_PATH)) {
  const lines = fs.readFileSync(STREAM_PATH, 'utf8').split('\n').filter(Boolean);
  for (const line of lines) {
    try {
      const data = JSON.parse(line);
      const key = `${data.route}_${data.width}_${data.theme}`;
      existingKeys.add(key);
      allFindings.push(data);
    } catch (e) {}
  }
}

// Build matrix of tasks
const tasks = [];
for (const r of ALL_ROUTES) {
  for (const vp of VIEWPORTS) {
    for (const th of THEMES) {
      const key = `${r.path}_${vp.width}_${th}`;
      if (!existingKeys.has(key)) {
        tasks.push({ route: r, vp, th });
      }
    }
  }
}

console.log(`Starting baseline audit: ${tasks.length} remaining tasks (${allFindings.length} already captured)`);

async function runAudit() {
  if (tasks.length > 0) {
    const browser = await chromium.launch({
      channel: 'chrome',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const CONCURRENCY = 4;
    let taskIndex = 0;

    async function worker(workerId) {
      const context = await browser.newContext();
      const page = await context.newPage();

      while (taskIndex < tasks.length) {
        const idx = taskIndex++;
        const { route, vp, th } = tasks[idx];
        const prefix = `[Worker ${workerId} | ${allFindings.length + 1}/${allFindings.length + tasks.length}]`;

        await page.setViewportSize({ width: vp.width, height: vp.height });

        const consoleErrors = [];
        const consoleWarnings = [];
        const failedRequests = [];

        const onConsole = msg => {
          const type = msg.type();
          if (type === 'error') consoleErrors.push(msg.text());
          else if (type === 'warning') consoleWarnings.push(msg.text());
        };
        const onPageError = err => consoleErrors.push(err.message || String(err));
        const onRequestFailed = req => {
          const failure = req.failure();
          failedRequests.push(`${req.method()} ${req.url()} (${failure ? failure.errorText : 'failed'})`);
        };
        const onResponse = res => {
          if (res.status() >= 400 && !res.url().includes('favicon.ico')) {
            failedRequests.push(`${res.status()} ${res.request().method()} ${res.url()}`);
          }
        };

        page.on('console', onConsole);
        page.on('pageerror', onPageError);
        page.on('requestfailed', onRequestFailed);
        page.on('response', onResponse);

        await page.addInitScript(({ theme }) => {
          try {
            localStorage.setItem('carbonos-theme', theme);
          } catch (e) {}
          window.__clsScore = 0;
          try {
            const obs = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                  window.__clsScore += entry.value;
                }
              }
            });
            obs.observe({ type: 'layout-shift', buffered: true });
          } catch (e) {}
        }, { theme: th });

        const targetUrl = `${BASE_URL}${route.path}`;

        try {
          await page.goto(targetUrl, { waitUntil: 'load', timeout: 15000 });
          await page.waitForTimeout(500);

          await page.evaluate(({ theme }) => {
            const root = document.documentElement;
            root.setAttribute('data-theme', theme);
            if (theme === 'dark') {
              root.classList.add('dark');
              root.classList.remove('light');
            } else {
              root.classList.remove('dark');
              root.classList.add('light');
            }
          }, { theme: th });

          await page.waitForTimeout(150);

          const metrics = await page.evaluate(({ vpWidth }) => {
            const docEl = document.documentElement;
            const body = document.body;
            const scrollWidth = Math.max(docEl.scrollWidth, body ? body.scrollWidth : 0);
            const clientWidth = docEl.clientWidth;
            const hasHorizontalOverflow = scrollWidth > clientWidth + 2;

            const overflowElements = [];
            const allEls = document.querySelectorAll('*');
            for (const el of allEls) {
              const rect = el.getBoundingClientRect();
              if (rect.width > clientWidth + 2 || rect.right > clientWidth + 2) {
                const tag = el.tagName.toLowerCase();
                if (tag === 'html' || tag === 'body') continue;
                const cls = typeof el.className === 'string' ? el.className.split(/\s+/).slice(0, 2).join('.') : '';
                const id = el.id ? `#${el.id}` : '';
                overflowElements.push({
                  selector: `<${tag}${id}${cls ? '.' + cls : ''}>`,
                  width: Math.round(rect.width),
                  right: Math.round(rect.right)
                });
              }
            }

            const clippedElements = [];
            const candidates = document.querySelectorAll('div, section, article, table, button, a, h1, h2, h3, p, [class*="card"], [class*="panel"], [class*="tile"]');
            for (const el of candidates) {
              if (!el.offsetParent && el.offsetWidth === 0 && el.offsetHeight === 0) continue;
              const elRect = el.getBoundingClientRect();
              if (elRect.width === 0 || elRect.height === 0) continue;

              let parent = el.parentElement;
              while (parent && parent !== document.documentElement && parent !== document.body) {
                const pStyle = window.getComputedStyle(parent);
                const clips = ['hidden', 'clip'].includes(pStyle.overflowX) || 
                              ['hidden', 'clip'].includes(pStyle.overflowY) ||
                              ['hidden', 'clip'].includes(pStyle.overflow);
                if (clips) {
                  const pRect = parent.getBoundingClientRect();
                  const rightDiff = Math.round(elRect.right - pRect.right);
                  const bottomDiff = Math.round(elRect.bottom - pRect.bottom);
                  const leftDiff = Math.round(pRect.left - elRect.left);
                  const topDiff = Math.round(pRect.top - elRect.top);

                  if (rightDiff > 4 || bottomDiff > 4 || leftDiff > 4 || topDiff > 4) {
                    const tag = el.tagName.toLowerCase();
                    const cls = typeof el.className === 'string' ? el.className.split(/\s+/).slice(0, 2).join('.') : '';
                    const id = el.id ? `#${el.id}` : '';
                    
                    const pTag = parent.tagName.toLowerCase();
                    const pCls = typeof parent.className === 'string' ? parent.className.split(/\s+/).slice(0, 2).join('.') : '';
                    const pId = parent.id ? `#${parent.id}` : '';

                    clippedElements.push({
                      element: `<${tag}${id}${cls ? '.' + cls : ''}>`,
                      ancestor: `<${pTag}${pId}${pCls ? '.' + pCls : ''}>`,
                      diff: { right: rightDiff, bottom: bottomDiff, left: leftDiff, top: topDiff }
                    });
                    break;
                  }
                }
                parent = parent.parentElement;
              }
            }

            return {
              scrollWidth,
              clientWidth,
              hasHorizontalOverflow,
              overflowElements: overflowElements.slice(0, 5),
              clippedElements: clippedElements.slice(0, 8),
              cls: window.__clsScore || 0
            };
          }, { vpWidth: vp.width });

          const screenshotFileName = `${route.name}_${vp.width}x${vp.height}_${th}.png`;
          const screenshotPath = path.join(OUTPUT_DIR, screenshotFileName);
          await page.screenshot({ path: screenshotPath, fullPage: false });

          const item = {
            route: route.path,
            name: route.name,
            viewport: vp.name,
            width: vp.width,
            theme: th,
            screenshot: `qa/before/${screenshotFileName}`,
            hasHorizontalOverflow: metrics.hasHorizontalOverflow,
            scrollWidth: metrics.scrollWidth,
            clientWidth: metrics.clientWidth,
            overflowElements: metrics.overflowElements,
            clippedElements: metrics.clippedElements,
            cls: Number(metrics.cls.toFixed(4)),
            consoleErrors,
            consoleWarnings,
            failedRequests
          };

          allFindings.push(item);
          fs.appendFileSync(STREAM_PATH, JSON.stringify(item) + '\n', 'utf8');

          const statusBadges = [
            metrics.hasHorizontalOverflow ? '⚠️ OVERFLOW' : 'OK',
            metrics.clippedElements.length > 0 ? `✂️ CLIPPED(${metrics.clippedElements.length})` : 'UNCLIPPED',
            consoleErrors.length > 0 ? `❌ ERR(${consoleErrors.length})` : 'NO_ERR'
          ].join(' | ');

          console.log(`${prefix} ${route.path} [${vp.name} | ${th}]: ${statusBadges}`);
        } catch (err) {
          console.error(`${prefix} FAILED ${targetUrl}:`, err.message);
          const item = {
            route: route.path,
            name: route.name,
            viewport: vp.name,
            width: vp.width,
            theme: th,
            screenshot: null,
            error: err.message,
            hasHorizontalOverflow: false,
            clippedElements: [],
            cls: 0,
            consoleErrors: [err.message],
            consoleWarnings: [],
            failedRequests: []
          };
          allFindings.push(item);
          fs.appendFileSync(STREAM_PATH, JSON.stringify(item) + '\n', 'utf8');
        } finally {
          page.off('console', onConsole);
          page.off('pageerror', onPageError);
          page.off('requestfailed', onRequestFailed);
          page.off('response', onResponse);
        }
      }

      await context.close();
    }

    const workers = Array.from({ length: CONCURRENCY }, (_, i) => worker(i + 1));
    await Promise.all(workers);
    await browser.close();
  }

  // Write finalized baseline raw JSON
  fs.writeFileSync('qa/baseline-raw.json', JSON.stringify(allFindings, null, 2), 'utf8');

  // Generate qa/baseline-report.md
  generateReport(allFindings);
}

function generateReport(findings) {
  const totalSnapshots = findings.length;
  const overflowIssues = findings.filter(f => f.hasHorizontalOverflow);
  const clippedIssues = findings.filter(f => f.clippedElements && f.clippedElements.length > 0);
  const consoleErrorIssues = findings.filter(f => f.consoleErrors && f.consoleErrors.length > 0);
  const networkErrorIssues = findings.filter(f => f.failedRequests && f.failedRequests.length > 0);
  const highClsIssues = findings.filter(f => f.cls > 0.05);

  let md = `# Visual & Runtime Baseline Report (Phase 0 Preflight)

Generated on ${new Date().toISOString()} across **${totalSnapshots}** route/viewport/theme combinations.

---

## Executive Summary Checklist

| Category | Snapshots Affected | Severity | Primary Root Causes |
| :--- | :---: | :---: | :--- |
| **Horizontal Page Overflow** | **${overflowIssues.length}** / ${totalSnapshots} | High | Cards/tables with fixed \`min-w\`, missing \`min-w-0\`, lack of responsive grid wrapping |
| **Visually Clipped Cards & Panels** | **${clippedIssues.length}** / ${totalSnapshots} | High | Ancestors with \`overflow-hidden\` clipping shadows, cards exceeding container width |
| **Console Errors / Exceptions** | **${consoleErrorIssues.length}** / ${totalSnapshots} | Medium | Uncaught runtime errors, missing image/tile endpoints, Leaflet re-init collisions |
| **Failed Network Requests** | **${networkErrorIssues.length}** / ${totalSnapshots} | Medium | External map tile 404s, mock APIs without backend handlers |
| **High Layout Shift (CLS > 0.05)** | **${highClsIssues.length}** / ${totalSnapshots} | Medium | Late font swapping, unstabilized image/chart dimension calculations |

---

## 1. Top Visually Clipped Elements & Cards

The following components and routes exhibited card or element clipping caused by ancestor \`overflow: hidden/clip\`:

| Route | Viewport | Theme | Clipped Element | Clipping Ancestor | Cutoff Dimensions |
| :--- | :--- | :--- | :--- | :--- | :--- |
`;

  const topClipped = [];
  for (const f of clippedIssues) {
    for (const c of f.clippedElements) {
      topClipped.push({
        route: f.route,
        vp: f.viewport,
        theme: f.theme,
        el: c.element,
        ancestor: c.ancestor,
        diff: `R: +${c.diff.right}px, B: +${c.diff.bottom}px`
      });
    }
  }

  const uniqueClipped = [];
  const seenClipped = new Set();
  for (const c of topClipped) {
    const key = `${c.route}|${c.el}|${c.ancestor}`;
    if (!seenClipped.has(key)) {
      seenClipped.add(key);
      uniqueClipped.push(c);
    }
  }

  md += uniqueClipped.slice(0, 30).map(c => 
    `| \`${c.route}\` | ${c.vp} | ${c.theme} | \`${c.el}\` | \`${c.ancestor}\` | ${c.diff} |`
  ).join('\n');

  md += `\n\n---

## 2. Horizontal Overflow Hotspots (document.scrollWidth > clientWidth)

The following views trigger horizontal window scrolling on mobile and tablet screens:

| Route | Viewport | Theme | Client Width | Scroll Width | Culprit Elements |
| :--- | :---: | :---: | :---: | :---: | :--- |
`;

  md += overflowIssues.slice(0, 25).map(f => {
    const culprits = (f.overflowElements || []).map(e => `\`${e.selector}\` (${e.width}px)`).join(', ');
    return `| \`${f.route}\` | ${f.viewport} | ${f.theme} | ${f.clientWidth}px | **${f.scrollWidth}px** | ${culprits || 'Nested wide container'} |`;
  }).join('\n');

  md += `\n\n---

## 3. Console Errors & Runtime Exceptions

| Route | Viewport | Theme | Error Message |
| :--- | :---: | :---: | :--- |
`;

  const uniqueErrors = [];
  const seenErrors = new Set();
  for (const f of consoleErrorIssues) {
    for (const err of f.consoleErrors) {
      const key = `${f.route}|${err.slice(0, 60)}`;
      if (!seenErrors.has(key)) {
        seenErrors.add(key);
        uniqueErrors.push({ route: f.route, vp: f.viewport, theme: f.theme, err: err.slice(0, 140) });
      }
    }
  }

  md += uniqueErrors.slice(0, 25).map(e => 
    `| \`${e.route}\` | ${e.vp} | ${e.theme} | \`${e.err.replace(/\|/g, '\\|')}\` |`
  ).join('\n');

  md += `\n\n---

## 4. Failed Network Requests

| Route | Viewport | Failed Request URL |
| :--- | :---: | :--- |
`;

  const uniqueRequests = [];
  const seenRequests = new Set();
  for (const f of networkErrorIssues) {
    for (const req of f.failedRequests) {
      const key = `${f.route}|${req.slice(0, 60)}`;
      if (!seenRequests.has(key)) {
        seenRequests.add(key);
        uniqueRequests.push({ route: f.route, vp: f.viewport, req: req.slice(0, 140) });
      }
    }
  }

  md += uniqueRequests.slice(0, 20).map(r => 
    `| \`${r.route}\` | ${r.vp} | \`${r.req.replace(/\|/g, '\\|')}\` |`
  ).join('\n');

  md += `\n\n---

## 5. Phase 0 Remediation Checklist for Upcoming Phases

- [ ] **Phase 1 Architecture**: Deconstruct giant single-file views (\`CarbonMonitoring.jsx\`, \`SaaSDashboard.jsx\`) into modular feature folders; introduce persistent AppShell and shared \`Card\` / \`Modal\` / \`DataTable\` primitives.
- [ ] **Phase 2 Design System**: Remove hardcoded color literals, replace unconstrained \`py-24\`/\`py-32\` with parent-controlled rhythm, configure font definitions without \`!important\` hacks.
- [ ] **Phase 3 Card Clipping & Overflow**: Eliminate clipping on all cards by applying \`min-w-0\`, \`repeat(auto-fit, minmax(min(100%, 280px), 1fr))\`, and removing unnecessary \`overflow-hidden\` on wrapper cards.
- [ ] **Phase 4 Dashboard Navigation**: Implement desktop collapsible rail / drawer system to resolve horizontal squishing of cards in tablet viewports.
- [ ] **Phase 5 Footer**: Modernize footer into a responsive multi-column layout with accordions on mobile.
- [ ] **Phase 6 Transitions**: Prevent abrupt page jumps with fluid outlet transitions and top progress bar.
- [ ] **Phase 7 Purposeful Motion**: Implement subtle micro-interactions, guided stepper in ESG, and interactive hero graphics.
- [ ] **Phase 8 Slop Eraser**: Clean up placeholder text and generic AI slogans.
- [ ] **Phase 9 Theming & Leak Verification**: Verify contrast across all tokens and ensure zero console errors in both themes.
- [ ] **Phase 10 Responsive Polish**: Audit across 320px–1920px with zero horizontal scroll and Lighthouse performance scores $\\ge$ 90.
`;

  fs.writeFileSync(REPORT_PATH, md, 'utf8');
  console.log(`Successfully generated ${REPORT_PATH}`);
}

runAudit().catch(err => {
  console.error('Audit run failed:', err);
  process.exit(1);
});
