import { expect, test, type Page } from "@playwright/test";
import { fixedViewport } from "./layout.js";

// Behavior of the native-only components added after Phase 1 (toggles, inputs,
// display, status, navigation and the overlays built on <dialog> and popover),
// on the gallery page, in all three engines.
const noWebFonts = (page: Page) => page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());

test.use({ reducedMotion: "reduce" });

test.beforeEach(async ({ page }) => {
  await noWebFonts(page);
  await page.goto("/components.html");
});

test.describe("Toggle and ToggleGroup", () => {
  test("a toggle is a native checkbox: the label toggles it, and so does Space", async ({ page }) => {
    const bold = page.getByRole("checkbox", { name: "太字" });
    await expect(bold).toBeChecked();
    await page.locator("#toggle label").filter({ has: page.getByTestId("toggle-italic") }).click();
    await expect(page.getByRole("checkbox", { name: "斜体" })).toBeChecked();
    await bold.focus();
    await page.keyboard.press("Space");
    await expect(bold).not.toBeChecked();
  });

  test("a single toggle group is a named group of radios that arrow keys move through", async ({ page }) => {
    const group = page.getByRole("group", { name: "表示", exact: true });
    const radios = group.getByRole("radio");
    await expect(radios).toHaveCount(3);
    await expect(group.getByRole("radio", { name: "リスト" })).toBeChecked();
    await group.getByRole("radio", { name: "リスト" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(group.getByRole("radio", { name: "ボード" })).toBeChecked();
    await expect(group.getByRole("radio", { name: "リスト" })).not.toBeChecked();
    expect(await radios.evaluateAll((els) => els.map((el) => (el as HTMLInputElement).name))).toEqual(["view", "view", "view"]);
  });

  test("a multiple toggle group is a group of checkboxes with a visible legend", async ({ page }) => {
    const group = page.getByRole("group", { name: "表示する曜日" });
    await expect(group.getByRole("checkbox")).toHaveCount(7);
    await expect(group.locator("input:checked")).toHaveCount(5);
    await expect(page.getByText("表示する曜日", { exact: true })).toBeVisible();
    await group.getByRole("checkbox", { name: "土" }).check();
    await expect(group.getByRole("checkbox", { name: "土" })).toBeChecked();
  });

  test("a button group is a named group of buttons", async ({ page }) => {
    const group = page.getByRole("group", { name: "リンク", exact: true });
    await expect(group.getByRole("button")).toHaveCount(3);
  });
});

test.describe("inputs", () => {
  test("an input group passes the Field's label, hint and error to its input", async ({ page }) => {
    const url = page.getByRole("textbox", { name: "サイトの URL" });
    await expect(url).toHaveAccessibleDescription("https:// は入れなくてかまいません。");
    const invite = page.getByRole("textbox", { name: "招待するメールアドレス" });
    await expect(invite).toHaveAttribute("aria-invalid", "true");
    await expect(invite).toHaveAccessibleDescription(/メールアドレスの形になっていません/);
    // The addon text is not part of the name.
    await expect(url).toHaveAccessibleName("サイトの URL");
  });

  test("a slider is a labelled native range", async ({ page }) => {
    const slider = page.getByRole("slider", { name: "通知音の大きさ" });
    await expect(slider).toHaveValue("60");
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await expect(slider).toHaveValue("61");
    await page.keyboard.press("End");
    await expect(slider).toHaveValue("100");
  });

  test("a date input keeps ISO values and native limits", async ({ page }) => {
    const due = page.getByTestId("due");
    await expect(due).toHaveAttribute("type", "date");
    await expect(due).toHaveValue("2026-10-30");
    await expect(due).toHaveAttribute("min", "2026-10-01");
    await expect(page.getByLabel("期限")).toHaveCount(1);
  });

  test("a file input takes files and is described by its hint", async ({ page }) => {
    const photo = page.getByTestId("photo");
    await expect(photo).toHaveAccessibleDescription("PNG か JPEG、5 MB まで。");
    await photo.setInputFiles({ name: "me.png", mimeType: "image/png", buffer: Buffer.from("89504e47", "hex") });
    expect(await photo.evaluate((el) => (el as HTMLInputElement).files?.[0]?.name)).toBe("me.png");
  });

  test("an OTP input is one numeric field with one-time-code autofill", async ({ page }) => {
    const otp = page.getByRole("textbox", { name: "確認コード" });
    await expect(otp).toHaveAttribute("inputmode", "numeric");
    await expect(otp).toHaveAttribute("autocomplete", "one-time-code");
    await expect(otp).toHaveAttribute("maxlength", "6");
    await expect(otp).toHaveAccessibleDescription("メールに届いた 6 桁の数字を入れてください。");
    await otp.fill("12345678");
    await expect(otp).toHaveValue("123456");
    expect(await otp.evaluate((el) => (el as HTMLInputElement).validity.valid)).toBe(true);
  });
});

test.describe("display", () => {
  test("an avatar is an image named after the person, with an initial", async ({ page }) => {
    await expect(page.getByRole("img", { name: "佐藤 美咲" }).first()).toBeVisible();
    await expect(page.getByTestId("avatar-latin")).toHaveText("HT");
    await expect(page.getByRole("img", { name: "写真が読めない人" })).toBeVisible();
  });

  test("a table is named by its caption, even a hidden one", async ({ page }) => {
    const tasks = page.getByRole("table", { name: "今週のタスク" });
    await expect(tasks.getByRole("columnheader")).toHaveCount(4);
    await expect(tasks.getByRole("row")).toHaveCount(4);
    const people = page.getByRole("table", { name: "参加者" });
    await expect(people.getByRole("rowheader")).toHaveCount(3);
    await expect(people.locator("caption")).toHaveCSS("clip-path", "inset(50%)");
  });

  test("a collapsible opens and closes from its summary", async ({ page }) => {
    const details = page.getByTestId("collapsible");
    await expect(details).not.toHaveAttribute("open");
    await details.getByText("詳細な設定").click();
    await expect(details).toHaveAttribute("open", "");
    await expect(page.getByRole("checkbox", { name: "週末も締め切りの通知を送る" })).toBeVisible();
  });

  test("a scroll area is a named, focusable region that the keyboard scrolls", async ({ page }) => {
    const region = page.getByRole("region", { name: "参加者" });
    await expect(region).toHaveAttribute("tabindex", "0");
    await region.focus();
    await page.keyboard.press("PageDown");
    await expect.poll(() => region.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  });

  test("a carousel is a named region of numbered slides that the keyboard scrolls", async ({ page }) => {
    const carousel = page.getByTestId("carousel");
    await expect(carousel).toHaveAttribute("aria-roledescription", "カルーセル");
    await expect(carousel).toHaveAccessibleName("会場の写真");
    const slides = carousel.getByRole("group");
    await expect(slides).toHaveCount(4);
    await expect(slides.first()).toHaveAccessibleName("1 / 4");
    const viewport = carousel.locator('[data-slot="carousel-viewport"]');
    await viewport.focus();
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => viewport.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  });
});

test.describe("status", () => {
  test("an alert is not a live region", async ({ page }) => {
    const alert = page.getByTestId("alert-danger");
    await expect(alert).toContainText("支払いに失敗しました");
    await expect(alert).not.toHaveAttribute("role");
    await expect(alert).not.toHaveAttribute("aria-live");
  });

  test("a progress bar is named by its label; without a value it is indeterminate", async ({ page }) => {
    await expect(page.getByRole("progressbar", { name: "写真をアップロード中" })).toHaveAttribute("value", "42");
    await expect(page.getByRole("progressbar", { name: "データを読み込んでいます" })).not.toHaveAttribute("value");
  });

  test("a meter is named by its label and keeps its bounds", async ({ page }) => {
    const storage = page.getByTestId("storage");
    await expect(storage).toHaveAccessibleName("使用容量");
    await expect(storage).toHaveAttribute("max", "10");
    await expect(storage).toHaveAttribute("high", "8");
  });
});

test.describe("navigation", () => {
  test("a breadcrumb is a named nav whose last item is the current page, not a link", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "パンくずリスト" });
    await expect(nav.getByRole("link")).toHaveCount(2);
    await expect(nav.getByText("通知")).toHaveAttribute("aria-current", "page");
  });

  test("pagination links every page from the template and marks the current one", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "ページ送り", exact: true });
    await expect(nav.getByRole("link", { name: "6 ページ目" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "7 ページ目" })).toHaveAttribute("href", "#page-7");
    await expect(nav.getByRole("link", { name: "前へ" })).toHaveAttribute("href", "#page-5");
    // On the first page there is no previous link.
    const short = page.getByRole("navigation", { name: "ページ送り（短い一覧）" });
    await expect(short.getByRole("link", { name: "前へ" })).toHaveCount(0);
    await expect(short.getByText("前へ")).toHaveAttribute("aria-disabled", "true");
  });

  test("steps mark the current step and say which are done", async ({ page }) => {
    const steps = page.getByRole("list", { name: "申し込みの手順" });
    await expect(steps.getByRole("listitem")).toHaveCount(3);
    await expect(steps.getByRole("listitem").nth(1)).toHaveAttribute("aria-current", "step");
    await expect(steps.getByRole("listitem").first()).toContainText("完了");
  });

  test("a sidebar marks the current page and folds groups with details", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "メイン" });
    await expect(nav.getByRole("link", { name: "タスク" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "春のキャンペーン" })).toBeHidden();
    await nav.getByText("アーカイブ").click();
    await expect(nav.getByRole("link", { name: "春のキャンペーン" })).toBeVisible();
  });
});

test.describe("AlertDialog", () => {
  test("opens as a named alertdialog with focus on the safe choice", async ({ page }) => {
    await page.getByTestId("open-delete").click();
    const dialog = page.getByRole("alertdialog", { name: "「秋のキャンペーン」を削除しますか？" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleDescription(/この操作は取り消せません/);
    await expect(page.getByTestId("delete-cancel")).toBeFocused();
  });

  test("Escape and clicks outside do not close it; its buttons do", async ({ page }) => {
    // Opened from the keyboard: WebKit does not focus a button on click, so focus could not return to it.
    const trigger = page.getByTestId("open-delete");
    await trigger.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByTestId("delete-dialog");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(dialog).toBeVisible();
    await page.getByTestId("delete-cancel").click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await dialog.getByRole("button", { name: "削除する" }).click();
    await expect(dialog).toBeHidden();
  });
});

test.describe("Sheet", () => {
  test("slides in at the end edge as a modal dialog and closes with Escape", async ({ page }) => {
    const trigger = page.getByTestId("open-sheet");
    await trigger.focus();
    await page.keyboard.press("Enter");
    const sheet = page.getByRole("dialog", { name: "タスクを編集" });
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveAccessibleDescription("変更は保存するまで反映されません。");
    const box = (await sheet.boundingBox())!;
    const viewport = await fixedViewport(page);
    expect(Math.round(box.x + box.width)).toBe(Math.round(viewport.x + viewport.width));
    expect(Math.round(box.height)).toBe(viewport.height);
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("side=start pins it to the start edge", async ({ page }) => {
    await page.getByTestId("open-nav-sheet").click();
    const sheet = page.getByTestId("nav-sheet");
    await expect(sheet).toBeVisible();
    expect(Math.round((await sheet.boundingBox())!.x)).toBe(0);
  });

  test("submitting its form closes it", async ({ page }) => {
    await page.getByTestId("open-sheet").click();
    const sheet = page.getByTestId("task-sheet");
    await sheet.getByRole("button", { name: "保存" }).click();
    await expect(sheet).toBeHidden();
  });
});

test.describe("HoverCard", () => {
  test("shows on hover, stays while the pointer moves into it, and hides with Escape", async ({ page }) => {
    const trigger = page.getByTestId("hc-trigger");
    await trigger.hover();
    const card = page.getByTestId("hc-card");
    await expect(card).toBeVisible({ timeout: 3000 });
    // Below the link, aligned to its start.
    const t = (await trigger.boundingBox())!;
    const c = (await card.boundingBox())!;
    expect(c.y).toBeGreaterThanOrEqual(t.y + t.height);
    await page.getByTestId("hc-link").hover();
    await page.waitForTimeout(400);
    await expect(card).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(card).toBeHidden();
  });

  test("shows when the link gets keyboard focus, and the link still navigates", async ({ page }) => {
    // A navigation key establishes keyboard modality on macOS and Linux WebKit; Shift alone does not.
    await page.keyboard.press("Tab");
    await page.getByTestId("hc-trigger").focus();
    await expect(page.getByTestId("hc-trigger")).toBeFocused();
    await expect(page.getByTestId("hc-card")).toBeVisible({ timeout: 3000 });
    await page.keyboard.press("Escape");
    await page.getByTestId("hc-trigger").click();
    await expect(page).toHaveURL(/#sato$/);
  });
});
