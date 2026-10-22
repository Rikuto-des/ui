import { expect, test, type Page } from "@playwright/test";

// Behavior of the Phase 1 components on the gallery page, in all three engines.
const noWebFonts = (page: Page) => page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());

test.use({ reducedMotion: "reduce" });

test.beforeEach(async ({ page }) => {
  await noWebFonts(page);
  await page.goto("/components.html");
});

test.describe("Field", () => {
  test("links the label, hint and error to the control", async ({ page }) => {
    const email = page.getByRole("textbox", { name: "メールアドレス" });
    await expect(email).toHaveAccessibleDescription("受付完了のお知らせを送ります。");
    const code = page.getByRole("textbox", { name: "招待コード" });
    await expect(code).toHaveAttribute("aria-invalid", "true");
    await expect(code).toHaveAccessibleDescription(/コードが見つかりません/);
    // "必須" is visual only; the control itself is required.
    await expect(page.getByRole("textbox", { name: "氏名", exact: true })).toHaveAttribute("required", "");
  });

  test("clicking the label focuses the control", async ({ page }) => {
    await page.locator('label[for="g-email"]').click();
    await expect(page.locator("#g-email")).toBeFocused();
  });

  test("a hidden label still names the control", async ({ page }) => {
    await expect(page.getByRole("textbox", { name: "小", exact: true })).toBeVisible();
    await expect(page.locator('label[for="g-size-sm"]')).toHaveCSS("clip-path", "inset(50%)");
  });
});

test("Textarea grows with its content without JavaScript", async ({ page }) => {
  const notes = page.getByTestId("notes");
  const before = (await notes.boundingBox())!.height;
  await notes.fill(["1", "2", "3", "4", "5", "6", "7", "8"].join("\n"));
  await expect.poll(async () => (await notes.boundingBox())!.height).toBeGreaterThan(before + 40);
});

test("Select starts on its placeholder and takes a value", async ({ page }) => {
  const select = page.getByTestId("assignee");
  await expect(select).toHaveValue("");
  await expect(select.locator("option").first()).toBeDisabled();
  await select.selectOption("suzuki");
  await expect(select).toHaveValue("suzuki");
});

test.describe("Checkbox and Switch", () => {
  test("the whole label toggles the box, and Space toggles it from the keyboard", async ({ page }) => {
    const agree = page.getByRole("checkbox", { name: "利用規約に同意する" });
    await page.getByText("利用規約に同意する").click();
    await expect(agree).toBeChecked();
    await agree.focus();
    await page.keyboard.press("Space");
    await expect(agree).not.toBeChecked();
    await expect(page.getByRole("checkbox", { name: "管理者だけが変更できます" })).toBeDisabled();
  });

  test("the description is announced as the description, not in the name", async ({ page }) => {
    const remind = page.getByRole("checkbox", { name: "リマインダーを受け取る", exact: true });
    await expect(remind).toBeChecked();
    await expect(remind).toHaveAccessibleDescription("締め切りの 1 日前にお知らせします。");
    const notify = page.getByRole("switch", { name: "メール通知", exact: true });
    await expect(notify).toHaveAccessibleDescription("新しいコメントが付いたときに届きます。");
  });

  test("a switch is a native checkbox exposed as a switch", async ({ page }) => {
    const weekend = page.getByRole("switch", { name: "週末も通知する" });
    await expect(weekend).not.toBeChecked();
    await page.getByText("週末も通知する").click();
    await expect(weekend).toBeChecked();
  });
});

test.describe("RadioGroup", () => {
  test("is a named group whose items share one name", async ({ page }) => {
    const group = page.getByRole("group", { name: "公開範囲" });
    await expect(group.getByRole("radio")).toHaveCount(3);
    await expect(group.getByRole("radio", { name: "チーム内", exact: true })).toBeChecked();
    await expect(group.getByRole("radio", { name: "全員", exact: true })).toHaveAccessibleDescription("URL を知っている人なら誰でも見られます。");
    for (const radio of await group.getByRole("radio").all()) await expect(radio).toHaveAttribute("name", "visibility");
  });

  test("arrow keys move the selection (browser behavior)", async ({ page }) => {
    const group = page.getByRole("group", { name: "優先度" });
    await group.getByRole("radio", { name: "中" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(group.getByRole("radio", { name: "低" })).toBeChecked();
    await expect(group.getByRole("radio", { name: "低" })).toBeFocused();
  });
});

test.describe("Accordion", () => {
  test("opening one item closes the others (exclusive details)", async ({ page }) => {
    const items = page.getByTestId("faq").locator("details");
    await expect(items.nth(0)).toHaveAttribute("open", "");
    await page.getByText("1 つだけ開くようにするには？").click();
    await expect(items.nth(1)).toHaveAttribute("open", "");
    await expect(items.nth(0)).not.toHaveAttribute("open");
  });

  test("toggles from the keyboard", async ({ page }) => {
    const summary = page.getByTestId("faq").locator("summary").nth(2);
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("faq").locator("details").nth(2)).toHaveAttribute("open", "");
    await expect(page.getByText("対応するブラウザでは高さがなめらかに変わります", { exact: false })).toBeVisible();
  });
});

test.describe("Tabs", () => {
  test("renders the selected tab and panel from the server", async ({ page }) => {
    const tabs = page.getByRole("tablist", { name: "プロジェクト" });
    await expect(tabs.getByRole("tab", { name: "概要" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel", { name: "概要" })).toBeVisible();
    await expect(page.locator("#project-tabs-panel-tasks")).toBeHidden();
  });

  test("switches on click and follows the arrow keys, Home and End", async ({ page }) => {
    const tabs = page.getByRole("tablist", { name: "プロジェクト" });
    await tabs.getByRole("tab", { name: "タスク" }).click();
    await expect(page.getByRole("tabpanel", { name: "タスク" })).toBeVisible();
    await expect(page.getByRole("tabpanel", { name: "概要" })).toBeHidden();
    await page.keyboard.press("ArrowRight");
    await expect(tabs.getByRole("tab", { name: "メンバー" })).toBeFocused();
    await expect(tabs.getByRole("tab", { name: "メンバー" })).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowRight");
    await expect(tabs.getByRole("tab", { name: "概要" })).toBeFocused();
    await page.keyboard.press("End");
    await expect(tabs.getByRole("tab", { name: "メンバー" })).toBeFocused();
    await page.keyboard.press("Home");
    await expect(tabs.getByRole("tab", { name: "概要" })).toHaveAttribute("aria-selected", "true");
    // Only the selected tab is in the tab order; Tab moves into the panel.
    await page.keyboard.press("Tab");
    await expect(page.getByRole("tabpanel", { name: "概要" })).toBeFocused();
  });
});

test.describe("Tabs indicator", () => {
  const box = async (page: Page, selector: string) => (await page.locator(selector).boundingBox())!;

  test("one background sits under the selected tab and follows the selection", async ({ page }) => {
    const indicator = page.locator('#project-tabs [data-slot="tabs-indicator"]');
    await expect(indicator).toHaveAttribute("aria-hidden", "true");
    // It is not a tab: the list still has exactly its three tabs.
    await expect(page.getByRole("tablist", { name: "プロジェクト" }).getByRole("tab")).toHaveCount(3);
    for (const value of ["overview", "members"]) {
      await page.locator(`#project-tabs-tab-${value}`).click();
      await expect
        .poll(async () => {
          const [i, t] = [await box(page, '#project-tabs [data-slot="tabs-indicator"]'), await box(page, `#project-tabs-tab-${value}`)];
          return [Math.round(i.x - t.x), Math.round(i.y - t.y), Math.round(i.width - t.width), Math.round(i.height - t.height)];
        })
        .toEqual([0, 0, 0, 0]);
    }
  });

  test("each Tabs gets its own anchor name, from its id", async ({ page }) => {
    await expect(page.locator('#project-tabs [data-slot="tabs-list"]')).toHaveAttribute("style", /--yl-tabs-anchor:\s*--yl-anchor-project-tabs-selected/);
  });
});

test.describe("Menu", () => {
  test("opens on the first item, moves with the arrows and returns focus on Escape", async ({ page }) => {
    const trigger = page.getByTestId("menu-trigger");
    await expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    // Keyboard: Safari does not focus a button on click, so focus could not return to it.
    await trigger.focus();
    await page.keyboard.press("Enter");
    const menu = page.getByRole("menu", { name: "タスクの操作" });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: "編集する" })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(menu.getByRole("menuitem", { name: "複製する" })).toBeFocused();
    await page.keyboard.press("End");
    await expect(menu.getByRole("menuitem", { name: "削除する" })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(menu.getByRole("menuitem", { name: "編集する" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("ArrowUp on the trigger opens on the last item; typing jumps to an item", async ({ page }) => {
    await page.getByTestId("menu-trigger").focus();
    await page.keyboard.press("ArrowUp");
    const menu = page.getByRole("menu", { name: "タスクの操作" });
    await expect(menu.getByRole("menuitem", { name: "削除する" })).toBeFocused();
    // Playwright cannot press keys outside the US layout; send the keydown directly.
    await page.evaluate(() =>
      document.activeElement?.dispatchEvent(new KeyboardEvent("keydown", { key: "履", bubbles: true })),
    );
    await expect(menu.getByRole("menuitem", { name: "履歴を見る" })).toBeFocused();
  });

  test("a click opens it with focus on the first item", async ({ page }) => {
    await page.getByTestId("menu-trigger").click();
    await expect(page.getByRole("menuitem", { name: "編集する" })).toBeFocused();
  });

  test("choosing an item closes the menu; the separator is not an item", async ({ page }) => {
    await page.getByTestId("menu-trigger").click();
    const menu = page.getByRole("menu", { name: "タスクの操作" });
    await expect(menu.getByRole("menuitem")).toHaveCount(4);
    await expect(menu.getByRole("separator")).toHaveCount(1);
    await menu.getByRole("menuitem", { name: "複製する" }).click();
    await expect(menu).toBeHidden();
  });

  test("opens next to its trigger", async ({ page }) => {
    const trigger = page.getByTestId("menu-trigger");
    await trigger.click();
    const t = (await trigger.boundingBox())!;
    const m = (await page.getByTestId("row-menu").boundingBox())!;
    expect(m.y).toBeGreaterThanOrEqual(t.y + t.height - 1);
    expect(m.y - (t.y + t.height)).toBeLessThanOrEqual(12);
    // align="end": the menu's end edge lines up with the trigger's.
    expect(Math.abs(m.x + m.width - (t.x + t.width))).toBeLessThanOrEqual(2);
  });
});

test.describe("Tooltip", () => {
  test("describes its trigger and shows on keyboard focus", async ({ page }) => {
    const trigger = page.getByTestId("tip-trigger");
    await expect(trigger).toHaveAccessibleName("リンクをコピー");
    await expect(trigger).toHaveAccessibleDescription("共有用の URL をクリップボードに入れます");
    // A key press first, so the focus that follows counts as keyboard focus
    // (:focus-visible). Tab itself skips buttons in Safari by default.
    await page.keyboard.press("Shift");
    await trigger.focus();
    await expect(trigger).toBeFocused();
    await expect(page.getByTestId("tip-copy")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("tip-copy")).toBeHidden();
  });

  test("shows on hover above the trigger and hides when the pointer leaves", async ({ page }) => {
    const trigger = page.getByTestId("tip-trigger");
    await trigger.hover();
    const tip = page.getByTestId("tip-copy");
    await expect(tip).toBeVisible({ timeout: 3000 });
    const t = (await trigger.boundingBox())!;
    const b = (await tip.boundingBox())!;
    expect(b.y + b.height).toBeLessThanOrEqual(t.y + 1);
    await page.mouse.move(5, 5);
    await expect(tip).toBeHidden({ timeout: 3000 });
  });
});

test.describe("Toast", () => {
  test("announces through a polite live region and can be dismissed", async ({ page }) => {
    const region = page.getByRole("region", { name: "通知" });
    await page.getByTestId("toast-error").click();
    const toast = region.getByRole("listitem").filter({ hasText: "送信できませんでした" });
    await expect(toast).toBeVisible();
    await expect(region.locator('[aria-live="polite"]')).toContainText("送信できませんでした");
    await toast.getByRole("button", { name: "通知を閉じる" }).click();
    await expect(toast).toHaveCount(0);
  });

  test("runs its action and hides by itself", async ({ page }) => {
    await page.clock.install();
    await page.getByTestId("toast-undo").click();
    const region = page.getByRole("region", { name: "通知" });
    await region.getByRole("button", { name: "元に戻す" }).click();
    await expect(region.getByText("タスクを元に戻しました")).toBeVisible();
    await expect(region.getByText("タスクを削除しました")).toHaveCount(0);
    // Hovering pauses a toast; move the pointer off it first.
    await page.mouse.move(5, 5);
    await page.clock.runFor(6000);
    await expect(region.getByText("タスクを元に戻しました")).toHaveCount(0);
  });

  test("appears above an open modal dialog and stays operable", async ({ page }) => {
    await page.getByTestId("open-invite").click();
    await expect(page.locator("dialog#g-invite")).toBeVisible();
    await page.evaluate(() => (window as unknown as { yourlibToast: (m: string) => void }).yourlibToast("ダイアログの上に出ます"));
    // It lands in an outlet inside the dialog: outside it would be inert.
    const toast = page.locator("dialog#g-invite").getByRole("region", { name: "通知" }).getByText("ダイアログの上に出ます");
    await expect(toast).toBeVisible();
    const box = (await toast.boundingBox())!;
    const hit = await page.evaluate(
      ([x, y]) => document.elementFromPoint(x, y)?.closest('[data-slot="toast"]') !== null,
      [box.x + 4, box.y + box.height / 2],
    );
    expect(hit).toBe(true);
    await toast.locator("xpath=ancestor::li").getByRole("button", { name: "通知を閉じる" }).click();
    await expect(toast).toHaveCount(0);
    await expect(page.locator("dialog#g-invite")).toBeVisible();
  });

  test("toasts left in a dialog move back to the page when it closes", async ({ page }) => {
    await page.getByTestId("open-invite").click();
    await page.evaluate(() =>
      (window as unknown as { yourlibToast: (m: string, o: object) => void }).yourlibToast("閉じたあとも残ります", { duration: 0 }),
    );
    await expect(page.locator("dialog#g-invite").getByText("閉じたあとも残ります")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog#g-invite")).toBeHidden();
    const pageRegion = page.locator('[data-slot="toaster"]:not([data-yl-outlet])');
    await expect(pageRegion.getByText("閉じたあとも残ります")).toBeVisible();
    await expect(page.locator("[data-yl-outlet]")).toHaveCount(0);
  });
});

test.describe("small parts", () => {
  test("Link marks an external link for screen readers", async ({ page }) => {
    const link = page.getByTestId("link-external");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await expect(link).toHaveAccessibleName(/^MDN の dialog 要素\s?（新しいタブで開きます）$/);
  });

  test("Spinner is a status with its label; Skeleton is hidden from assistive technology", async ({ page }) => {
    await expect(page.getByTestId("spinner-lg")).toHaveRole("status");
    await expect(page.getByTestId("spinner-lg")).toHaveText("アップロード中");
    await expect(page.locator('[data-slot="skeleton-lines"]')).toHaveAttribute("aria-hidden", "true");
  });

  test("Separator: decorative ones are not exposed, vertical ones are", async ({ page }) => {
    const section = page.locator("#separator");
    await expect(section.getByRole("separator")).toHaveCount(1);
    await expect(section.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
  });

  test("a loading Button cannot be activated", async ({ page }) => {
    const button = page.getByTestId("loading-button");
    await expect(button).toHaveAttribute("aria-disabled", "true");
    await expect(button).toHaveAttribute("aria-busy", "true");
  });
});
