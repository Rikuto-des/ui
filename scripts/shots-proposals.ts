import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
await page.goto("http://localhost:5173/proposals/index.html");
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
for (const id of ["graphite", "sumi", "lucent"]) {
  await page.locator(`#${id}`).screenshot({ path: `docs/design/proposals-${id}.png` });
}
await page.screenshot({ path: "docs/design/proposals-head.png" });
await browser.close();
console.log("ok");
