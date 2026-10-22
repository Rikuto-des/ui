import type * as React from "react";
import { inputDefaults, inputSlot, type InputOwnProps } from "./generated/input.ts";

export type InputProps = InputOwnProps & Omit<React.ComponentPropsWithRef<"input">, keyof InputOwnProps>;

export function Input({ size = inputDefaults.size, invalid = inputDefaults.invalid, ...rest }: InputProps) {
  return <input {...rest} data-slot={inputSlot} data-size={size} aria-invalid={invalid || rest["aria-invalid"] || undefined} />;
}
