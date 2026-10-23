// ESG dashboard must never show fabricated values or self-awarded verification (docs/esg/06-data-authenticity-register.md).
// Runs without a signed-in session, which is exactly when the old code fell back to invented data.
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/platform/saas-dashboard");
});

test("unextractable upload shows an error, not sample consumption", async ({ page }) => {
  await page.locator('input[type="file"]').first().setInputFiles({
    name: "memo.txt", mimeType: "text/plain", buffer: Buffer.from("Quarterly board memo. Nothing measurable here."),
  });
  await expect(page.getByText(/Extraction failed/)).toBeVisible();
  await expect(page.getByText("14,200 Liters")).toHaveCount(0);
});

test("demo sample is labelled as demo, never as verified", async ({ page }) => {
  await page.getByRole("button", { name: /Load Demo Sample/ }).first().click();
  await expect(page.getByRole("status").filter({ hasText: "DEMO SAMPLE" })).toBeVisible();
  await expect(page.getByText(/AUDIT VERIFIED|ISO 14064 assurance/)).toHaveCount(0);
});

test("assistant failure shows unavailable state without citations", async ({ page }) => {
  await page.getByRole("button", { name: /Run AI/ }).first().click();
  await expect(page.getByText(/ESG assistant is unavailable/)).toBeVisible();
});

test("no uncaught page errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.reload();
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});
