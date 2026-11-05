/**
 * In-page validation for `[data-slot="form"]`. The form is set to noValidate,
 * and on submit every invalid control gets its message under its Field
 * (`<id>-error`, linked by aria-describedby and aria-invalid), the summary at
 * the top lists them as links, and focus moves to the summary; the submit
 * and the app's onSubmit do not run. Editing a control re-checks it and
 * clears its message once it is valid. Messages are the browser's
 * validationMessage, so setCustomValidity works for app rules. Errors the
 * server rendered (Field's error prop) are left as they are.
 */
const FORM = '[data-slot="form"]';
type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const controls = (form: HTMLFormElement) =>
  [...form.elements].filter((el): el is Control => el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement);

/** The control's name for the summary: its Field label without the required mark. */
function labelOf(control: Control) {
  const label = control.labels?.[0];
  const text = label ? [...label.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join("").trim() : "";
  return text || control.getAttribute("aria-label") || control.name || control.id;
}

function describedBy(control: Control, id: string, add: boolean) {
  const ids = (control.getAttribute("aria-describedby") ?? "").split(/\s+/).filter((x) => x && x !== id);
  if (add) ids.push(id);
  if (ids.length) control.setAttribute("aria-describedby", ids.join(" "));
  else control.removeAttribute("aria-describedby");
}

function showError(control: Control) {
  const field = control.closest<HTMLElement>('[data-slot="field"]');
  if (!field || !control.id) return;
  const id = `${control.id}-error`;
  let message = field.ownerDocument.getElementById(id);
  // A message the server rendered stays as it is.
  if (message && !message.hasAttribute("data-runtime")) return;
  if (!message) {
    message = field.ownerDocument.createElement("p");
    message.id = id;
    message.dataset.slot = "field-error";
    message.dataset.runtime = "";
    field.append(message);
  }
  message.textContent = control.validationMessage;
  field.dataset.invalid = "";
  control.setAttribute("aria-invalid", "true");
  describedBy(control, id, true);
}

function clearError(control: Control) {
  const message = control.ownerDocument.getElementById(`${control.id}-error`);
  if (!message?.hasAttribute("data-runtime")) return;
  message.remove();
  control.closest<HTMLElement>('[data-slot="field"]')?.removeAttribute("data-invalid");
  control.removeAttribute("aria-invalid");
  describedBy(control, message.id, false);
}

function fillSummary(form: HTMLFormElement, invalid: Control[]) {
  const summary = form.querySelector<HTMLElement>('[data-slot="form-summary"]');
  const list = summary?.querySelector('[data-slot="form-summary-list"]');
  if (!summary || !list) return undefined;
  list.replaceChildren(
    ...invalid.map((control) => {
      const item = form.ownerDocument.createElement("li");
      const link = form.ownerDocument.createElement("a");
      link.href = `#${control.id}`;
      link.dataset.control = control.id;
      link.textContent = `${labelOf(control)}：${control.validationMessage}`;
      item.append(link);
      return item;
    }),
  );
  summary.hidden = invalid.length === 0;
  return summary;
}

export function installForms(doc: Document = document): () => void {
  const discover = () => {
    for (const form of doc.querySelectorAll<HTMLFormElement>(FORM)) form.noValidate = true;
  };
  discover();
  const observer = new MutationObserver(discover);
  observer.observe(doc.documentElement, { childList: true, subtree: true });

  function onSubmit(event: SubmitEvent) {
    const form = (event.target as Element | null)?.closest?.<HTMLFormElement>(FORM);
    if (!form) return;
    // One entry per radio group: the browser marks every radio of an unchecked required group.
    const seen = new Set<string>();
    const invalid = controls(form).filter((c) => {
      if (c.validity.valid || c.disabled) return false;
      const key = c instanceof HTMLInputElement && c.type === "radio" ? `radio:${c.name}` : `id:${c.id || Math.random()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    for (const control of controls(form)) (control.validity.valid ? clearError : showError)(control);
    const summary = fillSummary(form, invalid);
    if (!invalid.length) return;
    event.preventDefault();
    // The app's onSubmit (React listens at its root, after this) must not run.
    event.stopImmediatePropagation();
    (summary ?? invalid[0]).focus();
  }

  function onEdit(event: Event) {
    const control = event.target as Control;
    const form = control.form;
    if (!form?.matches(FORM) || !control.id) return;
    const shown = doc.getElementById(`${control.id}-error`)?.hasAttribute("data-runtime");
    if (!shown) return;
    if (control.validity.valid) clearError(control);
    else showError(control);
    const summary = form.querySelector<HTMLElement>('[data-slot="form-summary"]');
    const link = summary?.querySelector<HTMLAnchorElement>(`a[data-control="${CSS.escape(control.id)}"]`);
    if (!summary || !link) return;
    if (control.validity.valid) link.closest("li")?.remove();
    else link.textContent = `${labelOf(control)}：${control.validationMessage}`;
    summary.hidden = !summary.querySelector("li");
  }

  // A summary link moves focus to its control (a fragment link only scrolls).
  function onClick(event: MouseEvent) {
    const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>('[data-slot="form-summary-list"] a[data-control]');
    const control = link && doc.getElementById(link.dataset.control!);
    if (!control) return;
    event.preventDefault();
    control.focus();
    control.scrollIntoView({ block: "center" });
  }

  doc.addEventListener("submit", onSubmit, true);
  doc.addEventListener("input", onEdit);
  doc.addEventListener("change", onEdit);
  doc.addEventListener("click", onClick);
  return () => {
    observer.disconnect();
    doc.removeEventListener("submit", onSubmit, true);
    doc.removeEventListener("input", onEdit);
    doc.removeEventListener("change", onEdit);
    doc.removeEventListener("click", onClick);
  };
}
