import { expect, test, type Page } from "@playwright/test";

// Form on the gallery page, in all three engines: in-page messages, a summary that links to the controls.
const noWebFonts = (page: Page) => page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());

test.use({ reducedMotion: "reduce" });

const form = (page: Page) => page.getByTestId("signup");
const summary = (page: Page) => form(page).locator('[data-slot="form-summary"]');

test.beforeEach(async ({ page }) => {
  await noWebFonts(page);
  await page.goto("/components.html");
  await expect(page.locator("html")).toHaveAttribute("data-urushi-runtime", "ready", { timeout: 20_000 });
});

test("an invalid submit lists every error, marks the fields and focuses the summary", async ({ page }) => {
  await form(page).getByLabel("年齢").fill("12");
  await form(page).getByRole("button", { name: "登録する" }).click();
  await expect(summary(page)).toBeVisible();
  await expect(summary(page)).toBeFocused();
  await expect(summary(page).getByRole("link")).toHaveCount(3);
  await expect(summary(page).getByRole("link").first()).toContainText("名前：");
  const name = form(page).getByRole("textbox", { name: /名前/ });
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(name).toHaveAccessibleDescription(/.+/);
  await expect(form(page).locator("#g-signup-name-error")).toBeVisible();
  // The app's onSubmit did not run.
  await expect(form(page)).not.toHaveAttribute("data-sent");
});

test("a summary link focuses its control, and fixing a control clears its message", async ({ page }) => {
  await form(page).getByRole("button", { name: "登録する" }).click();
  await summary(page).getByRole("link", { name: /メールアドレス/ }).click();
  const email = form(page).getByRole("textbox", { name: /メールアドレス/ });
  await expect(email).toBeFocused();
  await email.fill("hanako");
  await expect(form(page).locator("#g-signup-email-error")).toBeVisible();
  await email.fill("hanako@example.jp");
  await expect(form(page).locator("#g-signup-email-error")).toHaveCount(0);
  await expect(email).not.toHaveAttribute("aria-invalid");
  await expect(summary(page).getByRole("link")).toHaveCount(1);
  await form(page).getByRole("textbox", { name: /名前/ }).fill("山田 花子");
  await expect(summary(page)).toBeHidden();
});

test("a valid submit reaches the app's onSubmit", async ({ page }) => {
  await form(page).getByRole("textbox", { name: /名前/ }).fill("山田 花子");
  await form(page).getByRole("textbox", { name: /メールアドレス/ }).fill("hanako@example.jp");
  await form(page).getByRole("button", { name: "登録する" }).click();
  await expect(form(page)).toHaveAttribute("data-sent", "");
  await expect(summary(page)).toBeHidden();
});
