const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.stack));
  
  await page.goto('http://localhost:5173/how-it-works');
  await new Promise(r => setTimeout(r, 1000));
  
  console.log("Clicking platform link...");
  await page.click('a[href="/#platform"]');
  
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
