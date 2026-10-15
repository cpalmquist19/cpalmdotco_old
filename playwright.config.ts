import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: Boolean(process.env.CI),
  // CI writes playwright-report/ for the workflow to upload; "never" stops the report server blocking the run.
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:3000",
    // Retries are off on purpose, so `on-first-retry` would record nothing. Record every run, keep failures.
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      // The fake model API the chat route calls in place of Anthropic (D-061). Started first, so the app finds it.
      command: "node tests/e2e/helpers/fake-anthropic.mjs",
      port: 3101,
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: "npm run build && npm run start",
      url: "http://localhost:3000",
      // Always test a fresh build, never a server that happens to be running (D-015).
      reuseExistingServer: false,
      timeout: 180_000,
      // The chat route reads these per request. The key is a placeholder, so a developer's real key is never used,
      // and CHAT_ENABLED is set so their own value can't turn the chat off during the run (D-061).
      env: {
        ANTHROPIC_BASE_URL: "http://localhost:3101",
        ANTHROPIC_API_KEY: "test-key",
        CHAT_ENABLED: "true",
      },
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      grepInvert: /@mobile-only/,
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      // WebKit has no layout-shift entries, so the @chromium-only tests can't run there (D-030).
      grepInvert: /@mobile-only|@chromium-only/,
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      grepInvert: /@desktop-only/,
    },
    {
      name: "no-js",
      use: { ...devices["Desktop Chrome"], javaScriptEnabled: false },
      // Only the content-page tests run with JavaScript off (F5.5). The S01 tests need it.
      testMatch: /content-pages\.spec\.ts/,
    },
  ],
});
