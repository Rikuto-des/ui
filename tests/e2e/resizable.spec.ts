import { expect, test, type Page } from "@playwright/test";

// Resizable on the gallery page, in all three engines (WAI-ARIA window splitter).
const noWebFonts = (page: Page) => page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());

test.use({ reducedMotion: "reduce" });

const handle = (page: Page) => page.getByRole("separator", { name: "一覧の幅" });
const firstPane = (page: Page) => page.getByTestId("split").locator('[data-slot="resizable-panel"]').first();
const share = async (page: Page) => {
  const pane = (await firstPane(page).boundingBox())!;
  const group = (await page.getByTestId("split").locator('[data-slot="resizable"]').boundingBox())!;
  return (pane.width / group.width) * 100;
};

test.beforeEach(async ({ page }) => {
  await noWebFonts(page);
  await page.goto("/components.html");
  await expect(page.locator("html")).toHaveAttribute("data-urushi-runtime", "ready", { timeout: 20_000 });
});

test("the handle is a focusable separator with its value from the server", async ({ page }) => {
  await expect(handle(page)).toHaveAttribute("aria-valuenow", "38");
  await expect(handle(page)).toHaveAttribute("aria-valuemin", "25");
  await expect(handle(page)).toHaveAttribute("aria-valuemax", "70");
  await expect(handle(page)).toHaveAttribute("aria-orientation", "vertical");
  expect(Math.round(await share(page))).toBe(38);
});

test("the arrow keys move it by 2%, with Shift by 10%, and Home End go to the limits", async ({ page }) => {
  await handle(page).focus();
  await page.keyboard.press("ArrowRight");
  await expect(handle(page)).toHaveAttribute("aria-valuenow", "40");
  await page.keyboard.press("Shift+ArrowLeft");
  await expect(handle(page)).toHaveAttribute("aria-valuenow", "30");
  await page.keyboard.press("End");
  await expect(handle(page)).toHaveAttribute("aria-valuenow", "70");
  expect(Math.round(await share(page))).toBe(70);
  await page.keyboard.press("ArrowRight");
  await expect(handle(page)).toHaveAttribute("aria-valuenow", "70");
  await page.keyboard.press("Home");
  await expect(handle(page)).toHaveAttribute("aria-valuenow", "25");
});

test("dragging follows the pointer and stops at the limits", async ({ page }) => {
  await handle(page).scrollIntoViewIfNeeded();
  const group = (await page.getByTestId("split").locator('[data-slot="resizable"]').boundingBox())!;
  const box = (await handle(page).boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(handle(page)).toBeFocused();
  await page.mouse.move(group.x + group.width * 0.55, box.y + 20, { steps: 8 });
  await expect(handle(page)).toHaveAttribute("data-dragging", "");
  await expect(handle(page)).toHaveAttribute("aria-valuenow", "55");
  await page.mouse.move(group.x + group.width * 0.95, box.y + 20, { steps: 4 });
  await expect(handle(page)).toHaveAttribute("aria-valuenow", "70");
  await page.mouse.up();
  await expect(handle(page)).not.toHaveAttribute("data-dragging");
  expect(Math.round(await share(page))).toBe(70);
});

test("in right-to-left text, → shrinks the first pane (it is on the right)", async ({ page }) => {
  await page.getByTestId("split").evaluate((el) => el.setAttribute("dir", "rtl"));
  await handle(page).focus();
  await page.keyboard.press("ArrowRight");
  await expect(handle(page)).toHaveAttribute("aria-valuenow", "36");
  const pane = (await firstPane(page).boundingBox())!;
  const group = (await page.getByTestId("split").locator('[data-slot="resizable"]').boundingBox())!;
  expect(Math.round(pane.x + pane.width)).toBe(Math.round(group.x + group.width));
});

test("a vertical split moves with ↑ ↓", async ({ page }) => {
  const editor = page.getByRole("separator", { name: "エディターの高さ" });
  await expect(editor).toHaveAttribute("aria-orientation", "horizontal");
  await editor.focus();
  await page.keyboard.press("ArrowDown");
  await expect(editor).toHaveAttribute("aria-valuenow", "57");
  await page.keyboard.press("ArrowLeft");
  await expect(editor).toHaveAttribute("aria-valuenow", "57");
});
