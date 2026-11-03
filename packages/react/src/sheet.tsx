import type * as React from "react";
import { renderButton, type ButtonLikeProps } from "./button-base.tsx";
import {
  sheetCloseSlot,
  sheetDefaults,
  sheetSlot,
  sheetTriggerSlot,
  type SheetCloseOwnProps,
  type SheetOwnProps,
  type SheetTriggerOwnProps,
} from "./generated/sheet.ts";

export type SheetProps = SheetOwnProps & Omit<React.ComponentPropsWithRef<"dialog">, keyof SheetOwnProps | "open" | "closedby">;
export type SheetTriggerProps = SheetTriggerOwnProps & Omit<ButtonLikeProps, keyof SheetTriggerOwnProps>;
export type SheetCloseProps = SheetCloseOwnProps & Omit<ButtonLikeProps, keyof SheetCloseOwnProps>;

/** A modal native <dialog> pinned to one edge; it shares Dialog's mechanics (data-slot includes "dialog"). */
function SheetRoot({
  id,
  title,
  description,
  side = sheetDefaults.side,
  size = sheetDefaults.size,
  dismissible = sheetDefaults.dismissible,
  children,
  ...rest
}: SheetProps) {
  return (
    <dialog
      {...rest}
      id={id}
      closedby={dismissible}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
      data-slot={`${sheetSlot} dialog`}
      data-side={side}
      data-size={size}
    >
      <h2 id={`${id}-title`} data-slot="dialog-title">
        {title}
      </h2>
      {description ? (
        <p id={`${id}-description`} data-slot="dialog-description">
          {description}
        </p>
      ) : null}
      {children}
    </dialog>
  );
}

function SheetTrigger({ sheet, ...props }: SheetTriggerProps) {
  return renderButton(`${sheetTriggerSlot} button`, { "aria-haspopup": "dialog", ...props, command: "show-modal", commandfor: sheet });
}

function SheetClose({ sheet, ...props }: SheetCloseProps) {
  return renderButton(`${sheetCloseSlot} button`, { ...props, command: "close", commandfor: sheet });
}

export const Sheet = Object.assign(SheetRoot, { Trigger: SheetTrigger, Close: SheetClose });
