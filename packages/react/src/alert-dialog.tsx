import type * as React from "react";
import { renderButton, type ButtonLikeProps } from "./button-base.tsx";
import {
  alertDialogActionDefaults,
  alertDialogActionSlot,
  alertDialogCancelSlot,
  alertDialogSlot,
  alertDialogTriggerSlot,
  type AlertDialogActionOwnProps,
  type AlertDialogCancelOwnProps,
  type AlertDialogOwnProps,
  type AlertDialogTriggerOwnProps,
} from "./generated/alert-dialog.ts";

export type AlertDialogProps = AlertDialogOwnProps &
  Omit<React.ComponentPropsWithRef<"dialog">, keyof AlertDialogOwnProps | "open" | "closedby" | "role">;
export type AlertDialogTriggerProps = AlertDialogTriggerOwnProps & Omit<ButtonLikeProps, keyof AlertDialogTriggerOwnProps>;
export type AlertDialogCancelProps = AlertDialogCancelOwnProps & Omit<ButtonLikeProps, keyof AlertDialogCancelOwnProps | "variant">;
export type AlertDialogActionProps = AlertDialogActionOwnProps & Omit<ButtonLikeProps, keyof AlertDialogActionOwnProps>;

/**
 * A modal confirmation that only its buttons can close: role="alertdialog"
 * and closedby="none" on a native <dialog>. It shares Dialog's look (its
 * data-slot includes "dialog"); the buttons sit in the actions row.
 */
function AlertDialogRoot({ id, title, description, children, ...rest }: AlertDialogProps) {
  return (
    <dialog
      {...rest}
      id={id}
      role="alertdialog"
      closedby="none"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      data-slot={`${alertDialogSlot} dialog`}
      data-size="sm"
    >
      <h2 id={`${id}-title`} data-slot="dialog-title">
        {title}
      </h2>
      <p id={`${id}-description`} data-slot="dialog-description">
        {description}
      </p>
      <div data-slot="dialog-actions">{children}</div>
    </dialog>
  );
}

function AlertDialogTrigger({ alertDialog, ...props }: AlertDialogTriggerProps) {
  return renderButton(`${alertDialogTriggerSlot} button`, { "aria-haspopup": "dialog", ...props, command: "show-modal", commandfor: alertDialog });
}

/** The safe choice: it gets focus when the dialog opens. */
function AlertDialogCancel({ alertDialog, ...props }: AlertDialogCancelProps) {
  return renderButton(`${alertDialogCancelSlot} button`, { autoFocus: true, ...props, variant: "ghost", command: "close", commandfor: alertDialog });
}

function AlertDialogAction({ alertDialog, variant = alertDialogActionDefaults.variant, ...props }: AlertDialogActionProps) {
  return renderButton(`${alertDialogActionSlot} button`, { ...props, variant, command: "close", commandfor: alertDialog });
}

export const AlertDialog = Object.assign(AlertDialogRoot, { Trigger: AlertDialogTrigger, Cancel: AlertDialogCancel, Action: AlertDialogAction });
