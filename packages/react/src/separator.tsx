import type * as React from "react";
import { separatorDefaults, separatorSlot, type SeparatorOwnProps } from "./generated/separator.ts";

export type SeparatorProps = SeparatorOwnProps & Omit<React.ComponentPropsWithRef<"hr">, keyof SeparatorOwnProps>;

export function Separator({
  orientation = separatorDefaults.orientation,
  decorative = separatorDefaults.decorative,
  ...rest
}: SeparatorProps) {
  if (orientation === "vertical") {
    return (
      <div
        {...(rest as React.ComponentPropsWithoutRef<"div">)}
        role={decorative ? "none" : "separator"}
        aria-orientation={decorative ? undefined : "vertical"}
        data-slot={separatorSlot}
        data-orientation="vertical"
      />
    );
  }
  return <hr {...rest} role={decorative ? "none" : undefined} data-slot={separatorSlot} data-orientation="horizontal" />;
}
