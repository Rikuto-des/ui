/**
 * Menu keyboard behavior for `[data-slot="menu"]` popovers (WAI-ARIA menu
 * button pattern). Without this script a menu still opens through
 * `popovertarget` and its items are reachable with Tab; the script adds
 * arrow keys, Home/End, typeahead, focus on open and close on activation.
 * On the trigger, ArrowDown opens the menu on its first item and ArrowUp on
 * its last.
 *
 * Submenus (`[data-slot="menu-sub"]`) are nested auto popovers. On wide
 * screens they fly out beside their item: a mouse opens them on hover, and
 * the pointer may cross other rows on its way there. On narrow screens they
 * open in place instead (`data-inline-open`), indented under the item. Either
 * way → (← in right-to-left text), Enter and Space open one on its first
 * item, and ← or Escape closes it and returns to the item.
 */
const ITEM = '[data-slot~="menu-item"]';
const SUB_TRIGGER = '[data-slot~="menu-sub-trigger"]';
const MENU = '[data-slot="menu"]';
const ROOT_MENU = '[data-slot="menu"]:not([data-sub])';
type Point = { x: number; y: number };

/** The items of this menu only, not those of its submenus. */
function items(menu: Element): HTMLElement[] {
  return [...menu.querySelectorAll<HTMLElement>(ITEM)].filter(
    (el) => el.closest(MENU) === menu && !el.hasAttribute("disabled") && el.getAttribute("aria-disabled") !== "true",
  );
}

function focusItem(list: HTMLElement[], index: number) {
  list.forEach((el, i) => (el.tabIndex = i === index ? 0 : -1));
  list[index]?.focus();
}

const subOf = (trigger: Element) => trigger.parentElement?.querySelector<HTMLElement>(`:scope > ${MENU}`) ?? null;
const triggerOf = (sub: Element) => sub.parentElement?.querySelector<HTMLElement>(`:scope > ${SUB_TRIGGER}`) ?? null;
const isOpen = (sub: Element) => sub.matches(":popover-open") || sub.hasAttribute("data-inline-open");
const rtl = (el: Element) => getComputedStyle(el).direction === "rtl";

/** A pointer travelling to a flyout may cross other rows: allow it while it heads for the flyout. */
function inTriangle(p: Point, a: Point, b: Point, c: Point) {
  const cross = (p1: Point, p2: Point, p3: Point) => (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
  const d = [cross(p, a, b), cross(p, b, c), cross(p, c, a)];
  return !(d.some((n) => n < 0) && d.some((n) => n > 0));
}

export function installMenus(doc: Document = document): () => void {
  const win = doc.defaultView ?? window;
  const wide = win.matchMedia("(min-width: 641px)");
  const finePointer = win.matchMedia("(hover: hover) and (pointer: fine)");
  let typed = "";
  let typedAt = 0;
  let opening: ReturnType<typeof setTimeout> | undefined;
  let closing: ReturnType<typeof setTimeout> | undefined;
  let corridor: { sub: HTMLElement; origin: Point; expires: number } | undefined;

  function openSub(trigger: HTMLElement, focusFirst: boolean) {
    const sub = subOf(trigger);
    const parent = trigger.closest(MENU);
    if (!sub || !parent) return;
    // One open submenu per menu.
    for (const other of parent.querySelectorAll<HTMLElement>(SUB_TRIGGER)) if (other !== trigger && other.closest(MENU) === parent) closeSub(other);
    if (wide.matches) {
      sub.removeAttribute("data-inline-open");
      trigger.removeAttribute("aria-expanded");
      if (!sub.matches(":popover-open")) sub.showPopover({ source: trigger } as ShowPopoverOptions);
    } else {
      sub.toggleAttribute("data-inline-open", true);
      trigger.setAttribute("aria-expanded", "true");
    }
    // Synchronously, not on the toggle event: the next key press must already land in the submenu.
    if (focusFirst) focusItem(items(sub), 0);
  }

  function closeSub(trigger: HTMLElement, focusTrigger = false) {
    const sub = subOf(trigger);
    if (!sub) return;
    if (sub.matches(":popover-open")) sub.hidePopover();
    if (sub.hasAttribute("data-inline-open")) {
      sub.removeAttribute("data-inline-open");
      trigger.setAttribute("aria-expanded", "false");
    }
    if (focusTrigger) trigger.focus();
  }

  const closeAll = (from: Element) => {
    const root = from.closest<HTMLElement>(ROOT_MENU);
    if (root?.matches(":popover-open")) root.hidePopover();
  };

  const onToggle = (event: Event) => {
    const menu = event.target;
    if (!(menu instanceof HTMLElement) || menu.dataset.slot !== "menu") return;
    const open = (event as ToggleEvent).newState === "open";
    if (menu.hasAttribute("data-sub")) {
      if (!open && corridor?.sub === menu) corridor = undefined;
      return;
    }
    if (!open) {
      // The next open starts at the top level.
      for (const trigger of menu.querySelectorAll<HTMLElement>(SUB_TRIGGER)) closeSub(trigger);
      return;
    }
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
    const trigger = target?.closest?.<HTMLElement>('[aria-haspopup="menu"][popovertarget]:not([data-slot~="menu-item"])');
    if (trigger && (event.key === "ArrowDown" || event.key === "ArrowUp")) return onTriggerKey(event, trigger);
    const item = target?.closest?.<HTMLElement>(ITEM);
    const menu = item?.closest<HTMLElement>(MENU);
    if (!item || !menu) return;
    const list = items(menu);
    const index = list.indexOf(item);
    const forward = rtl(menu) ? "ArrowLeft" : "ArrowRight";
    const back = rtl(menu) ? "ArrowRight" : "ArrowLeft";
    const parentItem = menu.hasAttribute("data-sub") ? triggerOf(menu) : null;
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
      case forward:
        if (!item.matches(SUB_TRIGGER)) return;
        event.preventDefault();
        return openSub(item, true);
      case back:
        if (!parentItem) return;
        event.preventDefault();
        return closeSub(parentItem, true);
      case "Escape":
        // Close only the innermost menu. Cancelling the key stops the browser closing the whole stack.
        if (!parentItem) return;
        event.preventDefault();
        return closeSub(parentItem, true);
      case "Tab":
        return closeAll(menu);
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
    const item = (event.target as Element | null)?.closest?.<HTMLElement>(ITEM);
    if (!item || item.getAttribute("aria-disabled") === "true") return;
    if (item.matches(SUB_TRIGGER)) {
      // Instead of the native toggle: one open submenu per menu, in place on narrow screens,
      // and on the first item when opened from the keyboard (Enter or Space: detail 0).
      // A flyout a mouse already opened on hover stays open on click; in place, a click toggles.
      event.preventDefault();
      const sub = subOf(item);
      if (sub && isOpen(sub) && !wide.matches && event.detail !== 0) return closeSub(item);
      return openSub(item, event.detail === 0);
    }
    closeAll(item);
  };

  const hoverable = (event: PointerEvent) => event.pointerType === "mouse" && wide.matches && finePointer.matches;

  const onPointerOver = (event: PointerEvent) => {
    if (!hoverable(event)) return;
    const item = (event.target as Element | null)?.closest?.<HTMLElement>(ITEM);
    const menu = item?.closest<HTMLElement>(MENU);
    if (!item || !menu) return;
    clearTimeout(opening);
    if (corridor && corridor.sub.contains(item)) {
      clearTimeout(closing);
      corridor = undefined;
      return;
    }
    const openSubHere = [...menu.querySelectorAll<HTMLElement>(SUB_TRIGGER)].find((t) => t.closest(MENU) === menu && subOf(t)?.matches(":popover-open"));
    if (item.matches(SUB_TRIGGER)) {
      if (item === openSubHere) return clearTimeout(closing);
      // Crossing this row on the way to another flyout must not open this one.
      const attempt = () => {
        if (!item.matches(":hover")) return;
        if (corridor && corridor.sub !== subOf(item)) opening = setTimeout(attempt, 80);
        else openSub(item, false);
      };
      opening = setTimeout(attempt, 160);
      return;
    }
    if (openSubHere && !corridor) {
      clearTimeout(closing);
      closing = setTimeout(() => closeSub(openSubHere), 120);
    }
  };

  const onPointerOut = (event: PointerEvent) => {
    if (!hoverable(event)) return;
    const trigger = (event.target as Element | null)?.closest?.<HTMLElement>(SUB_TRIGGER);
    const sub = trigger && subOf(trigger);
    if (!trigger || !sub?.matches(":popover-open") || trigger.contains(event.relatedTarget as Node | null)) return;
    if (sub.contains(event.relatedTarget as Node | null)) return;
    corridor = { sub, origin: { x: event.clientX, y: event.clientY }, expires: Date.now() + 500 };
    clearTimeout(closing);
    closing = setTimeout(() => corridor?.sub === sub && closeSub(trigger), 500);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!corridor || event.pointerType !== "mouse") return;
    const { sub, origin, expires } = corridor;
    if (sub.contains(event.target as Node)) {
      clearTimeout(closing);
      corridor = undefined;
      return;
    }
    const r = sub.getBoundingClientRect();
    const x = r.left >= origin.x ? r.left : r.right;
    const point = { x: event.clientX, y: event.clientY };
    const trigger = triggerOf(sub);
    clearTimeout(closing);
    if (Date.now() > expires || !inTriangle(point, origin, { x, y: r.top - 8 }, { x, y: r.bottom + 8 })) {
      corridor = undefined;
      if (trigger && !trigger.matches(":hover")) closing = setTimeout(() => closeSub(trigger), 100);
      return;
    }
    // Still heading for the flyout: a slow pointer keeps it as long as it makes progress,
    // and the corridor narrows from where the pointer is now.
    corridor = { sub, origin: point, expires: Date.now() + 500 };
    if (trigger) closing = setTimeout(() => corridor?.sub === sub && closeSub(trigger), 500);
  };

  doc.addEventListener("toggle", onToggle, true);
  doc.addEventListener("keydown", onKeyDown);
  doc.addEventListener("click", onClick);
  doc.addEventListener("pointerover", onPointerOver);
  doc.addEventListener("pointerout", onPointerOut);
  doc.addEventListener("pointermove", onPointerMove);
  return () => {
    clearTimeout(opening);
    clearTimeout(closing);
    doc.removeEventListener("toggle", onToggle, true);
    doc.removeEventListener("keydown", onKeyDown);
    doc.removeEventListener("click", onClick);
    doc.removeEventListener("pointerover", onPointerOver);
    doc.removeEventListener("pointerout", onPointerOut);
    doc.removeEventListener("pointermove", onPointerMove);
  };
}
