/**
 * Fallback for `<dialog closedby>` in browsers that do not implement it yet
 * (Safari at the time of writing). Native behavior is used whenever it exists.
 *
 * - closedby="any": a click on the backdrop closes the dialog.
 * - closedby="none": Escape does not close the dialog.
 * - closedby="closerequest": the native default for modal dialogs.
 */
export function supportsClosedBy(): boolean {
  return typeof HTMLDialogElement !== "undefined" && "closedBy" in HTMLDialogElement.prototype;
}

function close(dialog: HTMLDialogElement) {
  if (typeof dialog.requestClose === "function") dialog.requestClose();
  else dialog.close();
}

function isOutside(dialog: HTMLDialogElement, event: MouseEvent): boolean {
  // Keyboard-initiated clicks report 0/0 coordinates; never treat them as outside.
  if (event.detail === 0) return false;
  const rect = dialog.getBoundingClientRect();
  return (
    event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom
  );
}

/** Installs the fallback once per document. Returns a cleanup function. */
export function installClosedByFallback(doc: Document = document): () => void {
  if (supportsClosedBy()) return () => {};

  const onClick = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof HTMLDialogElement) || !target.open) return;
    if (target.getAttribute("closedby") === "any" && isOutside(target, event)) close(target);
  };
  const onCancel = (event: Event) => {
    const target = event.target;
    if (target instanceof HTMLDialogElement && target.getAttribute("closedby") === "none") event.preventDefault();
  };

  doc.addEventListener("click", onClick);
  doc.addEventListener("cancel", onCancel, true);
  return () => {
    doc.removeEventListener("click", onClick);
    doc.removeEventListener("cancel", onCancel, true);
  };
}
