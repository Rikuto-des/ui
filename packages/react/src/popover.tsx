import type * as React from "react";
import { renderButton, type ButtonLikeProps } from "./button-base.tsx";
import { anchorName } from "./util.ts";
import {
  popoverCloseSlot,
  popoverDefaults,
  popoverSlot,
  popoverTriggerSlot,
  type PopoverCloseOwnProps,
  type PopoverOwnProps,
  type PopoverTriggerOwnProps,
} from "./generated/popover.ts";

export type PopoverProps = PopoverOwnProps &
  Omit<React.ComponentPropsWithRef<"div">, keyof PopoverOwnProps | "popover" | "role">;
export type PopoverTriggerProps = PopoverTriggerOwnProps & Omit<ButtonLikeProps, keyof PopoverTriggerOwnProps>;
export type PopoverCloseProps = PopoverCloseOwnProps & Omit<ButtonLikeProps, keyof PopoverCloseOwnProps>;

export { anchorName } from "./util.ts";

/**
 * A native `popover` panel positioned with CSS anchor positioning. Placement
 * comes from data-side / data-align in the base stylesheet, so it needs no
 * JavaScript and no measurement.
 */
function PopoverRoot({
  id,
  title,
  side = popoverDefaults.side,
  align = popoverDefaults.align,
  mode = popoverDefaults.mode,
  style,
  children,
  ...rest
}: PopoverProps) {
  const titleId = title ? `${id}-title` : undefined;
  return (
    <div
      aria-labelledby={titleId}
      {...rest}
      id={id}
      popover={mode}
      role="dialog"
      data-slot={popoverSlot}
      data-side={side}
      data-align={align}
      style={{ positionAnchor: anchorName(id), ...style } as React.CSSProperties}
    >
      {title ? (
        <div id={titleId} data-slot="popover-title">
          {title}
        </div>
      ) : null}
      {children}
    </div>
  );
}

function PopoverTrigger({ popover, style, ...props }: PopoverTriggerProps) {
  return renderButton(`${popoverTriggerSlot} button`, {
    ...props,
    popoverTarget: popover,
    popoverTargetAction: "toggle",
    style: { anchorName: anchorName(popover), ...style } as React.CSSProperties,
  });
}

function PopoverClose({ popover, ...props }: PopoverCloseProps) {
  return renderButton(`${popoverCloseSlot} button`, { ...props, popoverTarget: popover, popoverTargetAction: "hide" });
}

export const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Close: PopoverClose,
});
