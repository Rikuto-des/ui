import { expect, test, type Page } from "@playwright/test";

// Chart on the gallery page, in all three engines.
const noWebFonts = (page: Page) => page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
const chart = (page: Page) => page.getByTestId("sales-chart");

test.beforeEach(async ({ page }) => {
  await noWebFonts(page);
  await page.goto("/components.html");
});

test("the numbers are a table named by the title; the plot is hidden from assistive technology", async ({ page }) => {
  const table = chart(page).getByRole("table", { name: "月ごとの売上（万円）" });
  await expect(table.getByRole("row")).toHaveCount(7);
  await expect(table.getByRole("row", { name: /11月/ })).toContainText("78万円");
  await expect(chart(page).locator('[data-slot="chart-plot"]')).toHaveAttribute("aria-hidden", "true");
  // Bars are sized against a round top (80) in percent.
  const heights = await chart(page).locator('[data-slot="chart-bar"]').evaluateAll((bars) => bars.map((b) => (b as HTMLElement).style.getPropertyValue("--_value")));
  expect(heights.at(-2)).toBe("97.5%");
});

test("hovering a column shows its values", async ({ page }) => {
  const column = chart(page).locator('[data-slot="chart-column"]').nth(3);
  const tooltip = column.locator('[data-slot="chart-tooltip"]');
  await expect(tooltip).toBeHidden();
  await column.hover();
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toContainText("9月");
  await expect(tooltip).toContainText("63万円");
});

test("it fits a 320px screen", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  const box = (await chart(page).boundingBox())!;
  expect(box.width).toBeLessThanOrEqual(320);
  const overflow = await chart(page).evaluate((el) => el.scrollWidth > el.clientWidth + 1);
  expect(overflow).toBe(false);
});
