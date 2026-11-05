import { defineConfig, devices } from "@playwright/test";

// Runs against the static export of apps/site (pnpm --filter site build).
export default defineConfig({
  testDir: "tests/site",
  outputDir: "test-results/site",
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:3201", screenshot: "only-on-failure" },
  webServer: {
    command: "node scripts/serve-static.ts apps/site/out 3201",
    url: "http://localhost:3201",
    reuseExistingServer: true,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    // Linux WebKit on CI fails a different timing-sensitive test on most runs; a retry is still reported as flaky.
    { name: "webkit", retries: process.env.CI ? 1 : 0, use: { ...devices["Desktop Safari"] } },
  ],
});
