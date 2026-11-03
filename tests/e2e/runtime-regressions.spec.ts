import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { fixedViewport } from "./layout.js";

const core = `/@fs${resolve(import.meta.dirname, "../../packages/core/src")}`;

test.beforeEach(async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
  await page.goto("/static/components.html");
});

test("a dialog stays centered when an application reset clears native margins", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => {
    const reset = document.createElement("style");
    reset.textContent = "@layer app-reset { *, ::before, ::after { margin: 0; } }";
    document.head.prepend(reset);
  });
  await page.getByTestId("open-invite").click();
  const box = await page.locator("dialog#g-invite").boundingBox();
  expect(box).not.toBeNull();
  const viewport = await fixedViewport(page);
  expect(Math.abs(box!.x + box!.width / 2 - viewport.x - viewport.width / 2)).toBeLessThan(2);
  expect(Math.abs(box!.y + box!.height / 2 - viewport.y - viewport.height / 2)).toBeLessThan(2);
});

test("dismiss cancels a toast before its first animation frame", async ({ page }) => {
  const id = await page.evaluate(async (core) => {
    const { toast, dismiss } = await import(`${core}/toast.ts`);
    const id = toast("Cancelled before display", { duration: 0 });
    dismiss(id);
    await new Promise(requestAnimationFrame);
    return id;
  }, core);
  await expect(page.locator(`[id="${id}"]`)).toHaveCount(0);
});

test("toast stays available while focused after the pointer leaves", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-01T00:00:01Z"));
  const id = await page.evaluate(async (core) => {
    const { toast } = await import(`${core}/toast.ts`);
    return toast("Keep reading", { duration: 1000, action: { label: "Undo", onClick() {} } });
  }, core);
  await page.clock.runFor(20);
  const item = page.locator(`[id="${id}"]`);
  await item.hover();
  await item.getByRole("button", { name: "Undo" }).focus();
  await page.mouse.move(0, 0);
  await page.clock.runFor(1200);
  await expect(item).toBeVisible();
  await page.locator("body").click({ position: { x: 1, y: 1 } });
  await page.clock.runFor(1500);
  await expect(item).toHaveCount(0);
});

test("uninstalling tooltip fallback cancels a pending show", async ({ page, browserName }) => {
  test.skip(browserName === "chromium", "Chromium uses native interest invokers");
  await page.clock.install();
  await page.evaluate(async (core) => {
    const { installTooltips } = await import(`${core}/tooltip.ts`);
    const cleanup = installTooltips();
    const button = document.createElement("button");
    button.dataset.urTooltip = "pending-tip";
    button.textContent = "Help";
    const tip = document.createElement("div");
    tip.id = "pending-tip";
    tip.popover = "hint";
    tip.textContent = "Help text";
    document.body.append(button, tip);
    button.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
    cleanup();
  }, core);
  await page.clock.runFor(600);
  await expect(page.locator("#pending-tip")).not.toBeVisible();
});

test("tooltip fallback stays open for keyboard focus when the pointer leaves", async ({ page, browserName }) => {
  test.skip(browserName === "chromium", "Chromium uses native interest invokers");
  await page.clock.install();
  await page.evaluate(async (core) => {
    const { installTooltips } = await import(`${core}/tooltip.ts`);
    installTooltips();
  }, core);
  const trigger = page.locator('[data-ur-tooltip]').first();
  const tipId = await trigger.getAttribute("data-ur-tooltip");
  await trigger.focus();
  await trigger.hover();
  await page.clock.runFor(600);
  await expect(page.locator(`[id="${tipId}"]`)).toBeVisible();
  await page.mouse.move(0, 0);
  await page.clock.runFor(200);
  await expect(trigger).toBeFocused();
  await expect(page.locator(`[id="${tipId}"]`)).toBeVisible();
});

test("dialog pointer invokers restore focus after Escape and close on every browser", async ({ page }) => {
  await page.evaluate(async core => { const {installDialogInvokers}=await import(`${core}/dialog.ts`);installDialogInvokers(); }, core);
  const trigger=page.getByTestId('open-invite'),dialog=page.locator('dialog#g-invite');
  await trigger.click();await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');await expect(dialog).toBeHidden();await expect(trigger).toBeFocused();
  await trigger.click();await dialog.locator('[command="close"]').first().click();
  await expect(dialog).toBeHidden();await expect(trigger).toBeFocused();
});

test("cancelled dialog invocation preserves application focus", async ({ page }) => {
  await page.evaluate(async core => {
    const {installDialogInvokers}=await import(`${core}/dialog.ts`);installDialogInvokers();
    document.querySelector('[data-testid="open-invite"]')!.addEventListener('click', event=>event.preventDefault());
    const input=document.createElement('input');input.id='focus-owner';document.body.prepend(input);input.focus();
    (document.querySelector('[data-testid="open-invite"]') as HTMLButtonElement).click();
  }, core);
  await expect(page.locator('#focus-owner')).toBeFocused();await expect(page.locator('dialog#g-invite')).toBeHidden();
});


test("tooltip fallback initializes an already keyboard-focused trigger", async ({ page, browserName }) => {
  test.skip(browserName === "chromium", "Chromium uses native interest invokers");
  const trigger = page.getByTestId("tip-trigger");
  await page.keyboard.press("Tab");
  await trigger.focus();
  await expect(trigger).toBeFocused();
  await page.evaluate(async core => { const {installTooltips}=await import(`${core}/tooltip.ts`); installTooltips(); }, core);
  await expect(page.getByTestId("tip-copy")).toBeVisible();
});
