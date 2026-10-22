/**
 * Tooltips are `popover="hint"` elements linked from their trigger with
 * `interestfor` — Chromium shows them on hover and focus with no script.
 * This fallback does the same elsewhere: show after a short hover delay or
 * immediately on keyboard focus, hide on leave, blur or Escape (hint
 * popovers light-dismiss natively).
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

  const tipOf = (trigger: Element) => doc.getElementById(trigger.getAttribute("data-yl-tooltip") ?? "");
  const triggerOf = (target: EventTarget | null) => (target as Element | null)?.closest?.("[data-yl-tooltip]") ?? null;
  const show = (trigger: Element, delay: number) => {
    clearTimeout(hideTimer);
    clearTimeout(showTimer);
    showTimer = setTimeout(() => {
      const tip = tipOf(trigger);
      if (tip && !tip.matches(":popover-open")) tip.showPopover();
    }, delay);
  };
  const hide = (trigger: Element) => {
    clearTimeout(showTimer);
    hideTimer = setTimeout(() => {
      const tip = tipOf(trigger);
      if (tip?.matches(":popover-open")) tip.hidePopover();
    }, HIDE_DELAY);
  };

  const onOver = (event: PointerEvent) => {
    const trigger = triggerOf(event.target);
    if (trigger && event.pointerType === "mouse") show(trigger, SHOW_DELAY);
  };
  const onOut = (event: PointerEvent) => {
    const trigger = triggerOf(event.target);
    if (trigger && !trigger.contains(event.relatedTarget as Node | null)) hide(trigger);
  };
  const onFocusIn = (event: FocusEvent) => {
    const trigger = triggerOf(event.target);
    if (trigger?.matches(":focus-visible")) show(trigger, 0);
  };
  const onFocusOut = (event: FocusEvent) => {
    const trigger = triggerOf(event.target);
    if (trigger) hide(trigger);
  };

  doc.addEventListener("pointerover", onOver);
  doc.addEventListener("pointerout", onOut);
  doc.addEventListener("focusin", onFocusIn);
  doc.addEventListener("focusout", onFocusOut);
  return () => {
    doc.removeEventListener("pointerover", onOver);
    doc.removeEventListener("pointerout", onOut);
    doc.removeEventListener("focusin", onFocusIn);
    doc.removeEventListener("focusout", onFocusOut);
  };
}
