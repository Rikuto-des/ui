import type * as React from "react";
import { dateInputDefaults, dateInputSlot, type DateInputOwnProps } from "./generated/date-input.ts";

export type DateInputProps = DateInputOwnProps & Omit<React.ComponentPropsWithRef<"input">, keyof DateInputOwnProps>;

/** The browser's own date or time input and picker, drawn like Input (it shares Input's styles). */
export function DateInput({ type = dateInputDefaults.type, size = dateInputDefaults.size, invalid = dateInputDefaults.invalid, ...rest }: DateInputProps) {
  return (
    <input
      {...rest}
      type={type}
      data-slot={`${dateInputSlot} input`}
      data-size={size}
      aria-invalid={invalid || rest["aria-invalid"] || undefined}
    />
  );
}
