import type * as React from "react";
import { toggleDefaults, toggleSlot, type ToggleOwnProps } from "./generated/toggle.ts";

export type ToggleProps = ToggleOwnProps &
  Omit<React.ComponentPropsWithRef<"input">, keyof ToggleOwnProps | "type" | "children" | "size"> & { children?: React.ReactNode };

/**
 * A <label> drawn as a button around a native checkbox: pressed is checked,
 * so it submits with forms and works without JavaScript. className and style
 * go to the label; other props go to the checkbox (aria-label for icon-only).
 */
export function Toggle({ size = toggleDefaults.size, children, className, style, ...input }: ToggleProps) {
  return (
    <label className={className} style={style} data-slot={toggleSlot} data-size={size}>
      <input {...input} type="checkbox" data-slot="toggle-input" />
      <span data-slot="toggle-label">{children}</span>
    </label>
  );
}
