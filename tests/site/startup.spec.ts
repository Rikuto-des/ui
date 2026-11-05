import { expect, test } from "@playwright/test";

for (const slug of ["input", "date-input", "kbd", "command", "icons", "alert"]) {
  test(`${slug} demo protects the first interaction while its chunk loads`, async ({ page }) => {
    let release!: () => void;
    const chunks = new Promise<void>(resolve => { release = resolve; });
    await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.fulfill({ status: 200, contentType: "text/css", body: "" }));
    await page.route(/\/_next\/static\/.*\.js(?:\?.*)?$/, async route => {
      await chunks;
      await route.continue();
    });
    try {
      await page.goto(slug === "icons" ? "/docs/icons/" : `/components/${slug}/`, { waitUntil: "commit" });
      const stage = page.locator(slug === "icons" ? ".icon-explorer" : ".example .stage");
      const control = slug === "icons" ? stage.getByLabel("アイコンを検索", { exact: true })
        : slug === "input" ? stage.getByLabel("プロジェクト名", { exact: true })
        : slug === "date-input" ? stage.getByLabel("終了日", { exact: true })
        : stage.getByRole("button", { name: slug === "kbd" ? "集中表示を切り替える" : slug === "alert" ? "もう一度試す" : "コマンドを開く", exact: true });
      await expect(control).toBeVisible();
      await expect(control).toBeDisabled();
      release();
      await expect(control).toBeEnabled();
      if (slug === "icons") {
        await control.fill("bookmark");
        await expect(stage.locator(".icon-grid button")).toHaveCount(1);
      } else if (slug === "input") {
        await control.fill("First edit");
        await expect(stage.locator(".study-cover strong")).toHaveText("First edit");
      } else if (slug === "date-input") {
        await control.fill("2026-11-10");
        await expect(stage.locator(".study-date-window strong")).toHaveText("9日間");
      } else if (slug === "kbd") {
        await control.press("Enter");
        await expect(stage.locator(".study-result strong")).toHaveText("集中表示");
      } else if (slug === "alert") {
        await control.press("Enter");
        await expect(stage.getByText("接続が戻りました", { exact: true })).toBeVisible();
      } else {
        await control.press("Enter");
        await expect(page.getByRole("combobox", { name: "コマンドを検索", exact: true })).toBeFocused();
      }
    } finally {
      release();
    }
  });
}

test("SSR Combobox preserves the first edit after its client chunk loads", async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.fulfill({ status: 200, contentType: "text/css", body: "" }));
  let release!: () => void;
  const chunks = new Promise<void>(resolve => { release = resolve; });
  await page.route(/\/_next\/static\/.*\.js(?:\?.*)?$/, async route => {
    await chunks;
    await route.continue();
  });
  try {
    await page.goto("/components/combobox/", { waitUntil: "commit" });
    const box = page.getByRole("combobox", { name: "担当者", exact: true });
    await expect(box).toBeVisible();
    await expect(box).toHaveValue("Mika Sato");
    await expect(box).toBeDisabled();
    release();
    await box.fill("Ren");
    await expect(page.getByRole("option", { name: "Ren Aoki 休暇中" })).toHaveAttribute("aria-disabled", "true");
    await box.press("Escape");
    await expect(box).toHaveValue("Mika Sato");
  } finally {
    release();
  }
});

test("catalog and theme controls accept input only after their handlers are ready", async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.fulfill({ status: 200, contentType: "text/css", body: "" }));
  let release!: () => void;
  const chunks = new Promise<void>(resolve => { release = resolve; });
  await page.route(/\/_next\/static\/.*\.js(?:\?.*)?$/, async route => {
    await chunks;
    await route.continue();
  });
  try {
    await page.goto("/components/", { waitUntil: "commit" });
    const search = page.getByRole("searchbox", { name: "コンポーネントを検索" });
    const pack = page.getByRole("combobox", { name: "パック" });
    const theme = page.getByRole("combobox", { name: "テーマ" });
    await expect(search).toBeVisible();
    await expect(page.locator("html")).not.toHaveAttribute("data-urushi-runtime", "ready");
    await expect(search).toBeDisabled();
    await expect(pack).toBeDisabled();
    await expect(theme).toBeDisabled();
    await expect(page.getByRole("group", { name: "コンポーネントの分類" }).getByRole("button").first()).toBeDisabled();
    await expect(page.locator(".catalog-details")).toHaveCount(58);
    release();
    await expect(search).toBeEnabled();
    await expect(page.locator("html")).toHaveAttribute("data-urushi-runtime", "ready");
    await search.fill("NavigationMenu");
    await expect(page.locator(".catalog-grid > li:visible")).toHaveCount(1);
    await pack.selectOption("lucent");
    await theme.selectOption("dark");
    await expect(pack).toHaveValue("lucent");
    await expect(theme).toHaveValue("dark");
    await expect(page.locator("html")).toHaveAttribute("data-pack", "lucent");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    const nav = page.getByRole("navigation", { name: "一覧のNavigation Menu" });
    await nav.locator("summary").filter({ hasText: "Product" }).press("ArrowDown");
    await expect(nav.getByRole("link", { name: /Button/ })).toBeFocused();
  } finally {
    release();
  }
});
