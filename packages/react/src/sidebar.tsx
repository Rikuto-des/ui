import { useId } from "react";
import type * as React from "react";
import {
  sidebarGroupDefaults,
  sidebarGroupSlot,
  sidebarItemDefaults,
  sidebarItemSlot,
  sidebarSlot,
  type SidebarGroupOwnProps,
  type SidebarItemOwnProps,
  type SidebarOwnProps,
} from "./generated/sidebar.ts";

export type SidebarProps = SidebarOwnProps & Omit<React.ComponentPropsWithRef<"nav">, keyof SidebarOwnProps>;
export type SidebarGroupProps = SidebarGroupOwnProps & Omit<React.HTMLAttributes<HTMLElement>, keyof SidebarGroupOwnProps>;
export type SidebarItemProps = SidebarItemOwnProps & Omit<React.ComponentPropsWithRef<"a">, keyof SidebarItemOwnProps>;

function SidebarItem({ href, current = sidebarItemDefaults.current, icon, children, ...rest }: SidebarItemProps) {
  return (
    <li data-slot="sidebar-entry">
      <a {...rest} href={href} aria-current={current ? "page" : undefined} data-slot={sidebarItemSlot}>
        {icon ? (
          <span data-slot="sidebar-item-icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <span data-slot="sidebar-item-label">{children}</span>
      </a>
    </li>
  );
}

/** A titled list of items; collapsible turns it into a native <details>. */
function SidebarGroup({
  title,
  collapsible = sidebarGroupDefaults.collapsible,
  defaultOpen = sidebarGroupDefaults.defaultOpen,
  children,
  ...rest
}: SidebarGroupProps) {
  const id = useId();
  if (collapsible) {
    return (
      <details {...rest} open={defaultOpen || undefined} data-slot={sidebarGroupSlot} data-collapsible="">
        <summary data-slot="sidebar-group-title">
          <span>{title}</span>
          <span data-slot="sidebar-group-icon" aria-hidden="true" />
        </summary>
        <ul data-slot="sidebar-list">{children}</ul>
      </details>
    );
  }
  return (
    <div {...rest} data-slot={sidebarGroupSlot}>
      <p id={id} data-slot="sidebar-group-title">
        {title}
      </p>
      <ul aria-labelledby={id} data-slot="sidebar-list">
        {children}
      </ul>
    </div>
  );
}

function SidebarRoot({ label, ...rest }: SidebarProps) {
  return <nav {...rest} aria-label={label} data-slot={sidebarSlot} />;
}

export const Sidebar = Object.assign(SidebarRoot, { Group: SidebarGroup, Item: SidebarItem });
