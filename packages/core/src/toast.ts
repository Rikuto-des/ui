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
  /** A pending operation. The notification remains until updated or dismissed. */
  loading?: boolean;
  /** Known progress from 0 to 100; omitted for an indeterminate operation. */
  progress?: number;
  progressLabel?: string;
  tone?: ToastTone;
  /** Milliseconds before the toast hides itself; 0 keeps it until dismissed. */
  duration?: number;
  action?: { label: string; onClick: () => void };
  /** Accessible label of the dismiss button. */
  dismissLabel?: string;
}

let counter = 0;
export type ToastUpdate = ToastOptions & { message?: string };
export interface ToastPromiseOptions<T> {
  loading: string;
  success: string | ((value: T) => string | ToastUpdate);
  error: string | ((error: unknown) => string | ToastUpdate);
  dismissLabel?: string;
}

const active = new WeakMap<Document, Map<string, { item: HTMLElement; cancel: () => void; update: (options: ToastUpdate) => void }>>();
const PAGE_REGION = '[data-slot="toaster"]:not([data-ur-outlet])';

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
  const existing = dialog.querySelector<HTMLElement>(":scope > [data-ur-outlet]");
  if (existing) return existing;
  const doc = dialog.ownerDocument;
  const el = doc.createElement("section");
  el.dataset.slot = "toaster";
  el.dataset.position = page.dataset.position ?? "bottom-end";
  el.dataset.urOutlet = "";
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
  const pending = active.get(doc)?.get(id);
  const item = pending?.item ?? doc.getElementById(id);
  if (!item || item.dataset.state === "closing") return;
  pending?.cancel();
  active.get(doc)?.delete(id);
  item.dataset.state = "closing";
  const remove = () => item.remove();
  const duration = parseFloat(getComputedStyle(item).transitionDuration) || 0;
  if (duration === 0) remove();
  else {
    item.addEventListener("transitionend", remove, { once: true });
    setTimeout(remove, duration * 1000 + 50);
  }
}

function createToast(message: string, initial: ToastOptions = {}, doc: Document = document): string {
  target(doc);
  const id = `ur-toast-${++counter}`;
  const item = doc.createElement("li");
  item.id = id;
  item.dataset.slot = "toast";
  const body = doc.createElement("div");
  body.dataset.slot = "toast-body";
  body.setAttribute("aria-atomic", "true");
  const title = doc.createElement("p");
  title.dataset.slot = "toast-title";
  title.textContent = message;
  const description = doc.createElement("p");
  description.dataset.slot = "toast-description";
  const progress = doc.createElement("progress");
  progress.dataset.slot = "toast-progress";
  progress.max = 100;
  const action = doc.createElement("button");
  action.type = "button";
  action.dataset.slot = "toast-action button";
  action.dataset.variant = "ghost";
  action.dataset.size = "sm";
  const close = doc.createElement("button");
  close.type = "button";
  close.dataset.slot = "toast-close";
  close.addEventListener("click", () => dismiss(id, doc));
  body.append(title, description, progress);
  item.append(body, action, close);

  let options = initial;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let remaining = 0;
  let startedAt = 0;
  let hovering = false;
  let focused = false;
  let motion: Animation | undefined;
  const pause = () => {
    if (timer !== undefined) remaining = Math.max(0, remaining - (Date.now() - startedAt));
    clearTimeout(timer);
    timer = undefined;
  };
  const resume = () => {
    if (options.loading || (options.duration ?? 5000) <= 0 || hovering || focused || !item.isConnected || item.dataset.state === "closing") return;
    clearTimeout(timer);
    startedAt = Date.now();
    timer = setTimeout(() => dismiss(id, doc), remaining);
  };
  const update = (next: ToastUpdate) => {
    const before = item.getBoundingClientRect().height;
    const actionFocused = doc.activeElement === action;
    motion?.cancel();
    pause();
    options = { ...options, ...next };
    if (next.message !== undefined) title.textContent = next.message;
    item.dataset.tone = options.tone ?? "neutral";
    item.toggleAttribute("data-loading", Boolean(options.loading));
    description.textContent = options.description ?? "";
    description.hidden = !options.description;
    progress.hidden = options.progress === undefined;
    if (options.progress !== undefined) progress.value = Math.max(0, Math.min(100, options.progress));
    progress.setAttribute("aria-label", options.progressLabel ?? "Progress");
    action.hidden = !options.action;
    action.textContent = options.action?.label ?? "";
    action.onclick = () => { options.action?.onClick(); dismiss(id, doc); };
    close.setAttribute("aria-label", options.dismissLabel ?? "通知を閉じる");
    // Keep keyboard focus inside the notice if an update removes its action.
    if (action.hidden && actionFocused) close.focus({ preventScroll: true });
    remaining = options.duration ?? 5000;
    resume();
    if (before && !doc.defaultView?.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const after = item.getBoundingClientRect().height;
      motion = item.animate([{ height: `${before}px` }, { height: `${after}px` }], { duration: 220, easing: "cubic-bezier(.22,1,.36,1)" });
    }
  };
  update(initial);
  // Resolve the outlet again: a modal may close before this frame runs.
  const frame = requestAnimationFrame(() => { listOf(target(doc)).append(item); resume(); });
  let records = active.get(doc);
  if (!records) active.set(doc, (records = new Map()));
  records.set(id, { item, update, cancel: () => { cancelAnimationFrame(frame); clearTimeout(timer); motion?.cancel(); } });
  item.addEventListener("pointerenter", () => { hovering = true; pause(); });
  item.addEventListener("pointerleave", () => { hovering = false; resume(); });
  item.addEventListener("focusin", () => { focused = true; pause(); });
  item.addEventListener("focusout", (event) => {
    focused = event.relatedTarget instanceof Node && item.contains(event.relatedTarget);
    resume();
  });
  return id;
}

/** Update in place. Dismissed notifications never reappear. */
function updateToast(id: string, options: ToastUpdate, doc: Document = document): boolean {
  const record = active.get(doc)?.get(id);
  if (!record) return false;
  record.update(options);
  return true;
}

/** One notice follows an existing operation; dismissing it does not cancel that operation. */
function promiseToast<T>(promise: Promise<T>, messages: ToastPromiseOptions<T>, doc: Document = document): string {
  const id = createToast(messages.loading, { loading: true, dismissLabel: messages.dismissLabel }, doc);
  void promise.then(
    value => {
      const result = typeof messages.success === "function" ? messages.success(value) : messages.success;
      updateToast(id, { loading: false, progress: undefined, description: undefined, action: undefined, tone: "ok", ...(typeof result === "string" ? { message: result } : result) }, doc);
    },
    error => {
      const result = typeof messages.error === "function" ? messages.error(error) : messages.error;
      updateToast(id, { loading: false, progress: undefined, description: undefined, action: undefined, tone: "danger", duration: 0, ...(typeof result === "string" ? { message: result } : result) }, doc);
    },
  );
  return id;
}

export const toast = Object.assign(createToast, { update: updateToast, promise: promiseToast });

/** Shows an existing toaster region so its live region is ready before the first toast. */
export function installToasts(doc: Document = document): () => void {
  const toaster = doc.querySelector<HTMLElement>(PAGE_REGION);
  if (toaster) show(toaster);
  return () => {};
}
