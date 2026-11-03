import type * as React from "react";
import { collapsibleDefaults, collapsibleSlot, type CollapsibleOwnProps } from "./generated/collapsible.ts";

export type CollapsibleProps = CollapsibleOwnProps & Omit<React.ComponentPropsWithRef<"details">, keyof CollapsibleOwnProps | "open" | "title">;

/** One native <details>: Enter and Space toggle it, find-in-page opens it, no JavaScript. */
export function Collapsible({ title, description, defaultOpen = collapsibleDefaults.defaultOpen, children, ...rest }: CollapsibleProps) {
  return (
    <details {...rest} open={defaultOpen || undefined} data-slot={collapsibleSlot}>
      <summary data-slot="collapsible-trigger">
        <span data-slot="collapsible-heading"><span data-slot="collapsible-title">{title}</span>{description ? <span data-slot="collapsible-description">{description}</span> : null}</span>
        <span data-slot="collapsible-icon" aria-hidden="true" />
      </summary>
      <div data-slot="collapsible-content">{children}</div>
    </details>
  );
}
