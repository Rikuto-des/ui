import { defineConfig, devices } from "@playwright/test";

// Runs against the production build of examples/next (pnpm --filter next-example build).
export default defineConfig({
  testDir: "tests/next",
  outputDir: "test-results/next",
  reporter: [["list"]],
  use: { baseURL: "http://localhost:3100", trace: "on-first-retry", screenshot: "only-on-failure" },
  webServer: {
    command: "pnpm --filter next-example start",
    url: "http://localhost:3100",
    reuseExistingServer: true,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    // Linux WebKit can time out during its first page fixture. Keep the failure
    // in the report and collect a trace if its single CI retry is needed.
    { name: "webkit", retries: process.env.CI ? 1 : 0, use: { ...devices["Desktop Safari"] } },
  ],
});
