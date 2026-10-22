import type * as React from "react";
import { renderButton, type ButtonLikeProps } from "./button-base.tsx";
import {
  dialogActionsSlot,
  dialogCloseSlot,
  dialogDefaults,
  dialogSlot,
  dialogTriggerSlot,
  type DialogCloseOwnProps,
  type DialogOwnProps,
  type DialogTriggerOwnProps,
} from "./generated/dialog.ts";

export type DialogProps = DialogOwnProps &
  Omit<React.ComponentPropsWithRef<"dialog">, keyof DialogOwnProps | "open" | "closedby">;
export type DialogTriggerProps = DialogTriggerOwnProps & Omit<ButtonLikeProps, keyof DialogTriggerOwnProps>;
export type DialogCloseProps = DialogCloseOwnProps & Omit<ButtonLikeProps, keyof DialogCloseOwnProps>;
export type DialogActionsProps = React.ComponentPropsWithRef<"div">;

/**
 * A modal native <dialog>. It is opened by a trigger's `show-modal` command,
 * so it needs no client state: the browser provides the top layer, the inert
 * background, Escape handling and focus restoration.
 */
function DialogRoot({
  id,
  title,
  description,
  dismissible = dialogDefaults.dismissible,
  size = dialogDefaults.size,
  children,
  ...rest
}: DialogProps) {
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  return (
    <dialog
      {...rest}
      id={id}
      closedby={dismissible}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      data-slot={dialogSlot}
      data-size={size}
    >
      <h2 id={titleId} data-slot="dialog-title">
        {title}
      </h2>
      {description ? (
        <p id={descriptionId} data-slot="dialog-description">
          {description}
        </p>
      ) : null}
      {children}
    </dialog>
  );
}

function DialogTrigger({ dialog, ...props }: DialogTriggerProps) {
  return renderButton(`${dialogTriggerSlot} button`, {
    "aria-haspopup": "dialog",
    ...props,
    command: "show-modal",
    commandfor: dialog,
  });
}

function DialogClose({ dialog, ...props }: DialogCloseProps) {
  return renderButton(`${dialogCloseSlot} button`, { ...props, command: "close", commandfor: dialog });
}

function DialogActions(props: DialogActionsProps) {
  return <div {...props} data-slot={dialogActionsSlot} />;
}

export const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Close: DialogClose,
  Actions: DialogActions,
});
