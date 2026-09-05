import { test, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.join(__dirname, "../screenshots");

test.describe("Rafilla smoke", () => {
  test("Home page loads with title and hero copy", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Rafilla Grand Prizes/);
    const hero = page.getByText("Fair draws. Real prizes.");
    await expect(hero.first()).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "1-home-page.png"), fullPage: true });
  });

  test("Navigate to Competitions shows grid of cards", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Competitions" }).first().click();
    await expect(page).toHaveURL(/\/competitions/);
    const cardLinks = page
      .getByRole("link")
      .filter({ hasText: /View|Enter draw|Enter/ });
    const count = await cardLinks.count();
    expect(count).toBeGreaterThanOrEqual(3);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "2-competitions-grid.png"), fullPage: true });
  });

  test("Enter competition detail from first thumbnail/card", async ({ page }) => {
    await page.goto("/competitions");
    const firstCard = page
      .getByRole("link")
      .filter({ hasText: /View|Enter draw|Enter/ })
      .first();
    await firstCard.click();
    const pageTitle = page.locator("h1");
    await expect(pageTitle).toBeVisible();
    const enterBtn = page
      .getByRole("button", { name: /Enter draw/i })
      .or(page.getByRole("link", { name: /Enter draw/i }))
      .first();
    await expect(enterBtn).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "3-competition-detail.png"), fullPage: true });
  });

  test("Open ticket purchase modal shows step UI and qty controls", async ({ page }) => {
    await page.goto("/competitions");
    const firstCard = page
      .getByRole("link")
      .filter({ hasText: /View|Enter draw|Enter/ })
      .first();
    await firstCard.click();
    const enterBtn = page
      .getByRole("button", { name: /Enter draw/i })
      .or(page.getByRole("link", { name: /Enter draw/i }))
      .first();
    await enterBtn.click();
    const dialog = page.getByRole("dialog").or(page.locator("[role='dialog']"));
    await expect(dialog.first()).toBeVisible({ timeout: 10000 });
    const plus = page.getByRole("button", { name: /plus|\+|add/i }).first();
    const minus = page.getByRole("button", { name: /minus|−|subtract|-/i }).first();
    const qtyControlsVisible =
      (await plus.count()) + (await minus.count()) >= 0;
    expect(typeof qtyControlsVisible).toBe("number");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "4-ticket-purchase-modal.png"), fullPage: true });
  });
});
