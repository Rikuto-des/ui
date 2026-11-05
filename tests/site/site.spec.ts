import { readdirSync } from "node:fs";
import { join } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// The documentation site (apps/site), as a static export with every page prerendered.
// Web fonts are answered with an empty stylesheet (not aborted, which would log console errors).
const noWebFonts = (page: Page) =>
  page.route(/fonts\.(googleapis|gstatic)\.com/, (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
// Every contract has a page.
const slugs = readdirSync(join(import.meta.dirname, "../../contracts"))
  .filter((f) => f.endsWith(".contract.ts"))
  .map((f) => f.replace(".contract.ts", ""));
const pages = [
  "/",
  "/components/",
  "/docs/",
  "/docs/packs/",
  "/docs/typesetting/",
  "/docs/design/",
  "/docs/ai/",
  "/docs/cli/",
  "/docs/browsers/",
  "/docs/comparison/",
];

test.use({ reducedMotion: "reduce" });
test.beforeEach(async ({ page }) => noWebFonts(page));

test("every page renders without errors and has one h1", async ({ page }) => {
  const errors: string[] = [];
  let current = "";
  page.on("pageerror", (e) => errors.push(`${current} ${e.message}`));
  page.on(
    "console",
    (m) => m.type() === "error" && errors.push(`${current} ${m.text()}`),
  );
  for (const path of [...pages, ...slugs.map((s) => `/components/${s}/`)]) {
    current = path;
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
    await expect(page.locator("h1"), path).toHaveCount(1);
  }
  expect(errors).toEqual([]);
});

// Give each page its own interaction budget; 58 navigations must not share 30s.
for (const slug of slugs) {
  test(`${slug}: live example, source, install command and props`, async ({
    page,
  }) => {
    await page.goto(`/components/${slug}/`);
    await expect(page.locator("html")).toHaveAttribute(
      "data-urushi-runtime",
      "ready",
    );
    await expect(
      page.locator(".example .stage [data-slot]").first(),
      slug,
    ).toBeVisible();
    await page.getByRole("tab", { name: "Code", exact: true }).click();
    await expect(page.locator(".example .stage"), slug).toBeHidden();
    await expect(page.locator(".example .code-block"), slug).toBeVisible();
    await expect(page.locator(".example .code-block"), slug).toContainText(
      "@urushi/react",
    );
    await page.getByRole("tab", { name: "Preview", exact: true }).click();
    await expect(page.locator(".example .stage"), slug).toBeVisible();
    await expect(
      page.getByText(`npx urushi add ${slug}`),
      slug,
    ).toBeVisible();
    await expect(
      page.locator(".part").first().locator("h3"),
      slug,
    ).toBeVisible();
  });
}

test("the docs index marks the current page and links every component", async ({
  page,
}) => {
  await page.goto("/components/tabs/");
  const nav = page.getByRole("navigation", { name: "ドキュメントの目次" });
  await expect(
    nav.getByRole("link", { name: "Tabs", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  for (const slug of slugs)
    await expect(nav.locator(`a[href="/components/${slug}/"]`)).toHaveCount(1);
});

test("the documented external tab action works after pointer and keyboard selection", async ({
  page,
}) => {
  await page.goto("/components/tabs/");
  const demo = page.locator(".example .stage");
  for (let i = 0; i < 2; i++) {
    await demo.getByRole("button", { name: "残りのタスクを見る" }).click();
    await expect(
      demo.getByRole("tab", { name: "タスク 4", exact: true }),
    ).toHaveAttribute("aria-selected", "true");
    await demo.getByRole("tab", { name: "概要", exact: true }).click();
    await demo
      .getByRole("tab", { name: "概要", exact: true })
      .press("ArrowRight");
    await expect(
      demo.getByRole("tabpanel", { name: "タスク 4", exact: true }),
    ).toBeVisible();
    await demo.getByRole("tab", { name: "概要", exact: true }).click();
  }
});

test("the pack and theme switches restyle the site and are remembered", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: "パック" }).selectOption("lucent");
  await page.getByRole("combobox", { name: "テーマ" }).selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-pack", "lucent");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.goto("/docs/");
  await expect(page.locator("html")).toHaveAttribute("data-pack", "lucent");
  await expect(page.getByRole("combobox", { name: "パック" })).toHaveValue(
    "lucent",
  );
});

test("rapid pack and theme changes retain both choices while a view transition waits", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: () => { throw new Error("Appearance must not block hit testing with a page snapshot"); },
    });
  });
  await page.goto("/");
  const pack = page.getByRole("combobox", { name: "パック" });
  const theme = page.getByRole("combobox", { name: "テーマ" });
  await pack.selectOption("lucent");
  await theme.selectOption("dark");
  await expect(pack).toHaveValue("lucent");
  await expect(theme).toHaveValue("dark");
  await expect(page.locator("html")).toHaveAttribute("data-pack", "lucent");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(pack).toHaveValue("lucent");
  await expect(theme).toHaveValue("dark");
});

test.describe("small screens", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("keeps navigation and theme selection usable, including at 320px", async ({
    page,
  }) => {
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/components/dialog/");
      await expect(
        page.getByRole("combobox", { name: "テーマ" }),
      ).toBeVisible();
      await page.getByRole("combobox", { name: "テーマ" }).selectOption("dark");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await page.locator(".docs-mobile summary").click();
      const nav = page.getByRole("navigation", { name: "モバイルの目次" });
      await expect(
        nav.getByRole("link", { name: "Dialog", exact: true }),
      ).toHaveAttribute("aria-current", "page");
      await nav.getByRole("link", { name: "ブラウザの対応" }).click();
      await expect(page).toHaveURL(/\/docs\/browsers\/$/);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  });

  test("the mobile index works without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await noWebFonts(page);
    await page.goto("http://localhost:3201/docs/");
    await page.locator(".docs-mobile summary").press("Enter");
    await page
      .getByRole("navigation", { name: "モバイルの目次" })
      .getByRole("link", { name: "CLI", exact: true })
      .click();
    await expect(page).toHaveURL(/\/docs\/cli\/$/);
    await context.close();
  });
});

test("documentation-only pages do not ship component implementations", async ({
  page,
}) => {
  await page.goto("/docs/", { waitUntil: "networkidle" });
  const urls = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter(
        (e) => (e as PerformanceResourceTiming).initiatorType === "script",
      )
      .map((e) => e.name),
  );
  const all = (
    await Promise.all(
      urls.map((u) => page.request.get(u).then((r) => r.text())),
    )
  ).join("\n");
  for (const marker of [
    "accordion-trigger",
    "field-required",
    "card-header",
    "dialog-actions",
    "Tabs.Tab must be",
  ]) {
    expect(all, `component code "${marker}" was shipped`).not.toContain(marker);
  }
});

test("the agent workflow shows actual diagnostics and the corrected example", async ({
  page,
}) => {
  await page.goto("/docs/ai/");
  await expect(page.locator(".agent-diagnostics")).toContainText(
    "urushi/valid-props",
  );
  await expect(page.locator(".agent-diagnostics")).toContainText(
    "urushi/required-props",
  );
  await page.getByText("修正後：エラー0件・警告0件", { exact: true }).click();
  await expect(
    page.locator(".agent-example").last().locator(".code-block"),
  ).toBeVisible();
  await expect(page.locator(".agent-example").last()).toContainText(
    "Dialog.Trigger",
  );
});

test.describe("with JavaScript disabled", () => {
  test.use({ javaScriptEnabled: false });

  test("the home page dialog and task menu open without JavaScript", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "タスクを追加" }).click();
    await expect(
      page.getByRole("dialog", { name: "タスクを追加" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "キャンセル" }).click();
    await expect(
      page.getByRole("dialog", { name: "タスクを追加" }),
    ).toBeHidden();
    await page
      .getByRole("button", { name: "コンセプトを言葉にするの操作" })
      .click();
    await expect(
      page.getByRole("menu", { name: "タスクの操作" }),
    ).toBeVisible();
  });

  test("component examples work", async ({ page }) => {
    await page.goto("/components/accordion/");
    const items = page.locator(".stage details");
    await page
      .locator(".stage")
      .getByText("02　共有する相手", { exact: true })
      .click();
    await expect(items.nth(1)).toHaveAttribute("open", "");
    await expect(items.nth(0)).not.toHaveAttribute("open");
  });
});

for (const pack of ["graphite", "lucent"]) {
  for (const theme of ["light", "dark"]) {
    test(`no WCAG A/AA violations: ${pack} / ${theme}`, async ({ page }) => {
      for (const path of [
        "/",
        "/components/tabs/",
        "/docs/browsers/",
        "/docs/comparison/",
      ]) {
        await page.goto(path);
        await page.evaluate(
          ([p, t]) =>
            Object.assign(document.documentElement.dataset, {
              pack: p,
              theme: t,
            }),
          [pack, theme],
        );
        await page.waitForFunction(() =>
          document.getAnimations().every(
            (a) =>
              a.playState !== "running" ||
              a.effect?.getTiming().iterations === Infinity ||
              // Firefox never advances transitions inside a closed <details>: they are not rendered.
              !(
                (
                  (a.effect as KeyframeEffect | null)?.target as Element | null
                )?.checkVisibility() ?? true
              ),
          ),
        );
        const { violations } = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(
          violations.map(
            (v) =>
              `${path} ${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
          ),
        ).toEqual([]);
      }
    });
  }
}
