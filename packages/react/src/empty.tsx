import type * as React from "react";
import { emptySlot, type EmptyOwnProps } from "./generated/empty.ts";

export type EmptyProps = EmptyOwnProps & Omit<React.ComponentPropsWithRef<"div">, keyof EmptyOwnProps | "children">;

export function Empty({ title, description, action, icon, ...rest }: EmptyProps) {
  return (
    <div {...rest} data-slot={emptySlot}>
      {icon ? (
        <span data-slot="empty-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <p data-slot="empty-title">{title}</p>
      {description ? <p data-slot="empty-description">{description}</p> : null}
      {action ? <div data-slot="empty-action">{action}</div> : null}
    </div>
  );
}
