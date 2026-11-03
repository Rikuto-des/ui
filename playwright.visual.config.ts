import { defineConfig, devices } from "@playwright/test";

// Visual regression tests for the component gallery. Baselines are kept for
// Chromium only and per platform: with web fonts blocked, text renders in the
// OS fonts, so images from another OS (or another macOS release) will differ.
//
// The playground is built fresh for every run and served without HMR. Against
// the dev server, an edit anywhere in the repo swaps the stylesheets of open
// pages mid-test, and the transitions that follow end up in the screenshots.
const site = "../../node_modules/.cache/urushi-visual";
const port = 4319;

export default defineConfig({
  testDir: "tests/visual",
  outputDir: "test-results/visual",
  fullyParallel: true,
  reporter: [["list"]],
  // `pnpm test:visual` never writes baselines; `pnpm test:visual:update` does.
  updateSnapshots: "none",
  snapshotPathTemplate: "{testDir}/__screenshots__/{platform}/{arg}{ext}",
  expect: {
    // On a busy machine, waiting for an element to stop moving can take more than the default 5 s.
    timeout: 15_000,
    toHaveScreenshot: {
      // Same browser, same machine: any changed pixel is a change.
      threshold: 0,
      maxDiffPixels: 0,
      animations: "disabled",
      // tests/visual/screenshot.css hides the caret, added once per page.
      caret: "initial",
      scale: "css",
    },
  },
  use: {
    baseURL: `http://localhost:${port}`,
    reducedMotion: "reduce",
  },
  webServer: {
    command:
      `pnpm --filter playground exec vite build --outDir ${site} --emptyOutDir --logLevel warn && ` +
      `pnpm --filter playground exec vite preview --outDir ${site} --port ${port} --strictPort`,
    url: `http://localhost:${port}/components.html`,
    // Never test a build left over from an earlier run.
    reuseExistingServer: false,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
        // When only part of a tile changes (a hover, a style added for a shot),
        // Chromium re-rasters just that part, and over Lucent's gradients the
        // result can differ by a shade from rastering the whole tile. Which one
        // happens depends on timing, so the same page gave different pixels.
        launchOptions: { args: ["--disable-partial-raster"] },
      },
    },
  ],
});
