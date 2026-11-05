import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import list from "../../blocks/index.json" with { type: "json" };

test.beforeEach(async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.fulfill({ status: 200, contentType: "text/css", body: "" }));
});

test("the Blocks page frames every block with its install command and code", async ({ page }) => {
  await page.goto("/blocks/");
  await expect(page.getByRole("heading", { level: 1, name: "Blocks" })).toBeVisible();
  await expect(page.locator("iframe.block-frame")).toHaveCount(list.length);
  for (const block of list) {
    await expect(page.getByRole("heading", { level: 2, name: block.title })).toBeVisible();
    await expect(page.getByText(`npx urushi add ${block.name}`)).toBeVisible();
  }
});

for (const block of list) {
  test(`${block.name}: no axe violations and no sideways scroll at 320px and 1280px, in both themes`, async ({ page }) => {
    for (const theme of ["light", "dark"]) {
      for (const width of [320, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        // The site restores the theme from storage before the first paint, so nothing is mid-transition.
        await page.addInitScript((t) => localStorage.setItem("urushi-site", JSON.stringify({ theme: t })), theme);
        await page.goto(`/blocks/${block.name}/view/`);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await expect(page.locator("h1").first()).toBeVisible();
        await expect(page.locator("html")).toHaveAttribute("data-urushi-runtime", "ready", { timeout: 20_000 });
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth), `${theme}/${width}`).toBeLessThanOrEqual(width);
        const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`), `${theme}/${width}`).toEqual([]);
      }
    }
  });
}

test("mail-01: choosing a mail shows it, and the list's width moves with the keyboard", async ({ page }) => {
  await page.goto("/blocks/mail-01/view/");
  await expect(page.locator("html")).toHaveAttribute("data-urushi-runtime", "ready", { timeout: 20_000 });
  await page.getByRole("button", { name: /高橋 陽子/ }).click();
  await expect(page.getByRole("heading", { level: 2, name: "来週の打ち合わせ" })).toBeVisible();
  const handle = page.getByRole("separator", { name: "一覧の幅" });
  await handle.focus();
  await page.keyboard.press("ArrowRight");
  await expect(handle).toHaveAttribute("aria-valuenow", "36");
});
