import { Children, cloneElement } from "react";
import type * as React from "react";
import {
  inputGroupAddonSlot,
  inputGroupDefaults,
  inputGroupSlot,
  type InputGroupAddonOwnProps,
  type InputGroupOwnProps,
} from "./generated/input-group.ts";
import { Input, type InputProps } from "./input.tsx";
import { isPart, joinIds } from "./util.ts";

export type InputGroupProps = InputGroupOwnProps & Omit<React.ComponentPropsWithRef<"div">, keyof InputGroupOwnProps> & { required?: boolean };
export type InputGroupAddonProps = InputGroupAddonOwnProps & Omit<React.ComponentPropsWithRef<"span">, keyof InputGroupAddonOwnProps>;

/**
 * One field drawn around an Input and its addons. Inside a Field, the Field's
 * id, aria-describedby, aria-invalid and required arrive here and are passed
 * on to the Input, so the label still points at the input itself.
 */
function InputGroupRoot({
  size = inputGroupDefaults.size,
  id,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  required,
  children,
  ...rest
}: InputGroupProps) {
  const wired = Children.map(children, (child) =>
    isPart<InputProps>(child, Input)
      ? cloneElement(child, {
          id: id ?? child.props.id,
          size,
          "aria-describedby": joinIds(child.props["aria-describedby"], describedBy),
          "aria-invalid": invalid ?? child.props["aria-invalid"],
          required: required || child.props.required,
        })
      : child,
  );
  return (
    <div {...rest} data-slot={inputGroupSlot} data-size={size} data-invalid={invalid === true || invalid === "true" ? "" : undefined}>
      {wired}
    </div>
  );
}

function InputGroupAddon(props: InputGroupAddonProps) {
  return <span {...props} data-slot={inputGroupAddonSlot} />;
}

export const InputGroup = Object.assign(InputGroupRoot, { Addon: InputGroupAddon });
