import fs from 'node:fs';
import path from 'node:path';
import { preview } from 'vite';
import puppeteer from 'puppeteer';

const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;
const OUT_DIR = path.resolve('qa-screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const ROUTES = [
  { name: 'home', path: '/' },
  { name: 'how-it-works', path: '/how-it-works' },
  { name: 'carbon-registry', path: '/platform/carbon-registry' },
  { name: 'marketplace', path: '/platform/marketplace' },
  { name: 'saas-dashboard', path: '/platform/saas-dashboard' },
  { name: 'esg-workspace', path: '/platform/esg' },
  { name: 'farmers-ai', path: '/farmers-ai' },
  { name: 'harvestguard-dashboard', path: '/harvestguard/dashboard' },
  { name: 'forbidden-403', path: '/forbidden' },
  { name: 'notfound-404', path: '/404-unresolved-node' },
];

const VIEWPORTS = [
  { name: '375', width: 375, height: 812 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 900 },
];

const THEMES = ['dark', 'light'];

async function main() {
  console.log('1. Starting Vite preview server programmatically...');
  const server = await preview({
    preview: {
      port: PORT,
      strictPort: true,
      host: '127.0.0.1'
    }
  });

  console.log(`Vite preview server listening at ${BASE_URL}`);

  try {
    console.log('2. Launching headless browser...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    let totalCaptured = 0;

    for (const route of ROUTES) {
      console.log(`\nProcessing route: ${route.name} (${route.path})`);
      for (const vp of VIEWPORTS) {
        await page.setViewport({ width: vp.width, height: vp.height });

        for (const theme of THEMES) {
          await page.evaluateOnNewDocument((th) => {
            try {
              localStorage.setItem('carbonos-theme', th);
              document.documentElement.setAttribute('data-theme', th);
              if (th === 'light') {
                document.documentElement.classList.add('light');
                document.documentElement.classList.remove('dark');
              } else {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
              }
            } catch {}
          }, theme);

          const fullUrl = `${BASE_URL}${route.path}`;
          await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });

          await page.evaluate((th) => {
            localStorage.setItem('carbonos-theme', th);
            document.documentElement.setAttribute('data-theme', th);
            if (th === 'light') {
              document.documentElement.classList.add('light');
              document.documentElement.classList.remove('dark');
            } else {
              document.documentElement.classList.add('dark');
              document.documentElement.classList.remove('light');
            }
          }, theme);

          await new Promise((r) => setTimeout(r, 400));

          const fileName = `${route.name}-${vp.name}-${theme}.png`;
          const filePath = path.join(OUT_DIR, fileName);

          await page.screenshot({ path: filePath, fullPage: false });
          totalCaptured++;
          process.stdout.write(`  [${vp.name} | ${theme}] -> ${fileName}\n`);
        }
      }
    }

    await browser.close();
    console.log(`\nSuccessfully captured ${totalCaptured} QA screenshots in ${OUT_DIR}`);
  } finally {
    console.log('Closing Vite preview server...');
    await server.close();
  }
}

main().catch((err) => {
  console.error('Fatal error generating screenshots:', err);
  process.exit(1);
});
