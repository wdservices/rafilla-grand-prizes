import fs from "node:fs";
import { chromium, defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Use Playwright's bundled Chromium when it has been downloaded; otherwise fall
 * back to the system-installed Chrome so `npm run e2e` works on machines where
 * `npx playwright install` was never run (the browser download can be blocked).
 */
function browserChannel(): string | undefined {
  try {
    if (fs.existsSync(chromium.executablePath())) return undefined;
  } catch {
    // Bundled browser missing/unavailable -> use system Chrome below.
  }
  return "chrome";
}

export default defineConfig({
  testDir: path.join(__dirname, "tests/e2e"),
  outputDir: path.join(__dirname, "tests/e2e/test-results"),
  snapshotDir: path.join(__dirname, "tests/e2e/screenshots"),
  // Vite dev compiles the module graph on first hit, which can exceed the
  // default 30s navigation budget on a cold start.
  timeout: 60000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:8080",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    navigationTimeout: 60000,
    actionTimeout: 20000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: browserChannel() },
    },
  ],
});
