import { expect, test, type Page } from "@playwright/test";

const noWebFonts = (page: Page) => page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());

for (const javaScriptEnabled of [true, false]) {
  test.describe(`Next.js server components, JavaScript ${javaScriptEnabled ? "on" : "off"}`, () => {
    test.use({ javaScriptEnabled, reducedMotion: "reduce" });

    test.beforeEach(async ({ page }) => {
      await noWebFonts(page);
      await page.goto("/");
    });

    test("the dialog opens modally, focuses the safe action and closes with Escape", async ({ page }) => {
      await page.getByTestId("open-confirm").focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("dialog#confirm-delete")).toBeVisible();
      await expect(page.getByTestId("cancel-delete")).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(page.locator("dialog#confirm-delete")).toBeHidden();
      await expect(page.getByTestId("open-confirm")).toBeFocused();
    });

    test("the popover opens under its trigger and light-dismisses", async ({ page }) => {
      const trigger = page.getByTestId("open-filters");
      await trigger.click();
      const popover = page.getByTestId("filters");
      await expect(popover).toBeVisible();
      const t = (await trigger.boundingBox())!;
      const p = (await popover.boundingBox())!;
      expect(p.y).toBeGreaterThanOrEqual(t.y + t.height);
      expect(Math.abs(p.x - t.x)).toBeLessThanOrEqual(1);
      await page.mouse.click(5, 5);
      await expect(popover).toBeHidden();
    });

    test("Field, Checkbox and Switch are wired on the server", async ({ page }) => {
      const email = page.getByRole("textbox", { name: "メールアドレス" });
      await expect(email).toHaveAccessibleDescription("受付完了のお知らせを送ります。");
      await expect(email).toHaveAttribute("required", "");
      await page.getByText("利用規約に同意する").click();
      await expect(page.getByRole("checkbox", { name: "利用規約に同意する" })).toBeChecked();
      await expect(page.getByRole("switch", { name: "リマインダー", exact: true })).toHaveAccessibleDescription("締め切りの前日にお知らせします。");
    });

    test("tabs render the selected panel and the accordion keeps one item open", async ({ page }) => {
      await expect(page.getByRole("tabpanel", { name: "リスト" })).toBeVisible();
      await expect(page.locator("#views-panel-board")).toBeHidden();
      const items = page.getByTestId("faq").locator("details");
      await page.getByText("コンポーネントのコードはブラウザに送られますか？").click();
      await expect(items.nth(1)).toHaveAttribute("open", "");
      await expect(items.nth(0)).not.toHaveAttribute("open");
    });

    test("the menu opens from its trigger", async ({ page }) => {
      await page.getByTestId("open-menu").click();
      await expect(page.getByRole("menu", { name: "プロジェクトの操作" })).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("menu", { name: "プロジェクトの操作" })).toBeHidden();
    });
  });
}

test.describe("Next.js with the runtime", () => {
  test.use({ reducedMotion: "reduce" });

  test("no component code reaches the browser; only the optional runtime does", async ({ page }) => {
    await noWebFonts(page);
    await page.goto("/", { waitUntil: "networkidle" });
    const urls = await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .filter((e) => (e as PerformanceResourceTiming).initiatorType === "script")
        .map((e) => e.name),
    );
    expect(urls.length).toBeGreaterThan(0);
    const all = (await Promise.all(urls.map((u) => page.request.get(u).then((r) => r.text())))).join("\n");
    // String literals that exist only in component source (they survive minification).
    for (const marker of ["accordion-trigger", "field-required", "card-header", "dialog-actions", "Tabs.Tab must be"]) {
      expect(all, `component code "${marker}" was shipped`).not.toContain(marker);
    }
    // The runtime is there (its tabs behavior announces changes with this event).
    expect(all).toContain("ur-tabs-change");
  });

  test("the runtime adds tab and menu keyboard behavior to server-rendered markup", async ({ page }) => {
    await noWebFonts(page);
    await page.goto("/");
    await page.getByRole("tab", { name: "ボード" }).click();
    await expect(page.getByRole("tabpanel", { name: "ボード" })).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("tab", { name: "リスト" })).toBeFocused();
    await expect(page.getByRole("tabpanel", { name: "リスト" })).toBeVisible();
    await page.getByTestId("open-menu").focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitem", { name: "複製する" })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitem", { name: "書き出す" })).toBeFocused();
  });
});
