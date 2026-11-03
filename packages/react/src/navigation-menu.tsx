import { useId } from "react";
import type * as React from "react";
import type { NavigationMenuOwnProps, NavigationMenuGroupOwnProps, NavigationMenuLinkOwnProps } from "./generated/navigation-menu.ts";

export type NavigationMenuProps = NavigationMenuOwnProps & Omit<React.ComponentPropsWithRef<"nav">, keyof NavigationMenuOwnProps>;
export type NavigationMenuGroupProps = NavigationMenuGroupOwnProps & Omit<React.ComponentPropsWithRef<"details">, keyof NavigationMenuGroupOwnProps | "open" | "name">;
export type NavigationMenuLinkProps = NavigationMenuLinkOwnProps & Omit<React.ComponentPropsWithRef<"a">, keyof NavigationMenuLinkOwnProps>;

function Root({ label, openOnHover = true, children, ...rest }: NavigationMenuProps) {
  return <nav {...rest} aria-label={label} data-slot="navigation-menu" data-hover={openOnHover}><ul data-slot="navigation-menu-list">{children}</ul></nav>;
}
function Group({ title, defaultOpen = false, columns = 1, submenu = "flyout", children, ...rest }: NavigationMenuGroupProps) {
  const id = useId();
  return <li data-slot="navigation-menu-entry"><details {...rest} open={defaultOpen || undefined} data-slot="navigation-menu-group" data-columns={columns} data-submenu={submenu}>
    <summary id={id} data-slot="navigation-menu-trigger"><span>{title}</span><span data-slot="navigation-menu-indicator" aria-hidden="true" /></summary>
    <ul aria-labelledby={id} data-slot="navigation-menu-panel">{children}</ul>
  </details></li>;
}
function Link({ href, current = false, description, children, ...rest }: NavigationMenuLinkProps) {
  return <li data-slot="navigation-menu-entry"><a {...rest} href={href} aria-current={current ? "page" : undefined} data-slot="navigation-menu-link"><span>{children}</span>{description ? <span data-slot="navigation-menu-description">{description}</span> : null}</a></li>;
}

export const NavigationMenu = Object.assign(Root, { Group, Link });
