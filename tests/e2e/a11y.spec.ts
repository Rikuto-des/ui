import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const noWebFonts = (page: Page) => page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// A scan may include several axe passes. A cold Linux WebKit worker exceeded
// 30 seconds while the same checks passed after warm-up. This is an audit
// execution budget, not an increased UI assertion or interaction timeout.
test.describe.configure({ timeout: 60_000 });

/**
 * Waits until no transition or finite animation is running, so contrast is
 * measured on final colors. Spinners loop forever and are skipped.
 */
async function settle(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every(
      (a) =>
        a.playState !== "running" ||
        a.effect?.getTiming().iterations === Infinity ||
        // Firefox never advances transitions inside a closed <details>: they are not rendered.
        !(((a.effect as KeyframeEffect | null)?.target as Element | null)?.checkVisibility() ?? true),
    ),
  );
}

async function scan(page: Page, include?: string) {
  await test.step("wait for final rendered colors", () => settle(page));
  let builder = new AxeBuilder({ page }).withTags(WCAG);
  if (include) builder = builder.include(include);
  const { violations } = await test.step("scan WCAG rules with axe", () => builder.analyze());
  return violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
}

test.use({ reducedMotion: "reduce" });

for (const pack of ["graphite", "lucent"]) {
  for (const theme of ["light", "dark"]) {
    test.describe(`${pack} / ${theme}`, () => {
      test.beforeEach(async ({ page }) => {
        await noWebFonts(page);
        await page.goto("/");
        await page.evaluate(
          ([p, t]) => {
            document.documentElement.dataset.pack = p;
            document.documentElement.dataset.theme = t;
          },
          [pack, theme],
        );
      });

      test("the page has no WCAG A/AA violations", async ({ page }) => {
        expect(await scan(page)).toEqual([]);
      });

      test("an open modal dialog has no WCAG A/AA violations", async ({ page }) => {
        await page.getByTestId("open-confirm").click();
        await expect(page.locator("dialog#confirm-delete")).toBeVisible();
        expect(await scan(page, "dialog#confirm-delete")).toEqual([]);
      });

      test("an open popover has no WCAG A/AA violations", async ({ page }) => {
        await page.getByTestId("open-filters").click();
        await expect(page.getByTestId("filters")).toBeVisible();
        expect(await scan(page, "#filters")).toEqual([]);
      });
    });
  }
}

for (const pack of ["graphite", "lucent"]) {
  for (const theme of ["light", "dark"]) {
    test.describe(`component gallery: ${pack} / ${theme}`, () => {
      test.beforeEach(async ({ page }) => {
        await noWebFonts(page);
        await page.goto("/components.html");
        await page.evaluate(
          ([p, t]) => {
            document.documentElement.dataset.pack = p;
            document.documentElement.dataset.theme = t;
          },
          [pack, theme],
        );
      });

      test("the gallery has no WCAG A/AA violations", async ({ page }) => {
        expect(await scan(page)).toEqual([]);
      });

      test("an open menu and a tooltip have no violations", async ({ page }) => {
        await page.getByTestId("menu-trigger").click();
        await expect(page.getByTestId("row-menu")).toBeVisible();
        expect(await scan(page, "#row-menu")).toEqual([]);
        await page.keyboard.press("Escape");
        await page.getByTestId("tip-trigger").hover();
        await expect(page.getByTestId("tip-copy")).toBeVisible({ timeout: 3000 });
        expect(await scan(page, "#tip-copy")).toEqual([]);
      });

      test("an open alert dialog, sheet and hover card have no violations", async ({ page }) => {
        await page.getByTestId("open-delete").click();
        await expect(page.getByTestId("delete-dialog")).toBeVisible();
        expect(await scan(page, "dialog#g-delete")).toEqual([]);
        await page.getByTestId("delete-cancel").click();
        await page.getByTestId("open-sheet").click();
        await expect(page.getByTestId("task-sheet")).toBeVisible();
        expect(await scan(page, "dialog#g-task-sheet")).toEqual([]);
        await page.keyboard.press("Escape");
        await expect(page.getByTestId("task-sheet")).toBeHidden();
        await page.getByTestId("hc-trigger").hover();
        await expect(page.getByTestId("hc-card")).toBeVisible({ timeout: 3000 });
        expect(await scan(page, "#g-person")).toEqual([]);
      });

      test("toasts, including one above a modal, have no violations", async ({ page }) => {
        await page.getByTestId("toast-error").click();
        await page.getByTestId("toast-undo").click();
        await expect(page.locator('[data-slot="toast"]')).toHaveCount(2);
        expect(await scan(page, '[data-slot="toaster"]')).toEqual([]);
        await page.getByTestId("open-invite").click();
        await page.evaluate(() => (window as unknown as { urushiToast: (m: string) => void }).urushiToast("ダイアログの上に出ます"));
        await expect(page.locator("[data-ur-outlet]").getByText("ダイアログの上に出ます")).toBeVisible();
        expect(await scan(page, "dialog#g-invite")).toEqual([]);
      });
    });
  }
}

test.describe("accessibility tree", () => {
  test.beforeEach(async ({ page }) => {
    await noWebFonts(page);
    await page.goto("/");
  });

  test("the confirm dialog exposes a named dialog, its heading, description and actions", async ({ page }) => {
    await page.getByTestId("open-confirm").click();
    await expect(page.locator("dialog#confirm-delete")).toMatchAriaSnapshot(`
      - dialog "「秋のキャンペーン」を削除しますか？":
        - heading "「秋のキャンペーン」を削除しますか？" [level=2]
        - paragraph: タスク 5 件とコメントがすべて消えます。この操作は取り消せません。
        - button "キャンセル"
        - button "削除する"
    `);
  });

  test("the filter popover is a named dialog with labelled checkboxes", async ({ page }) => {
    await page.getByTestId("open-filters").click();
    await expect(page.getByTestId("filters")).toMatchAriaSnapshot(`
      - dialog "状態で絞り込む":
        - text: 状態で絞り込む
        - group "状態":
          - text: 状態
          - checkbox "未着手" [checked]
          - text: 未着手 1
          - checkbox "対応中" [checked]
          - text: 対応中 1
          - checkbox "完了"
          - text: 完了 1
        - button "閉じる"
    `);
    // The count sits outside the label and describes the checkbox.
    await expect(page.getByRole("checkbox", { name: "未着手" })).toHaveAccessibleDescription("1");
  });

  test("Chromium's platform tree reports the dialog as modal and the page behind as hidden", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "reads the platform accessibility tree through CDP");
    const cdp = await page.context().newCDPSession(page);
    await page.getByTestId("open-confirm").click();
    await expect(page.locator("dialog#confirm-delete")).toBeVisible();
    const { nodes } = (await cdp.send("Accessibility.getFullAXTree")) as {
      nodes: { ignored: boolean; name?: { value: string }; role?: { value: string }; properties?: { name: string; value: { value: unknown } }[] }[];
    };
    const dialog = nodes.find((n) => n.role?.value === "dialog" && n.name?.value === "「秋のキャンペーン」を削除しますか？");
    expect(dialog?.properties?.find((p) => p.name === "modal")?.value.value).toBe(true);
    // The page behind a modal is inert: its buttons are not exposed.
    const visibleShare = nodes.find((n) => !n.ignored && n.role?.value === "button" && n.name?.value === "共有");
    expect(visibleShare).toBeUndefined();
  });
});
