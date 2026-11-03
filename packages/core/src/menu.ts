/**
 * Menu keyboard behavior for `[data-slot="menu"]` popovers (WAI-ARIA menu
 * button pattern). Without this script a menu still opens through
 * `popovertarget` and its items are reachable with Tab; the script adds
 * arrow keys, Home/End, typeahead, focus on open and close on activation.
 * On the trigger, ArrowDown opens the menu on its first item and ArrowUp on
 * its last.
 */
const ITEM = '[data-slot~="menu-item"]';

function items(menu: Element): HTMLElement[] {
  return [...menu.querySelectorAll<HTMLElement>(ITEM)].filter(
    (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-disabled") !== "true",
  );
}

function focusItem(list: HTMLElement[], index: number) {
  list.forEach((el, i) => (el.tabIndex = i === index ? 0 : -1));
  list[index]?.focus();
}

export function installMenus(doc: Document = document): () => void {
  let typed = "";
  let typedAt = 0;

  const onToggle = (event: Event) => {
    const menu = event.target;
    if (!(menu instanceof HTMLElement) || menu.dataset.slot !== "menu") return;
    if ((event as ToggleEvent).newState !== "open") return;
    const list = items(menu);
    focusItem(list, menu.dataset.urFocus === "last" ? list.length - 1 : 0);
    delete menu.dataset.urFocus;
  };

  const onTriggerKey = (event: KeyboardEvent, trigger: HTMLElement) => {
    const menu = doc.getElementById(trigger.getAttribute("popovertarget") ?? "");
    if (!menu || menu.dataset.slot !== "menu") return;
    event.preventDefault();
    const last = event.key === "ArrowUp";
    if (menu.matches(":popover-open")) {
      const list = items(menu);
      return focusItem(list, last ? list.length - 1 : 0);
    }
    if (last) menu.dataset.urFocus = "last";
    // `source` makes the trigger the invoker, so focus returns to it on close.
    menu.showPopover({ source: trigger } as ShowPopoverOptions);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const target = event.target as Element | null;
    const trigger = target?.closest?.<HTMLElement>('[aria-haspopup="menu"][popovertarget]');
    if (trigger && (event.key === "ArrowDown" || event.key === "ArrowUp")) return onTriggerKey(event, trigger);
    const item = target?.closest?.(ITEM);
    const menu = item?.closest<HTMLElement>('[data-slot="menu"]');
    if (!item || !menu) return;
    const list = items(menu);
    const index = list.indexOf(item as HTMLElement);
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        return focusItem(list, (index + 1) % list.length);
      case "ArrowUp":
        event.preventDefault();
        return focusItem(list, (index - 1 + list.length) % list.length);
      case "Home":
        event.preventDefault();
        return focusItem(list, 0);
      case "End":
        event.preventDefault();
        return focusItem(list, list.length - 1);
      case "Tab":
        return menu.hidePopover();
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = Date.now();
      typed = now - typedAt > 500 ? event.key : typed + event.key;
      typedAt = now;
      const needle = typed.toLocaleLowerCase();
      const order = [...list.slice(index + 1), ...list.slice(0, index + 1)];
      const match = order.find((el) => (el.textContent ?? "").trim().toLocaleLowerCase().startsWith(needle));
      if (match) focusItem(list, list.indexOf(match));
    }
  };

  const onClick = (event: MouseEvent) => {
    const item = (event.target as Element | null)?.closest?.(ITEM);
    if (!item || item.getAttribute("aria-disabled") === "true") return;
    const menu = item.closest<HTMLElement>('[data-slot="menu"]');
    if (menu?.matches(":popover-open")) menu.hidePopover();
  };

  doc.addEventListener("toggle", onToggle, true);
  doc.addEventListener("keydown", onKeyDown);
  doc.addEventListener("click", onClick);
  return () => {
    doc.removeEventListener("toggle", onToggle, true);
    doc.removeEventListener("keydown", onKeyDown);
    doc.removeEventListener("click", onClick);
  };
}
