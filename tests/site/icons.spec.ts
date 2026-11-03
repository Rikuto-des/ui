import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Phosphor catalog supports sizing, search, selection and saved-state silhouettes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/docs/icons/");
  await expect(page.locator(".icon-grid button")).toHaveCount(52);
  await page.getByLabel("アイコンを検索", { exact: true }).fill("bookmark");
  await expect(page.locator(".icon-grid button")).toHaveCount(1);
  await page.getByLabel("サイズ", { exact: true }).selectOption("24");
  await expect(page.locator('.icon-grid [data-phosphor="bookmark-simple"]')).toHaveAttribute("width", "24");
  await page.getByRole("button", { name: "BookmarkSimple", exact: true }).click();
  await expect(page.locator(".icon-code")).toContainText("BookmarkSimpleIcon");
  await expect(page.locator(".icon-code")).toContainText("size={24}");
  const save = page.locator(".icon-state-demo button");
  await save.press("Space");
  await expect(save).toHaveAttribute("aria-pressed", "true");
  await expect(save.locator("svg")).toHaveAttribute("data-weight", "fill");
  await expect(save.locator("svg")).toHaveCSS("width", "24px");
  await save.press("Space");
  await expect(save.locator("svg")).toHaveAttribute("data-weight", "regular");
  const license = await page.request.get("/licenses/phosphor.txt");
  expect(license.ok()).toBeTruthy();
  expect(await license.text()).toContain("Copyright (c) 2023 Phosphor Icons");
});

for (const width of [320, 1280]) {
  for (const theme of ["dark", "light"]) {
    test(`Phosphor gallery is accessible at ${width}px in ${theme} mode`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/docs/icons/");
      await page.getByRole("combobox", { name: "テーマ", exact: true }).selectOption(theme);
      await page.waitForFunction(() => document.getAnimations().every(animation => animation.playState !== "running" || animation.effect?.getTiming().iterations === Infinity));
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(audit.violations).toEqual([]);
    });
  }
}
