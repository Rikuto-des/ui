import type * as React from "react";
import { CaretRightIcon } from "./icons.tsx";
import { itemGroupDefaults, itemGroupSlot, itemSlot, type ItemGroupOwnProps, type ItemOwnProps } from "./generated/item.ts";

export type ItemGroupProps = ItemGroupOwnProps & Omit<React.ComponentPropsWithRef<"ul">, keyof ItemGroupOwnProps>;
export type ItemProps = ItemOwnProps & Omit<React.ComponentPropsWithRef<"li">, keyof ItemOwnProps | "children">;

function ItemGroup({ label, variant = itemGroupDefaults.variant, ...rest }: ItemGroupProps) {
  // role=list: Safari drops list semantics from a <ul> without list markers.
  return <ul role="list" aria-label={label} {...rest} data-slot={itemGroupSlot} data-variant={variant} />;
}

function ItemRoot({ title, description, icon, action, href, ...rest }: ItemProps) {
  const content = (
    <>
      {icon ? (
        <span data-slot="item-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span data-slot="item-text">
        <span data-slot="item-title">{title}</span>
        {description ? <span data-slot="item-description">{description}</span> : null}
      </span>
    </>
  );
  return (
    <li {...rest} data-slot={itemSlot}>
      {href ? (
        <a href={href} data-slot="item-link">
          {content}
          <CaretRightIcon data-slot="item-chevron" aria-hidden="true" size={16} />
        </a>
      ) : (
        <div data-slot="item-row">
          {content}
          {action ? <span data-slot="item-action">{action}</span> : null}
        </div>
      )}
    </li>
  );
}

export const Item = Object.assign(ItemRoot, { Group: ItemGroup });
