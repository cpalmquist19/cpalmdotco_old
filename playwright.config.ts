import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      grepInvert: /@mobile-only/,
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      grepInvert: /@mobile-only/,
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      grepInvert: /@desktop-only/,
    },
  ],
});
