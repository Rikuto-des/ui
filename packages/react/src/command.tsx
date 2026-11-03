"use client";
import { ArrowUpIcon, ArrowDownIcon, ArrowBendDownLeftIcon } from "./icons.tsx";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  preview?: ReactNode;
  group?: string;
  keywords?: string;
  shortcut?: string;
  disabled?: boolean;
  onSelect: () => void;
}
export interface CommandProps {
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: readonly CommandItem[];
  placeholder?: string;
  emptyText?: string;
  closeLabel?: string;
  navigationHint?: string;
  actionHint?: string;
}
/** Modal command search. Shortcut registration belongs to the application. */
export function Command({
  label,
  open,
  onOpenChange,
  items,
  placeholder = "Search commands…",
  emptyText = "No commands found.",
  closeLabel = "Close commands",
  navigationHint = "Navigate",
  actionHint = "Open",
}: CommandProps) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const terms = query.trim().toLocaleLowerCase().split(/\s+/);
  const filtered = items.filter((item) =>
    terms.every((term) =>
      `${item.label} ${item.description ?? ""} ${item.group ?? ""} ${item.keywords ?? ""}`
        .toLocaleLowerCase()
        .includes(term),
    ),
  );
  const enabled = filtered
    .map((item, i) => (item.disabled ? -1 : i))
    .filter((i) => i >= 0);
  const current = enabled.includes(active) ? active : enabled[0];
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) {
      setQuery("");
      setActive(0);
      el.showModal();
      input.current?.focus();
    } else if (!open && el.open) el.close();
  }, [open]);
  useEffect(() => {
    if (open && current !== undefined)
      document
        .getElementById(`${id}-item-${current}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [id, current, open]);
  function select(index: number | undefined) {
    const item = index === undefined ? undefined : filtered[index];
    if (!item || item.disabled) return;
    dialog.current?.close();
    onOpenChange(false);
    item.onSelect();
  }
  return (
    <dialog
      ref={dialog}
      data-slot="command"
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClose={() => onOpenChange(false)}
    >
      <div data-slot="command-search">
        <span aria-hidden="true">⌕</span>
        <input
          ref={input}
          type="text"
          role="combobox"
          aria-label={label}
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={`${id}-list`}
          aria-activedescendant={
            open && current !== undefined ? `${id}-item-${current}` : undefined
          }
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) return;
            const position =
              current === undefined ? -1 : enabled.indexOf(current);
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setActive(
                enabled[
                  (position +
                    (event.key === "ArrowDown" ? 1 : -1) +
                    enabled.length) %
                    enabled.length
                ] ?? -1,
              );
            } else if (event.key === "Enter") {
              event.preventDefault();
              select(current);
            }
          }}
        />
        <button
          type="button"
          aria-label={closeLabel}
          onClick={() => onOpenChange(false)}
        >
          Esc
        </button>
      </div>
      <div
        data-slot="command-body"
        data-preview={filtered[current]?.preview ? "" : undefined}
      >
        <div
          role="listbox"
          id={`${id}-list`}
          aria-label={label}
          data-slot="command-list"
        >
          {filtered.map((item, index) => (
            <div
              key={item.id}
              role="option"
              id={`${id}-item-${index}`}
              aria-selected={current === index}
              aria-disabled={item.disabled || undefined}
              data-slot="command-item"
              onPointerMove={() => {
                if (!item.disabled) setActive(index);
              }}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => select(index)}
            >
              <span>
                {item.label}
                {(item.description || item.group) && (
                  <small>{item.description ?? item.group}</small>
                )}
              </span>
              {item.shortcut && <kbd>{item.shortcut}</kbd>}
            </div>
          ))}
        </div>
        {filtered[current]?.preview && (
          <div data-slot="command-preview" key={filtered[current].id}>
            {filtered[current].preview}
          </div>
        )}
      </div>
      {!filtered.length && (
        <p role="status" data-slot="command-empty">
          {emptyText}
        </p>
      )}
      <footer>
        <ArrowUpIcon size={16} /><ArrowDownIcon size={16} /> <span>{navigationHint}</span> <ArrowBendDownLeftIcon size={16} /> <span>{actionHint}</span>
      </footer>
    </dialog>
  );
}
