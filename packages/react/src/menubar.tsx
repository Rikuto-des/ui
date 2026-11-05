import type * as React from "react";
import { useId } from "react";
import { renderButton } from "./button-base.tsx";
import { menuSlot } from "./generated/menu.ts";
import {
  menubarMenuSlot,
  menubarSlot,
  type MenubarMenuOwnProps,
  type MenubarOwnProps,
} from "./generated/menubar.ts";
import { anchorName } from "./util.ts";

export type MenubarProps = MenubarOwnProps & Omit<React.ComponentPropsWithRef<"div">, keyof MenubarOwnProps | "role">;
export type MenubarMenuProps = MenubarMenuOwnProps &
  Omit<React.ComponentPropsWithRef<"div">, keyof MenubarMenuOwnProps | "role">;

/**
 * A desktop-style menu bar. Every trigger is reachable with Tab until the
 * runtime makes the bar a single Tab stop with ← → between its menus.
 */
function MenubarRoot({ label, ...rest }: MenubarProps) {
  return <div {...rest} role="menubar" aria-label={label} data-slot={menubarSlot} />;
}

/**
 * A trigger and the menu it opens: a native auto popover that shares Menu's
 * mechanics (data-slot includes "menu"), anchored below the trigger.
 */
function MenubarMenu({ label, children, ...rest }: MenubarMenuProps) {
  const id = `ur-menubar-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <div {...rest} role="none" data-slot={menubarMenuSlot}>
      {renderButton("menubar-trigger button", {
        variant: "ghost",
        size: "sm",
        role: "menuitem",
        "aria-haspopup": "menu",
        popoverTarget: id,
        style: { anchorName: anchorName(id) } as React.CSSProperties,
        children: label,
      })}
      <div
        id={id}
        popover="auto"
        role="menu"
        aria-label={label}
        data-slot={`menubar-content ${menuSlot}`}
        data-side="bottom"
        data-align="start"
        style={{ positionAnchor: anchorName(id) } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}

export const Menubar = Object.assign(MenubarRoot, { Menu: MenubarMenu });
