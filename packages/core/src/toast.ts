/**
 * Toasts. `toast("保存しました")` from any client code shows a message in
 * the page's `[data-slot="toaster"]` region (created on demand when the page
 * has none). The region is a manual popover in the top layer and a polite
 * live region, so screen readers announce it.
 *
 * A modal <dialog> makes everything outside it inert: a toast there would be
 * visible but neither clickable nor announced. So while a modal is open,
 * toasts go to an outlet region inside that dialog, and whatever is left in
 * it moves back to the page region when the dialog closes.
 */
export type ToastTone = "neutral" | "ok" | "danger";

export interface ToastOptions {
  description?: string;
  tone?: ToastTone;
  /** Milliseconds before the toast hides itself; 0 keeps it until dismissed. */
  duration?: number;
  action?: { label: string; onClick: () => void };
  /** Accessible label of the dismiss button. */
  dismissLabel?: string;
}

let counter = 0;
const PAGE_REGION = '[data-slot="toaster"]:not([data-yl-outlet])';

function region(doc: Document): HTMLElement {
  let toaster = doc.querySelector<HTMLElement>(PAGE_REGION);
  if (!toaster) {
    toaster = doc.createElement("section");
    toaster.dataset.slot = "toaster";
    toaster.dataset.position = "bottom-end";
    toaster.setAttribute("popover", "manual");
    toaster.setAttribute("aria-label", "通知");
    const list = doc.createElement("ol");
    list.dataset.slot = "toast-list";
    list.setAttribute("aria-live", "polite");
    toaster.append(list);
    doc.body.append(toaster);
  }
  return toaster;
}

function show(toaster: HTMLElement) {
  if (!toaster.matches(":popover-open")) toaster.showPopover();
}

function listOf(toaster: HTMLElement): HTMLElement {
  return toaster.querySelector<HTMLElement>('[data-slot="toast-list"]') ?? toaster;
}

/** The open modal dialog on top, if any. Later in the document means opened later for nested modals. */
function topModal(doc: Document): HTMLDialogElement | undefined {
  return [...doc.querySelectorAll("dialog")].filter((d) => d.matches(":modal")).at(-1);
}

/** A region inside the modal dialog, shaped like the page region, so its toasts stay operable. */
function outlet(dialog: HTMLDialogElement, page: HTMLElement): HTMLElement {
  const existing = dialog.querySelector<HTMLElement>(":scope > [data-yl-outlet]");
  if (existing) return existing;
  const doc = dialog.ownerDocument;
  const el = doc.createElement("section");
  el.dataset.slot = "toaster";
  el.dataset.position = page.dataset.position ?? "bottom-end";
  el.dataset.ylOutlet = "";
  el.setAttribute("popover", "manual");
  el.setAttribute("aria-label", page.getAttribute("aria-label") ?? "通知");
  const list = doc.createElement("ol");
  list.dataset.slot = "toast-list";
  list.setAttribute("aria-live", "polite");
  el.append(list);
  dialog.append(el);
  dialog.addEventListener(
    "close",
    () => {
      listOf(page).append(...listOf(el).children);
      el.remove();
      show(page);
    },
    { once: true },
  );
  return el;
}

/** Where a new toast goes: the page region, or an outlet inside the open modal. */
function target(doc: Document): HTMLElement {
  const page = region(doc);
  show(page);
  const modal = topModal(doc);
  if (!modal) return page;
  const inner = outlet(modal, page);
  // Shown after the dialog, so it is above it in the top layer.
  show(inner);
  return inner;
}

export function dismiss(id: string, doc: Document = document) {
  const item = doc.getElementById(id);
  if (!item || item.dataset.state === "closing") return;
  item.dataset.state = "closing";
  const remove = () => item.remove();
  const duration = parseFloat(getComputedStyle(item).transitionDuration) || 0;
  if (duration === 0) remove();
  else {
    item.addEventListener("transitionend", remove, { once: true });
    setTimeout(remove, duration * 1000 + 50);
  }
}

export function toast(message: string, options: ToastOptions = {}, doc: Document = document): string {
  const list = listOf(target(doc));
  const id = `yl-toast-${++counter}`;

  const item = doc.createElement("li");
  item.id = id;
  item.dataset.slot = "toast";
  item.dataset.tone = options.tone ?? "neutral";
  const body = doc.createElement("div");
  body.dataset.slot = "toast-body";
  const title = doc.createElement("p");
  title.dataset.slot = "toast-title";
  title.textContent = message;
  body.append(title);
  if (options.description) {
    const description = doc.createElement("p");
    description.dataset.slot = "toast-description";
    description.textContent = options.description;
    body.append(description);
  }
  item.append(body);
  if (options.action) {
    const action = doc.createElement("button");
    action.type = "button";
    action.dataset.slot = "toast-action button";
    action.dataset.variant = "ghost";
    action.dataset.size = "sm";
    action.textContent = options.action.label;
    const { onClick } = options.action;
    action.addEventListener("click", () => {
      onClick();
      dismiss(id, doc);
    });
    item.append(action);
  }
  const close = doc.createElement("button");
  close.type = "button";
  close.dataset.slot = "toast-close";
  close.setAttribute("aria-label", options.dismissLabel ?? "通知を閉じる");
  close.addEventListener("click", () => dismiss(id, doc));
  item.append(close);

  // Append on the next frame so the live region is already in the top layer.
  requestAnimationFrame(() => list.append(item));

  const duration = options.duration ?? 5000;
  if (duration > 0) {
    let timer = setTimeout(() => dismiss(id, doc), duration);
    const pause = () => clearTimeout(timer);
    const resume = () => {
      clearTimeout(timer);
      timer = setTimeout(() => dismiss(id, doc), duration / 2);
    };
    item.addEventListener("pointerenter", pause);
    item.addEventListener("pointerleave", resume);
    item.addEventListener("focusin", pause);
    item.addEventListener("focusout", resume);
  }
  return id;
}

/** Shows an existing toaster region so its live region is ready before the first toast. */
export function installToasts(doc: Document = document): () => void {
  const toaster = doc.querySelector<HTMLElement>(PAGE_REGION);
  if (toaster) show(toaster);
  return () => {};
}
