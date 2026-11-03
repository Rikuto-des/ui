/** Screenshots of the component gallery for docs/phase1. Needs `pnpm dev` running. */
import { chromium } from "@playwright/test";

const out = "docs/phase1/shots";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 820 }, deviceScaleFactor: 2 });
await page.goto("http://localhost:5173/components.html", { waitUntil: "networkidle" });
const theme = async (pack: string, t: string) => {
  await page.evaluate(([p, th]) => {
    document.documentElement.dataset.pack = p;
    document.documentElement.dataset.theme = th;
  }, [pack, t]);
  await page.waitForTimeout(400);
};
const section = (id: string) => page.locator(`#${id}`).screenshot({ path: `${out}/${id}.png` });

await theme("graphite", "light");
await page.screenshot({ path: `${out}/gallery-graphite-light.png` });
await section("field");
await section("radio-group");
await page.locator("#menu .g-stage").scrollIntoViewIfNeeded();
await page.getByTestId("menu-trigger").focus();
await page.keyboard.press("ArrowDown");
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/menu-graphite-light.png` });
await page.keyboard.press("Escape");

await theme("lucent", "light");
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: `${out}/gallery-lucent-light.png` });
await section("card");

await theme("lucent", "dark");
await page.locator("#toast .g-stage").scrollIntoViewIfNeeded();
await page.getByTestId("toast-save").click();
await page.getByTestId("toast-error").click();
await page.getByTestId("open-invite").click();
await page.evaluate(() => (window as unknown as { urushiToast: (m: string) => void }).urushiToast("ダイアログの中にも出ます"));
await page.waitForTimeout(700);
await page.screenshot({ path: `${out}/dialog-toast-lucent-dark.png` });
await browser.close();
console.log(`wrote ${out}`);
