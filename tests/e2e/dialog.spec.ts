import { expect, test, type Page } from "@playwright/test";

const dialog = (page: Page, id: string) => page.locator(`dialog#${id}`);
const isModal = (page: Page, id: string) => page.evaluate((i) => document.getElementById(i)!.matches(":modal"), id);
/** Activates a button without scrolling (element.click() runs the invoker command). */
const press = (page: Page, testId: string) =>
  page.evaluate((t) => document.querySelector<HTMLButtonElement>(`[data-testid="${t}"]`)!.click(), testId);

// Web fonts arrive late and shift layout; tests run on system fonts so
// measurements are deterministic.
const noWebFonts = (page: Page) => page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());

test.beforeEach(async ({ page }) => {
  await noWebFonts(page);
  await page.goto("/");
});

test("a trigger opens a modal dialog without app JavaScript and focuses the autofocus element", async ({ page }) => {
  await page.getByTestId("open-confirm").click();
  await expect(dialog(page, "confirm-delete")).toBeVisible();
  expect(await isModal(page, "confirm-delete")).toBe(true);
  await expect(page.getByTestId("cancel-delete")).toBeFocused();
});

test("the dialog exposes its title and description", async ({ page }) => {
  await page.getByTestId("open-confirm").click();
  const d = page.getByRole("dialog", { name: "「秋のキャンペーン」を削除しますか？" });
  await expect(d).toBeVisible();
  await expect(d).toHaveAccessibleDescription("タスク 5 件とコメントがすべて消えます。この操作は取り消せません。");
});

test("Escape closes the dialog and focus returns to the trigger", async ({ page }) => {
  const trigger = page.getByTestId("open-confirm");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(dialog(page, "confirm-delete")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog(page, "confirm-delete")).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("a close button closes the dialog and focus returns to the trigger", async ({ page }) => {
  // Keyboard activation: Safari never focuses a button on mouse click, so there
  // is no focused trigger to return to after a mouse-only flow (platform behavior).
  const trigger = page.getByTestId("open-confirm");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await page.getByTestId("cancel-delete").click();
  await expect(dialog(page, "confirm-delete")).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("focus cannot leave the modal and the page behind it cannot be hit", async ({ page }) => {
  await page.getByTestId("open-new-task").click();
  await expect(dialog(page, "new-task")).toBeVisible();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    const inside = await page.evaluate(() => {
      const active = document.activeElement;
      return active === null || active === document.body || document.getElementById("new-task")!.contains(active);
    });
    expect(inside, `focus escaped after ${i + 1} Tab presses`).toBe(true);
  }
  const hitsBackground = await page.evaluate(() => {
    const r = document.querySelector('[data-testid="background-button"]')!.getBoundingClientRect();
    const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return Boolean(el?.closest('[data-testid="background-button"]'));
  });
  expect(hitsBackground).toBe(false);
});

test("the page does not scroll or shift while a modal is open", async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 520 });
  await page.evaluate(() => window.scrollTo(0, 240));
  const widthBefore = await page.evaluate(() => document.documentElement.clientWidth);
  await press(page, "open-new-task");
  await expect(dialog(page, "new-task")).toBeVisible();
  const y = await page.evaluate(() => window.scrollY);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe("hidden");
  await page.mouse.move(20, 300);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => window.scrollY)).toBe(y);
  expect(await page.evaluate(() => document.documentElement.clientWidth)).toBe(widthBefore);
});

test('dismissible="any": a click on the backdrop closes the dialog', async ({ page }) => {
  await page.getByTestId("open-confirm").click();
  await expect(dialog(page, "confirm-delete")).toBeVisible();
  await page.mouse.click(8, 8);
  await expect(dialog(page, "confirm-delete")).toBeHidden();
});

test('dismissible="none": Escape and backdrop clicks are ignored, the close button works', async ({ page }) => {
  await page.getByTestId("open-new-task").click();
  await expect(dialog(page, "new-task")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog(page, "new-task")).toBeVisible();
  await page.mouse.click(8, 8);
  await expect(dialog(page, "new-task")).toBeVisible();
  await page.getByTestId("new-task-cancel").click();
  await expect(dialog(page, "new-task")).toBeHidden();
});

test("a form with method=dialog closes the dialog on submit", async ({ page }) => {
  await page.getByTestId("open-new-task").click();
  await page.getByTestId("task-title").fill("告知メールを送る");
  await page.getByTestId("new-task-save").click();
  await expect(dialog(page, "new-task")).toBeHidden();
});

test("a dialog inside a nested pack inherits that pack's tokens in the top layer", async ({ page }) => {
  const radius = (selector: string) =>
    page.evaluate((s) => getComputedStyle(document.querySelector(s)!).borderTopLeftRadius, selector);
  await page.locator('[data-testid="preview"] [data-slot~="dialog-trigger"]').click();
  await expect(dialog(page, "nested-dialog")).toBeVisible();
  const nested = await radius("#nested-dialog");
  await page.keyboard.press("Escape");
  await page.getByTestId("open-confirm").click();
  const page_ = await radius("#confirm-delete");
  expect(nested).not.toBe(page_);
});
