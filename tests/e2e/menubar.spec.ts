import { expect, test, type Page } from "@playwright/test";

// Menubar on the gallery page, in all three engines (WAI-ARIA menubar pattern).
const noWebFonts = (page: Page) => page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());

test.use({ reducedMotion: "reduce" });

const bar = (page: Page) => page.getByRole("menubar", { name: "ノートのメニュー" });
const trigger = (page: Page, name: string) => bar(page).getByRole("menuitem", { name, exact: true });
const menu = (page: Page, name: string) => page.getByRole("menu", { name, exact: true });

test.beforeEach(async ({ page }) => {
  await noWebFonts(page);
  await page.goto("/components.html");
  await expect(page.locator("html")).toHaveAttribute("data-urushi-runtime", "ready");
});

test("the bar is one Tab stop, and ← → Home End move between its menus", async ({ page }) => {
  await expect(trigger(page, "ファイル")).toHaveAttribute("aria-haspopup", "menu");
  await trigger(page, "ファイル").focus();
  await page.keyboard.press("ArrowRight");
  await expect(trigger(page, "編集")).toBeFocused();
  await page.keyboard.press("End");
  await expect(trigger(page, "ヘルプ")).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(trigger(page, "ファイル")).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(trigger(page, "ヘルプ")).toBeFocused();
  // Only the current trigger is in the Tab order.
  const order = await bar(page).locator('[data-slot~="menubar-trigger"]').evaluateAll((els) => els.map((el) => (el as HTMLElement).tabIndex));
  expect(order).toEqual([-1, -1, -1, 0]);
});

test("a bar added after the runtime is ready is one Tab stop too", async ({ page }) => {
  const order = await page.evaluate(async () => {
    const copy = document.querySelector('[data-slot="menubar"]')!.cloneNode(true) as HTMLElement;
    for (const el of copy.querySelectorAll("[tabindex]")) el.removeAttribute("tabindex");
    for (const el of copy.querySelectorAll("[id]")) el.removeAttribute("id");
    document.body.append(copy);
    await new Promise((resolve) => setTimeout(resolve));
    return [...copy.querySelectorAll<HTMLElement>('[data-slot~="menubar-trigger"]')].map((el) => el.tabIndex);
  });
  expect(order).toEqual([0, -1, -1, -1]);
});

test("↓ opens a menu on its first item, ↑ on its last, and → ← switch to the next menu", async ({ page }) => {
  await trigger(page, "ファイル").focus();
  await page.keyboard.press("ArrowDown");
  await expect(menu(page, "ファイル").getByRole("menuitem", { name: "新しいノート" })).toBeFocused();
  // → on an item without a submenu opens the next menu.
  await page.keyboard.press("ArrowRight");
  await expect(menu(page, "編集").getByRole("menuitem", { name: "元に戻す" })).toBeFocused();
  await expect(menu(page, "ファイル")).toBeHidden();
  await page.keyboard.press("ArrowLeft");
  await expect(menu(page, "ファイル").getByRole("menuitem", { name: "新しいノート" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu(page, "ファイル")).toBeHidden();
  await expect(trigger(page, "ファイル")).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(menu(page, "ファイル").getByRole("menuitem", { name: "印刷…" })).toBeFocused();
});

test("→ on a Menu.Sub opens the submenu; ← in it returns to the item, not the previous menu", async ({ page }) => {
  await trigger(page, "ファイル").focus();
  await page.keyboard.press("ArrowDown");
  await expect(menu(page, "ファイル").getByRole("menuitem", { name: "新しいノート" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  const sub = menu(page, "ファイル").getByRole("menuitem", { name: "書き出す" });
  await expect(sub).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("menuitem", { name: "PDF" })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(sub).toBeFocused();
  await expect(menu(page, "ファイル")).toBeVisible();
});

test("a click opens a menu, hovering another trigger switches to it, and choosing an item closes it", async ({ page }) => {
  await trigger(page, "編集").click();
  await expect(menu(page, "編集")).toBeVisible();
  await trigger(page, "表示").hover();
  await expect(menu(page, "表示")).toBeVisible();
  await expect(menu(page, "編集")).toBeHidden();
  const below = (await menu(page, "表示").boundingBox())!;
  const at = (await trigger(page, "表示").boundingBox())!;
  expect(below.y).toBeGreaterThanOrEqual(at.y + at.height);
  expect(Math.abs(below.x - at.x)).toBeLessThanOrEqual(4);
  await menu(page, "表示").getByRole("menuitem", { name: "目次を表示" }).click();
  await expect(menu(page, "表示")).toBeHidden();
  // With every menu closed, hovering does not open one.
  await trigger(page, "ヘルプ").hover();
  await page.waitForTimeout(200);
  await expect(menu(page, "ヘルプ")).toBeHidden();
});

test("a click outside closes the menu and leaves focus where the click put it", async ({ page }) => {
  await trigger(page, "編集").click();
  await expect(menu(page, "編集")).toBeVisible();
  await page.locator("h1").first().click();
  await expect(menu(page, "編集")).toBeHidden();
  await expect(trigger(page, "編集")).not.toBeFocused();
});
