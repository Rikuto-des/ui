import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.use({ reducedMotion: "reduce" });

const key = "urushi-example-studio-v1";
const app = "/examples/studio/";
const nameInput = (page: Page) => page.getByRole("textbox", { name: "プロジェクト名", exact: true });
const editor = (page: Page) => page.locator("#demo-project-editor");
const saved = (page: Page) => page.evaluate(k => JSON.parse(localStorage.getItem(k) ?? "null"), key);
async function open(page: Page) {
  await page.goto(app);
  await expect(page.locator(".studio-demo")).toHaveAttribute("data-ready", "true");
}

test.beforeEach(async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.fulfill({ status: 200, contentType: "text/css", body: "" }));
});

test("create, nested owner/date selection, edit, persistence and undo", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "新規プロジェクト", exact: true }).click();
  await expect(nameInput(page)).toBeFocused();
  await page.getByRole("button", { name: "追加する", exact: true }).click();
  await expect(nameInput(page)).toHaveAttribute("aria-invalid", "true");
  await expect(nameInput(page)).toBeFocused();
  await nameInput(page).fill("サンプルの動作確認");
  await page.getByRole("textbox", { name: "説明", exact: true }).fill("担当者と期限を変更して保存します。");
  const owner = editor(page).getByRole("combobox", { name: "担当者", exact: true });
  await owner.fill("Kai");
  await editor(page).getByRole("option", { name: /Kai Ito/ }).click();
  await editor(page).getByRole("button", { name: /^期限:/ }).click();
  const calendar = page.getByRole("dialog", { name: "期限: カレンダー", exact: true });
  await calendar.locator('button[data-outside="true"]:not([disabled])').first().click();
  await expect(calendar).toBeHidden();
  await expect(editor(page)).toBeVisible();
  await page.getByRole("button", { name: "追加する", exact: true }).click();
  await expect(editor(page)).toBeHidden();
  expect((await saved(page)).projects[0]).toMatchObject({ name: "サンプルの動作確認", owner: "kai" });
  await page.reload();
  await expect(page.getByRole("button", { name: /サンプルの動作確認 PRJ-/ })).toBeVisible();
  await page.getByRole("button", { name: /サンプルの動作確認 PRJ-/ }).click();
  await nameInput(page).fill("確認が終わりました");
  await page.getByRole("button", { name: "変更を保存", exact: true }).click();
  await expect(page.getByRole("button", { name: /確認が終わりました PRJ-/ })).toBeVisible();
  await page.getByRole("button", { name: "直前の変更を取り消す" }).click();
  await expect(page.getByRole("button", { name: /サンプルの動作確認 PRJ-/ })).toBeVisible();
});

test("validation cannot steal focus from a field the user has moved to", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "新規プロジェクト", exact: true }).click();
  await expect(nameInput(page)).toBeFocused();
  // A busy frame must not apply an older validation focus after newer input.
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await page.getByRole("button", { name: "追加する", exact: true }).click();
  await expect(nameInput(page)).toHaveAttribute("aria-invalid", "true");
  await nameInput(page).fill("入力を続ける");
  const owner = editor(page).getByRole("combobox", { name: "担当者", exact: true });
  await owner.focus();
  await expect(owner).toBeFocused();
  await page.clock.runFor(32);
  await expect(owner).toBeFocused();
  await owner.fill("Kai");
  await editor(page).getByRole("option", { name: /Kai Ito/ }).click();
  await expect(owner).toHaveValue("Kai Ito");
});

test("dirty editor requires an explicit discard and restores usable focus", async ({ page }) => {
  await open(page);
  const launch = page.getByRole("button", { name: /Website redesign PRJ-/ });
  await launch.click();
  await nameInput(page).fill("未保存の変更");
  await page.keyboard.press("Escape");
  const confirm = page.getByRole("alertdialog", { name: "編集内容を破棄しますか？" });
  await expect(confirm).toBeVisible();
  await confirm.getByRole("button", { name: "編集を続ける" }).click();
  await expect(nameInput(page)).toHaveValue("未保存の変更");
  await editor(page).getByRole("button", { name: "キャンセル", exact: true }).click();
  await confirm.getByRole("button", { name: "破棄して閉じる" }).click();
  await expect(editor(page)).toBeHidden();
  await expect(launch).toBeFocused();
  expect(await saved(page)).toBeNull();
});

test("filter, paginate, sort, select and move between board columns", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "次のページ", exact: true }).click();
  await expect(page.getByRole("button", { name: /Component documentation PRJ-/ })).toBeVisible();
  await page.getByRole("searchbox", { name: "プロジェクトを検索" }).fill("Website");
  await expect(page.getByRole("table").getByRole("row")).toHaveCount(2);
  await page.getByRole("checkbox", { name: "Website redesignを選択", exact: true }).check();
  await page.getByRole("button", { name: "選択した項目を完了にする" }).click();
  await expect(page.getByRole("table")).toContainText("完了");
  await page.getByRole("button", { name: "解除", exact: true }).click();
  await page.getByRole("table").getByRole("button", { name: "期限", exact: true }).click();
  await expect(page.getByRole("columnheader").filter({hasText: "期限"})).toHaveAttribute("aria-sort", "ascending");
  await page.getByRole("combobox", { name: "担当者で絞り込み" }).selectOption("mika");
  await page.getByRole("tab", { name: "ボード", exact: true }).click();
  await page.getByRole("combobox", { name: "Website redesignの状態", exact: true }).focus();
  await page.getByRole("combobox", { name: "Website redesignの状態", exact: true }).selectOption("review");
  await expect(page.getByRole("combobox", { name: "Website redesignの状態", exact: true })).toBeFocused();
  await expect(page.getByRole("region", { name: "レビューのプロジェクト" }).getByRole("button", { name: "Website redesign", exact: true })).toBeVisible();
  expect((await saved(page)).projects.find((p: {id: string}) => p.id === "PRJ-001").status).toBe("review");
});

test("command, menu edit/delete and undo work together", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: /^検索・コマンド/ }).click();
  const command = page.getByRole("dialog", { name: "Studioの検索とコマンド" });
  await command.getByRole("combobox").fill("Website");
  await command.getByRole("option", { name: /Website redesign/ }).click();
  await expect(nameInput(page)).toHaveValue("Website redesign");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Website redesignの操作", exact: true }).click();
  await page.getByRole("menuitem", { name: "編集する", exact: true }).click();
  await expect(editor(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "新規プロジェクト", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Website redesignの操作", exact: true }).click();
  await page.getByRole("menuitem", { name: "削除する", exact: true }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "削除する", exact: true }).click();
  await expect(page.getByRole("button", { name: /Website redesign PRJ-/ })).toHaveCount(0);
  await page.getByRole("button", { name: "直前の変更を取り消す" }).click();
  await expect(page.getByRole("button", { name: /Website redesign PRJ-/ })).toBeVisible();
});

test("settings persist, export real data and reset with recovery", async ({ page }) => {
  await open(page);
  await page.getByRole("navigation", { name: "ワークスペース", exact: true }).getByRole("button", { name: "設定", exact: true }).click();
  await page.getByRole("textbox", { name: "名前", exact: true }).fill("My team");
  await page.getByRole("button", { name: "名前を保存" }).click();
  await page.getByRole("switch", { name: "完了したプロジェクトも表示", exact: true }).uncheck();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "JSONを書き出す" }).click();
  expect((await download).suggestedFilename()).toBe("urushi-studio.json");
  await page.reload();
  await expect(page.locator(".demo-workspace")).toContainText("My team");
  await expect(page.getByRole("heading", { name: "All projects 10" })).toBeVisible();
  await page.getByRole("navigation", { name: "ワークスペース", exact: true }).getByRole("button", { name: "設定", exact: true }).click();
  await page.getByRole("button", { name: "初期データに戻す", exact: true }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "初期データに戻す", exact: true }).click();
  await expect(page.locator(".demo-workspace")).toContainText("Forma Studio");
  await page.getByRole("button", { name: "直前の変更を取り消す" }).click();
  await expect(page.locator(".demo-workspace")).toContainText("My team");
});

test("storage failure preserves draft; corrupt stored data is never silently overwritten", async ({ page }) => {
  await open(page);
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException("full", "QuotaExceededError"); }; });
  await page.getByRole("button", { name: "新規プロジェクト", exact: true }).click();
  await nameInput(page).fill("保存できなくても残す");
  await page.getByRole("button", { name: "追加する", exact: true }).click();
  await expect(editor(page)).toContainText("保存できませんでした");
  await expect(nameInput(page)).toHaveValue("保存できなくても残す");
  await editor(page).getByRole("button", { name: "キャンセル", exact: true }).click();
  await page.getByRole("button", { name: "破棄して閉じる" }).click();
  await page.reload();
  await page.evaluate(k => localStorage.setItem(k, '{"broken":true}'), key);
  await page.reload();
  await expect(page.getByRole("button", { name: "新規プロジェクト", exact: true })).toBeDisabled();
  await expect(page.locator(".demo-main")).toContainText("保存データを読み込めませんでした");
  expect(await page.evaluate(k => localStorage.getItem(k), key)).toBe('{"broken":true}');
});

test("a second tab cannot silently overwrite newer data", async ({ page, context }) => {
  await open(page);
  const second = await context.newPage();
  await open(second);
  await second.getByRole("button", { name: /Website redesign PRJ-/ }).click();
  await nameInput(second).fill("古いタブからの編集");
  await page.getByRole("button", { name: /Website redesign PRJ-/ }).click();
  await nameInput(page).fill("最新の編集");
  await page.getByRole("button", { name: "変更を保存", exact: true }).click();
  await second.getByRole("button", { name: "変更を保存", exact: true }).click();
  await expect(editor(second)).toContainText("別のタブでデータが更新されました");
  expect((await saved(page)).projects[0].name).toBe("最新の編集");
  await expect(nameInput(second)).toHaveValue("古いタブからの編集");
  await second.close({runBeforeUnload:false});
});

for (const viewport of [{ width: 1440, height: 1080 }, { width: 320, height: 900 }]) {
  test(`themes, keyboard and accessibility at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await open(page);
    for (const pack of ["graphite", "lucent"]) for (const theme of ["light", "dark"]) {
      await page.getByRole("combobox", { name: "パック", exact: true }).selectOption(pack);
      await page.getByRole("combobox", { name: "テーマ", exact: true }).selectOption(theme);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await page.evaluate(async () => { await Promise.all(document.getAnimations().filter(animation => animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {}))); });
      const audit = await new AxeBuilder({ page }).analyze();
      expect(audit.violations).toEqual([]);
    }
    await page.getByRole("button", { name: "新規プロジェクト", exact: true }).press("Enter");
    await expect(nameInput(page)).toBeFocused();
    await page.evaluate(async () => { await Promise.all(document.getAnimations().filter(animation => animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {}))); });
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "新規プロジェクト", exact: true })).toBeFocused();
    await page.getByRole("tab", { name: "ボード", exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.evaluate(async () => { await Promise.all(document.getAnimations().filter(animation => animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {}))); });
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("site links to the example, source and component documentation", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "サイト", exact: true }).getByRole("link", { name: "Examples", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Examples", exact: true })).toBeVisible();
  await expect(page.locator(".examples-preview img")).toHaveJSProperty("naturalWidth", 1392);
  await page.getByRole("link", { name: "アプリを開く", exact: true }).click();
  await expect(page.getByRole("heading", { name: "チームのプロジェクト", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "実装コード", exact: true }).click();
  await page.getByText("アプリの画面と操作", { exact: false }).first().click();
  await expect(page.locator("details[open] pre")).toContainText("export function StudioApp");
});

test("pack changes affect rendered geometry, depth and motion without losing work", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1080 });
  await open(page);
  const pack = page.getByRole("combobox", { name: "パック", exact: true });
  const search = page.getByRole("searchbox", { name: "プロジェクトを検索" });
  const selected = page.getByRole("checkbox", { name: "Website redesignを選択", exact: true });
  await pack.selectOption("graphite");
  await search.fill("Website");
  await selected.check();
  const appearance = () => page.evaluate(async () => {
    await Promise.all(document.getAnimations().filter(a => a.effect?.getTiming().iterations !== Infinity).map(a => a.finished.catch(() => {})));
    const button = document.querySelector('.demo-heading [data-slot~="button"]')!;
    const card = document.querySelector('.demo-overview [data-slot="card"]')!;
    const buttonStyle = getComputedStyle(button);
    const cardStyle = getComputedStyle(card);
    return {
      height: button.getBoundingClientRect().height,
      radius: buttonStyle.borderRadius,
      weight: Number(buttonStyle.fontWeight),
      duration: parseFloat(buttonStyle.transitionDuration),
      cardRadius: cardStyle.borderRadius,
      shadow: cardStyle.boxShadow,
      gap: parseFloat(getComputedStyle(document.querySelector('.demo-overview')!).gap),
    };
  });
  const graphite = await appearance();
  await pack.selectOption("lucent");
  const lucent = await appearance();
  expect(lucent.height).toBeGreaterThan(graphite.height);
  expect(lucent.radius).not.toBe(graphite.radius);
  expect(lucent.weight).toBeGreaterThan(graphite.weight);
  expect(lucent.duration).toBeGreaterThan(graphite.duration);
  expect(lucent.cardRadius).not.toBe(graphite.cardRadius);
  expect(lucent.shadow).not.toBe(graphite.shadow);
  expect(lucent.gap).toBeGreaterThan(graphite.gap);
  await expect(search).toHaveValue("Website");
  await expect(selected).toBeChecked();
  await pack.selectOption("graphite");
  await expect(search).toHaveValue("Website");
  await expect(selected).toBeChecked();
  await pack.selectOption("lucent");
  await page.reload();
  await expect(pack).toHaveValue("lucent");
  expect(await appearance()).toEqual(lucent);
  await page.getByRole("button", { name: /Website redesign PRJ-/ }).click();
  const inputHeight = await nameInput(page).evaluate(el => el.getBoundingClientRect().height);
  expect(await editor(page).getByRole("combobox", { name: "担当者", exact: true }).evaluate(el => el.getBoundingClientRect().height)).toBe(inputHeight);
  expect(await page.locator("#demo-project-due").evaluate(el => el.getBoundingClientRect().height)).toBe(inputHeight);
  await editor(page).getByRole("button", { name: /^期限:/ }).click();
  const calendar = page.getByRole("dialog", { name: "期限: カレンダー", exact: true });
  await expect(calendar).toBeVisible();
  await page.setViewportSize({ width: 320, height: 900 });
  await page.evaluate(async () => { await Promise.all(document.getAnimations().filter(a => a.effect?.getTiming().iterations !== Infinity).map(a => a.finished.catch(() => {}))); });
  expect(await calendar.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await calendar.getByRole("button", { name: "キャンセル", exact: true }).click();
  await editor(page).getByRole("button", { name: "キャンセル", exact: true }).click();

  // The wider controls must not squeeze the filter labels into two lines.
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1080 });
    const wraps = await page.locator(".demo-filters selectedcontent").evaluateAll(nodes => nodes.some(node => {
      if (!node.checkVisibility()) return false; // Native select fallback has no rendered selectedcontent.
      const range = document.createRange();
      range.selectNodeContents(node);
      return range.getBoundingClientRect().height > parseFloat(getComputedStyle(node).lineHeight) * 1.2;
    }));
    expect(wraps, `filter label wraps at ${width}px`).toBe(false);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
});

test("table selection uses Urushi Checkbox motion, mixed state and a 44px hit area", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await open(page);
  const row = page.getByRole("checkbox", { name: "Website redesignを選択", exact: true });
  const all = page.getByRole("checkbox", { name: "このページを選択", exact: true });
  await expect(row).toHaveAttribute("data-slot", "checkbox-input");
  const label = page.locator('[data-slot="checkbox"]').filter({has: row});
  const bounds = await label.boundingBox();
  expect(bounds!.width).toBeGreaterThanOrEqual(44);
  expect(bounds!.height).toBeGreaterThanOrEqual(44);
  await label.click({position:{x:3,y:3}});
  await expect(row).toBeChecked();
  await expect(all).toHaveJSProperty("indeterminate", true);
  const mixed = all.locator("..").locator('[data-slot="checkbox-mixed"]');
  await expect.poll(() => mixed.evaluate(el => getComputedStyle(el).strokeDashoffset)).toBe("0px");
  const mark = row.locator("..").locator('[data-slot="checkbox-mark"]');
  await expect.poll(() => mark.evaluate(el => getComputedStyle(el).strokeDashoffset)).toBe("0px");
  await row.press("Space");
  await expect(row).not.toBeChecked();
  await expect.poll(() => mark.evaluate(el => getComputedStyle(el).strokeDashoffset)).toBe("1px");
  // Capture the shared stroke transition at a known point, rather than trusting a class name.
  await row.press("Space");
  const motion = await mark.evaluate(el => {
    const animation = el.getAnimations().find(a => (a as CSSTransition).transitionProperty === "stroke-dashoffset");
    if (!animation) return null;
    animation.pause(); animation.currentTime = Number(animation.effect!.getTiming().duration) / 3;
    const result = { duration: Number(animation.effect!.getTiming().duration), offset: parseFloat(getComputedStyle(el).strokeDashoffset) };
    animation.finish(); return result;
  });
  expect(motion).not.toBeNull();
  expect(motion!.duration).toBeGreaterThanOrEqual(180);
  expect(motion!.offset).toBeGreaterThan(0);
  expect(motion!.offset).toBeLessThan(1);
  await all.check();
  await expect(all).toHaveJSProperty("indeterminate", false);
  await expect(page.getByRole("table").getByRole("checkbox", { checked: true })).toHaveCount(7);
  await page.getByRole("button", { name: "選択解除", exact: true }).click();
  await page.emulateMedia({reducedMotion:"reduce"});
  await row.check();
  await expect.poll(() => mark.evaluate(el => getComputedStyle(el).transitionDuration)).toBe("0s");
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
});
