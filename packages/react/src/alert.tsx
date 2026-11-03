import type * as React from "react";
import { alertDefaults, alertSlot, type AlertOwnProps } from "./generated/alert.ts";

export type AlertProps = AlertOwnProps & Omit<React.ComponentPropsWithRef<"div">, keyof AlertOwnProps>;

/** A callout in the page. Not a live region: news that arrives later belongs in a toast. */
export function Alert({ title, tone = alertDefaults.tone, action, children, ...rest }: AlertProps) {
  return (
    <div {...rest} data-slot={alertSlot} data-tone={tone}>
      <span data-slot="alert-icon" aria-hidden="true" />
      <div data-slot="alert-body">
        <p data-slot="alert-title">{title}</p>
        {children ? <div data-slot="alert-description">{children}</div> : null}
      </div>
      {action ? <div data-slot="alert-action">{action}</div> : null}
    </div>
  );
}
