"use client";
import { CaretDownIcon, CheckIcon } from "./icons.tsx";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ComponentPropsWithRef, type ReactNode } from "react";

export interface ComboboxOption { value: string; label: string; description?: string; disabled?: boolean; icon?: ReactNode; keywords?: readonly string[] }
export type ComboboxLoader = (query: string, context: { signal: AbortSignal }) => Promise<readonly ComboboxOption[]>;
export interface ComboboxProps extends Omit<ComponentPropsWithRef<"input">, "value" | "defaultValue" | "onChange" | "type" | "size"> {
  label: string;
  options: readonly ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, option: ComboboxOption) => void;
  /** Search text while open, distinct from the committed option value. */
  query?: string;
  onQueryChange?: (query: string) => void;
  /** Use manual when a server already filters or ranks the supplied options. */
  filter?: "local" | "manual";
  /** Server-ranked results. Runs on open/search/retry; stale results are ignored even if abort is not honored. */
  loadOptions?: ComboboxLoader;
  loading?: boolean;
  loadingText?: string;
  errorText?: string;
  retryLabel?: string;
  emptyText?: string;
  /** Read-only details. Pointer selection previews first; Enter or the action commits. */
  renderPreview?: (option: ComboboxOption) => ReactNode;
  previewLabel?: string;
  previewActionLabel?: string;
}

/** Single selection; editing searches, and Escape/blur restores the committed value. */
export function Combobox({ label, options, value: controlled, defaultValue = "", onValueChange, query: controlledQuery, onQueryChange, filter = "local", loadOptions, loading: externalLoading = false, loadingText = "Loading…", errorText = "Could not load options.", retryLabel = "Retry", emptyText = "No results found.", renderPreview, previewLabel = "Option details", previewActionLabel = "Choose this option", id: suppliedId, name, disabled, required, ref, ...inputProps }: ComboboxProps) {
  const uid = useId();
  const id = suppliedId ?? `combobox-${uid}`;
  const [local, setLocal] = useState(defaultValue);
  const value = controlled ?? local;
  const currentOption = options.find(option => option.value === value);
  // Remote result pages need not include the committed value. Remember only
  // selections, including earlier values a parent may restore on cancellation.
  const [selections, setSelections] = useState(() => new Map(currentOption ? [[value, currentOption]] : []));
  const remember = useCallback((option: ComboboxOption) => {
    setSelections(previous => {
      const saved = previous.get(option.value);
      if (saved?.label === option.label && saved?.description === option.description && saved?.disabled === option.disabled) return previous;
      return new Map(previous).set(option.value, option);
    });
  }, []);
  useEffect(() => {
    // With a loader, options seed the initial selection. A newly selected
    // remote label must not be replaced by an older label from those seeds.
    if (currentOption && (!loadOptions || !selections.has(value))) remember(currentOption);
  }, [currentOption, loadOptions, selections, value, remember]);
  const selected = loadOptions ? selections.get(value) ?? currentOption : currentOption ?? selections.get(value);
  const [open, setOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState("");
  const query = controlledQuery ?? localQuery;
  const setQuery = useCallback((next: string) => { setLocalQuery(next); onQueryChange?.(next); }, [onQueryChange]);
  const [remote, setRemote] = useState<{ query: string; options: readonly ComboboxOption[]; status: "loading" | "success" | "error" }>();
  const [retry, setRetry] = useState(0);
  // Inline loaders are supported: a new function identity is not a new search.
  // A different data source can remount with a key; the next request always
  // uses the latest callback without refetching on every parent render.
  const loader = useRef(loadOptions);
  useLayoutEffect(() => { loader.current = loadOptions; });
  const remoteEnabled = Boolean(loadOptions) && open && !disabled;
  useEffect(() => {
    if (!remoteEnabled) return;
    let current = true;
    const controller = new AbortController();
    setRemote({ query, options: [], status: "loading" });
    Promise.resolve().then(() => loader.current!(query, { signal: controller.signal })).then(
      options => { if (current) setRemote({ query, options, status: "success" }); },
      () => { if (current) setRemote({ query, options: [], status: "error" }); },
    );
    return () => { current = false; controller.abort(); };
  }, [remoteEnabled, query, retry]);
  const remoteMatches = remoteEnabled && remote?.query === query;
  const loading = externalLoading || (remoteEnabled && (!remoteMatches || remote?.status === "loading"));
  const failed = remoteMatches && remote?.status === "error";
  const [active, setActive] = useState(-1);
  // Server-rendered input must not accept edits before React can preserve them.
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  const input = useRef<HTMLInputElement>(null);
  const retryButton = useRef<HTMLButtonElement>(null);
  const previewButton = useRef<HTMLButtonElement>(null);
  const previewContent = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const composing = useRef(false);
  const filtered = loadOptions ? (remoteMatches && remote?.status === "success" ? remote.options : []) : filter === "manual" ? options : options.filter(option => `${option.label} ${option.description ?? ""} ${option.keywords?.join(" ") ?? ""}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const enabled = filtered.map((option, index) => option.disabled ? -1 : index).filter(index => index >= 0);
  const previewEnabled = Boolean(renderPreview);
  const activeIndex = previewEnabled && !enabled.includes(active) ? (enabled[0] ?? -1) : active;
  const activeOption = open && !loading && activeIndex >= 0 && filtered[activeIndex] && !filtered[activeIndex].disabled ? `${id}-option-${activeIndex}` : undefined;
  const previewOption = renderPreview && activeOption ? filtered[activeIndex] : undefined;
  useLayoutEffect(() => { if (previewContent.current) previewContent.current.scrollTop = 0; }, [previewOption?.value]);
  function choose(option: ComboboxOption) {
    if (option.disabled) return;
    remember(option); setLocal(option.value); onValueChange?.(option.value, option); setOpen(false); setQuery("");
    input.current?.focus({ preventScroll: true });
  }
  function expand() { if (!disabled) { setQuery(""); setActive(-1); setOpen(true); } }
  useLayoutEffect(() => {
    const el = popup.current, anchor = input.current;
    if (!el || !anchor || !open || disabled) return;
    const place = () => {
      const rect = anchor.getBoundingClientRect();
      el.style.width = `${Math.min(previewEnabled ? Math.max(rect.width, 580) : rect.width, window.innerWidth - 16)}px`;
      el.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - el.offsetWidth - 8))}px`;
      const below = window.innerHeight - rect.bottom - 12;
      const above = rect.top - 12;
      const down = below >= Math.min(previewEnabled ? 520 : 280, el.scrollHeight) || below >= above;
      el.dataset.side = down ? "bottom" : "top";
      el.style.maxHeight = `${Math.max(64, down ? below : above)}px`;
      el.style.top = `${down ? rect.bottom + 6 : Math.max(8, rect.top - el.offsetHeight - 6)}px`;
    };
    el.showPopover(); place();
    const observer = new ResizeObserver(place); observer.observe(anchor); observer.observe(el);
    window.addEventListener("resize", place); window.addEventListener("scroll", place, true);
    const outside = (event: PointerEvent) => { if (!el.contains(event.target as Node) && event.target !== anchor) setOpen(false); };
    document.addEventListener("pointerdown", outside);
    return () => { observer.disconnect(); window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); document.removeEventListener("pointerdown", outside); if (el.matches(":popover-open")) el.hidePopover(); };
  }, [open, disabled, previewEnabled]);
  useEffect(() => { if (activeOption) document.getElementById(activeOption)?.scrollIntoView({ block: "nearest" }); }, [activeOption]);
  useEffect(() => { input.current?.setCustomValidity(required && !selected ? "Choose an option from the list." : ""); }, [required, selected]);
  useEffect(() => {
    const form = input.current?.form;
    const reset = () => { setLocal(defaultValue); setQuery(""); setOpen(false); };
    form?.addEventListener("reset", reset); return () => form?.removeEventListener("reset", reset);
  }, [defaultValue, setQuery]);
  return <div data-slot="combobox" data-open={open && !disabled || undefined}>
    <label htmlFor={id} data-slot="combobox-label">{label}</label>
    <div data-slot="combobox-control">
      <input {...inputProps} id={id} ref={node => { input.current = node; if (typeof ref === "function") return ref(node); if (ref) ref.current = node; }} data-slot="combobox-input" role="combobox" type="text" disabled={disabled || !ready} required={required} aria-required={required || undefined} autoComplete="off" aria-autocomplete="list" aria-expanded={open && !disabled} aria-controls={`${id}-list`} aria-activedescendant={activeOption} value={open ? query : selected?.label ?? ""}
        onClick={() => { if (!open) expand(); }} onChange={event => { setQuery(event.target.value); setActive(-1); setOpen(true); }}
        onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }}
        onBlur={event => { inputProps.onBlur?.(event); if (!popup.current?.contains(event.relatedTarget)) setOpen(false); }}
        onKeyDown={event => {
          inputProps.onKeyDown?.(event); if (event.defaultPrevented || composing.current || event.nativeEvent.isComposing) return;
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault(); if (!open) { expand(); return; }
            if (failed && !loading) { retryButton.current?.focus(); return; }
            const position = enabled.indexOf(activeIndex); const next = event.key === "ArrowDown" ? Math.min(position + 1, enabled.length - 1) : position < 0 ? enabled.length - 1 : Math.max(0, position - 1);
            setActive(enabled[next] ?? -1);
          } else if (event.key === "Enter" && open && activeOption) { event.preventDefault(); choose(filtered[activeIndex]); }
          else if (event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); setOpen(false); }
          else if (event.key === "Tab") {
            const action = previewOption ? previewContent.current : failed ? retryButton.current : null;
            if (open && !event.shiftKey && action) { event.preventDefault(); action.focus(); }
            else setOpen(false);
          }
        }} />
      <CaretDownIcon size={16} data-slot="combobox-chevron" />
    </div>
    {name && <input type="hidden" name={name} value={value} disabled={disabled} />}
    <div ref={popup} popover="manual" data-slot="combobox-popup" data-preview={previewEnabled || undefined} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget) && event.relatedTarget !== input.current) setOpen(false); }} onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); setOpen(false); input.current?.focus(); } }}>
      <div data-slot="combobox-results">
      <div id={`${id}-list`} role="listbox" tabIndex={-1} onFocus={event => { if (event.target === event.currentTarget) input.current?.focus({ preventScroll: true }); }} aria-label={label} aria-busy={loading || undefined}>
        {!loading && filtered.map((option, index) => <div key={option.value} id={`${id}-option-${index}`} role="option" aria-selected={option.value === value} aria-disabled={option.disabled || undefined} aria-describedby={previewOption?.value === option.value ? `${id}-preview` : undefined} data-slot="combobox-option" data-active={activeIndex === index || undefined}
          onPointerDown={event => event.preventDefault()} onPointerMove={event => { if (event.pointerType !== "touch" && !option.disabled) setActive(index); }} onClick={() => { if (option.disabled) return; if (renderPreview) setActive(index); else choose(option); }}>
          {option.icon && <span data-slot="combobox-option-icon" aria-hidden="true">{option.icon}</span>}
          <span data-slot="combobox-option-label">{option.label}{option.description && <small>{option.description}</small>}</span><span data-slot="combobox-check" aria-hidden="true">{option.value === value ? <CheckIcon size={16} /> : null}</span>
        </div>)}
      </div>
      {(loading || failed || filtered.length === 0) && <p data-slot="combobox-empty" role="status">{loading ? loadingText : failed ? errorText : emptyText}</p>}
      {failed && !loading && <button ref={retryButton} type="button" data-slot="combobox-retry" onPointerDown={event => event.preventDefault()} onKeyDown={event => { if (event.key === "ArrowUp") { event.preventDefault(); input.current?.focus(); } }} onClick={() => { input.current?.focus({ preventScroll: true }); setRetry(n => n + 1); }}>{retryLabel}</button>}
      </div>
      {previewOption && <div data-slot="combobox-preview" role="region" aria-label={previewLabel}>
        <div ref={previewContent} id={`${id}-preview`} data-slot="combobox-preview-content" tabIndex={0} onPointerDown={event => event.preventDefault()} onKeyDown={event => { if (event.key === "Tab") { event.preventDefault(); (event.shiftKey ? input.current : previewButton.current)?.focus({ preventScroll: true }); } else if (event.key === "Enter") { event.preventDefault(); choose(previewOption); } }}><div key={previewOption.value} data-slot="combobox-preview-body">{renderPreview!(previewOption)}</div></div>
        <button ref={previewButton} type="button" data-slot="combobox-preview-action button" data-variant="primary" data-size="sm" onPointerDown={event => event.preventDefault()} onClick={() => choose(previewOption)} onKeyDown={event => { if (event.key === "ArrowUp") { event.preventDefault(); input.current?.focus(); } else if (event.key === "Tab" && event.shiftKey) { event.preventDefault(); previewContent.current?.focus({ preventScroll: true }); } }}>{previewActionLabel}<kbd aria-hidden="true">↵</kbd></button>
      </div>}
    </div>
  </div>;
}
