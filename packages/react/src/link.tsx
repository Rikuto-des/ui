import type * as React from "react";
import { linkDefaults, linkSlot, type LinkOwnProps } from "./generated/link.ts";

export type LinkProps = LinkOwnProps & Omit<React.ComponentPropsWithRef<"a">, keyof LinkOwnProps>;

export function Link({ variant = linkDefaults.variant, external = linkDefaults.external, children, ...rest }: LinkProps) {
  return (
    <a
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
      data-slot={linkSlot}
      data-variant={variant}
      data-external={external ? "" : undefined}
    >
      {children}
      {external ? <span data-slot="visually-hidden">（新しいタブで開きます）</span> : null}
    </a>
  );
}
