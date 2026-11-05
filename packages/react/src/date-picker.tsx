"use client";
import { Calendar, isoDate as iso, parseDate as parse } from "./calendar.tsx";
import { CalendarBlankIcon } from "./icons.tsx";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithRef,
} from "react";

export interface DatePickerProps
  extends Omit<
    ComponentPropsWithRef<"input">,
    "type" | "value" | "defaultValue" | "onChange" | "min" | "max"
  > {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  min?: string;
  max?: string;
  locale?: string;
  /** Explicit ISO dates keep presets deterministic across time zones and server renders. */
  presets?: readonly { label: string; value: string }[];
}
/** Native date entry plus an optional, keyboard-operable calendar dialog. ISO date values have no time zone. */
export function DatePicker({
  label,
  value: controlled,
  defaultValue = "",
  onValueChange,
  min,
  max,
  locale = "en",
  presets,
  id: suppliedId,
  disabled,
  ...props
}: DatePickerProps) {
  const japanese = locale.startsWith("ja");
  const uid = useId();
  const id = suppliedId ?? `date-picker-${uid}`;
  const [local, setLocal] = useState(defaultValue);
  const value = controlled ?? local;
  const [calendarOpen, setCalendarOpen] = useState(false);
  // Where the calendar opens; "今日" reopens the grid there.
  const [start, setStart] = useState(() => iso(new Date()));
  const [round, setRound] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const clamp = (candidate: string) =>
    min && candidate < min ? min : max && candidate > max ? max : candidate;
  const choose = (next: string) => {
    setLocal(next);
    onValueChange?.(next);
  };
  const close = () => {
    setCalendarOpen(false);
    dialog.current?.close();
    trigger.current?.focus();
  };
  function open() {
    setStart(clamp(parse(value) ? value : iso(new Date())));
    setRound(round + 1);
    trigger.current?.focus();
    setCalendarOpen(true);
    dialog.current?.showModal();
  }
  useEffect(() => {
    const form = input.current?.form;
    const reset = () => setLocal(defaultValue);
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, [defaultValue]);
  return (
    <div data-slot="date-picker">
      <label htmlFor={id} data-slot="date-picker-label">
        {label}
      </label>
      <div data-slot="date-picker-control">
        <input
          {...props}
          id={id}
          ref={(node) => {
            input.current = node;
            if (typeof props.ref === "function") return props.ref(node);
            if (props.ref) props.ref.current = node;
          }}
          data-slot="date-picker-input"
          type="date"
          value={value}
          min={min}
          max={max}
          disabled={disabled}
          onChange={(event) => choose(event.target.value)}
        />
        <button
          ref={trigger}
          type="button"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-label={`${label}: ${value || (japanese ? "日付を選択" : "Choose date")}`}
          onClick={open}
          data-slot="date-picker-trigger"
        >
          <CalendarBlankIcon size={20} />
        </button>
      </div>
      <dialog
        ref={dialog}
        data-slot="date-picker-dialog"
        aria-label={`${label}: ${japanese ? "カレンダー" : "calendar"}`}
        onClose={(event) => {
          event.stopPropagation();
          setCalendarOpen(false);
        }}
        onCancel={(event) => {
          event.preventDefault();
          event.stopPropagation();
          close();
        }}
      >
        {calendarOpen && (
          <>
            {presets?.length ? (
              <div
                data-slot="date-picker-presets"
                role="group"
                aria-label={japanese ? "日付の候補" : "Suggested dates"}
              >
                {presets.map((preset) => (
                  <button
                    key={`${preset.label}-${preset.value}`}
                    type="button"
                    aria-pressed={value === preset.value}
                    disabled={
                      !parse(preset.value) ||
                      !!(
                        (min && preset.value < min) ||
                        (max && preset.value > max)
                      )
                    }
                    onClick={() => {
                      choose(preset.value);
                      close();
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            ) : null}
            <Calendar
              key={round}
              label={`${label}: ${japanese ? "カレンダー" : "calendar"}`}
              value={value}
              onValueChange={(next) => {
                choose(next);
                close();
              }}
              min={min}
              max={max}
              locale={locale}
              defaultFocusedDate={start}
              autoFocus
            />
            <footer>
              <button
                type="button"
                onClick={() => {
                  setStart(clamp(iso(new Date())));
                  setRound(round + 1);
                }}
              >
                {japanese ? "今日" : "Today"}
              </button>
              <button type="button" onClick={close}>
                {japanese ? "キャンセル" : "Cancel"}
              </button>
            </footer>
          </>
        )}
      </dialog>
    </div>
  );
}
