import type * as React from "react";
import { selectDefaults, selectSlot, type SelectOwnProps } from "./generated/select.ts";

export type SelectProps = SelectOwnProps & Omit<React.ComponentPropsWithRef<"select">, keyof SelectOwnProps>;

/** A native select. Where `appearance: base-select` is supported its picker follows the pack. */
export function Select({
  size = selectDefaults.size,
  invalid = selectDefaults.invalid,
  placeholder,
  children,
  ...rest
}: SelectProps) {
  const showPlaceholder = placeholder !== undefined && rest.value === undefined && rest.defaultValue === undefined;
  return (
    <select
      {...rest}
      defaultValue={showPlaceholder ? "" : rest.defaultValue}
      data-slot={selectSlot}
      data-size={size}
      aria-invalid={invalid || rest["aria-invalid"] || undefined}
    >
      {placeholder !== undefined ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {children}
    </select>
  );
}
