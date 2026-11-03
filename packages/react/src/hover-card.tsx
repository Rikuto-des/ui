import type * as React from "react";
import {
  hoverCardDefaults,
  hoverCardSlot,
  hoverCardTriggerSlot,
  type HoverCardOwnProps,
  type HoverCardTriggerOwnProps,
} from "./generated/hover-card.ts";
import { anchorName } from "./util.ts";

export type HoverCardProps = HoverCardOwnProps & Omit<React.ComponentPropsWithRef<"div">, keyof HoverCardOwnProps | "popover">;
export type HoverCardTriggerProps = HoverCardTriggerOwnProps & Omit<React.ComponentPropsWithRef<"a">, keyof HoverCardTriggerOwnProps>;

/** The card: an auto popover anchored to its link. */
function HoverCardRoot({ id, side = hoverCardDefaults.side, align = hoverCardDefaults.align, style, ...rest }: HoverCardProps) {
  return (
    <div
      {...rest}
      id={id}
      popover="auto"
      data-slot={hoverCardSlot}
      data-side={side}
      data-align={align}
      style={{ positionAnchor: anchorName(id), ...style } as React.CSSProperties}
    />
  );
}

/**
 * The link. Chromium shows the card through interestfor (hover and focus);
 * the runtime does the same elsewhere. A click still follows the link.
 */
function HoverCardTrigger({ hoverCard, style, ...rest }: HoverCardTriggerProps) {
  return (
    <a
      {...rest}
      interestfor={hoverCard}
      data-ur-tooltip={hoverCard}
      data-slot={hoverCardTriggerSlot}
      style={{ anchorName: anchorName(hoverCard), ...style } as React.CSSProperties}
    />
  );
}

export const HoverCard = Object.assign(HoverCardRoot, { Trigger: HoverCardTrigger });
