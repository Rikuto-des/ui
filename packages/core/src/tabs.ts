/**
 * Tabs behavior for `[data-slot="tabs"]` (WAI-ARIA tabs, automatic
 * activation). The server renders the selected tab and hides the other
 * panels; this script switches them on click and with the arrow keys.
 * A `ur-tabs-change` event (detail: { value }) bubbles from the tabs root.
 */
const TAB = '[role="tab"][data-slot~="tabs-tab"]';
const indicatorMotion = new WeakMap<HTMLElement, Animation>();
const panelMotion = new WeakMap<HTMLElement, Animation>();
const reducedMotion = (el: Element) => el.ownerDocument.defaultView?.matchMedia("(prefers-reduced-motion: reduce)").matches;

function moveIndicator(list: HTMLElement, animate = false) {
  const indicator = list.querySelector<HTMLElement>(':scope > [data-slot="tabs-indicator"]');
  const selected = list.querySelector<HTMLElement>(`${TAB}[aria-selected="true"]`);
  if (!indicator || !selected || !list.getClientRects().length) return;
  const before = indicator.getBoundingClientRect();
  const initialized = list.hasAttribute("data-indicator-ready");
  indicatorMotion.get(list)?.cancel();
  list.dataset.indicatorReady = "";
  Object.assign(indicator.style, { left: `${selected.offsetLeft}px`, top: `${selected.offsetTop}px`, width: `${selected.offsetWidth}px`, height: `${selected.offsetHeight}px` });
  const after = indicator.getBoundingClientRect();
  if (!animate || !initialized || reducedMotion(list) || list.closest('[data-slot="tabs"]')?.getAttribute("data-motion") === "none") return;
  // Animate geometry, never glyphs. A new selection starts at the current
  // visual rectangle, including when the preceding motion is unfinished.
  const motion = indicator.animate([
    { transform: `translate(${before.left - after.left}px, ${before.top - after.top}px)`, width: `${before.width}px`, height: `${before.height}px` },
    { transform: "translate(0, 0)", width: `${after.width}px`, height: `${after.height}px` },
  ], { duration: 260, easing: "cubic-bezier(.22, 1, .36, 1)" });
  indicatorMotion.set(list, motion);
}

function tabsOf(tab: Element): HTMLElement[] {
  return [...(tab.closest('[role="tablist"]')?.querySelectorAll<HTMLElement>(TAB) ?? [])].filter(
    (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-disabled") !== "true",
  );
}

export function selectTab(tab: HTMLElement, focus = false) {
  if (tab.hasAttribute("disabled") || tab.getAttribute("aria-disabled") === "true") return;
  const list = tab.closest('[role="tablist"]');
  if (!list) return;
  const root = tab.closest<HTMLElement>('[data-slot="tabs"]');
  const previous = list.querySelector<HTMLElement>(`${TAB}[aria-selected="true"]`);
  const previousPanel = tab.ownerDocument.getElementById(previous?.getAttribute("aria-controls") ?? "");
  const height = previousPanel?.getBoundingClientRect().height ?? 0;
  if (root) panelMotion.get(root)?.cancel();
  const all = [...list.querySelectorAll<HTMLElement>(TAB)];
  for (const t of list.querySelectorAll<HTMLElement>(TAB)) {
    const selected = t === tab;
    t.setAttribute("aria-selected", String(selected));
    t.tabIndex = selected ? 0 : -1;
    const panel = t.ownerDocument.getElementById(t.getAttribute("aria-controls") ?? "");
    if (panel) panel.hidden = !selected;
  }
  moveIndicator(list as HTMLElement, true);
  const panel = tab.ownerDocument.getElementById(tab.getAttribute("aria-controls") ?? "");
  if (root && panel && previous !== tab && height > 0 && !reducedMotion(tab) && root.dataset.motion !== "none") {
    const nextHeight = panel.getBoundingClientRect().height;
    const vertical = list.getAttribute("aria-orientation") === "vertical";
    const sign = (all.indexOf(tab) > all.indexOf(previous!) ? 1 : -1) * (!vertical && getComputedStyle(tab).direction === "rtl" ? -1 : 1);
    const translate = vertical ? `translateY(${sign * 8}px)` : `translateX(${sign * 12}px)`;
    const motion = panel.animate([
      { height: `${height}px`, opacity: .4, transform: translate, overflow: "clip" },
      { height: `${nextHeight}px`, opacity: 1, transform: "translate(0, 0)", overflow: "clip" },
    ], { duration: 260, easing: "cubic-bezier(.22, 1, .36, 1)" });
    panelMotion.set(root, motion);
  }
  if (focus) tab.focus();
  tab.closest('[data-slot="tabs"]')?.dispatchEvent(
    new CustomEvent("ur-tabs-change", { bubbles: true, detail: { value: tab.dataset.value } }),
  );
}

export function installTabs(doc: Document = document): () => void {
  const lists = new Map<HTMLElement, { resize: ResizeObserver; tabs: HTMLElement[] }>();
  const discover = () => {
    for (const [list, record] of lists) {
      if (!list.isConnected) { record.resize.disconnect(); indicatorMotion.get(list)?.cancel(); lists.delete(list); }
    }
    for (const list of doc.querySelectorAll<HTMLElement>('[data-slot="tabs-list"]')) {
      const tabs = [...list.querySelectorAll<HTMLElement>(TAB)];
      const existing = lists.get(list);
      if (existing) {
        if (tabs.length === existing.tabs.length && tabs.every((tab, index) => tab === existing.tabs[index])) continue;
        for (const tab of existing.tabs) if (!tabs.includes(tab)) existing.resize.unobserve(tab);
        for (const tab of tabs) if (!existing.tabs.includes(tab)) existing.resize.observe(tab);
        existing.tabs = tabs;
        moveIndicator(list);
        continue;
      }
      const observer = new ResizeObserver(() => moveIndicator(list));
      observer.observe(list);
      for (const tab of tabs) observer.observe(tab);
      lists.set(list, { resize: observer, tabs });
      moveIndicator(list);
    }
  };
  discover();
  const observer = new MutationObserver(discover);
  observer.observe(doc.documentElement, { childList: true, subtree: true });
  const preference = doc.defaultView?.matchMedia("(prefers-reduced-motion: reduce)");
  const stopMotion = () => {
    for (const list of lists.keys()) {
      indicatorMotion.get(list)?.cancel();
      const root = list.closest<HTMLElement>('[data-slot="tabs"]');
      if (root) panelMotion.get(root)?.cancel();
    }
  };
  preference?.addEventListener("change", stopMotion);
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented) return;
    const activator = (event.target as Element | null)?.closest?.<HTMLElement>('[data-slot~="tabs-activate"]');
    if (activator) {
      if (activator.hasAttribute("disabled") || activator.getAttribute("aria-disabled") === "true") return;
      const root = doc.getElementById(activator.dataset.tabsTarget ?? "");
      if (!root?.matches('[data-slot="tabs"]')) return;
      const target = [...root.querySelectorAll<HTMLElement>(TAB)].find(
        (tab) => tab.dataset.value === activator.dataset.value && tab.closest('[data-slot="tabs"]') === root,
      );
      if (target) selectTab(target);
      return;
    }
    const tab = (event.target as Element | null)?.closest?.<HTMLElement>(TAB);
    if (tab && tab.getAttribute("aria-selected") !== "true") selectTab(tab);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    const tab = (event.target as Element | null)?.closest?.<HTMLElement>(TAB);
    if (!tab) return;
    const tabs = tabsOf(tab);
    const index = tabs.indexOf(tab);
    const vertical = tab.closest('[role="tablist"]')?.getAttribute("aria-orientation") === "vertical";
    const rtl = getComputedStyle(tab).direction === "rtl";
    const next = vertical ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
    const prev = vertical ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
    let target: HTMLElement | undefined;
    if (event.key === next) target = tabs[(index + 1) % tabs.length];
    else if (event.key === prev) target = tabs[(index - 1 + tabs.length) % tabs.length];
    else if (event.key === "Home") target = tabs[0];
    else if (event.key === "End") target = tabs[tabs.length - 1];
    if (!target) return;
    event.preventDefault();
    selectTab(target, true);
  };
  doc.addEventListener("click", onClick);
  doc.addEventListener("keydown", onKeyDown);
  return () => {
    observer.disconnect();
    preference?.removeEventListener("change", stopMotion);
    stopMotion();
    for (const [list, record] of lists) {
      record.resize.disconnect(); delete list.dataset.indicatorReady;
      const indicator = list.querySelector<HTMLElement>(':scope > [data-slot="tabs-indicator"]');
      for (const property of ["left", "top", "width", "height"]) indicator?.style.removeProperty(property);
    }
    lists.clear();
    doc.removeEventListener("click", onClick);
    doc.removeEventListener("keydown", onKeyDown);
  };
}
