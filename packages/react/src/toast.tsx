import type * as React from "react";
import { toasterDefaults, toasterSlot, type ToasterOwnProps } from "./generated/toast.ts";

export { dismiss, toast, type ToastOptions, type ToastTone } from "@yourlib/core/toast";

export type ToasterProps = ToasterOwnProps & Omit<React.ComponentPropsWithRef<"section">, keyof ToasterOwnProps | "popover" | "children">;

/**
 * The region toasts appear in. Render it once (e.g. in the root layout); the
 * runtime opens it so its live region is ready before the first toast.
 */
export function Toaster({ label = toasterDefaults.label, position = toasterDefaults.position, ...rest }: ToasterProps) {
  return (
    <section {...rest} popover="manual" aria-label={label} data-slot={toasterSlot} data-position={position}>
      <ol data-slot="toast-list" aria-live="polite" />
    </section>
  );
}
