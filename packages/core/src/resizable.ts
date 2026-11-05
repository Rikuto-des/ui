/**
 * Resizing for `[data-slot="resizable"]` (WAI-ARIA window splitter). Dragging
 * the handle, or the arrow keys on it, set the first pane's share (the
 * --_size custom property, in percent) between the handle's aria-valuemin and
 * aria-valuemax, and keep aria-valuenow in step. In right-to-left text the
 * horizontal keys and drag follow the reading direction.
 */
const HANDLE = '[data-slot="resizable-handle"]';
const STEP = 2;
const BIG_STEP = 10;

export function installResizables(doc: Document = document): () => void {
  let drag: { handle: HTMLElement; pointer: number } | undefined;

  const parts = (handle: Element) => {
    const group = handle.closest<HTMLElement>('[data-slot="resizable"]');
    if (!group) return undefined;
    const vertical = group.dataset.orientation === "vertical";
    const rtl = !vertical && getComputedStyle(group).direction === "rtl";
    const min = Number(handle.getAttribute("aria-valuemin") ?? 0);
    const max = Number(handle.getAttribute("aria-valuemax") ?? 100);
    const now = Number(handle.getAttribute("aria-valuenow") ?? 50);
    return { group, vertical, rtl, min, max, now };
  };

  function set(handle: Element, value: number) {
    const p = parts(handle);
    if (!p) return;
    const next = Math.round(Math.min(p.max, Math.max(p.min, value)) * 10) / 10;
    p.group.style.setProperty("--_size", String(next));
    handle.setAttribute("aria-valuenow", String(Math.round(next)));
  }

  function onDown(event: PointerEvent) {
    if (event.button !== 0 || drag) return;
    const handle = (event.target as Element | null)?.closest?.<HTMLElement>(HANDLE);
    if (!handle || !parts(handle)) return;
    event.preventDefault();
    handle.focus({ preventScroll: true });
    handle.setPointerCapture(event.pointerId);
    handle.dataset.dragging = "";
    drag = { handle, pointer: event.pointerId };
  }

  function onMove(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.pointer) return;
    const p = parts(drag.handle);
    if (!p) return;
    const box = p.group.getBoundingClientRect();
    const share = p.vertical
      ? (event.clientY - box.top) / box.height
      : p.rtl
        ? (box.right - event.clientX) / box.width
        : (event.clientX - box.left) / box.width;
    set(drag.handle, share * 100);
  }

  function onUp(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.pointer) return;
    delete drag.handle.dataset.dragging;
    drag = undefined;
  }

  function onKey(event: KeyboardEvent) {
    const handle = (event.target as Element | null)?.closest?.(HANDLE);
    if (!handle || event.altKey || event.ctrlKey || event.metaKey) return;
    const p = parts(handle);
    if (!p) return;
    const step = event.shiftKey ? BIG_STEP : STEP;
    const back = p.vertical ? "ArrowUp" : p.rtl ? "ArrowRight" : "ArrowLeft";
    const forward = p.vertical ? "ArrowDown" : p.rtl ? "ArrowLeft" : "ArrowRight";
    const next = { [back]: p.now - step, [forward]: p.now + step, Home: p.min, End: p.max }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    set(handle, next);
  }

  doc.addEventListener("pointerdown", onDown);
  doc.addEventListener("pointermove", onMove);
  doc.addEventListener("pointerup", onUp);
  doc.addEventListener("pointercancel", onUp);
  doc.addEventListener("keydown", onKey);
  return () => {
    doc.removeEventListener("pointerdown", onDown);
    doc.removeEventListener("pointermove", onMove);
    doc.removeEventListener("pointerup", onUp);
    doc.removeEventListener("pointercancel", onUp);
    doc.removeEventListener("keydown", onKey);
  };
}
