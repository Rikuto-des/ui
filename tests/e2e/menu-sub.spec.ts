import { expect, test, type Page } from "@playwright/test";

// Menu.Sub on the gallery page, in all three engines: a flyout beside its item
// on wide screens, in place under the item on narrow ones.
const noWebFonts = (page: Page) => page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());

test.use({ reducedMotion: "reduce" });

const sub = (page: Page) => page.locator('[data-testid="assign-sub"] > [data-slot="menu"]');
const subItem = (page: Page) => page.getByRole("menuitem", { name: "担当者を変える" });
const isOpen = (page: Page) => sub(page).evaluate((el) => el.matches(":popover-open") || el.hasAttribute("data-inline-open"));

/** Opens the task menu from the keyboard and moves to the submenu's item. */
async function toSubItem(page: Page) {
  await page.getByTestId("sub-menu-trigger").focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: "編集する" }).last()).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(subItem(page)).toBeFocused();
}

test.beforeEach(async ({ page }) => {
  await noWebFonts(page);
  await page.goto("/components.html");
  // Arrow keys and hover come from the runtime; a key pressed before it installs does nothing.
  // A cold Vite module graph on Linux WebKit (CI) can take longer than 5s to load the runtime.
  // This is a page-load budget only; the interaction assertions keep the default timeout.
  await expect(page.locator("html")).toHaveAttribute("data-urushi-runtime", "ready", { timeout: 20_000 });
});

test.describe("wide screens", () => {
  test("the item announces a submenu, and → opens it beside the item on its first entry", async ({ page }) => {
    await toSubItem(page);
    await expect(subItem(page)).toHaveAttribute("aria-haspopup", "menu");
    await page.keyboard.press("ArrowRight");
    const menu = page.getByRole("menu", { name: "担当者を変える" });
    await expect(menu).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "佐藤 美咲" })).toBeFocused();
    expect(await sub(page).evaluate((el) => el.matches(":popover-open"))).toBe(true);
    // The parent stays open, and the flyout sits beside it with its first row level with the item.
    await expect(page.getByTestId("task-menu")).toBeVisible();
    const parent = (await page.getByTestId("task-menu").boundingBox())!;
    const flyout = (await menu.boundingBox())!;
    const item = (await subItem(page).boundingBox())!;
    expect(flyout.x + flyout.width <= parent.x + 4 || flyout.x >= parent.x + parent.width - 4).toBe(true);
    expect(Math.abs(flyout.y - item.y)).toBeLessThanOrEqual(8);
  });

  test("↓ ↑ stay inside the submenu; ← and Escape close only the submenu and return to its item", async ({ page }) => {
    await toSubItem(page);
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowUp");
    await expect(page.getByRole("menuitem", { name: "担当者なし" })).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(subItem(page)).toBeFocused();
    expect(await isOpen(page)).toBe(false);
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menuitem", { name: "佐藤 美咲" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(subItem(page)).toBeFocused();
    expect(await isOpen(page)).toBe(false);
    await expect(page.getByTestId("task-menu")).toBeVisible();
  });

  test("choosing an item in the submenu closes every menu and returns focus to the trigger", async ({ page }) => {
    await toSubItem(page);
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("task-menu")).toBeHidden();
    expect(await isOpen(page)).toBe(false);
    await expect(page.getByTestId("sub-menu-trigger")).toBeFocused();
  });

  test("a mouse opens it on hover, keeps it while heading for it, and closes it on another item", async ({ page }) => {
    await page.getByTestId("sub-menu-trigger").click();
    const item = (await subItem(page).boundingBox())!;
    await page.mouse.move(item.x + item.width / 2, item.y + item.height / 2);
    const menu = page.getByRole("menu", { name: "担当者を変える" });
    await expect(menu).toBeVisible();
    // Travel diagonally into the flyout, crossing the next row on the way.
    const flyout = (await menu.boundingBox())!;
    const target = { x: flyout.x + flyout.width / 2, y: flyout.y + flyout.height - 8 };
    await page.mouse.move(target.x, target.y, { steps: 12 });
    await page.waitForTimeout(300);
    await expect(menu).toBeVisible();
    // Resting on another item of the parent closes it.
    const other = (await page.getByRole("menuitem", { name: "編集する" }).last().boundingBox())!;
    await page.mouse.move(other.x + other.width / 2, other.y + other.height / 2, { steps: 4 });
    await expect(menu).toBeHidden();
    // Clicking the item opens it too, and a second click keeps it open.
    await subItem(page).click();
    await expect(menu).toBeVisible();
    await subItem(page).click();
    await expect(menu).toBeVisible();
  });
});

test.describe("narrow screens", () => {
  test.use({ viewport: { width: 390, height: 760 } });

  test("it opens in place under the item, and a tap toggles it", async ({ page }) => {
    await page.getByTestId("sub-menu-trigger").click();
    await subItem(page).click();
    const menu = page.getByRole("menu", { name: "担当者を変える" });
    await expect(menu).toBeVisible();
    await expect(subItem(page)).toHaveAttribute("aria-expanded", "true");
    expect(await sub(page).evaluate((el) => el.matches(":popover-open"))).toBe(false);
    // In the flow of the parent menu: directly under the item and inside the parent's box.
    const parent = (await page.getByTestId("task-menu").boundingBox())!;
    const box = (await menu.boundingBox())!;
    const item = (await subItem(page).boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(item.y + item.height - 1);
    expect(box.x).toBeGreaterThan(parent.x);
    expect(box.x + box.width).toBeLessThanOrEqual(parent.x + parent.width);
    await subItem(page).click();
    await expect(menu).toBeHidden();
    await expect(subItem(page)).toHaveAttribute("aria-expanded", "false");
  });

  test("the keyboard works the same way in place", async ({ page }) => {
    await toSubItem(page);
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("menuitem", { name: "佐藤 美咲" })).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(subItem(page)).toBeFocused();
    await expect(page.getByRole("menu", { name: "担当者を変える" })).toBeHidden();
    // Closing the menu resets the submenu for the next open.
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Tab");
    await expect(page.getByTestId("task-menu")).toBeHidden();
    await page.getByTestId("sub-menu-trigger").click();
    await expect(page.getByRole("menu", { name: "担当者を変える" })).toBeHidden();
  });
});
