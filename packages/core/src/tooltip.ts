/**
 * Tooltips are `popover="hint"` elements linked from their trigger with
 * `interestfor` — Chromium shows them on hover and focus with no script.
 * This fallback does the same elsewhere: show after a short hover delay or
 * immediately on keyboard focus, hide on leave, blur or Escape (hint
 * popovers light-dismiss natively).
 *
 * Hover cards use the same triggers (`data-ur-tooltip`) but hold links, so
 * moving the pointer or focus from the trigger into the card keeps it open.
 */
const SHOW_DELAY = 400;
const HIDE_DELAY = 120;

export function supportsInterestInvokers(): boolean {
  return typeof HTMLButtonElement !== "undefined" && "interestForElement" in HTMLButtonElement.prototype;
}

export function installTooltips(doc: Document = document): () => void {
  if (supportsInterestInvokers()) return () => {};
  let showTimer: ReturnType<typeof setTimeout> | undefined;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;
  let active: Element | null = null;
  let dismissed: Element | null = null;

  const tipOf = (trigger: Element) => doc.getElementById(trigger.getAttribute("data-ur-tooltip") ?? "");
  const triggerOf = (target: EventTarget | null) => (target as Element | null)?.closest?.("[data-ur-tooltip]") ?? null;
  const show = (trigger: Element, delay: number) => {
    if (trigger === dismissed) return;
    clearTimeout(hideTimer);
    clearTimeout(showTimer);
    active = trigger;
    showTimer = setTimeout(() => {
      const tip = tipOf(trigger);
      if (trigger.isConnected && tip && !tip.matches(":popover-open")) tip.showPopover();
    }, delay);
  };
  const interested = (trigger: Element) => {
    const tip = tipOf(trigger);
    return trigger.matches(":hover, :focus-visible") || Boolean(tip?.matches(":hover, :focus-within"));
  };
  const hide = (trigger: Element) => {
    if (interested(trigger)) return;
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      const tip = tipOf(trigger);
      if (!interested(trigger) && tip?.matches(":popover-open")) tip.hidePopover();
    }, HIDE_DELAY);
  };

  /** The popover a node sits in, if a trigger points at it. */
  const tipAround = (node: EventTarget | null) => {
    const tip = (node as Element | null)?.closest?.<HTMLElement>("[popover]");
    return tip?.id && doc.querySelector(`[data-ur-tooltip="${CSS.escape(tip.id)}"]`) ? tip : null;
  };
  const triggerFor = (tip: HTMLElement) => doc.querySelector(`[data-ur-tooltip="${CSS.escape(tip.id)}"]`);
  /** Moving between a trigger and its own popover does not count as leaving. */
  const staysWithin = (trigger: Element, to: EventTarget | null) => {
    const node = to as Node | null;
    return Boolean(node && (trigger.contains(node) || tipOf(trigger)?.contains(node)));
  };

  const onOver = (event: PointerEvent) => {
    const trigger = triggerOf(event.target);
    if (trigger && event.pointerType === "mouse") show(trigger, SHOW_DELAY);
    else if (tipAround(event.target)) clearTimeout(hideTimer);
  };
  const onOut = (event: PointerEvent) => {
    const trigger = triggerOf(event.target) ?? (() => {
      const tip = tipAround(event.target);
      return tip ? triggerFor(tip) : null;
    })();
    if (trigger && !staysWithin(trigger, event.relatedTarget)) {
      if (dismissed === trigger) dismissed = null;
      hide(trigger);
    }
  };
  const onFocusIn = (event: FocusEvent) => {
    const trigger = triggerOf(event.target);
    if (trigger?.matches(":focus-visible")) show(trigger, 0);
    else if (tipAround(event.target)) clearTimeout(hideTimer);
  };
  const onFocusOut = (event: FocusEvent) => {
    const trigger = triggerOf(event.target) ?? (() => {
      const tip = tipAround(event.target);
      return tip ? triggerFor(tip) : null;
    })();
    if (trigger && !staysWithin(trigger, event.relatedTarget)) {
      if (dismissed === trigger) dismissed = null;
      hide(trigger);
    }
  };

  // Native light-dismiss cannot cancel a delayed show that has not opened yet.
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape" || !active) return;
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    dismissed = active;
    const tip = tipOf(active);
    if (tip?.matches(":popover-open")) {
      event.preventDefault();
      tip.hidePopover();
    }
    active = null;
  };

  doc.addEventListener("pointerover", onOver);
  doc.addEventListener("pointerout", onOut);
  doc.addEventListener("focusin", onFocusIn);
  doc.addEventListener("focusout", onFocusOut);
  doc.addEventListener("keydown", onKeyDown);
  // Hydration can install the fallback after the user has already focused a
  // server-rendered trigger. That focusin event will not be replayed here.
  const focused = triggerOf(doc.activeElement);
  if (focused?.matches(":focus-visible")) show(focused, 0);
  return () => {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    doc.removeEventListener("pointerover", onOver);
    doc.removeEventListener("pointerout", onOut);
    doc.removeEventListener("focusin", onFocusIn);
    doc.removeEventListener("focusout", onFocusOut);
    doc.removeEventListener("keydown", onKeyDown);
  };
}
