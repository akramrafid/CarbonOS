import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('hg_profile', JSON.stringify({ name: 'Synthetic weather test', language: 'en' })));
});
const payload = (temp = 0) => ({ timezone: 'Asia/Dhaka', current_units: { temperature_2m: '°C', relative_humidity_2m: '%', wind_speed_10m: 'm/s' }, current: { temperature_2m: temp, relative_humidity_2m: 65, wind_speed_10m: 0, time: '2026-11-04T12:00' } });

test('weather presents model provenance and clears conditions on failure, then retries', async ({ page }) => {
  const credentialRequests: string[] = [];
  page.on('request', (request) => { if (/openweathermap|appid=|api_key=|token=/i.test(request.url())) credentialRequests.push(new URL(request.url()).hostname); });
  let fail = false;
  await page.route('https://api.open-meteo.com/v1/forecast?**', (route) => fail
    ? route.fulfill({ status: 503, body: '{}' })
    : route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload()) }));
  await page.goto('/harvestguard/dashboard');
  const weather = page.getByRole('region', { name: 'City weather' });
  await expect(weather).toContainText('0°C');
  await expect(weather).toContainText('Model estimate');
  await expect(weather).toContainText('2026-11-04 12:00 Asia/Dhaka');
  await expect(weather.getByRole('link', { name: 'Open-Meteo' })).toHaveAttribute('href', 'https://open-meteo.com/');
  fail = true;
  await page.getByLabel('Weather city').selectOption('Rajshahi');
  await expect(weather).toContainText('Weather unavailable.');
  await expect(weather).not.toContainText('°C');
  fail = false;
  await weather.getByRole('button', { name: 'Retry weather' }).click();
  await expect(weather).toContainText('0°C');
  expect(credentialRequests).toEqual([]);
});

test('incomplete provider weather stays unavailable instead of using sample conditions', async ({ page }) => {
  await page.route('https://api.open-meteo.com/v1/forecast?**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.goto('/harvestguard/dashboard');
  const weather = page.getByRole('region', { name: 'City weather' });
  await expect(weather).toContainText('Weather unavailable.');
  await expect(weather).not.toContainText('°C');
  await expect(weather).not.toContainText('Local Engine');
});
