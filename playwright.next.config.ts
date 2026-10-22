import { defineConfig, devices } from "@playwright/test";

// Runs against the production build of examples/next (pnpm --filter next-example build).
export default defineConfig({
  testDir: "tests/next",
  reporter: [["list"]],
  use: { baseURL: "http://localhost:3100" },
  webServer: {
    command: "pnpm --filter next-example start",
    url: "http://localhost:3100",
    reuseExistingServer: true,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
