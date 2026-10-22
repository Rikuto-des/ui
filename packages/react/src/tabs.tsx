import { Children, cloneElement, type ReactNode } from "react";
import type * as React from "react";
import {
  tabsDefaults,
  tabsListSlot,
  tabsPanelSlot,
  tabsSlot,
  tabsTabSlot,
  type TabsOwnProps,
  type TabsPanelOwnProps,
  type TabsTabOwnProps,
} from "./generated/tabs.ts";
import { anchorName, isPart } from "./util.ts";

export type TabsProps = TabsOwnProps & Omit<React.ComponentPropsWithRef<"div">, keyof TabsOwnProps>;
export type TabsListProps = React.ComponentPropsWithRef<"div">;
export type TabsTabProps = TabsTabOwnProps & Omit<React.ComponentPropsWithRef<"button">, keyof TabsTabOwnProps>;
export type TabsPanelProps = TabsPanelOwnProps & Omit<React.ComponentPropsWithRef<"div">, keyof TabsPanelOwnProps>;

/** What Tabs passes down to its parts (not part of the public API). */
type Wiring = { __tabs?: { id: string; selected: string; label: string; orientation: string } };

const tabId = (id: string, value: string) => `${id}-tab-${value}`;
const panelId = (id: string, value: string) => `${id}-panel-${value}`;

function TabsTab({ value, __tabs, ...rest }: TabsTabProps & Wiring) {
  if (!__tabs) throw new Error("Tabs.Tab must be a direct child of Tabs.List inside Tabs");
  const selected = value === __tabs.selected;
  return (
    <button
      type="button"
      {...rest}
      role="tab"
      id={tabId(__tabs.id, value)}
      aria-controls={panelId(__tabs.id, value)}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      data-slot={tabsTabSlot}
      data-value={value}
    />
  );
}
TabsTab.ylPart = "tabs-tab";

/**
 * The list also holds one background (`tabs-indicator`) that CSS anchors to
 * the selected tab, so it slides when the selection moves. The anchor name
 * comes from the Tabs id, so several Tabs on a page never share one.
 */
function TabsList({ children, __tabs, style, ...rest }: TabsListProps & Wiring) {
  if (!__tabs) throw new Error("Tabs.List must be a direct child of Tabs");
  return (
    <div
      {...rest}
      role="tablist"
      aria-label={__tabs.label}
      aria-orientation={__tabs.orientation === "vertical" ? "vertical" : undefined}
      data-slot={tabsListSlot}
      style={{ "--yl-tabs-anchor": anchorName(`${__tabs.id}-selected`), ...style } as React.CSSProperties}
    >
      <span data-slot="tabs-indicator" aria-hidden="true" />
      {wire(children, __tabs)}
    </div>
  );
}
TabsList.ylPart = "tabs-list";

function TabsPanel({ value, __tabs, ...rest }: TabsPanelProps & Wiring) {
  if (!__tabs) throw new Error("Tabs.Panel must be a direct child of Tabs");
  return (
    <div
      tabIndex={0}
      {...rest}
      role="tabpanel"
      id={panelId(__tabs.id, value)}
      aria-labelledby={tabId(__tabs.id, value)}
      hidden={value !== __tabs.selected}
      data-slot={tabsPanelSlot}
    />
  );
}
TabsPanel.ylPart = "tabs-panel";

function wire(children: ReactNode, tabs: NonNullable<Wiring["__tabs"]>): ReactNode {
  return Children.map(children, (child) =>
    isPart<Wiring>(child, TabsList, TabsTab, TabsPanel) ? cloneElement(child, { __tabs: tabs }) : child,
  );
}

/**
 * Server-rendered tabs: the selected tab and panel come from defaultValue,
 * and the runtime switches them on click and with the arrow keys.
 */
function TabsRoot({ id, label, defaultValue, orientation = tabsDefaults.orientation, children, ...rest }: TabsProps) {
  return (
    <div {...rest} id={id} data-slot={tabsSlot} data-orientation={orientation}>
      {wire(children, { id, selected: defaultValue, label, orientation })}
    </div>
  );
}

export const Tabs = Object.assign(TabsRoot, { List: TabsList, Tab: TabsTab, Panel: TabsPanel });
