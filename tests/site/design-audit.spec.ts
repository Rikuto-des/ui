import { readdirSync } from "node:fs";
import { join } from "node:path";
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const slugs = readdirSync(join(import.meta.dirname, "../../contracts"))
  .filter((f) => f.endsWith(".contract.ts"))
  .map((f) => f.replace(".contract.ts", ""));
const settle = (page: Page) =>
  page.waitForFunction(() =>
    document
      .getAnimations()
      .every(
        (a) =>
          a.playState !== "running" ||
          a.effect?.getTiming().iterations === Infinity ||
          !((a.effect as KeyframeEffect)?.target as Element)?.checkVisibility(),
      ),
  );
const audit = async (page: Page, scope = "main", soft = false) => {
  // Demos stay disabled until their chunk loads; axe would report that state.
  await expect(page.locator(scope).locator(".demo-interaction-boundary:disabled")).toHaveCount(0);
  await settle(page);
  const { violations } = await new AxeBuilder({ page })
    .include(scope)
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  (soft ? expect.soft : expect)(
    violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        reason: n.failureSummary,
      })),
    })),
  ).toEqual([]);
};
test.beforeEach(async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) =>
    r.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
});

for (const pack of ["graphite", "lucent"])
  for (const theme of ["light", "dark"]) {
    test(`all 52 detail previews: accessibility and reflow — ${pack}/${theme}`, async ({
      page,
    }) => {
      test.setTimeout(180000);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/components/");
      await page
        .getByRole("combobox", { name: "パック", exact: true })
        .selectOption(pack);
      await page
        .getByRole("combobox", { name: "テーマ", exact: true })
        .selectOption(theme);
      for (const slug of slugs) {
        await test.step(slug, async () => {
          await page.setViewportSize({ width: 1280, height: 960 });
          await page.goto(`/components/${slug}/`);
          await audit(page, ".example", true);
          await page.setViewportSize({ width: 320, height: 800 });
          await expect
            .poll(
              () => page.evaluate(() => document.documentElement.scrollWidth),
              slug,
            )
            .toBeLessThanOrEqual(320);
          const stage = page.locator(".stage");
          expect(
            await stage.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
            `${slug} preview overflows`,
          ).toBe(true);
        });
      }
    });
  }

test("detail examples respond to saving, validation and keyboard selection", async ({
  page,
}) => {
  await page.goto("/components/button/");
  await page
    .getByLabel("ノートのタイトル", { exact: true })
    .fill("Design studio");
  const save = page
    .locator(".stage")
    .getByRole("button", { name: "変更を保存", exact: true });
  await save.click();
  await expect(page.locator('.stage [aria-busy="true"]')).toBeVisible();
  await expect(
    page
      .locator(".stage")
      .getByRole("button", { name: "保存しました", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".study-result strong")).toHaveText(
    "Design studio",
  );
  await page
    .locator(".stage")
    .getByRole("button", { name: "変更を戻す", exact: true })
    .click();
  await expect(save).toBeVisible();
  await page.goto("/components/field/");
  await page.getByRole("button", { name: "形式を確認", exact: true }).click();
  const input = page.getByLabel("ワークスペース名", { exact: false });
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await input.fill("design-studio");
  await page.getByRole("button", { name: "形式を確認", exact: true }).click();
  await expect(input).not.toHaveAttribute("aria-invalid", "true");
  await expect(page.locator('[data-slot="field-success"]')).toBeVisible();
  await page.goto("/components/tabs/");
  await page
    .locator(".stage")
    .getByLabel("プロジェクト名")
    .fill("Design studio");
  await page
    .locator(".stage")
    .getByRole("tab", { name: "概要", exact: true })
    .press("ArrowRight");
  await expect(
    page
      .locator(".stage")
      .getByRole("tabpanel", { name: "タスク 4", exact: true }),
  ).toBeVisible();
  await page
    .locator(".stage")
    .getByRole("tab", { name: "タスク 4", exact: true })
    .press("ArrowLeft");
  await expect(page.locator(".stage").getByLabel("プロジェクト名")).toHaveValue(
    "Design studio",
  );
});
test("open detail overlays preserve focus, validate and pass axe in both packs and themes", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const pack of ["graphite", "lucent"])
    for (const theme of ["light", "dark"]) {
      await page.goto("/components/dialog/");
      await page
        .getByRole("combobox", { name: "パック", exact: true })
        .selectOption(pack);
      await page
        .getByRole("combobox", { name: "テーマ", exact: true })
        .selectOption(theme);
      const trigger = page
        .locator(".stage")
        .getByRole("button", { name: "プロジェクトを編集", exact: true });
      await expect(trigger).toBeEnabled();
      await trigger.press("Enter");
      const dialog = page.getByRole("dialog", {
        name: "プロジェクトを編集",
        exact: true,
      });
      await expect(dialog).toBeVisible();
      await audit(page, "#study-dialog");
      await dialog.getByLabel("プロジェクト名", { exact: true }).fill("");
      await expect(
        dialog.getByRole("button", { name: "内容を確認", exact: true }),
      ).toBeDisabled();
      await dialog
        .getByLabel("プロジェクト名", { exact: true })
        .fill("Design studio");
      for (let index = 0; index < 8; index++) {
        await page.keyboard.press("Tab");
        expect(
          await dialog.evaluate(
            (el) =>
              document.activeElement === document.body ||
              el.contains(document.activeElement),
          ),
        ).toBe(true);
      }
      await dialog
        .getByRole("button", { name: "内容を確認", exact: true })
        .click();
      await audit(page, "#study-dialog");
      await dialog
        .getByRole("button", { name: "変更を反映", exact: true })
        .click();
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
      for (const [slug, label, role] of [
        ["alert-dialog", "アーカイブする", "alertdialog"],
        ["sheet", "表示を編集", "dialog"],
        ["popover", "キャンバスの設定", ""],
      ] as const) {
        await page.goto(`/components/${slug}/`);
        await page
          .locator(".stage")
          .getByRole("button", { name: label, exact: true })
          .click();
        const overlay = role
          ? page.getByRole(role)
          : page.locator('[data-slot="popover"]');
        await expect(overlay).toBeVisible();
        await audit(
          page,
          role ? '[role="' + role + '"], dialog' : '[data-slot="popover"]',
        );
        await page.keyboard.press("Escape");
        if (slug === "alert-dialog") {
          await expect(overlay).toBeVisible();
          await overlay
            .getByRole("button", { name: "キャンセル", exact: true })
            .click();
        }
        await expect(overlay).toBeHidden();
      }
    }
});
test("tooltip is hoverable, dismissible and cancels a pending fallback on Escape", async ({
  page,
}) => {
  await page.goto("/components/tooltip/");
  const trigger = page.getByRole("button", {
    name: "ノートを保存",
    exact: true,
  });
  const tip = page.locator("#save-note-hint");
  await expect(trigger).toBeEnabled();
  await trigger.hover();
  await expect(tip).toBeVisible();
  await tip.hover();
  await page.waitForTimeout(500);
  await expect(tip).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tip).toBeHidden();
  await page.mouse.move(0, 0);
  await trigger.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(tip).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tip).toBeHidden();
  if (
    !(await page.evaluate(
      () => "interestForElement" in HTMLButtonElement.prototype,
    ))
  ) {
    await page.getByRole("heading", { name: "Tooltip", exact: true }).click();
    await page.mouse.move(0, 0);
    await trigger.hover();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(550);
    await expect(tip).toBeHidden();
  }
});

test("forced colors preserve selection marks and keyboard focus", async ({
  page,
}, info) => {
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.goto("/components/");
  test.skip(
    !(await page.evaluate(() => matchMedia("(forced-colors: active)").matches)),
    "Engine does not emulate forced colors",
  );
  for (const slug of ["checkbox", "switch", "radio-group"]) {
    const input = page
      .locator(`[data-component="${slug}"] input:checked`)
      .first();
    await expect(input).toBeEnabled();
    await input.focus();
    await expect(input).toBeFocused();
    await settle(page);
    const style = await input.evaluate((el) => {
      const s = getComputedStyle(el),
        mark = getComputedStyle(el, "::before");
      return {
        background: s.backgroundColor,
        border: s.borderColor,
        outline: s.outlineStyle,
        outlineWidth: parseFloat(s.outlineWidth),
        mark: mark.backgroundColor,
        adjust: s.forcedColorAdjust,
      };
    });
    expect(style.outline).toBe("solid");
    expect(style.outlineWidth).toBeGreaterThanOrEqual(2);
    expect(style.mark).not.toBe(style.background);
    // WebKit emulates the media query but does not implement this property.
    if (await page.evaluate(() => CSS.supports("forced-color-adjust", "none")))
      expect(style.adjust).toBe("none");
  }
  await page.goto("/components/input/");
  const input = page.getByLabel("プロジェクト名", { exact: true });
  await expect(input).toBeEnabled();
  await input.focus();
  await expect(input).toBeFocused();
  expect(
    await input.evaluate(
      (el) =>
        getComputedStyle(el.closest('[data-slot="input-group"]') ?? el)
          .outlineStyle,
    ),
  ).toBe("solid");
  await info.attach("forced-colors-input", {
    body: await page.screenshot(),
    contentType: "image/png",
  });
});

test("reduced motion removes switch travel and spinner rotation; normal response has no delayed check", async ({
  page,
}) => {
  await page.goto("/components/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const toggle = page.locator('[data-component="switch"] input').first();
  await toggle.uncheck();
  await toggle.check();
  expect(
    await toggle.evaluate(
      (el) => getComputedStyle(el, "::before").transitionDuration,
    ),
  ).toBe("0s");
  expect(
    await page
      .locator('[data-component="spinner"] [data-slot="spinner-ring"]')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const check = page.locator('[data-component="checkbox"] input').first();
  await check.uncheck();
  await check.check();
  expect(
    await check.evaluate(
      (el) => getComputedStyle(el, "::before").transitionDelay,
    ),
  ).toBe("0s");
});
