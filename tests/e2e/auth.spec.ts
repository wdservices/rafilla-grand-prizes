import { test, expect, type Page, type Locator } from "@playwright/test";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.join(__dirname, "../screenshots");

/**
 * AuthShell intentionally renders its children twice (a `lg:hidden` mobile copy
 * and a `hidden lg:flex` desktop copy), so every form control appears twice in
 * the DOM. Always target the copy that is actually on screen.
 */
function visible(locator: Locator): Locator {
  return locator.locator("visible=true").first();
}

function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
}

/**
 * Interactions on server-rendered markup are ignored until React attaches its
 * event handlers, and in dev hydration can lag well behind `domcontentloaded`.
 * Poll the password toggle until a click actually flips its state — that flip
 * can only happen once handlers are wired, so it doubles as a hydration gate.
 */
async function waitForHydration(page: Page): Promise<void> {
  const toggle = visible(page.getByRole("button", { name: "Show password" }));
  const password = visible(page.locator("#password"));

  await expect(async () => {
    if ((await toggle.count()) === 0) throw new Error("form not rendered yet");
    if ((await password.getAttribute("type")) === "text") return; // already proven
    await toggle.click({ force: true });
    await page.waitForTimeout(300);
    if ((await password.getAttribute("type")) === "text") return;
    throw new Error("handlers not attached yet");
  }).toPass({ timeout: 45000, intervals: [500] });
}

test.describe("Auth page", () => {
  test("hydrates: form controls respond to clicks", async ({ page }) => {
    const errors = collectPageErrors(page);

    await page.goto("/auth", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Welcome back" }).first()).toBeVisible();

    // The password toggle only flips once React has hydrated and wired onClick.
    const password = visible(page.locator("#password"));
    await expect(password).toHaveAttribute("type", "password");
    await waitForHydration(page);
    await expect(password).toHaveAttribute("type", "text");
    await expect(visible(page.getByRole("button", { name: "Hide password" }))).toBeVisible();

    // Client-side validation must fire on submit (proves onSubmit is wired).
    await visible(page.getByRole("button", { name: /^Sign in$/ })).click();
    await expect(visible(page.getByText("Email is required"))).toBeVisible();
    await expect(visible(page.getByText("Password is required"))).toBeVisible();

    expect(errors, `Uncaught page errors: ${errors.join(" | ")}`).toEqual([]);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "5-auth-validation.png"),
      fullPage: true,
    });
  });

  test("sign-in button reaches the Firebase auth path and surfaces an error", async ({ page }) => {
    const errors = collectPageErrors(page);

    await page.goto("/auth", { waitUntil: "domcontentloaded" });
    await waitForHydration(page);

    await visible(page.locator("#email")).fill("no-such-account@example.com");
    await visible(page.locator("#password")).fill("wrong-password-123");
    await visible(page.getByRole("button", { name: /^Sign in$/ })).click();

    // The button must enter its loading state, then report the failure back to
    // the UI — a dead button would neither load nor render any feedback.
    await expect(visible(page.getByRole("button", { name: /Signing in/ }))).toBeVisible({
      timeout: 15000,
    });

    const globalError = visible(page.locator("div.rounded-xl.border-coral\\/20"));
    const toast = visible(page.locator("[data-sonner-toast]"));
    await expect(globalError.or(toast).first()).toBeVisible({ timeout: 20000 });

    // Never returns to a stuck disabled state.
    await expect(visible(page.getByRole("button", { name: /^Sign in$/ }))).toBeEnabled({
      timeout: 20000,
    });

    expect(errors, `Uncaught page errors: ${errors.join(" | ")}`).toEqual([]);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "6-auth-signin-error.png"),
      fullPage: true,
    });
  });

  test("register link switches the auth view", async ({ page }) => {
    await page.goto("/auth", { waitUntil: "domcontentloaded" });
    await waitForHydration(page);

    await visible(page.getByRole("link", { name: "Create one" })).click();
    await expect(page).toHaveURL(/tab=register/);
    await expect(visible(page.locator("#r-password"))).toBeVisible();

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "7-auth-register.png"),
      fullPage: true,
    });
  });
});
