"use client";
import { CaretLeftIcon, CaretRightIcon } from "./icons.tsx";

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentPropsWithRef,
  type KeyboardEvent,
} from "react";

export interface CalendarProps
  extends Omit<ComponentPropsWithRef<"div">, "defaultValue" | "onChange" | "onSelect"> {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  min?: string;
  max?: string;
  locale?: string;
  /**
   * The day that first holds the grid's Tab stop. Defaults to the value, else today.
   * When server rendering without a value, pass it: the server's today may not be the viewer's.
   */
  defaultFocusedDate?: string;
  /** Move focus into the grid on mount (a calendar inside a dialog). */
  autoFocus?: boolean;
}

export function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const date = new Date(+match[1], +match[2] - 1, +match[3], 12);
  return isoDate(date) === value ? date : undefined;
}
export function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
const noSubscription = () => () => {};

function shiftMonth(date: Date, amount: number) {
  const result = new Date(date.getFullYear(), date.getMonth() + amount, 1, 12);
  result.setDate(Math.min(date.getDate(), new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate()));
  return result;
}

/**
 * A month grid (WAI-ARIA date grid). The days are buttons; one of them holds
 * the Tab stop and the arrow keys move it. ISO date values have no time zone.
 */
export function Calendar({
  label,
  value: controlled,
  defaultValue = "",
  onValueChange,
  min,
  max,
  locale = "en",
  defaultFocusedDate,
  autoFocus = false,
  ...props
}: CalendarProps) {
  const japanese = locale.startsWith("ja");
  const id = `calendar-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [local, setLocal] = useState(defaultValue);
  const value = controlled ?? local;
  const clamp = (candidate: string) => (min && candidate < min ? min : max && candidate > max ? max : candidate);
  const initial = () =>
    clamp(defaultFocusedDate && parseDate(defaultFocusedDate) ? defaultFocusedDate : parseDate(value) ? value : isoDate(new Date()));
  const [focused, setFocused] = useState(initial);
  // The month shown. Pointer focus must not change it before the clicked day's click is delivered.
  const [viewed, setViewed] = useState(initial);
  const grid = useRef<HTMLTableElement>(null);
  // The keyboard moves focus with it; the month buttons and other rerenders do not.
  const follow = useRef(autoFocus);
  const date = parseDate(viewed) ?? new Date();

  const noPrevious = (d: Date) => !!min && isoDate(new Date(d.getFullYear(), d.getMonth(), 0)) < min;
  const noNext = (d: Date) => !!max && isoDate(new Date(d.getFullYear(), d.getMonth() + 1, 1)) > max;

  function move(next: Date, takeFocus: boolean) {
    const nextValue = clamp(isoDate(next));
    // At min or max the day does not change and no effect would clear the flag.
    if (nextValue !== focused) follow.current ||= takeFocus;
    setFocused(nextValue);
    setViewed(nextValue);
  }
  function choose(next: string) {
    setLocal(next);
    onValueChange?.(next);
  }
  useLayoutEffect(() => {
    if (!follow.current) return;
    follow.current = false;
    grid.current?.querySelector<HTMLButtonElement>(`[data-date="${focused}"]`)?.focus();
  }, [focused]);

  function keyboard(event: KeyboardEvent) {
    // Alt+← and ⌘← belong to the browser (back, line start).
    if (event.altKey || event.metaKey || event.ctrlKey) return;
    const from = parseDate(focused) ?? date;
    const next = new Date(from);
    switch (event.key) {
      case "ArrowLeft":
        next.setDate(from.getDate() - 1);
        break;
      case "ArrowRight":
        next.setDate(from.getDate() + 1);
        break;
      case "ArrowUp":
        next.setDate(from.getDate() - 7);
        break;
      case "ArrowDown":
        next.setDate(from.getDate() + 7);
        break;
      case "Home":
        next.setDate(from.getDate() - from.getDay());
        break;
      case "End":
        next.setDate(from.getDate() + 6 - from.getDay());
        break;
      case "PageUp":
        event.preventDefault();
        return move(shiftMonth(from, event.shiftKey ? -12 : -1), true);
      case "PageDown":
        event.preventDefault();
        return move(shiftMonth(from, event.shiftKey ? 12 : 1), true);
      default:
        return;
    }
    event.preventDefault();
    move(next, true);
  }

  const start = new Date(date.getFullYear(), date.getMonth(), 1, 12);
  start.setDate(1 - start.getDay());
  const days = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i, 12));
  const monthLabel = new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" }).format(date);
  // The server and a static build do not know the viewer's day: mark today only once hydrated.
  const today = useSyncExternalStore(noSubscription, () => isoDate(new Date()), () => undefined);
  return (
    <div {...props} role="group" aria-label={label} data-slot="calendar">
      <header>
        <button
          type="button"
          aria-label={japanese ? "前の月" : "Previous month"}
          disabled={noPrevious(date)}
          // A month button that the move disables would drop focus: hand it to the day instead.
          onClick={() => move(shiftMonth(date, -1), noPrevious(shiftMonth(date, -1)))}
        >
          <CaretLeftIcon size={16} />
        </button>
        <h2 aria-live="polite" id={`${id}-month`}>
          {monthLabel}
        </h2>
        <button
          type="button"
          aria-label={japanese ? "次の月" : "Next month"}
          disabled={noNext(date)}
          onClick={() => move(shiftMonth(date, 1), noNext(shiftMonth(date, 1)))}
        >
          <CaretRightIcon size={16} />
        </button>
      </header>
      <table ref={grid} role="grid" aria-labelledby={`${id}-month`} onKeyDown={keyboard}>
        <thead>
          <tr>
            {days.slice(0, 7).map((day) => (
              <th key={day.getDay()} scope="col" abbr={new Intl.DateTimeFormat(locale, { weekday: "long" }).format(day)}>
                {new Intl.DateTimeFormat(locale, { weekday: "short" }).format(day)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, week) => (
            <tr key={week}>
              {days.slice(week * 7, week * 7 + 7).map((day) => {
                const key = isoDate(day);
                return (
                  <td key={key} aria-selected={value === key}>
                    <button
                      type="button"
                      data-date={key}
                      data-outside={day.getMonth() !== date.getMonth() || undefined}
                      aria-label={new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(day)}
                      aria-current={key === today ? "date" : undefined}
                      disabled={!!((min && key < min) || (max && key > max))}
                      tabIndex={focused === key ? 0 : -1}
                      onFocus={() => setFocused(key)}
                      onClick={() => choose(key)}
                    >
                      {day.getDate()}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
