import { expect, test, type Page } from "@playwright/test";

// Drawer and Item on the gallery page, in all three engines.
const noWebFonts = (page: Page) => page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());

test.use({ reducedMotion: "reduce" });

const drawer = (page: Page) => page.getByRole("dialog", { name: "予定を追加" });

test.beforeEach(async ({ page }) => {
  await noWebFonts(page);
  await page.goto("/components.html");
  await expect(page.locator("html")).toHaveAttribute("data-urushi-runtime", "ready", { timeout: 20_000 });
});

async function open(page: Page) {
  await page.getByTestId("open-drawer").click();
  await expect(drawer(page)).toBeVisible();
  const box = (await drawer(page).boundingBox())!;
  // It sits on the bottom edge.
  expect(Math.round(box.y + box.height)).toBe(page.viewportSize()!.height);
  return box;
}

/** Drag from the handle by dy pixels, in steps so the pointer has a speed. */
async function dragHandle(page: Page, dy: number, steps = 12) {
  const handle = (await drawer(page).locator('[data-slot="drawer-handle"]').boundingBox())!;
  const x = handle.x + handle.width / 2;
  const y = handle.y + handle.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + dy, { steps });
  return { x, y };
}

test("opens from its trigger, takes focus, and closes with Escape and its close button", async ({ page }) => {
  await open(page);
  await expect(page.getByRole("textbox", { name: /題名/ })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(drawer(page)).toBeHidden();
  await expect(page.getByTestId("open-drawer")).toBeFocused();
  await open(page);
  await drawer(page).getByRole("button", { name: "やめる" }).click();
  await expect(drawer(page)).toBeHidden();
});

test("follows a drag down and closes past a quarter of its height", async ({ page }) => {
  const box = await open(page);
  await dragHandle(page, box.height / 2);
  // While the pointer is down the drawer moves with it.
  await expect(drawer(page)).toHaveAttribute("data-dragging", "");
  const moved = (await drawer(page).boundingBox())!;
  expect(moved.y - box.y).toBeGreaterThan(box.height / 2 - 4);
  await page.mouse.up();
  await expect(drawer(page)).toBeHidden();
});

test("springs back after a short slow drag, and a click on the title does not move it", async ({ page }) => {
  const box = await open(page);
  const { x, y } = await dragHandle(page, 30, 30);
  // Hold still so the release has no speed.
  await page.mouse.move(x, y + 30, { steps: 5 });
  await page.waitForTimeout(100);
  await page.mouse.move(x, y + 30);
  await page.mouse.up();
  await expect(drawer(page)).toBeVisible();
  await expect(drawer(page)).not.toHaveAttribute("data-dragging");
  await expect.poll(async () => Math.round((await drawer(page).boundingBox())!.y)).toBe(Math.round(box.y));
  await drawer(page).getByRole("heading", { name: "予定を追加" }).click();
  await expect(drawer(page)).toBeVisible();
  expect(Math.round((await drawer(page).boundingBox())!.y)).toBe(Math.round(box.y));
});

test("a drag that starts in the form does not move it", async ({ page }) => {
  const box = await open(page);
  const field = (await page.getByRole("textbox", { name: /題名/ }).boundingBox())!;
  await page.mouse.move(field.x + 10, field.y + field.height / 2);
  await page.mouse.down();
  await page.mouse.move(field.x + 10, field.y + 200, { steps: 10 });
  await page.mouse.up();
  await expect(drawer(page)).toBeVisible();
  expect(Math.round((await drawer(page).boundingBox())!.y)).toBe(Math.round(box.y));
});

test("Item rows: a list with one link row and its own controls", async ({ page }) => {
  const list = page.getByRole("list", { name: "アカウントの設定" });
  await expect(list.getByRole("listitem")).toHaveCount(3);
  await expect(list.getByRole("link", { name: /完了したタスク/ })).toHaveAttribute("href", "#item");
  await expect(list.getByRole("switch", { name: "締め切りの前日に知らせる" })).toBeChecked();
  await list.getByRole("switch", { name: "締め切りの前日に知らせる" }).click();
  await expect(list.getByRole("switch", { name: "締め切りの前日に知らせる" })).not.toBeChecked();
});
