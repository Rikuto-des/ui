import { expect, test } from "@playwright/test";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { resolve } from "node:path";
import { Tabs } from "../../packages/react/src/tabs.tsx";

const core = `/@fs${resolve(import.meta.dirname, "../../packages/core/src")}`;
const group = (id: string) => h(Tabs, { id, label: id, defaultValue: "profile" },
  h(Tabs.List, null, h(Tabs.Tab, { value: "profile" }, "Profile"), h(Tabs.Tab, { value: "security" }, "Security"), h(Tabs.Tab, { value: "billing", disabled: true }, "Billing")),
  h(Tabs.Panel, { value: "profile" }, h("input", { "aria-label": `${id} name`, defaultValue: "Alex" })),
  h(Tabs.Panel, { value: "security" }, "Security settings"), h(Tabs.Panel, { value: "billing" }, "Billing"));

test.beforeEach(async ({ page }) => {
  await page.goto("/static/components.html");
  const markup = renderToStaticMarkup(h("main", null,
    h(Tabs.Activate, { tabs: "primary", value: "security" }, "Open security"),
    h(Tabs.Activate, { tabs: "primary", value: "profile" }, "Open profile"),
    h(Tabs.Activate, { tabs: "primary", value: "billing" }, "Open billing"),
    h(Tabs.Activate, { tabs: "missing", value: "profile" }, "Missing target"),
    group("primary"), group("secondary")));
  await page.evaluate(async ({ markup, core }) => {
    document.body.innerHTML = markup;
    const { installTabs } = await import(`${core}/tabs.ts`);
    installTabs();
  }, { markup, core });
});

test("external activation stays consistent with clicks and arrows and preserves input", async ({ page }) => {
  const first = page.getByRole("tablist", { name: "primary" });
  const openSecurity = page.getByRole("button", { name: "Open security", exact: true });
  await expect(openSecurity).toHaveAttribute("aria-controls", "primary-panel-security");
  await page.getByRole("textbox", { name: "primary name" }).fill("Mika");
  for (let i = 0; i < 2; i++) {
    await openSecurity.press("Enter");
    await expect(first.getByRole("tab", { name: "Security" })).toHaveAttribute("aria-selected", "true");
    await expect(openSecurity).toBeFocused();
    await first.getByRole("tab", { name: "Profile" }).click();
    await first.getByRole("tab", { name: "Profile" }).press("ArrowRight");
    await page.getByRole("button", { name: "Open profile", exact: true }).press("Enter");
    await expect(first.getByRole("tab", { name: "Profile" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("textbox", { name: "primary name" })).toHaveValue("Mika");
  }
  await expect(page.getByRole("tablist", { name: "secondary" }).getByRole("tab", { name: "Profile" })).toHaveAttribute("aria-selected", "true");
});

test("disabled targets, missing roots and cancelled activation leave selection unchanged", async ({ page }) => {
  await page.getByRole("button", { name: "Open billing", exact: true }).click();
  await page.getByRole("button", { name: "Missing target", exact: true }).click();
  await page.getByRole("button", { name: "Open security", exact: true }).evaluate((button) => button.addEventListener("click", (e) => e.preventDefault()));
  await page.getByRole("button", { name: "Open security", exact: true }).click();
  await expect(page.getByRole("tablist", { name: "primary" }).getByRole("tab", { name: "Profile" })).toHaveAttribute("aria-selected", "true");
});
