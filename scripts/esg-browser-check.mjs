// ESG data-authenticity browser check (no backend session required).
// Usage: npm run dev -- --port 5199  then  node scripts/esg-browser-check.mjs [url]
// Exits non-zero if any check fails.
import puppeteer from 'puppeteer';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const url = process.argv[2] || 'http://localhost:5199/platform/saas-dashboard';
const dir = mkdtempSync(join(tmpdir(), 'esg-check-'));
const memo = join(dir, 'memo.txt');
writeFileSync(memo, 'Quarterly board memo. Nothing measurable here.\n');
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 900 });
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(url, { waitUntil: 'networkidle0' });
const text = () => page.evaluate(() => document.body.innerText);
const clickText = async (t) => {
  const ok = await page.evaluate((t) => {
    const b = [...document.querySelectorAll('button')].find(b => b.innerText.includes(t) && b.offsetParent);
    if (b) b.click(); return !!b;
  }, t);
  if (!ok) throw new Error('button not found: ' + t);
};
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const results = {};
// 1. Unreadable/unextractable upload with no session -> error toast, no fake values
const input = await page.$('input[type=file]');
await input.uploadFile(memo);
await wait(1500);
let t = await text();
results.uploadShowsFailure = /Extraction failed/.test(t);
results.noCannedDiesel = !t.includes('14,200 Liters');
// 2. Demo sample is labelled as demo
await clickText('Load Demo Sample');
await wait(1500);
t = await text();
results.demoLabelled = /DEMO SAMPLE/.test(t);
results.noAuditVerified = !/AUDIT VERIFIED|ISO 14064 assurance/.test(t);
// 3. RAG without session -> unavailable, no fabricated citations
await clickText('Run AI');
await wait(1500);
t = await text();
results.ragUnavailable = /ESG assistant is unavailable/.test(t);
results.errors = errors.filter(e => !/favicon|Failed to load resource/.test(e));
console.log(JSON.stringify(results, null, 1));
await browser.close();
const failed = Object.entries(results).filter(([k, v]) => k === 'errors' ? v.length : !v);
if (failed.length) { console.error('FAILED:', failed.map(([k]) => k).join(', ')); process.exit(1); }
