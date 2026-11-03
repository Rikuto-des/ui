import type * as React from "react";
import { useId } from "react";
import { renderButton, type ButtonLikeProps } from "./button-base.tsx";
import {
  menuDefaults,
  menuItemDefaults,
  menuItemSlot,
  menuLinkSlot,
  menuSeparatorSlot,
  menuSlot,
  menuSubSlot,
  menuTriggerSlot,
  type MenuItemOwnProps,
  type MenuLinkOwnProps,
  type MenuOwnProps,
  type MenuSubOwnProps,
  type MenuTriggerOwnProps,
} from "./generated/menu.ts";
import { anchorName } from "./util.ts";

export type MenuProps = MenuOwnProps &
  Omit<
    React.ComponentPropsWithRef<"div">,
    keyof MenuOwnProps | "popover" | "role"
  >;
export type MenuTriggerProps = MenuTriggerOwnProps &
  Omit<ButtonLikeProps, keyof MenuTriggerOwnProps>;
export type MenuItemProps = MenuItemOwnProps &
  Omit<React.ComponentPropsWithRef<"button">, keyof MenuItemOwnProps | "role">;
export type MenuLinkProps = MenuLinkOwnProps &
  Omit<React.ComponentPropsWithRef<"a">, keyof MenuLinkOwnProps | "role">;
export type MenuSeparatorProps = Omit<
  React.ComponentPropsWithRef<"div">,
  "role" | "children"
>;
export type MenuSubProps = MenuSubOwnProps &
  Omit<React.ComponentPropsWithRef<"div">, keyof MenuSubOwnProps | "role">;

/**
 * A menu in a native auto popover. It opens and closes without JavaScript
 * (items are reachable with Tab); the runtime adds the menu keyboard model.
 */
function MenuRoot({
  id,
  label,
  side = menuDefaults.side,
  align = menuDefaults.align,
  style,
  ...rest
}: MenuProps) {
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
      style={
        { positionAnchor: anchorName(id), ...style } as React.CSSProperties
      }
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

function MenuItem({
  variant = menuItemDefaults.variant,
  children,
  description,
  shortcut,
  ...rest
}: MenuItemProps) {
  return (
    <button
      type="button"
      {...rest}
      role="menuitem"
      data-slot={`${menuItemSlot}`}
      data-variant={variant}
    >
      <span data-slot="menu-item-label">
        {children}
        {description && <small>{description}</small>}
      </span>
      {shortcut && <kbd aria-hidden="true">{shortcut}</kbd>}
    </button>
  );
}

function MenuLink(props: MenuLinkProps) {
  return (
    <a
      {...props}
      role="menuitem"
      data-slot={`${menuLinkSlot} ${menuItemSlot}`}
    />
  );
}

function MenuSeparator(props: MenuSeparatorProps) {
  return <div {...props} role="separator" data-slot={menuSeparatorSlot} />;
}

/**
 * An item that opens a nested menu of its children. The nested menu is its own
 * auto popover inside the parent, so the parent stays open, and a click opens
 * it without JavaScript. The runtime adds hover, the arrow keys and, on narrow
 * screens, opening in place instead of beside the item.
 */
function MenuSub({ label, children, ...rest }: MenuSubProps) {
  const id = `ur-menu-sub-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <div {...rest} role="none" data-slot={menuSubSlot}>
      <button
        type="button"
        role="menuitem"
        aria-haspopup="menu"
        popoverTarget={id}
        data-slot={`${menuItemSlot} menu-sub-trigger`}
        data-variant="default"
        style={{ anchorName: anchorName(id) } as React.CSSProperties}
      >
        <span data-slot="menu-item-label">{label}</span>
        <span data-slot="menu-sub-icon" aria-hidden="true" />
      </button>
      <div
        id={id}
        popover="auto"
        role="menu"
        aria-label={label}
        data-slot={menuSlot}
        data-sub=""
        style={{ positionAnchor: anchorName(id) } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}

export const Menu = Object.assign(MenuRoot, {
  Trigger: MenuTrigger,
  Item: MenuItem,
  Link: MenuLink,
  Separator: MenuSeparator,
  Sub: MenuSub,
});
