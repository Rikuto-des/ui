import { expect, test, type Locator, type Page } from "@playwright/test";

// Screenshots of every section of the component gallery, in both packs and
// both themes, plus the open state of each overlay. See playwright.visual.config.ts
// for the screenshot settings (Chromium only, exact match) and screenshot.css for
// what is frozen on the page.
const noWebFonts = (page: Page) => page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());

const packs = ["graphite", "lucent"];
const themes = ["light", "dark"];
/** The ids of the gallery's `.g-section`s, in page order. */
const sections = [
  "button",
  "link",
  "button-group",
  "toggle",
  "toggle-group",
  "menu",
  "context-menu",
  "menubar",
  "field",
  "form",
  "input-group",
  "textarea",
  "select",
  "checkbox",
  "switch",
  "radio-group",
  "slider",
  "date-input",
  "file-input",
  "otp-input",
  "card",
  "badge",
  "avatar",
  "kbd",
  "table",
  "chart",
  "item",
  "tabs",
  "accordion",
  "collapsible",
  "separator",
  "aspect-ratio",
  "scroll-area",
  "resizable",
  "carousel",
  "alert",
  "progress",
  "meter",
  "spinner",
  "skeleton",
  "empty",
  "breadcrumb",
  "pagination",
  "steps",
  "sidebar",
  "dialog",
  "alert-dialog",
  "sheet",
  "drawer",
  "popover",
  "hover-card",
  "tooltip",
  "toast",
];

type ToastFn = (message: string, options?: object) => string;
type Box = { x: number; y: number; width: number; height: number };

/** Waits until no transition or finite animation is running. Infinite ones are skipped. */
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

/** Scrolls `locator` to the middle of the viewport, so whatever opens from it lands in the same place every run. */
async function center(locator: Locator) {
  await locator.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
}

/** The whole-pixel box around all of `locators`, grown by `pad` and kept inside the viewport. */
async function around(page: Page, locators: Locator[], pad = 16): Promise<Box> {
  const boxes = await Promise.all(locators.map(async (l) => (await l.boundingBox())!));
  const { width, height } = page.viewportSize()!;
  const left = Math.max(0, Math.floor(Math.min(...boxes.map((b) => b.x)) - pad));
  const top = Math.max(0, Math.floor(Math.min(...boxes.map((b) => b.y)) - pad));
  const right = Math.min(width, Math.ceil(Math.max(...boxes.map((b) => b.x + b.width)) + pad));
  const bottom = Math.min(height, Math.ceil(Math.max(...boxes.map((b) => b.y + b.height)) + pad));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

/** Moves the pointer off the components so no hover style is captured. */
const pointerAway = (page: Page) => page.mouse.move(0, 0);

test("the list covers every section of the gallery", async ({ page }) => {
  await noWebFonts(page);
  await page.goto("/components.html");
  await expect(page.locator(".g-section")).toHaveCount(sections.length);
  expect(await page.locator(".g-section").evaluateAll((els) => els.map((el) => el.id))).toEqual(sections);
});

for (const pack of packs) {
  for (const theme of themes) {
    const name = `${pack}-${theme}`;

    test.describe(`${pack} / ${theme}`, () => {
      test.beforeEach(async ({ page }) => {
        await noWebFonts(page);
        await page.goto("/components.html");
        await expect(page.locator(".g-section")).toHaveCount(sections.length);
        await page.addStyleTag({ path: `${import.meta.dirname}/screenshot.css` });
        await page.evaluate(
          ([p, t]) => {
            document.documentElement.dataset.pack = p;
            document.documentElement.dataset.theme = t;
          },
          [pack, theme],
        );
        await page.evaluate(() => document.fonts.ready);
        await settle(page);
      });

      for (const id of sections) {
        test(id, async ({ page }) => {
          await expect(page.locator(`section#${id}`)).toHaveScreenshot([id, `${name}.png`]);
        });
      }

      test("menu: open", async ({ page }) => {
        const trigger = page.getByTestId("menu-trigger");
        await center(trigger);
        await trigger.click();
        const menu = page.getByTestId("row-menu");
        await expect(menu).toBeVisible();
        await pointerAway(page);
        await settle(page);
        const clip = await around(page, [page.locator("#menu .g-stage"), menu]);
        await expect(page).toHaveScreenshot(["menu", `${name}-open.png`], { clip });
      });

      test("menu: submenu open", async ({ page }) => {
        const trigger = page.getByTestId("sub-menu-trigger");
        await center(trigger);
        await trigger.focus();
        await page.keyboard.press("ArrowDown");
        await expect(page.getByTestId("task-menu").getByRole("menuitem", { name: "編集する" })).toBeFocused();
        const item = page.getByRole("menuitem", { name: "担当者を変える" });
        await page.keyboard.press("ArrowDown");
        await expect(item).toBeFocused();
        await page.keyboard.press("ArrowRight");
        const sub = page.getByRole("menu", { name: "担当者を変える" });
        await expect(sub).toBeVisible();
        await pointerAway(page);
        await settle(page);
        const clip = await around(page, [page.getByTestId("task-menu"), sub]);
        await expect(page).toHaveScreenshot(["menu", `${name}-submenu.png`], { clip });
      });

      test("context-menu: open", async ({ page }) => {
        const file = page.getByTestId("file-area").getByRole("button", { name: "見積もり.xlsx" });
        await center(file);
        await file.focus();
        await page.keyboard.press("Shift+F10");
        const menu = page.getByTestId("file-menu");
        await expect(menu.getByRole("menuitem", { name: "開く" })).toBeFocused();
        await pointerAway(page);
        await settle(page);
        const clip = await around(page, [page.getByTestId("file-area"), menu]);
        await expect(page).toHaveScreenshot(["context-menu", `${name}-open.png`], { clip });
      });

      test("menubar: open", async ({ page }) => {
        const bar = page.getByTestId("menubar");
        const edit = bar.getByRole("menuitem", { name: "編集", exact: true });
        await center(bar);
        await edit.focus();
        await page.keyboard.press("ArrowDown");
        const menu = page.getByRole("menu", { name: "編集", exact: true });
        await expect(menu.getByRole("menuitem", { name: "元に戻す" })).toBeFocused();
        await pointerAway(page);
        await settle(page);
        const clip = await around(page, [bar, menu]);
        await expect(page).toHaveScreenshot(["menubar", `${name}-open.png`], { clip });
      });

      test("drawer: open", async ({ page }) => {
        await page.getByTestId("open-drawer").click();
        const drawer = page.getByTestId("drawer");
        await expect(drawer).toBeVisible();
        await pointerAway(page);
        await settle(page);
        await expect(page).toHaveScreenshot(["drawer", `${name}-open.png`]);
      });

      test("tooltip: open", async ({ page }) => {
        const trigger = page.getByTestId("tip-trigger");
        await center(trigger);
        await trigger.hover();
        const tooltip = page.getByTestId("tip-copy");
        await expect(tooltip).toBeVisible({ timeout: 3000 });
        await settle(page);
        const clip = await around(page, [page.locator("#tooltip .g-stage"), tooltip]);
        await expect(page).toHaveScreenshot(["tooltip", `${name}-open.png`], { clip });
      });

      test("popover: open", async ({ page }) => {
        const trigger = page.getByTestId("open-display");
        await center(trigger);
        await trigger.click();
        const popover = page.locator("#g-display");
        await expect(popover).toBeVisible();
        await pointerAway(page);
        await settle(page);
        const clip = await around(page, [page.locator("#popover .g-stage"), popover]);
        await expect(page).toHaveScreenshot(["popover", `${name}-open.png`], { clip });
      });

      test("dialog: open", async ({ page }) => {
        const trigger = page.getByTestId("open-invite");
        await center(trigger);
        await trigger.click();
        const dialog = page.locator("dialog#g-invite");
        await expect(dialog).toBeVisible();
        await pointerAway(page);
        await settle(page);
        // The margin keeps the shadow and some of the backdrop in the picture.
        const clip = await around(page, [dialog], 40);
        await expect(page).toHaveScreenshot(["dialog", `${name}-open.png`], { clip });
      });

      test("alert-dialog: open", async ({ page }) => {
        const trigger = page.getByTestId("open-delete");
        await center(trigger);
        await trigger.click();
        const dialog = page.getByTestId("delete-dialog");
        await expect(dialog).toBeVisible();
        await pointerAway(page);
        await settle(page);
        const clip = await around(page, [dialog], 40);
        await expect(page).toHaveScreenshot(["alert-dialog", `${name}-open.png`], { clip });
      });

      test("sheet: open", async ({ page }) => {
        const trigger = page.getByTestId("open-sheet");
        await center(trigger);
        await trigger.click();
        await expect(page.getByTestId("task-sheet")).toBeVisible();
        await pointerAway(page);
        await settle(page);
        // The whole viewport: the sheet runs from the top edge to the bottom.
        await expect(page).toHaveScreenshot(["sheet", `${name}-open.png`]);
      });

      test("hover-card: open", async ({ page }) => {
        const trigger = page.getByTestId("hc-trigger");
        await center(trigger);
        await trigger.hover();
        const card = page.getByTestId("hc-card");
        await expect(card).toBeVisible({ timeout: 3000 });
        await settle(page);
        const clip = await around(page, [page.locator("#hover-card .g-stage"), card]);
        await expect(page).toHaveScreenshot(["hover-card", `${name}-open.png`], { clip });
      });

      test("toast: open", async ({ page }) => {
        await center(page.locator("section#toast"));
        // duration: 0 keeps every toast up until the screenshot is taken.
        await page.evaluate(() => {
          const toast = (window as unknown as { urushiToast: ToastFn }).urushiToast;
          toast("下書きを保存しました", { duration: 0 });
          toast("タスクを削除しました", { duration: 0, action: { label: "元に戻す", onClick: () => {} } });
          toast("タスクを元に戻しました", { duration: 0, tone: "ok" });
          toast("送信できませんでした", {
            duration: 0,
            tone: "danger",
            description: "通信状態を確かめて、もう一度送ってください。",
          });
        });
        const toasts = page.locator('[data-slot="toast"]');
        await expect(toasts).toHaveCount(4);
        await settle(page);
        const clip = await around(page, [page.locator('[data-slot="toast-list"]')]);
        await expect(page).toHaveScreenshot(["toast", `${name}-open.png`], { clip });
      });
    });
  }
}
