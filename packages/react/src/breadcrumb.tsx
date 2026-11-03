import type * as React from "react";
import {
  breadcrumbDefaults,
  breadcrumbItemDefaults,
  breadcrumbItemSlot,
  breadcrumbSlot,
  type BreadcrumbItemOwnProps,
  type BreadcrumbOwnProps,
} from "./generated/breadcrumb.ts";

export type BreadcrumbProps = BreadcrumbOwnProps & Omit<React.ComponentPropsWithRef<"nav">, keyof BreadcrumbOwnProps>;
export type BreadcrumbItemProps = BreadcrumbItemOwnProps & Omit<React.ComponentPropsWithRef<"li">, keyof BreadcrumbItemOwnProps>;

/** One level: a link, or the current page. Separators are drawn by CSS and not read. */
function BreadcrumbItem({ href, current = breadcrumbItemDefaults.current, children, ...rest }: BreadcrumbItemProps) {
  return (
    <li {...rest} data-slot={breadcrumbItemSlot}>
      {href && !current ? (
        <a href={href} data-slot="breadcrumb-link">
          {children}
        </a>
      ) : (
        <span aria-current={current ? "page" : undefined} data-slot="breadcrumb-current">
          {children}
        </span>
      )}
    </li>
  );
}

function BreadcrumbRoot({ label = breadcrumbDefaults.label, children, ...rest }: BreadcrumbProps) {
  return (
    <nav {...rest} aria-label={label} data-slot={breadcrumbSlot}>
      <ol data-slot="breadcrumb-list">{children}</ol>
    </nav>
  );
}

export const Breadcrumb = Object.assign(BreadcrumbRoot, { Item: BreadcrumbItem });
