import { installClosedByFallback } from "./closedby.ts";
import { installMenus } from "./menu.ts";
import { installTabs } from "./tabs.ts";
import { installToasts } from "./toast.ts";
import { installTooltips } from "./tooltip.ts";

let installed: (() => void) | undefined;

/**
 * Installs every progressive enhancement once per document: platform
 * fallbacks (dialog closedby, interest invokers) and the keyboard behavior of
 * menus and tabs. Components render and work without it; it adds what HTML
 * and CSS cannot do yet.
 */
export function installRuntime(doc: Document = document): () => void {
  if (installed) return installed;
  const cleanups = [installClosedByFallback(doc), installTooltips(doc), installMenus(doc), installTabs(doc), installToasts(doc)];
  installed = () => {
    for (const cleanup of cleanups) cleanup();
    installed = undefined;
  };
  return installed;
}
