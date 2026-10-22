import type * as React from "react";
import { renderButton, type ButtonLikeProps } from "./button-base.tsx";
import {
  menuDefaults,
  menuItemDefaults,
  menuItemSlot,
  menuLinkSlot,
  menuSeparatorSlot,
  menuSlot,
  menuTriggerSlot,
  type MenuItemOwnProps,
  type MenuLinkOwnProps,
  type MenuOwnProps,
  type MenuTriggerOwnProps,
} from "./generated/menu.ts";
import { anchorName } from "./util.ts";

export type MenuProps = MenuOwnProps & Omit<React.ComponentPropsWithRef<"div">, keyof MenuOwnProps | "popover" | "role">;
export type MenuTriggerProps = MenuTriggerOwnProps & Omit<ButtonLikeProps, keyof MenuTriggerOwnProps>;
export type MenuItemProps = MenuItemOwnProps & Omit<React.ComponentPropsWithRef<"button">, keyof MenuItemOwnProps | "role">;
export type MenuLinkProps = MenuLinkOwnProps & Omit<React.ComponentPropsWithRef<"a">, keyof MenuLinkOwnProps | "role">;
export type MenuSeparatorProps = Omit<React.ComponentPropsWithRef<"div">, "role" | "children">;

/**
 * A menu in a native auto popover. It opens and closes without JavaScript
 * (items are reachable with Tab); the runtime adds the menu keyboard model.
 */
function MenuRoot({ id, label, side = menuDefaults.side, align = menuDefaults.align, style, ...rest }: MenuProps) {
  return (
    <div
      {...rest}
      id={id}
      popover="auto"
      role="menu"
      aria-label={label}
      data-slot={menuSlot}
      data-side={side}
      data-align={align}
      style={{ positionAnchor: anchorName(id), ...style } as React.CSSProperties}
    />
  );
}

function MenuTrigger({ menu, style, ...props }: MenuTriggerProps) {
  return renderButton(`${menuTriggerSlot} button`, {
    "aria-haspopup": "menu",
    ...props,
    popoverTarget: menu,
    popoverTargetAction: "toggle",
    style: { anchorName: anchorName(menu), ...style } as React.CSSProperties,
  });
}

function MenuItem({ variant = menuItemDefaults.variant, ...rest }: MenuItemProps) {
  return <button type="button" {...rest} role="menuitem" data-slot={`${menuItemSlot}`} data-variant={variant} />;
}

function MenuLink(props: MenuLinkProps) {
  return <a {...props} role="menuitem" data-slot={`${menuLinkSlot} ${menuItemSlot}`} />;
}

function MenuSeparator(props: MenuSeparatorProps) {
  return <div {...props} role="separator" data-slot={menuSeparatorSlot} />;
}

export const Menu = Object.assign(MenuRoot, { Trigger: MenuTrigger, Item: MenuItem, Link: MenuLink, Separator: MenuSeparator });
