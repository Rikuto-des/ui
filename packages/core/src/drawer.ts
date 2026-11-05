/**
 * Drag to close for `[data-slot~="drawer"]`. A drag that starts on the handle,
 * the title or the description moves the drawer with the pointer; past a
 * quarter of its height, or after a quick flick down, it closes (through
 * requestClose, so a cancel listener can still keep it open). Otherwise it
 * springs back. dismissible="none" (closedby="none") turns this off. The
 * drawer's own transition does the closing and springing back: this only
 * sets an inline translate while the pointer is down.
 */
const DRAWER = '[data-slot~="drawer"]';
const GRIP = ':is([data-slot="drawer-handle"], [data-slot="dialog-title"], [data-slot="dialog-description"])';
// A press that moves less than this is a click (selecting the title text, for one).
const SLOP = 6;
const FLICK = 0.5; // px per ms

export function installDrawers(doc: Document = document): () => void {
  let drag:
    | { drawer: HTMLDialogElement; pointer: number; startY: number; lastY: number; lastT: number; speed: number; moving: boolean }
    | undefined;

  function onDown(event: PointerEvent) {
    if (event.button !== 0 || drag) return;
    const grip = (event.target as Element | null)?.closest?.(GRIP);
    const drawer = grip?.closest<HTMLDialogElement>(DRAWER);
    if (!drawer?.open || drawer.getAttribute("closedby") === "none" || grip?.closest(DRAWER) !== drawer) return;
    drag = { drawer, pointer: event.pointerId, startY: event.clientY, lastY: event.clientY, lastT: event.timeStamp, speed: 0, moving: false };
  }

  function onMove(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.pointer) return;
    const offset = Math.max(0, event.clientY - drag.startY);
    if (!drag.moving) {
      if (offset < SLOP) return;
      drag.moving = true;
      drag.drawer.setPointerCapture(event.pointerId);
      drag.drawer.dataset.dragging = "";
      doc.getSelection()?.removeAllRanges();
    }
    drag.speed = (event.clientY - drag.lastY) / Math.max(1, event.timeStamp - drag.lastT);
    drag.lastY = event.clientY;
    drag.lastT = event.timeStamp;
    drag.drawer.style.translate = `0 ${offset}px`;
  }

  function onUp(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.pointer) return;
    const { drawer, moving, startY, speed } = drag;
    drag = undefined;
    if (!moving) return;
    const offset = Math.max(0, event.clientY - startY);
    const close = event.type === "pointerup" && (offset > drawer.offsetHeight / 4 || (speed > FLICK && offset > SLOP * 2));
    delete drawer.dataset.dragging;
    // Clearing the inline translate hands the motion back to the drawer's transition:
    // from here to its resting place, or to its closed place below the edge.
    drawer.style.removeProperty("translate");
    if (close) {
      if (typeof drawer.requestClose === "function") drawer.requestClose();
      else drawer.close();
    }
  }

  // A drag must not end in a click on whatever is under the pointer (the backdrop closes the drawer).
  function onClick(event: MouseEvent) {
    const drawer = (event.target as Element | null)?.closest?.(DRAWER);
    if (drawer && suppressClick === drawer) {
      event.preventDefault();
      event.stopPropagation();
    }
    suppressClick = undefined;
  }
  let suppressClick: Element | undefined;
  function onUpCapture(event: PointerEvent) {
    suppressClick = drag?.moving && event.pointerId === drag.pointer ? drag.drawer : undefined;
  }

  doc.addEventListener("pointerdown", onDown);
  doc.addEventListener("pointermove", onMove);
  doc.addEventListener("pointerup", onUpCapture, true);
  doc.addEventListener("pointerup", onUp);
  doc.addEventListener("pointercancel", onUp);
  doc.addEventListener("click", onClick, true);
  return () => {
    doc.removeEventListener("pointerdown", onDown);
    doc.removeEventListener("pointermove", onMove);
    doc.removeEventListener("pointerup", onUpCapture, true);
    doc.removeEventListener("pointerup", onUp);
    doc.removeEventListener("pointercancel", onUp);
    doc.removeEventListener("click", onClick, true);
  };
}

