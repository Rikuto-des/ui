import type * as React from "react";
import { spinnerDefaults, spinnerSlot, type SpinnerOwnProps } from "./generated/spinner.ts";

export type SpinnerProps = SpinnerOwnProps & Omit<React.ComponentPropsWithRef<"span">, keyof SpinnerOwnProps | "children">;

export function Spinner({ label = spinnerDefaults.label, size = spinnerDefaults.size, ...rest }: SpinnerProps) {
  return (
    <span {...rest} role="status" data-slot={spinnerSlot} data-size={size}>
      <span data-slot="spinner-ring" aria-hidden="true" />
      <span data-slot="visually-hidden">{label}</span>
    </span>
  );
}
