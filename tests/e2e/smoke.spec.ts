import { test, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.join(__dirname, "../screenshots");

/**
 * Cards live behind `a[href^="/competitions/<slug>"]`. AuthShell-style
 * responsive duplication also applies to some views, so always target the copy
 * that is on screen.
 */
const cardLinks = (page: import("@playwright/test").Page) =>
  page.locator("a[href^='/competitions/']").locator("visible=true");

const cardLink = (page: import("@playwright/test").Page) => cardLinks(page).first();

/**
 * The detail page renders "Enter draw" twice: a sticky summary bar that is
 * hidden (`opacity-0 pointer-events-none`) until the user scrolls, and the
 * in-page CTA. Playwright treats `opacity: 0` as visible, so take the last
 * match — the real, clickable CTA.
 */
const enterDrawButton = (page: import("@playwright/test").Page) =>
  page
    .getByRole("button", { name: /Enter draw/i })
    .locator("visible=true")
    .last();

test.describe("Rafilla smoke", () => {
  test("Home page loads with title and hero copy", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Raffila/);
    const hero = page.getByRole("heading", { name: /Big opportunities\. Affordable entries/i });
    await expect(hero.first()).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "1-home-page.png"), fullPage: true });
  });

  test("Navigate to Competitions shows grid of cards", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Competitions" }).first().click();
    await expect(page).toHaveURL(/\/competitions/);

    // Cards stream in from live data — wait for at least one instead of
    // counting whatever happens to be mounted at that instant. The catalogue
    // is DB-driven (deleted competitions stay deleted), so the exact count
    // depends on Firestore contents, not fixtures.
    await expect
      .poll(() => cardLinks(page).count(), { timeout: 30000, intervals: [500] })
      .toBeGreaterThanOrEqual(1);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "2-competitions-grid.png"),
      fullPage: true,
    });
  });

  test("Enter competition detail from first card", async ({ page }) => {
    await page.goto("/competitions");
    await expect(cardLink(page)).toBeVisible({ timeout: 20000 });
    await cardLink(page).click();

    const pageTitle = page.locator("h1");
    await expect(pageTitle).toBeVisible();

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "3-competition-detail.png"),
      fullPage: true,
    });
  });

  test("Open ticket purchase modal shows step UI and qty controls", async ({ page }) => {
    await page.goto("/competitions");
    await expect(cardLink(page)).toBeVisible({ timeout: 20000 });
    await cardLink(page).click();
    await expect(page.locator("h1")).toBeVisible({ timeout: 20000 });

    // Only open-for-entries competitions render an Enter CTA (DRAW_READY /
    // closed ones don't). The catalogue is DB-driven, so when no enterable
    // competition exists there is no modal flow to test — skip instead of
    // failing on live data.
    const ctaVisible = await enterDrawButton(page)
      .waitFor({ state: "visible", timeout: 15000 })
      .then(
        () => true,
        () => false,
      );
    test.skip(!ctaVisible, "No enterable competition in the live DB — skipping modal flow.");

    // TicketPurchaseModal is a plain fixed overlay (no role="dialog"), so key
    // off its always-present close button instead of an ARIA dialog role.
    const modal = page.locator("div.fixed.inset-0.z-50").locator("visible=true").first();
    const modalClose = page
      .getByRole("button", { name: "Close ticket purchase" })
      .locator("visible=true")
      .first();

    // The modal only opens once React handlers are attached, so retry the click
    // until it appears instead of racing hydration.
    await expect(async () => {
      await expect(enterDrawButton(page)).toBeVisible({ timeout: 5000 });
      await enterDrawButton(page).click({ force: true, timeout: 5000 });
      await expect(modalClose).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 45000, intervals: [500] });

    await expect(modal).toBeVisible();
    const qtyControls = await modal.getByRole("button").count();
    expect(qtyControls).toBeGreaterThanOrEqual(3);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "4-ticket-purchase-modal.png"),
      fullPage: true,
    });
  });
});
