import { expect, test, type Page } from "@playwright/test";

// ContextMenu on the gallery page, in all three engines: opened by a right-click
// at the pointer, by Shift+F10 under the focused element, or by a long press.
const noWebFonts = (page: Page) => page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());

test.use({ reducedMotion: "reduce" });

const menu = (page: Page) => page.getByRole("menu", { name: "ファイルの操作" });
const file = (page: Page, name: string) => page.getByTestId("file-area").getByRole("button", { name });

test.beforeEach(async ({ page }) => {
  await noWebFonts(page);
  await page.goto("/components.html");
  await expect(page.locator("html")).toHaveAttribute("data-urushi-runtime", "ready");
});

test("a right-click opens it at the pointer on its first item, and Menu's keys work inside", async ({ page }) => {
  const target = file(page, "見積もり.xlsx");
  await target.scrollIntoViewIfNeeded();
  const box = (await target.boundingBox())!;
  const at = { x: box.x + 30, y: box.y + box.height / 2 };
  await page.mouse.click(at.x, at.y, { button: "right" });
  await expect(menu(page)).toBeVisible();
  await expect(menu(page).getByRole("menuitem", { name: "開く" })).toBeFocused();
  const placed = (await menu(page).boundingBox())!;
  expect(Math.abs(placed.x - at.x)).toBeLessThanOrEqual(6);
  expect(Math.abs(placed.y - at.y)).toBeLessThanOrEqual(6);
  await page.keyboard.press("ArrowDown");
  await expect(menu(page).getByRole("menuitem", { name: "名前を変更" })).toBeFocused();
  // The submenu is Menu.Sub: → opens it on its first item, ← returns.
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("menuitem", { name: "仕事" })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(menu(page).getByRole("menuitem", { name: "移動" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu(page)).toBeHidden();
});

test("a second right-click moves it, and choosing an item closes it", async ({ page }) => {
  // From the last file up to the first, so the open menu does not cover the next target.
  await file(page, "打ち合わせメモ.md").click({ button: "right" });
  await expect(menu(page)).toBeVisible();
  const first = (await menu(page).boundingBox())!;
  await file(page, "企画書.pdf").click({ button: "right" });
  await expect(menu(page)).toBeVisible();
  await expect.poll(async () => (await menu(page).boundingBox())!.y).toBeLessThan(first.y - 40);
  await menu(page).getByRole("menuitem", { name: "複製" }).click();
  await expect(menu(page)).toBeHidden();
});

test("near the edges of the window it opens up and towards the start instead", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 700 });
  const area = page.getByTestId("file-area");
  // Put the last file at the very bottom of the window.
  await area.evaluate((el) => window.scrollBy(0, el.getBoundingClientRect().bottom - window.innerHeight + 4));
  const box = (await file(page, "打ち合わせメモ.md").boundingBox())!;
  const at = { x: box.x + box.width - 4, y: box.y + box.height / 2 };
  await page.mouse.click(at.x, at.y, { button: "right" });
  await expect(menu(page)).toBeVisible();
  const placed = (await menu(page).boundingBox())!;
  expect(placed.y + placed.height).toBeLessThanOrEqual(at.y + 6);
  expect(placed.y + placed.height).toBeLessThanOrEqual(700);
  expect(placed.x + placed.width).toBeLessThanOrEqual(1024);
});

test("Shift+F10 opens it under the focused file, and Escape returns focus there", async ({ page }) => {
  const target = file(page, "企画書.pdf");
  await target.focus();
  await page.keyboard.press("Shift+F10");
  await expect(menu(page)).toBeVisible();
  await expect(menu(page).getByRole("menuitem", { name: "開く" })).toBeFocused();
  const box = (await target.boundingBox())!;
  const placed = (await menu(page).boundingBox())!;
  expect(Math.abs(placed.y - (box.y + box.height))).toBeLessThanOrEqual(6);
  await page.keyboard.press("Escape");
  await expect(menu(page)).toBeHidden();
  await expect(target).toBeFocused();
});

test("a long press on touch opens it; a press that moves does not", async ({ page }) => {
  const target = file(page, "見積もり.xlsx");
  await target.scrollIntoViewIfNeeded();
  const press = (move: number) =>
    target.evaluate(async (el, move) => {
      const r = el.getBoundingClientRect();
      const init = { bubbles: true, cancelable: true, pointerType: "touch", pointerId: 7, isPrimary: true };
      const x = r.x + 20, y = r.y + r.height / 2;
      el.dispatchEvent(new PointerEvent("pointerdown", { ...init, clientX: x, clientY: y }));
      if (move) el.dispatchEvent(new PointerEvent("pointermove", { ...init, clientX: x, clientY: y + move }));
      await new Promise((resolve) => setTimeout(resolve, 650));
      el.dispatchEvent(new PointerEvent("pointerup", { ...init, clientX: x, clientY: y + move }));
    }, move);
  await press(30);
  await expect(menu(page)).toBeHidden();
  await press(0);
  await expect(menu(page)).toBeVisible();
});

test("outside an area the browser's own menu is left alone", async ({ page }) => {
  const prevented = await page.getByRole("heading", { name: "ContextMenu" }).evaluate((el) => {
    const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true, button: 2 });
    el.dispatchEvent(event);
    return event.defaultPrevented;
  });
  expect(prevented).toBe(false);
  await expect(menu(page)).toBeHidden();
});
