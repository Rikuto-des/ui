/**
 * Tabs behavior for `[data-slot="tabs"]` (WAI-ARIA tabs, automatic
 * activation). The server renders the selected tab and hides the other
 * panels; this script switches them on click and with the arrow keys.
 * A `yl-tabs-change` event (detail: { value }) bubbles from the tabs root.
 */
const TAB = '[role="tab"][data-slot~="tabs-tab"]';

function tabsOf(tab: Element): HTMLElement[] {
  return [...(tab.closest('[role="tablist"]')?.querySelectorAll<HTMLElement>(TAB) ?? [])].filter(
    (el) => !el.hasAttribute("disabled"),
  );
}

export function selectTab(tab: HTMLElement, focus = false) {
  const list = tab.closest('[role="tablist"]');
  if (!list) return;
  for (const t of list.querySelectorAll<HTMLElement>(TAB)) {
    const selected = t === tab;
    t.setAttribute("aria-selected", String(selected));
    t.tabIndex = selected ? 0 : -1;
    const panel = t.ownerDocument.getElementById(t.getAttribute("aria-controls") ?? "");
    if (panel) panel.hidden = !selected;
  }
  if (focus) tab.focus();
  tab.closest('[data-slot="tabs"]')?.dispatchEvent(
    new CustomEvent("yl-tabs-change", { bubbles: true, detail: { value: tab.dataset.value } }),
  );
}

export function installTabs(doc: Document = document): () => void {
  const onClick = (event: MouseEvent) => {
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
    doc.removeEventListener("click", onClick);
    doc.removeEventListener("keydown", onKeyDown);
  };
}
