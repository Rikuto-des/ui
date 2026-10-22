import type * as React from "react";
import { renderButton, type ButtonLikeProps } from "./button-base.tsx";
import {
  tooltipDefaults,
  tooltipSlot,
  tooltipTriggerSlot,
  type TooltipOwnProps,
  type TooltipTriggerOwnProps,
} from "./generated/tooltip.ts";
import { anchorName, joinIds } from "./util.ts";

export type TooltipProps = TooltipOwnProps & Omit<React.ComponentPropsWithRef<"div">, keyof TooltipOwnProps | "popover" | "role">;
export type TooltipTriggerProps = TooltipTriggerOwnProps & Omit<ButtonLikeProps, keyof TooltipTriggerOwnProps>;

/** A hint popover. Chromium opens it through `interestfor`; the runtime covers other browsers. */
function TooltipRoot({ id, side = tooltipDefaults.side, align = tooltipDefaults.align, style, ...rest }: TooltipProps) {
  return (
    <div
      {...rest}
      id={id}
      popover="hint"
      role="tooltip"
      data-slot={tooltipSlot}
      data-side={side}
      data-align={align}
      style={{ positionAnchor: anchorName(id), ...style } as React.CSSProperties}
    />
  );
}

function TooltipTrigger({ tooltip, style, ...props }: TooltipTriggerProps) {
  return renderButton(`${tooltipTriggerSlot} button`, {
    ...props,
    interestfor: tooltip,
    "aria-describedby": joinIds(props["aria-describedby"], tooltip),
    ...({ "data-yl-tooltip": tooltip } as object),
    style: { anchorName: anchorName(tooltip), ...style } as React.CSSProperties,
  });
}

export const Tooltip = Object.assign(TooltipRoot, { Trigger: TooltipTrigger });
