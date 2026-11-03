import { Children, cloneElement } from "react";
import type * as React from "react";
import {
  toggleGroupDefaults,
  toggleGroupItemSlot,
  toggleGroupSlot,
  type ToggleGroupItemOwnProps,
  type ToggleGroupOwnProps,
} from "./generated/toggle-group.ts";
import { isPart } from "./util.ts";

export type ToggleGroupProps = ToggleGroupOwnProps & Omit<React.ComponentPropsWithRef<"fieldset">, keyof ToggleGroupOwnProps>;
export type ToggleGroupItemProps = ToggleGroupItemOwnProps &
  Omit<React.ComponentPropsWithRef<"input">, keyof ToggleGroupItemOwnProps | "type" | "children" | "name"> & { children?: React.ReactNode };

/** What ToggleGroup passes to its items (not part of the public API). */
type Wiring = { __group?: { name: string; type: "single" | "multiple"; defaultValue?: string } };

/** One segment: a radio (single) or checkbox (multiple) inside a label. */
function ToggleGroupItem({ value, children, className, style, __group, ...input }: ToggleGroupItemProps & Wiring) {
  const single = __group?.type !== "multiple";
  const initial = input.defaultChecked ?? (single && __group?.defaultValue !== undefined ? value === __group.defaultValue : undefined);
  return (
    <label className={className} style={style} data-slot={toggleGroupItemSlot}>
      <input {...input} type={single ? "radio" : "checkbox"} name={__group?.name} value={value} defaultChecked={initial} data-slot="toggle-group-input" />
      <span data-slot="toggle-group-label">{children}</span>
    </label>
  );
}
ToggleGroupItem.urPart = "toggle-group-item";

/**
 * A segmented control from native radios or checkboxes: arrow keys, form
 * submission and the checked state all come from the browser.
 */
function ToggleGroupRoot({
  legend,
  hideLegend = toggleGroupDefaults.hideLegend,
  name,
  type = toggleGroupDefaults.type,
  defaultValue,
  size = toggleGroupDefaults.size,
  children,
  ...rest
}: ToggleGroupProps) {
  const items = Children.map(children, (child) =>
    isPart<Wiring>(child, ToggleGroupItem) ? cloneElement(child, { __group: { name, type, defaultValue } }) : child,
  );
  return (
    <fieldset {...rest} data-slot={toggleGroupSlot} data-size={size} data-type={type}>
      <legend data-slot="toggle-group-legend" data-hidden={hideLegend ? "" : undefined}>
        {legend}
      </legend>
      <div data-slot="toggle-group-items"><span data-slot="toggle-group-indicator" aria-hidden="true" />{items}</div>
    </fieldset>
  );
}

export const ToggleGroup = Object.assign(ToggleGroupRoot, { Item: ToggleGroupItem });
