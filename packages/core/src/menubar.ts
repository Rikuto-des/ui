/**
 * Menubar behavior for `[data-slot="menubar"]` (WAI-ARIA menubar pattern).
 * Without this script every trigger is a Tab stop and opens its menu through
 * `popovertarget`. This makes the bar one Tab stop (roving tabindex), moves
 * between triggers with ← → Home End, and, while a menu is open, switches
 * menus on ← → (from the trigger or from an item) and on hover. Opening a
 * trigger with ↓ ↑ and everything inside a menu is Menu's behavior
 * (installMenus); this only adds what is particular to the bar.
 */
const BAR = '[data-slot="menubar"]';
const TRIGGER = '[data-slot~="menubar-trigger"]';
const SUB_TRIGGER = '[data-slot~="menu-sub-trigger"]';

const triggers = (bar: Element) =>
  [...bar.querySelectorAll<HTMLElement>(TRIGGER)].filter((el) => el.closest(BAR) === bar && !el.matches(":disabled"));
const menuOf = (trigger: Element) => trigger.parentElement?.querySelector<HTMLElement>(':scope > [data-slot~="menu"]') ?? null;
const isOpen = (trigger: Element) => !!menuOf(trigger)?.matches(":popover-open");
const rtl = (el: Element) => getComputedStyle(el).direction === "rtl";

function rove(bar: Element, current: HTMLElement) {
  for (const trigger of triggers(bar)) trigger.tabIndex = trigger === current ? 0 : -1;
}

function open(trigger: HTMLElement, focus: "first" | "last" = "first") {
  const menu = menuOf(trigger);
  const bar = trigger.closest(BAR);
  if (!menu || !bar) return;
  rove(bar, trigger);
  if (menu.matches(":popover-open")) return;
  if (focus === "last") menu.dataset.urFocus = "last";
  // `source` makes the trigger the invoker: Escape returns focus to it.
  menu.showPopover({ source: trigger } as ShowPopoverOptions);
}

export function installMenubars(doc: Document = document): () => void {
  const win = doc.defaultView ?? window;
  const finePointer = win.matchMedia("(hover: hover) and (pointer: fine)");
  // A bar rendered after this point (a client route, a late mount) is a single Tab stop too.
  const discover = () => {
    for (const bar of doc.querySelectorAll(BAR)) {
      const list = triggers(bar);
      const current = list.find((trigger) => trigger.getAttribute("tabindex") === "0") ?? list[0];
      if (current) rove(bar, current);
    }
  };
  discover();
  const observer = new MutationObserver(discover);
  observer.observe(doc.documentElement, { childList: true, subtree: true });

  /** The trigger `step` places from `from` in its bar, wrapping around. */
  function neighbour(from: HTMLElement, step: number) {
    const bar = from.closest(BAR)!;
    const list = triggers(bar);
    return list[(list.indexOf(from) + step + list.length) % list.length];
  }

  const onFocusIn = (event: FocusEvent) => {
    const trigger = (event.target as Element | null)?.closest?.<HTMLElement>(TRIGGER);
    const bar = trigger?.closest(BAR);
    if (trigger && bar) rove(bar, trigger);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const target = event.target as Element | null;
    const trigger = target?.closest?.<HTMLElement>(TRIGGER);
    if (trigger?.closest(BAR)) {
      const forward = rtl(trigger) ? "ArrowLeft" : "ArrowRight";
      const back = rtl(trigger) ? "ArrowRight" : "ArrowLeft";
      const list = triggers(trigger.closest(BAR)!);
      let next: HTMLElement | undefined;
      if (event.key === forward) next = neighbour(trigger, 1);
      else if (event.key === back) next = neighbour(trigger, -1);
      else if (event.key === "Home") next = list[0];
      else if (event.key === "End") next = list.at(-1);
      if (!next) return;
      event.preventDefault();
      const wasOpen = list.some(isOpen);
      rove(trigger.closest(BAR)!, next);
      next.focus();
      if (wasOpen) open(next);
      return;
    }
    // Inside a menu of the bar: → on an item without a submenu, and ← in the top menu, go to the next menu.
    const item = target?.closest?.<HTMLElement>('[data-slot~="menu-item"]');
    const top = item?.closest('[data-slot~="menubar-content"]');
    const owner = top?.parentElement?.querySelector<HTMLElement>(`:scope > ${TRIGGER}`);
    if (!item || !top || !owner) return;
    const forward = rtl(item) ? "ArrowLeft" : "ArrowRight";
    const back = rtl(item) ? "ArrowRight" : "ArrowLeft";
    const inSub = item.closest('[data-slot~="menu"]') !== top;
    let step = 0;
    if (event.key === forward && !item.matches(SUB_TRIGGER)) step = 1;
    else if (event.key === back && !inSub) step = -1;
    if (!step) return;
    event.preventDefault();
    const next = neighbour(owner, step);
    if (next === owner) return;
    open(next);
  };

  const onPointerOver = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" || !finePointer.matches) return;
    const trigger = (event.target as Element | null)?.closest?.<HTMLElement>(TRIGGER);
    const bar = trigger?.closest(BAR);
    if (!trigger || !bar || isOpen(trigger)) return;
    // Only switch: hovering never opens the first menu.
    if (triggers(bar).some(isOpen)) open(trigger);
  };

  // A press outside the bar light-dismisses its menu and leaves focus where the press put it.
  let pressedOutside = false;
  const onPointerDown = (event: PointerEvent) => {
    pressedOutside = !(event.target as Element | null)?.closest?.(`${BAR}, [data-slot~="menubar-content"]`);
  };
  const onKeyDownCapture = () => {
    pressedOutside = false;
  };

  // The browser returns focus to what was focused before the menu opened. After switching
  // menus that is an item of a menu that is closed by now, so focus would fall to the page.
  const onToggle = (event: Event) => {
    const menu = event.target;
    if (!(menu instanceof HTMLElement) || !menu.matches('[data-slot~="menubar-content"]') || (event as ToggleEvent).newState !== "closed") return;
    if (pressedOutside) return;
    const active = doc.activeElement;
    const lost = !active || active === doc.body || !!active.closest('[data-slot~="menubar-content"]:not(:popover-open)');
    const owner = menu.parentElement?.querySelector<HTMLElement>(`:scope > ${TRIGGER}`);
    if (lost && owner) owner.focus();
  };

  doc.addEventListener("toggle", onToggle, true);
  doc.addEventListener("pointerdown", onPointerDown, true);
  doc.addEventListener("keydown", onKeyDownCapture, true);
  doc.addEventListener("focusin", onFocusIn);
  doc.addEventListener("keydown", onKeyDown);
  doc.addEventListener("pointerover", onPointerOver);
  return () => {
    observer.disconnect();
    doc.removeEventListener("toggle", onToggle, true);
    doc.removeEventListener("pointerdown", onPointerDown, true);
    doc.removeEventListener("keydown", onKeyDownCapture, true);
    doc.removeEventListener("focusin", onFocusIn);
    doc.removeEventListener("keydown", onKeyDown);
    doc.removeEventListener("pointerover", onPointerOver);
  };
}
