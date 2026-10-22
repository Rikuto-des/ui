import { mkdir, writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

// Records which platform features each engine supports, for docs/phase0.
test("record platform feature support", async ({ page, browserName, browser }) => {
  await page.goto("/");
  const features = await page.evaluate(() => {
    const css = (decl: string) => CSS.supports(decl);
    const hint = (() => {
      const el = document.createElement("div");
      el.setAttribute("popover", "hint");
      return el.popover === "hint";
    })();
    return {
      popover: "popover" in HTMLElement.prototype,
      popoverHint: hint,
      invokerCommands: "commandForElement" in HTMLButtonElement.prototype,
      interestInvokers: "interestForElement" in HTMLButtonElement.prototype,
      detailsName: "name" in HTMLDetailsElement.prototype,
      detailsContent: css("selector(::details-content)"),
      interpolateSize: css("interpolate-size: allow-keywords"),
      userInvalid: css("selector(:user-invalid)"),
      dialogClosedBy: "closedBy" in HTMLDialogElement.prototype,
      dialogRequestClose: "requestClose" in HTMLDialogElement.prototype,
      anchorPositioning: css("anchor-name: --a"),
      positionArea: css("position-area: block-end"),
      positionTryFallbacks: css("position-try-fallbacks: flip-block"),
      startingStyle: "CSSStartingStyleRule" in window,
      transitionBehavior: css("transition-behavior: allow-discrete"),
      overlayProperty: css("overlay: auto"),
      lightDark: css("color: light-dark(red, blue)"),
      relativeColor: css("color: oklch(from red l c h)"),
      scope: "CSSScopeRule" in window,
      fieldSizing: css("field-sizing: content"),
      baseSelect: css("appearance: base-select"),
      cornerShape: css("corner-shape: squircle"),
      textBoxTrim: css("text-box: trim-both cap alphabetic"),
      textSpacingTrim: css("text-spacing-trim: trim-start"),
      textAutospace: css("text-autospace: normal"),
      wordBreakAutoPhrase: css("word-break: auto-phrase"),
      viewTransitions: "startViewTransition" in document,
    };
  });
  const backdropColor = await page.evaluate(async () => {
    const d = document.getElementById("confirm-delete") as HTMLDialogElement;
    d.showModal();
    await new Promise((r) => setTimeout(r, 400));
    const color = getComputedStyle(d, "::backdrop").backgroundColor;
    d.close();
    return color;
  });
  const result = {
    browser: browserName,
    version: browser.version(),
    ...features,
    backdropInheritsTokens: !/rgba\(0, 0, 0, 0\)|transparent/.test(backdropColor),
  };
  await mkdir("docs/phase0/features", { recursive: true });
  await writeFile(`docs/phase0/features/${browserName}.json`, JSON.stringify(result, null, 2) + "\n");
  expect(result.popover).toBe(true);
});
