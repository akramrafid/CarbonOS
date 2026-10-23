// Brief §1 customer journey through the real UI and API: organization → invite colleagues → facility →
// period → cited factor (dual approval) → activity with evidence → independent review → calculation →
// lock by a second person → reproducible export. Factor values are TEST fixtures.
import { test, expect, type Browser, type Page } from "@playwright/test";
import { createHmac, randomUUID } from "node:crypto";
import { E2E_JWT_SECRET } from "../../playwright.config";

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
function jwt(sub: string, email: string) {
  const body = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub, email, email_verified: true, exp: Math.floor(Date.now() / 1000) + 3600 })}`;
  return `${body}.${createHmac("sha256", E2E_JWT_SECRET).update(body).digest("base64url")}`;
}

async function as(browser: Browser, sub: string, email: string, path = "/platform/esg"): Promise<Page> {
  const context = await browser.newContext();
  await context.addInitScript((token) => { (window as any).__ESG_E2E_TOKEN__ = token; }, jwt(sub, email));
  const page = await context.newPage();
  await page.goto(path);
  return page;
}

async function invite(owner: Page, email: string, role: string) {
  await owner.getByRole("button", { name: "Members" }).click();
  const form = owner.getByRole("form", { name: "Invite member" });
  await form.getByLabel("Email").fill(email);
  await form.getByLabel("Role").selectOption(role);
  await form.getByRole("button", { name: "Create invitation" }).click();
  await expect(owner.getByRole("cell", { name: email })).toBeVisible(); // link below is now this invite's
  const url = new URL((await owner.getByText(/One-time link/).textContent())!.split("(shown once): ")[1]);
  return url.pathname + url.search;
}

test("organization admin completes the Scope 2 journey to a locked, reproducible report", async ({ browser }) => {
  test.setTimeout(120_000);
  const run = randomUUID().slice(0, 8);
  const owner = await as(browser, `owner-${run}`, `owner-${run}@example.test`);

  await owner.getByLabel("Organization name").fill(`Alpha Textiles ${run}`);
  await owner.getByRole("button", { name: "Create organization" }).click();
  await expect(owner.getByText("Role: org_owner")).toBeVisible();

  // Structure
  await owner.getByLabel("Name").first().fill("Alpha Textiles Ltd");
  await owner.getByLabel("Country (ISO-2)").first().fill("BD");
  await owner.getByRole("button", { name: "Add legal entity" }).click();
  await expect(owner.getByRole("cell", { name: "Alpha Textiles Ltd" })).toBeVisible();
  await owner.getByLabel("Facility name").fill("Savar Plant");
  await owner.getByLabel("Country (ISO-2)").nth(1).fill("BD");
  await owner.getByLabel("Factor region").fill("TEST-GRID");
  await owner.getByRole("button", { name: "Add facility" }).click();
  await expect(owner.getByRole("cell", { name: "Savar Plant" })).toBeVisible();
  await owner.getByLabel("Name").last().fill("FY2025");
  await owner.getByLabel("Start date").fill("2025-01-01");
  await owner.getByLabel("End date").fill("2025-12-31");
  await owner.getByRole("button", { name: "Add period" }).click();
  await expect(owner.getByRole("cell", { name: "FY2025" })).toBeVisible();

  // Colleagues join through invitations bound to their verified email.
  const adminLink = await invite(owner, `admin-${run}@example.test`, "esg_admin");
  const contribLink = await invite(owner, `contrib-${run}@example.test`, "data_contributor");
  const admin = await as(browser, `admin-${run}`, `admin-${run}@example.test`, adminLink);
  await expect(admin.getByText(/You joined .* as esg_admin/)).toBeVisible();
  const contrib = await as(browser, `contrib-${run}`, `contrib-${run}@example.test`, contribLink);
  await expect(contrib.getByText(/You joined .* as data_contributor/)).toBeVisible();

  // Cited factor, approved by someone other than its author.
  await owner.getByRole("button", { name: "Emission factors" }).click();
  const ff = owner.getByRole("form", { name: "New emission factor" });
  await ff.getByLabel("Factor family").fill("test-grid");
  await ff.getByLabel("Activity").selectOption("electricity");
  await ff.getByLabel("kgCO₂e per canonical unit").fill("0.5");
  await ff.getByLabel("Region").fill("TEST-GRID");
  await ff.getByLabel("Valid from").fill("2024-01-01");
  await ff.getByLabel("Publisher").fill("TEST FIXTURE");
  await ff.getByLabel("Document").fill("E2E fixture — not a real factor");
  await ff.getByLabel("Source year").fill("2024");
  await ff.getByRole("button", { name: "Save draft factor" }).click();
  await expect(owner.getByText(/saved as DRAFT/)).toBeVisible();
  await expect(owner.getByRole("button", { name: "Approve" })).toHaveCount(0); // author cannot approve
  await admin.getByRole("button", { name: "Emission factors" }).click();
  await admin.getByRole("button", { name: "Approve" }).click();
  await expect(admin.getByText("Factor approved.")).toBeVisible();

  // Contributor records activity data with evidence and submits it.
  await contrib.getByRole("button", { name: "Activity ledger" }).click();
  const af = contrib.getByRole("form", { name: "New activity record" });
  await af.getByLabel("Activity").selectOption("electricity");
  await af.getByLabel("Quantity").fill("10");
  await af.getByLabel("Unit").selectOption("MWh");
  await af.getByLabel("From").fill("2025-01-01");
  await af.getByLabel("To").fill("2025-01-31");
  await af.getByLabel("Meter / account ref").fill("DESCO-HT-1");
  await af.getByLabel("Source reference").fill("Invoice 2025-01, page 1");
  await af.getByRole("button", { name: "Save draft" }).click();
  await expect(contrib.getByText("10,000 kWh")).toBeVisible();
  await expect(contrib.getByText("entered 10 MWh")).toBeVisible();
  await contrib.getByRole("button", { name: "Submit" }).click();
  await expect(contrib.getByText("SUBMITTED", { exact: true })).toBeVisible();

  // Owner reviews (not the creator) and approves.
  await owner.getByRole("button", { name: "Activity ledger" }).click();
  await owner.getByRole("button", { name: "Approve", exact: true }).click();
  await expect(owner.getByText("Record approved.")).toBeVisible();

  // Contributor prepares the calculation; contributors cannot lock.
  await contrib.getByRole("button", { name: "Calculation & reports" }).click();
  await contrib.getByRole("button", { name: "Run calculation" }).click();
  await expect(contrib.getByText("5 tCO₂e")).toBeVisible();
  await expect(contrib.getByText("Not reported")).toBeVisible(); // market-based missing, not invented
  await expect(contrib.getByRole("button", { name: /lock/i })).toHaveCount(0);

  // Owner reviews the contributor's run and locks the period.
  await owner.getByRole("button", { name: "Calculation & reports" }).click();
  await expect(owner.getByText(`Prepared by contrib-${run}`)).toBeVisible();
  await owner.getByRole("button", { name: "Approve & lock period" }).click();
  await expect(owner.getByText("Period locked and report snapshot recorded.")).toBeVisible();

  const exports: string[] = [];
  for (let i = 0; i < 2; i++) {
    const download = owner.waitForEvent("download");
    await owner.getByRole("button", { name: "CSV" }).click();
    exports.push(await (await download).createReadStream().then(async (s) => {
      const chunks: Buffer[] = [];
      for await (const c of s!) chunks.push(c as Buffer);
      return Buffer.concat(chunks).toString();
    }));
  }
  expect(exports[0]).toBe(exports[1]);
  expect(exports[0]).toContain("total_tco2e,scope2_location_based,5.000");
  expect(exports[0]).toContain("Not externally assured or verified.");

  // Audit trail records the journey.
  await owner.getByRole("button", { name: "Audit trail" }).click();
  for (const action of ["invitation.accept", "factor.approve", "activity.approve", "calculation.run", "period.lock"]) {
    await expect(owner.getByRole("cell", { name: action, exact: true }).first()).toBeVisible();
  }
});

test("signed-out visitor sees no workspace data", async ({ page }) => {
  await page.goto("/platform/esg");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("table")).toHaveCount(0);
});
