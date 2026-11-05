import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  outputDir: "test-results/e2e",
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  maxFailures: process.env.CI ? 5 : undefined,
  reporter: [["list"], ["json", { outputFile: "test-results/results.json" }]],
  use: { baseURL: "http://localhost:5173", screenshot: "only-on-failure" },
  webServer: {
    command: "pnpm --filter playground dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    // Linux WebKit on CI fails a different timing-sensitive test on most runs; a retry is still reported as flaky.
    { name: "webkit", retries: process.env.CI ? 1 : 0, use: { ...devices["Desktop Safari"] } },
  ],
});
