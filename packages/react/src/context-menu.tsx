import type * as React from "react";
import {
  contextMenuAreaSlot,
  contextMenuSlot,
  type ContextMenuAreaOwnProps,
  type ContextMenuOwnProps,
} from "./generated/context-menu.ts";
import { menuSlot } from "./generated/menu.ts";
import { anchorName } from "./util.ts";

export type ContextMenuProps = ContextMenuOwnProps &
  Omit<React.ComponentPropsWithRef<"div">, keyof ContextMenuOwnProps | "popover" | "role">;
export type ContextMenuAreaProps = ContextMenuAreaOwnProps &
  Omit<React.ComponentPropsWithRef<"div">, keyof ContextMenuAreaOwnProps>;

/**
 * A menu in a native auto popover that shares Menu's mechanics (data-slot
 * includes "menu"). It is anchored to an empty fixed point that the runtime
 * moves to the pointer, so anchor positioning flips it at the viewport edges.
 */
function ContextMenuRoot({ id, label, style, ...rest }: ContextMenuProps) {
  return (
    <>
      <span
        aria-hidden="true"
        data-slot="context-menu-anchor"
        data-menu={id}
        style={{ anchorName: anchorName(id) } as React.CSSProperties}
      />
      <div
        {...rest}
        id={id}
        popover="auto"
        role="menu"
        aria-label={label}
        data-slot={`${contextMenuSlot} ${menuSlot}`}
        data-side="bottom"
        data-align="start"
        style={{ positionAnchor: anchorName(id), ...style } as React.CSSProperties}
      />
    </>
  );
}

/** The region that opens the menu. Without JavaScript the browser's own context menu shows. */
function ContextMenuArea({ menu, ...rest }: ContextMenuAreaProps) {
  return <div {...rest} data-slot={contextMenuAreaSlot} data-menu={menu} />;
}

export const ContextMenu = Object.assign(ContextMenuRoot, { Area: ContextMenuArea });
