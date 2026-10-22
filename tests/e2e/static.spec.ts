import { expect, test, type Page } from "@playwright/test";

// Web fonts arrive late and shift layout; tests run on system fonts so
// measurements are deterministic.
const noWebFonts = (page: Page) => page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());


// The static page is the playground scene rendered to HTML with zero <script>
// tags. JavaScript is also disabled in the browser.
test.use({ javaScriptEnabled: false, reducedMotion: "reduce" });

test.beforeEach(async ({ page }) => {
  await noWebFonts(page);
  await page.setViewportSize({ width: 1280, height: 860 });
  await page.goto("/static/index.html");
});

test("the page ships no scripts", async ({ page }) => {
  expect(await page.locator("script").count()).toBe(0);
});

test("a dialog opens, traps focus and closes with JavaScript disabled", async ({ page }) => {
  await page.getByTestId("open-confirm").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("dialog#confirm-delete")).toBeVisible();
  await expect(page.getByTestId("cancel-delete")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog#confirm-delete")).toBeHidden();
  await expect(page.getByTestId("open-confirm")).toBeFocused();
});

test("a popover opens next to its trigger and light-dismisses with JavaScript disabled", async ({ page }) => {
  const trigger = page.getByTestId("open-filters");
  await trigger.click();
  const popover = page.getByTestId("filters");
  await expect(popover).toBeVisible();
  const t = (await trigger.boundingBox())!;
  const p = (await popover.boundingBox())!;
  expect(p.y).toBeGreaterThanOrEqual(t.y + t.height);
  expect(p.y - (t.y + t.height)).toBeLessThanOrEqual(16);
  await page.keyboard.press("Escape");
  await expect(popover).toBeHidden();
});

test("a form inside a dialog submits and closes with JavaScript disabled", async ({ page }) => {
  await page.getByTestId("open-new-task").click();
  await page.getByTestId("task-title").fill("告知メールを送る");
  await page.getByTestId("new-task-save").click();
  await expect(page.locator("dialog#new-task")).toBeHidden();
});

test.describe("component gallery with JavaScript disabled", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/static/components.html");
  });

  test("ships no scripts", async ({ page }) => {
    expect(await page.locator("script").count()).toBe(0);
  });

  test("exclusive accordion items open and close each other", async ({ page }) => {
    const items = page.getByTestId("faq").locator("details");
    await page.getByText("1 つだけ開くようにするには？").click();
    await expect(items.nth(1)).toHaveAttribute("open", "");
    await expect(items.nth(0)).not.toHaveAttribute("open");
  });

  test("a menu opens from its trigger and light-dismisses", async ({ page }) => {
    await page.getByTestId("menu-trigger").click();
    const menu = page.getByRole("menu", { name: "タスクの操作" });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("menuitem")).toHaveCount(4);
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });

  test("a dialog with a form opens through invoker commands", async ({ page }) => {
    await page.getByTestId("open-invite").click();
    await expect(page.locator("dialog#g-invite")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "メールアドレス" }).last()).toBeVisible();
  });

  test("tabs show the server-selected panel", async ({ page }) => {
    await expect(page.getByRole("tabpanel", { name: "概要" })).toBeVisible();
    await expect(page.locator("#project-tabs-panel-tasks")).toBeHidden();
  });

  test("checkboxes, switches, radios and selects work", async ({ page }) => {
    await page.getByText("利用規約に同意する").click();
    await expect(page.getByRole("checkbox", { name: "利用規約に同意する" })).toBeChecked();
    await page.getByText("週末も通知する").click();
    await expect(page.getByRole("switch", { name: "週末も通知する" })).toBeChecked();
    await page.getByRole("radio", { name: "全員", exact: true }).check();
    await expect(page.getByRole("radio", { name: "チーム内", exact: true })).not.toBeChecked();
    await page.getByTestId("assignee").selectOption("takahashi");
    await expect(page.getByTestId("assignee")).toHaveValue("takahashi");
  });

  test("a textarea grows with its content", async ({ page }) => {
    const notes = page.getByTestId("notes");
    const before = (await notes.boundingBox())!.height;
    await notes.fill("1\n2\n3\n4\n5\n6\n7\n8");
    await expect.poll(async () => (await notes.boundingBox())!.height).toBeGreaterThan(before + 40);
  });

  test("a tooltip shows on hover through interest invokers (Chromium)", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "interestfor ships in Chromium only; other engines use the runtime");
    await page.getByTestId("tip-trigger").hover();
    await expect(page.getByTestId("tip-copy")).toBeVisible({ timeout: 3000 });
  });
});
