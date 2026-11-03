import { Children, cloneElement, useId } from "react";
import type * as React from "react";
import {
  radioGroupDefaults,
  radioGroupItemSlot,
  radioGroupSlot,
  type RadioGroupItemOwnProps,
  type RadioGroupOwnProps,
} from "./generated/radio-group.ts";
import { isPart, joinIds } from "./util.ts";

export type RadioGroupProps = RadioGroupOwnProps & Omit<React.ComponentPropsWithRef<"fieldset">, keyof RadioGroupOwnProps>;
export type RadioGroupItemProps = RadioGroupItemOwnProps &
  Omit<React.ComponentPropsWithRef<"input">, keyof RadioGroupItemOwnProps | "type" | "children"> & { children?: React.ReactNode };

/**
 * One option. Gets `name` (and the initial check) from its RadioGroup. Like
 * Checkbox, the description is linked with aria-describedby and kept out of
 * the name.
 */
function RadioGroupItem({ value, description, children, className, style, ...input }: RadioGroupItemProps) {
  const generatedId = useId();
  const descriptionId = description ? `${input.id ?? generatedId}-description` : undefined;
  return (
    <label className={className} style={style} data-slot={radioGroupItemSlot}>
      <input {...input} type="radio" value={value} data-slot="radio-input" aria-describedby={joinIds(input["aria-describedby"], descriptionId)} />
      <span data-slot="radio-text">
        <span data-slot="radio-label">{children}</span>
        {description ? (
          <span id={descriptionId} data-slot="radio-description" aria-hidden="true">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}
RadioGroupItem.urPart = "radio-group-item";

/**
 * A fieldset of native radios: arrow keys and form submission come from the
 * browser. Items receive the group's name, so they cannot drift apart.
 */
function RadioGroupRoot({
  name,
  legend,
  defaultValue,
  orientation = radioGroupDefaults.orientation,
  variant = radioGroupDefaults.variant,
  required = radioGroupDefaults.required,
  children,
  ...rest
}: RadioGroupProps) {
  const items = Children.map(children, (child) =>
    isPart<RadioGroupItemProps>(child, RadioGroupItem)
      ? cloneElement(child, {
          name,
          required,
          defaultChecked: child.props.defaultChecked ?? (defaultValue !== undefined ? child.props.value === defaultValue : undefined),
        })
      : child,
  );
  return (
    <fieldset {...rest} data-slot={radioGroupSlot} data-orientation={orientation} data-variant={variant}>
      <legend data-slot="radio-group-legend">{legend}</legend>
      <div data-slot="radio-group-items">{items}</div>
    </fieldset>
  );
}

export const RadioGroup = Object.assign(RadioGroupRoot, { Item: RadioGroupItem });
