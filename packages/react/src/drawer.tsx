import type * as React from "react";
import { renderButton, type ButtonLikeProps } from "./button-base.tsx";
import {
  drawerCloseSlot,
  drawerDefaults,
  drawerSlot,
  drawerTriggerSlot,
  type DrawerCloseOwnProps,
  type DrawerOwnProps,
  type DrawerTriggerOwnProps,
} from "./generated/drawer.ts";

export type DrawerProps = DrawerOwnProps & Omit<React.ComponentPropsWithRef<"dialog">, keyof DrawerOwnProps | "open" | "closedby">;
export type DrawerTriggerProps = DrawerTriggerOwnProps & Omit<ButtonLikeProps, keyof DrawerTriggerOwnProps>;
export type DrawerCloseProps = DrawerCloseOwnProps & Omit<ButtonLikeProps, keyof DrawerCloseOwnProps>;

/** A bottom Sheet with a handle (data-slot includes "sheet" and "dialog"); the runtime adds the drag to close. */
function DrawerRoot({ id, title, description, dismissible = drawerDefaults.dismissible, children, ...rest }: DrawerProps) {
  return (
    <dialog
      {...rest}
      id={id}
      closedby={dismissible}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
      data-slot={`${drawerSlot} sheet dialog`}
      data-side="bottom"
      data-size="md"
    >
      <div data-slot="drawer-handle" aria-hidden="true" />
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

function DrawerTrigger({ drawer, ...props }: DrawerTriggerProps) {
  return renderButton(`${drawerTriggerSlot} button`, { "aria-haspopup": "dialog", ...props, command: "show-modal", commandfor: drawer });
}

function DrawerClose({ drawer, ...props }: DrawerCloseProps) {
  return renderButton(`${drawerCloseSlot} button`, { ...props, command: "close", commandfor: drawer });
}

export const Drawer = Object.assign(DrawerRoot, { Trigger: DrawerTrigger, Close: DrawerClose });
