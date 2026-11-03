import type * as React from "react";
import { kbdSlot } from "./generated/kbd.ts";

export type KbdProps = React.ComponentPropsWithRef<"kbd"> & {
  pressed?: boolean;
};

export function Kbd({ pressed = false, ...props }: KbdProps) {
  return (
    <kbd {...props} data-slot={kbdSlot} data-pressed={pressed || undefined} />
  );
}
