import { useId } from "react";
import type * as React from "react";
import { checkboxDefaults, checkboxSlot, type CheckboxOwnProps } from "./generated/checkbox.ts";
import { switchSlot, type SwitchOwnProps } from "./generated/switch.ts";
import { joinIds } from "./util.ts";

type InputAttrs = Omit<React.ComponentPropsWithRef<"input">, "type" | "children">;

export type CheckboxProps = CheckboxOwnProps & Omit<InputAttrs, keyof CheckboxOwnProps> & { children?: React.ReactNode };
export type SwitchProps = SwitchOwnProps & Omit<InputAttrs, keyof SwitchOwnProps> & { children?: React.ReactNode };

/**
 * A <label> around a native checkbox. className and style style the label;
 * every other prop goes to the input, so forms and refs work as usual.
 *
 * The description sits inside the label so it is clickable too, but it is
 * aria-hidden there and linked with aria-describedby instead: it is announced
 * as the description, not as part of the name. (useId is server-safe: it
 * works in Server Components and keeps no state.)
 */
function renderCheck(
  slot: string,
  role: "switch" | undefined,
  { children, description, className, style, invalid, ...input }: CheckboxProps,
  generatedId: string,
) {
  const descriptionId = description ? `${input.id ?? generatedId}-description` : undefined;
  return (
    <label className={className} style={style} data-slot={slot} data-invalid={invalid ? "" : undefined}>
      <input
        {...input}
        type="checkbox"
        role={role}
        data-slot={`${slot}-input`}
        aria-invalid={invalid || input["aria-invalid"] || undefined}
        aria-describedby={joinIds(input["aria-describedby"], descriptionId)}
      />
      {children || description ? (
        <span data-slot={`${slot}-text`}>
          {children ? <span data-slot={`${slot}-label`}>{children}</span> : null}
          {description ? (
            <span id={descriptionId} data-slot={`${slot}-description`} aria-hidden="true">
              {description}
            </span>
          ) : null}
        </span>
      ) : null}
    </label>
  );
}

export function Checkbox({ invalid = checkboxDefaults.invalid, ...props }: CheckboxProps) {
  return renderCheck(checkboxSlot, undefined, { invalid, ...props }, useId());
}

export function Switch(props: SwitchProps) {
  return renderCheck(switchSlot, "switch", props, useId());
}
