/** Native modality and focus trapping stay in the browser. The optional IDs
 * make initial/return focus reliable for dynamic React content as well. */
export function installDialogInvokers(doc: Document = document): () => void {
  let installed = true;
  const pending = new Map<HTMLDialogElement, { returnId: string | null }>();
  let removalObserver: MutationObserver | undefined;
  const focus = (target: HTMLElement | null, dialog: HTMLDialogElement) => {
    if (!installed || !target?.isConnected) return;
    // A later or nested modal owns focus until it closes.
    const activeModal = doc.activeElement?.closest('dialog:modal');
    if (activeModal && activeModal !== dialog && !activeModal.contains(target)) return;
    target.focus({ preventScroll: true });
  };
  const restore = (dialog: HTMLDialogElement) => {
    const entry = pending.get(dialog);
    if (!entry) return;
    pending.delete(dialog);
    if (!pending.size) { removalObserver?.disconnect(); removalObserver = undefined; }
    queueMicrotask(() => {
      if (dialog.isConnected && dialog.open) return;
      if (entry.returnId) focus(doc.getElementById(entry.returnId), dialog);
    });
  };
  const beforeToggle = (event: Event) => {
    const dialog = event.target;
    if (!(dialog instanceof HTMLDialogElement) || !dialog.matches('[data-slot~="dialog"]') ||
        (event as ToggleEvent).newState !== 'open') return;
    const initialId = dialog.getAttribute('data-initial-focus');
    const returnId = dialog.getAttribute('data-return-focus');
    if (!initialId && !returnId) return;
    queueMicrotask(() => {
      if (!installed || !dialog.isConnected || !dialog.open) return;
      if (returnId) {
        pending.set(dialog, { returnId });
        removalObserver ??= new MutationObserver(() => {
          for (const tracked of pending.keys()) if (!tracked.isConnected) restore(tracked);
        });
        removalObserver.observe(doc, { childList: true, subtree: true });
      }
      const target = initialId ? doc.getElementById(initialId) : null;
      if (target && dialog.contains(target)) focus(target, dialog);
    });
  };
  const close = (event: Event) => {
    if (event.target instanceof HTMLDialogElement && !event.target.open) restore(event.target);
  };
  const click = (event: MouseEvent) => {
    if (event.defaultPrevented || !(event.target instanceof Element)) return;
    // Safari does not focus buttons on pointer activation. Focus the invoker
    // before show-modal so native restoration works without an explicit ID.
    const invoker = event.target.closest<HTMLButtonElement>('button[data-slot~="button"][command="show-modal"]');
    if (!invoker || invoker.disabled || invoker.getAttribute('aria-disabled') === 'true') return;
    const dialog = doc.getElementById(invoker.getAttribute('commandfor') ?? '');
    if (!(dialog instanceof HTMLDialogElement) || dialog.open || !dialog.matches('[data-slot~="dialog"]')) return;
    invoker.focus({ preventScroll: true });
  };
  doc.addEventListener('click', click);
  doc.addEventListener('beforetoggle', beforeToggle, true);
  doc.addEventListener('close', close, true);
  return () => {
    installed = false;
    removalObserver?.disconnect();
    pending.clear();
    doc.removeEventListener('click', click);
    doc.removeEventListener('beforetoggle', beforeToggle, true);
    doc.removeEventListener('close', close, true);
  };
}
