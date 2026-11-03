import type * as React from "react";
import { buttonGroupDefaults, buttonGroupSlot, type ButtonGroupOwnProps } from "./generated/button-group.ts";

export type ButtonGroupProps = ButtonGroupOwnProps & Omit<React.ComponentPropsWithRef<"div">, keyof ButtonGroupOwnProps>;

export function ButtonGroup({ label, orientation = buttonGroupDefaults.orientation, ...rest }: ButtonGroupProps) {
  return <div {...rest} role="group" aria-label={label} data-slot={buttonGroupSlot} data-orientation={orientation} />;
}
