import type * as React from "react";
import { scrollAreaDefaults, scrollAreaSlot, type ScrollAreaOwnProps } from "./generated/scroll-area.ts";

export type ScrollAreaProps = ScrollAreaOwnProps & Omit<React.ComponentPropsWithRef<"div">, keyof ScrollAreaOwnProps>;

/** A named, focusable region, so keyboard users can scroll it. Size it from the outside. */
export function ScrollArea({ label, orientation = scrollAreaDefaults.orientation, ...rest }: ScrollAreaProps) {
  return <div tabIndex={0} {...rest} role="region" aria-label={label} data-slot={scrollAreaSlot} data-orientation={orientation} />;
}
