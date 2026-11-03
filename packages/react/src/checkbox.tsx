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
  { children, description, className, style, invalid, showState, ...input }: CheckboxProps & { showState?: boolean },
  generatedId: string,
) {
  const descriptionId = description ? `${input.id ?? generatedId}-description` : undefined;
  return (
    <label className={className} style={style} data-slot={slot} data-invalid={invalid ? "" : undefined} data-state-marks={showState || undefined}>
      <input
        {...input}
        type="checkbox"
        role={role}
        data-slot={`${slot}-input`}
        aria-invalid={invalid || input["aria-invalid"] || undefined}
        aria-describedby={joinIds(input["aria-describedby"], descriptionId)}
      />
      {slot === checkboxSlot && <svg data-slot="checkbox-indicator" aria-hidden="true" viewBox="0 0 16 16" fill="none">
        <path data-slot="checkbox-mark" pathLength="1" d="m4.25 8.25 2.5 2.5 5-5.5" />
        <path data-slot="checkbox-mixed" pathLength="1" d="M4.5 8h7" />
      </svg>}
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
