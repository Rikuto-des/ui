import type * as React from "react";
import { tableDefaults, tableSlot, type TableOwnProps } from "./generated/table.ts";

export type TableProps = TableOwnProps & Omit<React.ComponentPropsWithRef<"table">, keyof TableOwnProps>;

/**
 * A native table in a wrapper that scrolls sideways when it is too wide.
 * Write thead / tbody / tr / th / td as usual; the pack styles them.
 */
export function Table({
  caption,
  hideCaption = tableDefaults.hideCaption,
  density = tableDefaults.density,
  striped = tableDefaults.striped,
  className,
  style,
  children,
  ...rest
}: TableProps) {
  return (
    <div className={className} style={style} data-slot="table-scroll">
      <table {...rest} data-slot={tableSlot} data-density={density} data-striped={striped ? "" : undefined}>
        <caption data-slot="table-caption" data-hidden={hideCaption ? "" : undefined}>
          {caption}
        </caption>
        {children}
      </table>
    </div>
  );
}
