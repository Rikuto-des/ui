import { expect, test, type Locator } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
test.beforeEach(async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
});

const position = (nav: Locator) => nav.evaluate((el) => el.scrollTop);
const visibleInside = (link: Locator) =>
  link.evaluate((el) => {
    const item = el.getBoundingClientRect();
    const nav = el.closest("nav")!.getBoundingClientRect();
    return item.top >= nav.top && item.bottom <= nav.bottom;
  });

test("lower sidebar links retain position through navigation, reload and history", async ({
  page,
}) => {
  await page.goto("/components/button/", { waitUntil: "networkidle" });
  const nav = page.getByRole("navigation", {
    name: "ドキュメントの目次",
    exact: true,
  });
  await nav.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  const top = await position(nav);
  expect(top).toBeGreaterThan(1000);
  const origin = await page.evaluate(() => performance.timeOrigin);
  for (const [label, path] of [
    ["Tooltip", "tooltip"],
    ["Sheet", "sheet"],
  ]) {
    await nav.getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/components/${path}/$`));
    await expect
      .poll(async () => Math.abs((await position(nav)) - top))
      .toBeLessThan(2);
    expect(
      await visibleInside(nav.getByRole("link", { name: label, exact: true })),
    ).toBe(true);
    expect(await page.evaluate(() => performance.timeOrigin)).toBe(origin);
    expect(await page.evaluate(() => scrollY)).toBe(0);
    if (path === "tooltip") {
      await page.evaluate(() => window.scrollTo(0, 800));
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
    }
  }
  // The runtime and modal focus behavior must still work after client navigation.
  await page
    .locator(".stage")
    .getByRole("button", { name: "表示を編集" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.reload({ waitUntil: "networkidle" });
  await expect
    .poll(async () => Math.abs((await position(nav)) - top))
    .toBeLessThan(2);
  await page.goBack();
  await expect(page).toHaveURL(/\/components\/tooltip\/$/);
  await expect
    .poll(async () => Math.abs((await position(nav)) - top))
    .toBeLessThan(2);
  await page.goForward();
  await expect(page).toHaveURL(/\/components\/sheet\/$/);
  await expect
    .poll(async () => Math.abs((await position(nav)) - top))
    .toBeLessThan(2);
});

test("a direct lower-page visit reveals its entry without scrolling the document, even with storage blocked", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "sessionStorage", {
      get() {
        throw new DOMException("Blocked", "SecurityError");
      },
    });
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/components/toast/", { waitUntil: "networkidle" });
  const nav = page.getByRole("navigation", {
    name: "ドキュメントの目次",
    exact: true,
  });
  await expect
    .poll(() =>
      visibleInside(nav.getByRole("link", { name: "Toast", exact: true })),
    )
    .toBe(true);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await nav.getByRole("link", { name: "Tooltip", exact: true }).press("Enter");
  await expect(page).toHaveURL(/\/components\/tooltip\/$/);
  await expect
    .poll(() =>
      visibleInside(nav.getByRole("link", { name: "Tooltip", exact: true })),
    )
    .toBe(true);
  expect(errors).toEqual([]);
});

test("mobile visits do not replace the desktop sidebar position", async ({
  page,
}) => {
  await page.goto("/components/tooltip/", { waitUntil: "networkidle" });
  const nav = page.getByRole("navigation", {
    name: "ドキュメントの目次",
    exact: true,
  });
  await nav.getByRole("link", { name: "Toast", exact: true }).click();
  await expect(page).toHaveURL(/\/components\/toast\/$/);
  const top = await position(nav);
  expect(top).toBeGreaterThan(1000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "networkidle" });
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect
    .poll(async () => Math.abs((await position(nav)) - top))
    .toBeLessThan(2);
  expect(
    await visibleInside(nav.getByRole("link", { name: "Toast", exact: true })),
  ).toBe(true);
});

test("the index is alphabetical and search restores its scroll position when cleared", async ({ page }) => {
  await page.goto("/components/tooltip/");
  const nav = page.getByRole("navigation", { name: "ドキュメントの目次", exact: true });
  const names = await nav.locator('.docs-nav-group').last().getByRole("link").allTextContents();
  expect(names).toHaveLength(60);
  expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "en")));
  const before = await position(nav);
  await page.keyboard.press("Control+k");
  const search = page.locator('.docs-sidebar').getByRole("searchbox", { name: "ドキュメントを検索" });
  await expect(search).toBeFocused();
  await search.fill("Date Picker");
  await expect(nav.getByRole("link")).toHaveCount(1);
  await expect(nav.getByRole("link", { name: "DatePicker", exact: true })).toBeVisible();
  await search.press("Escape");
  await expect(search).toHaveValue("");
  await expect.poll(async () => Math.abs((await position(nav)) - before)).toBeLessThan(2);
  await search.fill("no-such-component");
  await expect(nav.getByText("一致するページがありません。")).toBeVisible();
  await nav.getByRole("button", { name: "検索をクリア" }).click();
  await expect(search).toBeFocused();
  await search.fill("combobox");
  await search.press("ArrowDown");
  await expect(nav.getByRole("link", { name: "Combobox", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/components\/combobox\/$/);
  await expect(nav.getByRole("link", { name: "Combobox", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(search).toHaveValue("");
});

test("sidebar scrolling keeps search available and does not scroll the document at either edge", async ({ page }) => {
  await page.goto("/components/tooltip/");
  const nav = page.getByRole("navigation", { name: "ドキュメントの目次", exact: true });
  const search = page.locator('.docs-sidebar').getByRole("searchbox");
  const start = await search.boundingBox();
  await nav.evaluate(el => { el.scrollTop = el.scrollHeight; });
  await nav.hover();
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  expect((await search.boundingBox())!.y).toBe(start!.y);
  const frame = await nav.boundingBox();
  expect(frame!.y + frame!.height).toBeLessThanOrEqual(800);
  await nav.evaluate(el => { el.scrollTop = 0; });
  await page.mouse.wheel(0, -1200);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => scrollY)).toBe(0);
});

test("mobile navigation overlays the page, restores focus and closes after choosing a result", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/components/checkbox/");
  await page.evaluate(() => scrollTo(0, 600));
  const top = await page.evaluate(() => scrollY);
  const trigger = page.locator('.docs-mobile summary');
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "ドキュメント", exact: true });
  await expect(dialog).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(await page.evaluate(() => scrollY)).toBe(top);
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    // Safari can move Tab into browser chrome; the page behind the dialog must stay inert.
    expect(await dialog.evaluate(el => el.contains(document.activeElement) || document.activeElement === document.body)).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBe(top);
  await page.keyboard.press("Control+k");
  const search = dialog.getByRole("searchbox", { name: "ドキュメントを検索" });
  await expect(search).toBeFocused();
  await search.fill("toast");
  await search.press("Escape");
  await expect(search).toHaveValue("");
  await expect(dialog).toBeVisible();
  await search.fill("toast");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/components\/toast\/$/);
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe("hidden");
  await trigger.click();
  await expect(dialog.getByRole("link", { name: "Toast", exact: true })).toHaveAttribute("aria-current", "page");
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(dialog).toBeHidden();
  await expect(page.locator('.docs-sidebar').getByRole("searchbox")).toBeFocused();
});

test("the mobile drawer fits 320px and is accessible in every pack and theme", async ({ page }) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/docs/icons/");
  for (const pack of ["graphite", "lucent"]) for (const theme of ["light", "dark"]) {
    await page.getByRole("combobox", { name: "パック", exact: true }).selectOption(pack);
    await page.getByRole("combobox", { name: "テーマ", exact: true }).selectOption(theme);
    await page.locator('.docs-mobile summary').click();
    const dialog = page.getByRole("dialog", { name: "ドキュメント", exact: true });
    await expect(dialog).toBeVisible();
    expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    expect((await new AxeBuilder({ page }).include('.docs-drawer').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
    const nav = dialog.getByRole("navigation");
    await nav.evaluate(el => { el.scrollTop = el.scrollHeight; });
    await expect(dialog.getByRole("searchbox")).toBeInViewport();
    await expect(dialog.getByRole("button", { name: "メニューを閉じる" })).toBeInViewport();
    // Clicking the backdrop is supported even without native closedby support.
    await page.mouse.click(316, 350);
    await expect(dialog).toBeHidden();
  }
});

test("without JavaScript the desktop index keeps its layout and the mobile index stays usable", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await page.goto("http://localhost:3201/docs/");
  const side = await page.locator('.docs-sidebar').boundingBox();
  const main = await page.locator('main').boundingBox();
  expect(main!.x).toBeGreaterThan(side!.x + side!.width);
  expect(Math.abs(main!.y - side!.y)).toBeLessThan(2);
  await expect(page.getByRole('searchbox', { name: 'ドキュメントを検索' })).toBeHidden();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.docs-mobile summary').press('Enter');
  await page.getByRole('navigation', { name: 'モバイルの目次' }).getByRole('link', { name: 'Icons', exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/icons\/$/);
  await context.close();
});
