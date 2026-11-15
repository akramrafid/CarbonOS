import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { footerConfig, getAllFooterRoutes } from '../../src/config/footer.config.js';

const ROOT = path.resolve('.');

test('Phase 5 Footer Config: brand block, 4 link columns, and factual mission statement', () => {
  assert.ok(footerConfig.brand, 'footerConfig must define brand block');
  assert.equal(footerConfig.brand.namePrimary, 'Carbon');
  assert.equal(footerConfig.brand.nameAccent, 'Zero');
  assert.equal(footerConfig.brand.badge, 'BD');
  assert.ok(footerConfig.brand.missionKey, 'brand must have i18n missionKey');
  assert.ok(
    footerConfig.brand.missionDefault.includes('Measurement, Reporting, and Verification'),
    'brand mission must be factual and describe dMRV/ESG'
  );
  assert.ok(
    !footerConfig.brand.missionDefault.includes('97%'),
    'brand mission must not contain unverified percentage claims'
  );

  assert.ok(Array.isArray(footerConfig.columns), 'footerConfig.columns must be an array');
  assert.equal(footerConfig.columns.length, 4, 'footerConfig must have 4 link columns');

  const expectedColumnIds = ['platform', 'resources', 'company', 'legal'];
  assert.deepEqual(
    footerConfig.columns.map((c) => c.id),
    expectedColumnIds,
    'Columns must be Platform, Resources, Company, Legal'
  );

  for (const col of footerConfig.columns) {
    assert.ok(col.titleKey, `Column ${col.id} must have titleKey`);
    assert.ok(col.defaultTitle, `Column ${col.id} must have defaultTitle`);
    assert.ok(Array.isArray(col.links) && col.links.length > 0, `Column ${col.id} must have links`);

    for (const link of col.links) {
      assert.ok(link.id, `Link in ${col.id} must have id`);
      assert.ok(link.labelKey, `Link ${link.id} must have labelKey`);
      assert.ok(link.defaultLabel, `Link ${link.id} must have defaultLabel`);
      assert.ok(link.to && link.to.startsWith('/'), `Link ${link.id} must have valid internal route path`);
      assert.ok(!link.to.includes('#'), `Link ${link.id} must not be a dead # anchor`);
    }
  }
});

test('Phase 5 Route Resolution: every link in footer.config.js resolves to a real route in src/App.jsx', () => {
  const appPath = path.join(ROOT, 'src/App.jsx');
  const appCode = fs.readFileSync(appPath, 'utf-8');

  const routeRegex = /<Route\s+path="([^"]+)"/g;
  const definedRoutes = new Set();
  let match;
  while ((match = routeRegex.exec(appCode)) !== null) {
    definedRoutes.add(match[1]);
  }

  const footerRoutes = getAllFooterRoutes();
  assert.ok(footerRoutes.length >= 18, `Expected at least 18 unique footer routes, got ${footerRoutes.length}`);

  const unresolved = footerRoutes.filter((r) => !definedRoutes.has(r));
  assert.deepEqual(
    unresolved,
    [],
    `Footer contains links that do not resolve to real routes in src/App.jsx: ${unresolved.join(', ')}`
  );
});

test('Phase 5 Honesty & Copy Audit: no invented contacts, social links, or fake newsletter forms', () => {
  assert.equal(footerConfig.contact.email, null, 'Contact email must not be invented');
  assert.deepEqual(footerConfig.contact.socialLinks, [], 'Social links must not be invented');
  assert.equal(footerConfig.features.hasNewsletterEndpoint, false, 'Newsletter form must be omitted without backend endpoint');
  assert.equal(footerConfig.features.hasLiveStatusEndpoint, false, 'Fake status indicator must be omitted');

  const copyNeededPath = path.join(ROOT, 'docs/copy-needed.md');
  assert.ok(fs.existsSync(copyNeededPath), 'docs/copy-needed.md must exist');
  const copyNeededContent = fs.readFileSync(copyNeededPath, 'utf-8');
  assert.ok(copyNeededContent.includes('Official Contact Email'), 'copy-needed.md must ask for contact email');
  assert.ok(copyNeededContent.includes('Official Social Media Links'), 'copy-needed.md must ask for social links');
  assert.ok(copyNeededContent.includes('Privacy Policy'), 'copy-needed.md must document legal/company copy needs');
});

test('Phase 5 Footer Component: config-driven, gradient hairline, faded wordmark mask, accordions, switchers, slim mode', () => {
  const footerPath = path.join(ROOT, 'src/components/Footer.jsx');
  const code = fs.readFileSync(footerPath, 'utf-8');

  assert.ok(code.includes("from '../config/footer.config'"), 'Footer.jsx must import footerConfig');
  assert.ok(code.includes("variant = 'full'"), 'Footer.jsx must support full and slim variants');
  assert.ok(code.includes("variant === 'slim'"), 'Footer.jsx must implement slim variant for dashboard pages');
  assert.ok(code.includes('via-accent/60') || code.includes('via-accent/50'), 'Footer.jsx must include top gradient hairline');
  assert.ok(code.includes('mask-image:linear-gradient'), 'Footer.jsx must apply soft gradient mask to bottom wordmark');
  assert.ok(code.includes('new Date().getFullYear()'), 'Footer.jsx must render dynamic copyright year');
  assert.ok(code.includes("window.scrollTo({ top: 0, behavior: 'smooth' })"), 'Footer.jsx must implement smooth back-to-top button');
  assert.ok(code.includes('aria-expanded={isOpen}'), 'Footer.jsx must render accessible mobile accordions');
  assert.ok(code.includes('aria-controls={panelId}'), 'Footer.jsx mobile accordions must wire aria-controls');
  assert.ok(code.includes('handleLanguageSwitch'), 'Footer.jsx must include language switcher');
  assert.ok(code.includes('toggleTheme'), 'Footer.jsx must include theme switcher');
  assert.ok(code.includes('min-h-[44px]'), 'Footer.jsx interactive controls must meet 44px touch target minimum');

  const dashboardLayoutPath = path.join(ROOT, 'src/components/layout/DashboardLayout.jsx');
  const dashCode = fs.readFileSync(dashboardLayoutPath, 'utf-8');
  assert.ok(dashCode.includes('<Footer variant="slim" />'), 'DashboardLayout must render slim footer');
});

test('Phase 5 i18n Coverage: all footer column titles and link keys are translated in English and Bengali', () => {
  const i18nPath = path.join(ROOT, 'src/i18n.js');
  const i18nCode = fs.readFileSync(i18nPath, 'utf-8');

  for (const col of footerConfig.columns) {
    const colKeyLeaf = col.titleKey.split('.').pop();
    assert.ok(i18nCode.includes(`${colKeyLeaf}:`), `i18n.js must define column key ${col.titleKey}`);
    for (const link of col.links) {
      const linkKeyLeaf = link.labelKey.split('.').pop();
      assert.ok(i18nCode.includes(`${linkKeyLeaf}:`), `i18n.js must define link key ${link.labelKey}`);
    }
  }
});
