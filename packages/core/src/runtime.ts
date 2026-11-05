import { installDialogInvokers } from "./dialog.ts";
import { installNavigationMenus } from "./navigation-menu.ts";
import { installClosedByFallback } from "./closedby.ts";
import { installMenus } from "./menu.ts";
import { installContextMenus } from "./context-menu.ts";
import { installMenubars } from "./menubar.ts";
import { installDrawers } from "./drawer.ts";
import { installResizables } from "./resizable.ts";
import { installTabs } from "./tabs.ts";
import { installSliders } from "./slider.ts";
import { installCarousels } from "./carousel.ts";
import { installToasts } from "./toast.ts";
import { installTooltips } from "./tooltip.ts";

import { installInputFeedback } from "./input-feedback.ts";
import { installSegmentedControls } from "./segmented.ts";

let installed: (() => void) | undefined;

/**
 * Installs every progressive enhancement once per document: platform
 * fallbacks (dialog closedby, interest invokers) and the keyboard behavior of
 * menus and tabs. Components render and work without it; it adds what HTML
 * and CSS cannot do yet.
 */
export function installRuntime(doc: Document = document): () => void {
  if (installed) return installed;
  const cleanups = [installDialogInvokers(doc), installClosedByFallback(doc), installTooltips(doc), installMenus(doc), installContextMenus(doc), installMenubars(doc), installDrawers(doc), installResizables(doc), installNavigationMenus(doc), installTabs(doc), installSliders(doc), installCarousels(doc), installToasts(doc), installInputFeedback(doc), installSegmentedControls(doc)];
  // Native HTML works before this point. Consumers can wait for the optional
  // keyboard/floating enhancements without relying on a load event or a delay.
  doc.documentElement.dataset.urushiRuntime = "ready";
  installed = () => {
    for (const cleanup of cleanups) cleanup();
    delete doc.documentElement.dataset.urushiRuntime;
    installed = undefined;
  };
  return installed;
}
