import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await page.goto("/themes/");
  await expect(page.locator("html")).toHaveAttribute("data-urushi-runtime", "ready", { timeout: 20_000 });
});

const primary = (page: Page) => page.locator('.pack-editor-preview [data-variant="primary"]').first();
const style = (page: Page, prop: string) => primary(page).evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

test("the controls change the preview and the CSS it writes", async ({ page }) => {
  await page.getByRole("slider", { name: /角の丸み/ }).fill("3");
  await expect.poll(() => style(page, "border-radius")).toBe("3px");
  await page.getByLabel("主ボタン（ライト）").fill("#3355ff");
  await expect.poll(() => style(page, "background-color")).toBe("rgb(51, 85, 255)");
  // The text on the button is picked for contrast.
  await expect.poll(() => style(page, "color")).toBe("rgb(255, 255, 255)");
  await page.getByRole("radio", { name: "ゆったり" }).check();
  await expect.poll(() => style(page, "height")).toBe("40px");
  await page.getByRole("textbox", { name: /パックの名前/ }).fill("north");
  const code = page.getByLabel("パックの CSS");
  await expect(code).toContainText('[data-pack="north"]');
  await expect(code).toContainText("--ur-color-action: light-dark(#3355ff,");
  await expect(code).toContainText("--ur-radius-control: 3px;");
  await expect(page.locator(".pack-editor-preview")).toHaveAttribute("data-pack", "north");
});

test("a pair below the WCAG minimum is reported", async ({ page }) => {
  await expect(page.getByText("すべての組み合わせが WCAG の基準を満たしています")).toBeVisible();
  await page.getByLabel("文字（ライト）").fill("#c8c8c8");
  await expect(page.getByText(/か所でコントラストが足りません/)).toBeVisible();
  await expect(page.locator(".pack-editor-checks")).toContainText("4.5:1 未満");
});

test("tokens.json and the CSS download", async ({ page }) => {
  const [json] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "tokens.json を保存" }).click()]);
  expect(json.suggestedFilename()).toBe("tokens.json");
  const tree = JSON.parse(await (await json.createReadStream()).toArray().then((chunks) => Buffer.concat(chunks).toString("utf8")));
  expect(tree.color.accent.$value.hex).toMatch(/^#[0-9a-f]{6}$/);
  const [css] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "CSS を保存" }).click()]);
  expect(css.suggestedFilename()).toBe("my-pack.css");
});

test("no axe violations, and no sideways scroll at 320px", async ({ page }) => {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  await page.setViewportSize({ width: 320, height: 900 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
