/**
 * Keyboard access to a Table that scrolls sideways. While its wrapper
 * (`[data-slot="table-scroll"]`) is narrower than the table, the wrapper is a
 * focusable region named by the caption, so the arrow keys can scroll it;
 * once it fits again it leaves the Tab order. Chromium and Firefox focus
 * scroll containers on their own; this covers Safari and names the region.
 */
const SCROLL = '[data-slot="table-scroll"]';

export function installTableScroll(doc: Document = document): () => void {
  const seen = new WeakSet<Element>();

  function sync(scroll: HTMLElement) {
    const overflows = scroll.scrollWidth > scroll.clientWidth + 1;
    if (overflows === scroll.hasAttribute("data-overflow")) return;
    if (overflows) {
      scroll.setAttribute("data-overflow", "");
      scroll.tabIndex = 0;
      scroll.setAttribute("role", "region");
      scroll.setAttribute("aria-label", scroll.querySelector("caption")?.textContent?.trim() || "Table");
    } else {
      scroll.removeAttribute("data-overflow");
      scroll.removeAttribute("tabindex");
      scroll.removeAttribute("role");
      scroll.removeAttribute("aria-label");
    }
  }

  const resize = new ResizeObserver((entries) => {
    for (const entry of entries) sync(entry.target as HTMLElement);
  });
  function discover() {
    for (const scroll of doc.querySelectorAll<HTMLElement>(SCROLL)) {
      if (seen.has(scroll)) continue;
      seen.add(scroll);
      sync(scroll);
      resize.observe(scroll);
      // The table can grow without the wrapper changing size (rows or columns added).
      const table = scroll.querySelector("table");
      if (table) resize.observe(table);
    }
  }
  discover();
  const mutations = new MutationObserver(discover);
  mutations.observe(doc.documentElement, { childList: true, subtree: true });
  return () => {
    mutations.disconnect();
    resize.disconnect();
  };
}
