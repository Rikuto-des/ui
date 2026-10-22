import { expect, test, type Page } from "@playwright/test";

// Web fonts arrive late and shift layout; tests run on system fonts so
// measurements are deterministic.
const noWebFonts = (page: Page) => page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());


// Geometry is measured right after opening; reduced motion removes the
// entry scale so the box is final immediately (and covers that code path).
test.use({ reducedMotion: "reduce" });

test.beforeEach(async ({ page }) => {
  await noWebFonts(page);
  await page.setViewportSize({ width: 1280, height: 860 });
  await page.goto("/");
});

test("a trigger opens the popover right below it, aligned to its start edge", async ({ page }) => {
  const trigger = page.getByTestId("open-filters");
  await trigger.click();
  const popover = page.getByTestId("filters");
  await expect(popover).toBeVisible();
  const t = (await trigger.boundingBox())!;
  const p = (await popover.boundingBox())!;
  expect(p.y - (t.y + t.height)).toBeGreaterThanOrEqual(0);
  expect(p.y - (t.y + t.height)).toBeLessThanOrEqual(16);
  expect(Math.abs(p.x - t.x)).toBeLessThanOrEqual(1);
});

test('align="end" lines the popover up with the trigger\'s end edge', async ({ page }) => {
  const trigger = page.getByTestId("open-edge");
  await trigger.click();
  const popover = page.getByTestId("edge");
  await expect(popover).toBeVisible();
  const t = (await trigger.boundingBox())!;
  const p = (await popover.boundingBox())!;
  expect(Math.abs(p.x + p.width - (t.x + t.width))).toBeLessThanOrEqual(1);
});

test("the popover flips above the trigger when there is no room below", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 860 });
  const trigger = page.getByTestId("open-filters");
  // Shrink the viewport so the trigger sits just above its bottom edge.
  const bottom = await page.evaluate(
    () => document.querySelector('[data-testid="open-filters"]')!.getBoundingClientRect().bottom,
  );
  await page.setViewportSize({ width: 1280, height: Math.ceil(bottom + 12) });
  await trigger.click();
  const popover = page.getByTestId("filters");
  await expect(popover).toBeVisible();
  const t = (await trigger.boundingBox())!;
  const p = (await popover.boundingBox())!;
  expect(p.y + p.height).toBeLessThanOrEqual(t.y + 1);
});

test("Escape closes the popover and returns focus to the trigger", async ({ page }) => {
  const trigger = page.getByTestId("open-filters");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await page.getByTestId("filter-open").focus();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("filters")).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("Tab moves from the trigger into the open popover", async ({ page, browserName }) => {
  test.skip(browserName === "webkit", "WebKit does not Tab to buttons by default (macOS keyboard setting)");
  const trigger = page.getByTestId("open-filters");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("filters")).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByTestId("filter-open")).toBeFocused();
});

test("a click outside light-dismisses the popover", async ({ page }) => {
  await page.getByTestId("open-filters").click();
  await expect(page.getByTestId("filters")).toBeVisible();
  await page.mouse.click(600, 820);
  await expect(page.getByTestId("filters")).toBeHidden();
});

test("the close button hides the popover", async ({ page }) => {
  await page.getByTestId("open-filters").click();
  await page.getByTestId("close-filters").click();
  await expect(page.getByTestId("filters")).toBeHidden();
});

test("opening another auto popover closes the first one", async ({ page }) => {
  await page.getByTestId("open-filters").click();
  await expect(page.getByTestId("filters")).toBeVisible();
  await page.getByTestId("open-edge").click();
  await expect(page.getByTestId("edge")).toBeVisible();
  await expect(page.getByTestId("filters")).toBeHidden();
});

test("the trigger reports expanded/collapsed to the accessibility tree (Chromium AX)", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "reads the platform accessibility tree through CDP");
  const cdp = await page.context().newCDPSession(page);
  const expanded = async () => {
    const { nodes } = (await cdp.send("Accessibility.getFullAXTree")) as {
      nodes: { name?: { value: string }; role?: { value: string }; properties?: { name: string; value: { value: unknown } }[] }[];
    };
    const node = nodes.find((n) => n.role?.value === "button" && n.name?.value === "フィルタ");
    return node?.properties?.find((p) => p.name === "expanded")?.value.value;
  };
  expect(await expanded()).toBe(false);
  await page.getByTestId("open-filters").click();
  await expect(page.getByTestId("filters")).toBeVisible();
  expect(await expanded()).toBe(true);
});
