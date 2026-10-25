import { defineConfig, devices } from "@playwright/test";

// Test-only signing secret for the local e2e API; never used outside this config.
export const E2E_JWT_SECRET = "e2e-only-secret-not-for-production-0123456789";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { outputFolder: "docs/qa/playwright-report", open: "never" }], ["line"]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    colorScheme: "light",
    reducedMotion: "no-preference",
  },
  // SPA + standalone ESG API (SQLite, HS256 test secret). The e2e token hook is compiled into this
  // dev server only (VITE_E2E_TEST_HOOK); production builds never contain it.
  webServer: process.env.BASE_URL ? undefined : [
    {
      command: "npm run dev -- --port 3000 --strictPort",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: !process.env.CI,
      env: { VITE_FASTAPI_API_URL: "http://127.0.0.1:8100", VITE_E2E_TEST_HOOK: "true" },
    },
    {
      command: `${JSON.stringify(process.env.ESG_PYTHON ?? "python")} -m uvicorn esg_app:app --port 8100`,
      cwd: "inference",
      url: "http://127.0.0.1:8100/readyz",
      reuseExistingServer: !process.env.CI,
      env: {
        DATABASE_URL: "sqlite:///./e2e.sqlite3",
        ESG_AUTH_JWT_SECRET: E2E_JWT_SECRET,
        CHROMA_PERSIST_DIR: "./.e2e_store",
        GEMINI_API_KEY: "",
        ALLOWED_ORIGINS: "http://127.0.0.1:3000,http://localhost:3000",
      },
    },
  ],
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "tablet-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1024, height: 900 } } },
    { name: "mobile-chromium", use: { ...devices["iPhone 13"], browserName: "chromium", viewport: { width: 375, height: 812 } } },
    { name: "small-mobile-chromium", use: { ...devices["Pixel 5"], viewport: { width: 320, height: 720 } } },
  ],
});
