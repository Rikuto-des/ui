import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const button = (page: Page, name: string) =>
  page.getByRole("button", { name, exact: true });
const workflows: Record<string, (page: Page) => Promise<void>> = {
  input: async (p) => {
    await p
      .getByLabel("プロジェクト名", { exact: true })
      .fill("Fresh notebook");
    await expect(p.locator(".study-cover strong")).toHaveText("Fresh notebook");
    await button(p, "プロジェクト名を消去").click();
    await expect(p.getByLabel("プロジェクト名", { exact: true })).toBeFocused();
    await expect(p.locator(".study-cover strong")).toHaveText("Untitled");
    await button(p, "表示").click();
    await expect(
      p.getByLabel("パスワード表示の見本", { exact: true }),
    ).toHaveAttribute("type", "text");
  },
  field: async (p) => {
    await button(p, "形式を確認").click();
    await expect(
      p.getByLabel("ワークスペース名", { exact: false }),
    ).toHaveAttribute("aria-invalid", "true");
    await p
      .getByLabel("ワークスペース名", { exact: false })
      .fill("field-notes");
    await button(p, "形式を確認").click();
    await expect(p.locator('[data-slot="field-success"]')).toHaveText(
      "この形式で利用できます。",
    );
    await expect(
      p.getByLabel("ワークスペース名", { exact: false }),
    ).toHaveAttribute("aria-describedby", /field-handle-success/);
  },
  "input-group": async (p) => {
    await p.getByLabel("ページのアドレス", { exact: true }).fill("new-notes");
    await button(p, "反映").click();
    await expect(p.locator(".study-result strong")).toHaveText("/new-notes");
  },
  select: async (p) => {
    await p.getByLabel("担当者", { exact: true }).selectOption("ren");
    await expect(p.locator(".study-result")).toContainText(
      "キーボード操作を確認",
    );
  },
  "date-input": async (p) => {
    await p.getByLabel("終了日", { exact: true }).fill("2026-11-10");
    await expect(p.locator(".study-date-window strong")).toContainText("9");
    await p.getByLabel("開始日", { exact: true }).fill("2026-11-11");
    await expect(p.locator('[data-slot="field-error"]')).toBeVisible();
    await button(p, "5日間に戻す").click();
    await expect(p.locator(".study-date-window strong")).toContainText("5");
  },
  "otp-input": async (p) => {
    await p.getByLabel("デモ用の確認コード", { exact: true }).fill("654321");
    await button(p, "コードを確認").click();
    await expect(p.locator('[data-slot="field-error"]')).toBeVisible();
    await p.getByLabel("デモ用の確認コード", { exact: true }).fill("123456");
    await button(p, "コードを確認").click();
    await expect(p.locator('[data-slot="field-success"]')).toBeVisible();
    await button(p, "やり直す").click();
    await expect(
      p.getByLabel("デモ用の確認コード", { exact: true }),
    ).toBeFocused();
  },
  button: async (p) => {
    await p.getByLabel("ノートのタイトル", { exact: true }).fill("Saved note");
    await button(p, "変更を保存").click();
    await button(p, "保存を取り消す").click();
    await p.waitForTimeout(1000);
    await expect(p.locator(".study-result strong")).toHaveText("Field notes");
    await p.getByLabel("ノートのタイトル", { exact: true }).fill("New title");
    await button(p, "変更を保存").click();
    await expect(p.locator(".study-result strong")).toHaveText("New title");
  },
  "button-group": async (p) => {
    await button(p, "拡大").click();
    await expect(button(p, "倍率を100%に戻す")).toHaveText("125%");
    await button(p, "全体を表示").click();
    await expect(button(p, "倍率を100%に戻す")).toHaveText("75%");
    await expect(button(p, "縮小")).toBeDisabled();
  },
  link: async (p) => {
    await p
      .locator(".interaction-study")
      .getByRole("link", { name: "実装例", exact: true })
      .click();
    await expect(p.locator(".study-result strong")).toHaveText(
      "実装例を確認する",
    );
    await p
      .locator(".interaction-study")
      .getByRole("link", { name: "概要", exact: true })
      .click();
    await expect(p.locator(".study-result strong")).toHaveText(
      "文章から関連する情報を開く",
    );
  },
  card: async (p) => {
    await button(p, "コレクションに追加").click();
    await expect(p.locator('[data-slot="card"]')).toHaveAttribute(
      "data-selected",
      "true",
    );
    await button(p, "詳細").click();
    await expect(p.locator("#card-detail")).toBeVisible();
    await button(p, "コレクションに追加済み").click();
    await expect(p.locator('[data-slot="card"]')).not.toHaveAttribute(
      "data-selected",
    );
  },
  badge: async (p) => {
    await button(p, "完了 1").click();
    await expect(p.locator(".study-list li")).toHaveCount(1);
    await expect(p.locator(".study-list")).toContainText("文字の整理");
  },
  avatar: async (p) => {
    await button(p, "高橋 蓮").click();
    await expect(p.locator(".study-person")).toContainText("取り込み中");
    await expect(p.locator('.study-person [role="img"]')).toHaveAccessibleName(
      "高橋 蓮, 取り込み中",
    );
  },
  kbd: async (p) => {
    await button(p, "集中表示を切り替える").focus();
    await p.keyboard.down("Enter");
    await expect(p.locator(".study-keyboard kbd")).toHaveAttribute(
      "data-pressed",
      "true",
    );
    await p.keyboard.up("Enter");
    await expect(p.locator(".study-keyboard kbd")).not.toHaveAttribute(
      "data-pressed",
    );
    await expect(p.locator(".study-result strong")).toHaveText("集中表示");
  },
  table: async (p) => {
    await button(p, "10%を加算").click();
    await expect(p.locator("tfoot")).toContainText("4,070");
    await button(p, "行をコンパクトに").click();
    await expect(p.locator('[data-slot="table"]')).toHaveAttribute(
      "data-density",
      "compact",
    );
  },
  separator: async (p) => {
    await button(p, "中央揃え").click();
    await button(p, "太字").click();
    await expect(p.locator(".study-quote")).toHaveCSS("text-align", "center");
    await expect(p.locator(".study-quote")).toHaveCSS("font-weight", "650");
  },
  "aspect-ratio": async (p) => {
    await button(p, "1:1").click();
    await expect(p.locator('[data-slot="aspect-ratio"]')).toHaveCSS(
      "aspect-ratio",
      "1 / 1",
    );
    await button(p, "構図をずらす").click();
    await expect(p.locator(".study-landscape")).toHaveCSS(
      "background-position",
      /^75% 50%/,
    );
  },
  "scroll-area": async (p) => {
    await button(p, "最後まで読む").click();
    await expect(button(p, "先頭に戻る")).toBeVisible();
    await button(p, "先頭に戻る").click();
    await expect(button(p, "最後まで読む")).toBeVisible();
  },
  spinner: async (p) => {
    await button(p, "読み込みを試す").click();
    await expect(p.locator('[data-slot="spinner-label"]')).toHaveText(
      "ノートを準備しています",
    );
    await button(p, "読み込みを取り消す").click();
    await expect(p.locator('[data-slot="spinner"]')).toHaveCount(0);
    await button(p, "読み込みを試す").click();
    await expect(
      p.getByText("ノートの準備ができました", { exact: true }),
    ).toBeVisible();
  },
  skeleton: async (p) => {
    const before = await p.locator(".study-skeleton-stage").boundingBox();
    await button(p, "内容を読み込む").click();
    await expect(p.locator(".study-skeleton-stage")).toHaveAttribute(
      "aria-busy",
      "true",
    );
    await expect(p.locator(".study-skeleton-stage")).toHaveAttribute(
      "aria-busy",
      "false",
    );
    const after = await p.locator(".study-skeleton-stage").boundingBox();
    expect(Math.abs(after!.height - before!.height)).toBeLessThanOrEqual(1);
    await button(p, "リセット").click();
    await expect(
      p.locator('.study-skeleton-stage [data-slot="skeleton"]'),
    ).toHaveCount(4);
  },
  breadcrumb: async (p) => {
    await p
      .locator(".interaction-study")
      .getByRole("link", { name: "Workspace", exact: true })
      .click();
    await expect(p.locator(".study-folder h4")).toHaveText("Workspace");
    await button(p, "Projects を開く").click();
    await button(p, "Field notes を開く").click();
    await expect(
      p.locator('[data-slot="breadcrumb-current"][aria-current="page"]'),
    ).toHaveText("Field notes");
  },
  pagination: async (p) => {
    await p
      .locator(".interaction-study")
      .getByRole("link", { name: "2 ページ目", exact: true })
      .click();
    await expect(p.locator(".study-page-list")).toContainText("小さな発見");
    await expect(
      p.locator('[data-slot="pagination"] [aria-current="page"]'),
    ).toBeFocused();
  },
  sidebar: async (p) => {
    await p
      .locator(".interaction-study")
      .getByRole("link", { name: "プロジェクト", exact: true })
      .click();
    await expect(p.locator(".study-workspace-page h4")).toHaveText(
      "プロジェクト",
    );
    await p.locator(".interaction-study summary").click();
    await expect(
      p
        .locator(".interaction-study")
        .getByRole("link", { name: "プロジェクト", exact: true }),
    ).toBeHidden();
  },
  menu: async (p) => {
    await button(p, "ノートの操作").press("Enter");
    await p.getByRole("menuitem", { name: /複製/ }).press("Enter");
    await expect(p.locator(".study-file")).toContainText("2冊のノート");
    await button(p, "ノートの操作").click();
    await p.getByRole("menuitem", { name: /アーカイブ/ }).click();
    await expect(p.locator(".study-file")).toContainText("アーカイブ済み");
    await button(p, "元に戻す").click();
    await expect(p.locator(".study-file")).toContainText("1冊のノート");
  },
  dialog: async (p) => {
    const trigger = button(p, "プロジェクトを編集");
    await trigger.press("Enter");
    const dialog = p.getByRole("dialog", {
      name: "プロジェクトを編集",
      exact: true,
    });
    await dialog
      .getByLabel("プロジェクト名", { exact: true })
      .fill("New project");
    await button(p, "内容を確認").click();
    await expect(
      p.getByRole("heading", { name: "この名前に変更します" }),
    ).toBeFocused();
    await button(p, "戻る").click();
    await expect(
      dialog.getByLabel("プロジェクト名", { exact: true }),
    ).toHaveValue("New project");
    await button(p, "内容を確認").click();
    await button(p, "変更を反映").click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(p.locator(".study-cover strong")).toHaveText("New project");
  },
  "alert-dialog": async (p) => {
    await button(p, "アーカイブする").press("Enter");
    await expect(button(p, "キャンセル")).toBeFocused();
    await p.keyboard.press("Escape");
    await expect(p.getByRole("alertdialog")).toBeVisible();
    await button(p, "アーカイブ").click();
    await expect(p.locator(".study-file")).toContainText(
      "アーカイブに移動しました",
    );
    await button(p, "元に戻す").click();
    await expect(p.locator(".study-file")).toContainText("ノート 12件");
  },
  sheet: async (p) => {
    await button(p, "表示を編集").press("Enter");
    await p
      .getByRole("dialog")
      .getByLabel("タイトル", { exact: true })
      .fill("Revised");
    await p
      .getByRole("switch", { name: "グリッドを表示", exact: true })
      .uncheck();
    await button(p, "キャンセル").click();
    await expect(
      p.locator(".interaction-study > .study-canvas strong"),
    ).toHaveText("Field notes");
    await button(p, "表示を編集").click();
    await expect(
      p.getByRole("dialog").getByLabel("タイトル", { exact: true }),
    ).toHaveValue("Field notes");
    await p
      .getByRole("dialog")
      .getByLabel("タイトル", { exact: true })
      .fill("Saved canvas");
    await button(p, "表示を保存").click();
    await expect(
      p.locator(".interaction-study > .study-canvas strong"),
    ).toHaveText("Saved canvas");
  },
  popover: async (p) => {
    await button(p, "キャンバスの設定").click();
    await p
      .getByRole("switch", { name: "グリッドを表示", exact: true })
      .uncheck();
    await p.getByRole("switch", { name: "ガイドを表示", exact: true }).check();
    await expect(p.locator(".study-canvas")).toHaveAttribute(
      "data-grid",
      "false",
    );
    await expect(p.locator(".study-canvas")).toHaveAttribute(
      "data-guides",
      "true",
    );
    await button(p, "完了").click();
    await expect(p.locator('[data-slot="popover"]')).toBeHidden();
  },
  "hover-card": async (p) => {
    const trigger = p.getByRole("link", { name: "佐藤 美咲", exact: true });
    await trigger.focus();
    await expect(p.locator("#person-preview")).toBeVisible();
    await p.keyboard.press("Escape");
    await expect(p.locator("#person-preview")).toBeHidden();
    await trigger.click();
    await expect(p.locator("#person-full")).toBeVisible();
  },
  tooltip: async (p) => {
    await button(p, "ノートを保存").focus();
    await expect(p.locator("#save-note-hint")).toBeVisible();
    await p.keyboard.press("Escape");
    await expect(p.locator("#save-note-hint")).toBeHidden();
    await button(p, "ノートを保存").click();
    await expect(p.locator(".study-file")).toContainText("保存済み");
    await button(p, "通知をミュート").click();
    await expect(p.locator(".study-file")).toContainText("通知オフ");
  },
  "date-picker": async (p) => {
    await button(p, "公開日: 2026-10-30").click();
    await button(p, "11月9日").click();
    await expect(p.getByLabel("公開日", { exact: true })).toHaveValue(
      "2026-11-09",
    );
    await expect(button(p, "公開日: 2026-11-09")).toBeFocused();
    await expect(p.locator(".study-calendar-slip")).toContainText(
      "2026年11月9日",
    );
  },
  "data-table": async (p) => {
    await button(p, "Websiteの詳細").click();
    await expect(
      p.locator('[data-slot="data-table-detail"]:not([hidden])'),
    ).toContainText("トップページの余白");
    await p
      .getByRole("checkbox", { name: "Websiteを選択", exact: true })
      .check();
    await button(p, "選択した1件をアーカイブ").click();
    await expect(
      p.getByRole("cell", { name: "Website", exact: true }),
    ).toHaveCount(0);
    await button(p, "元に戻す").click();
    await expect(
      p.getByRole("cell", { name: "Website", exact: true }),
    ).toBeVisible();
    await p.getByLabel("プロジェクトを検索", { exact: true }).fill("Alex");
    await expect(
      p.getByRole("cell", { name: "Brand system", exact: true }),
    ).toBeVisible();
  },
  command: async (p) => {
    await button(p, "コマンドを開く").press("Enter");
    const query = p.getByRole("combobox", {
      name: "コマンドを検索",
      exact: true,
    });
    await query.fill("title settings");
    await expect(p.locator('[data-slot="command-preview"]')).toContainText(
      "ノートの設定",
    );
    await query.press("Enter");
    await expect(button(p, "コマンドを開く")).toBeFocused();
    await p
      .getByLabel("ノートのタイトル", { exact: true })
      .fill("New notebook");
    await button(p, "コマンドを開く").click();
    await p
      .getByRole("combobox", { name: "コマンドを検索", exact: true })
      .fill("notes");
    await p.keyboard.press("Enter");
    await expect(p.locator(".study-cover strong")).toHaveText("New notebook");
  },
};
test.beforeEach(async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) =>
    r.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
});
for (const [slug, workflow] of Object.entries(workflows))
  test(`${slug}: complete interaction and recovery`, async ({ page }) => {
    await page.goto(`/components/${slug}/`);
    await expect(page.locator(".demo-interaction-boundary")).toHaveAttribute("data-ready", "true");
    await workflow(page);
  });
test("changed workflows fit narrow screens and remain accessible after interaction", async ({
  page,
}) => {
  test.setTimeout(240000);
  await page.setViewportSize({ width: 320, height: 900 });
  for (const slug of [
    "command",
    "date-picker",
    "data-table",
    "field",
    "card",
    "avatar",
    "dialog",
    "sheet",
    "popover",
    "otp-input",
  ]) {
    for (const theme of ["light", "dark"]) {
      await page.goto(`/components/${slug}/`);
      await page
        .getByRole("combobox", { name: "テーマ", exact: true })
        .selectOption(theme);
      await workflowForAudit(page, slug);
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(320);
      await page.waitForFunction(() =>
        document
          .getAnimations()
          .every(
            (a) =>
              a.playState !== "running" ||
              a.effect?.getTiming().iterations === Infinity ||
              !(
                (a.effect as KeyframeEffect)?.target as Element
              )?.checkVisibility(),
          ),
      );
      const { violations } = await new AxeBuilder({ page })
        .include(".example")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(
        violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            reason: n.failureSummary,
          })),
        })),
        slug,
      ).toEqual([]);
    }
  }
});
async function workflowForAudit(page: Page, slug: string) {
  if (slug === "command") {
    await button(page, "コマンドを開く").click();
    await page
      .getByRole("combobox", { name: "コマンドを検索", exact: true })
      .fill("settings");
  } else if (slug === "date-picker")
    await button(page, "公開日: 2026-10-30").click();
  else if (slug === "dialog") await button(page, "プロジェクトを編集").click();
  else if (slug === "sheet") await button(page, "表示を編集").click();
  else if (slug === "popover") await button(page, "キャンバスの設定").click();
  else await workflows[slug](page);
}

test('theme crossfade keeps underlying actions clickable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/components/data-table/');
  await page.getByRole('combobox', { name: 'テーマ', exact: true }).selectOption('dark');
  await button(page, 'Websiteの詳細').click();
  await expect(button(page, 'Websiteの詳細')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('[data-slot="data-table-detail"]:not([hidden])')).toContainText('トップページの余白');
});
