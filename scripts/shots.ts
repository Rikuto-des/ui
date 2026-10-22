/** Captures playground screenshots for design review: node scripts/shots.ts [outDir] */
import { chromium } from "@playwright/test";

const out = process.argv[2] ?? "docs/phase0/shots";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const set = (pack: string, theme: string) =>
  page.evaluate(([p, t]) => {
    document.documentElement.dataset.pack = p;
    document.documentElement.dataset.theme = t;
  }, [pack, theme]);
for (const pack of ["graphite", "lucent"]) {
  for (const theme of ["light", "dark"]) {
    await set(pack, theme);
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${out}/${pack}-${theme}.png` });
  }
  await set(pack, "light");
  await page.screenshot({ path: `${out}/${pack}-full.png`, fullPage: true });
  await page.getByTestId("open-filters").click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/${pack}-popover.png` });
  await page.keyboard.press("Escape");
  await page.getByTestId("open-confirm").click();
  await page.waitForTimeout(450);
  await page.screenshot({ path: `${out}/${pack}-dialog.png` });
  await page.keyboard.press("Escape");
  await set(pack, "dark");
  await page.getByTestId("open-confirm").click();
  await page.waitForTimeout(450);
  await page.screenshot({ path: `${out}/${pack}-dialog-dark.png` });
  await page.keyboard.press("Escape");
}
await browser.close();
console.log("done");
