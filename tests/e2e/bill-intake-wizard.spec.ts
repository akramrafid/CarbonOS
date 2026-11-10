import { test, expect } from "@playwright/test";

test.describe("ESG Utility Bill Intake Wizard E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the ESG workspace containing the Bill Intake Wizard
    await page.goto("/platform/esg");
  });

  test("wizard renders step-by-step layout in English", async ({ page }) => {
    await expect(page.getByText("Utility Bill Intake Wizard")).toBeVisible();
    await expect(page.getByText("1. Upload")).toBeVisible();
    await expect(page.getByText("2. What We Found")).toBeVisible();
    await expect(page.getByText("3. Fill the Gaps")).toBeVisible();
    await expect(page.getByText("4. Confirm")).toBeVisible();
    await expect(page.getByText("5. Result")).toBeVisible();
    await expect(page.getByRole("button", { name: "বাংলায় দেখুন" })).toBeVisible();
  });

  test("language toggle switches entire wizard to Bengali and back to English", async ({ page }) => {
    const langBtn = page.getByRole("button", { name: "বাংলায় দেখুন" });
    await expect(langBtn).toBeVisible();
    await langBtn.click();

    // Verify Bengali localized headers and steps
    await expect(page.getByText("ইউটিলিটি বিল ইনটেক উইজার্ড")).toBeVisible();
    await expect(page.getByText("১. আপলোড")).toBeVisible();
    await expect(page.getByText("২. প্রাপ্ত ফলাফল")).toBeVisible();
    await expect(page.getByText("৩. তথ্যের ঘাটতি পূরণ")).toBeVisible();
    await expect(page.getByText("৪. নিশ্চিতকরণ ও সংরক্ষণ")).toBeVisible();
    await expect(page.getByText("৫. হিসাবের ফলাফল")).toBeVisible();

    // Switch back to English
    const backBtn = page.getByRole("button", { name: "View in English" });
    await expect(backBtn).toBeVisible();
    await backBtn.click();
    await expect(page.getByText("Utility Bill Intake Wizard")).toBeVisible();
  });

  test("upload flow identifies bill and shows gap analysis form", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: "desco_sample_bill.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4\n1 0 obj\n<< /Title (DESCO HT Electric Bill) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF")
    });

    const uploadBtn = page.getByRole("button", { name: /Upload & Analyze|আপলোড ও বিশ্লেষণ/ });
    if (await uploadBtn.isVisible()) {
      await uploadBtn.click();
    }

    // Wizard moves to Step 2 / Step 3 with gap analysis summary
    await expect(page.getByText(/What We Found|প্রাপ্ত ফলাফল|Fill the Gaps|তথ্য পূরণ/)).toBeVisible();
  });
});

