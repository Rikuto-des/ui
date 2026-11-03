import type { Page } from "@playwright/test";

/** CSS fixed-position area, excluding a reserved classic scrollbar gutter.
 * innerWidth/clientWidth can include that gutter when a modal locks overflow.
 */
export async function fixedViewport(page: Page) {
  return page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.cssText = "position:fixed;inset:0;margin:0;padding:0;border:0;visibility:hidden;pointer-events:none";
    document.body.append(probe);
    const { x, y, width, height } = probe.getBoundingClientRect();
    probe.remove();
    return { x, y, width, height };
  });
}
