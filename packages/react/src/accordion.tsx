import { Children, cloneElement } from "react";
import type * as React from "react";
import {
  accordionItemDefaults,
  accordionItemSlot,
  accordionSlot,
  type AccordionItemOwnProps,
  type AccordionOwnProps,
} from "./generated/accordion.ts";
import { isPart } from "./util.ts";

export type AccordionProps = AccordionOwnProps & Omit<React.ComponentPropsWithRef<"div">, keyof AccordionOwnProps>;
export type AccordionItemProps = AccordionItemOwnProps &
  Omit<React.ComponentPropsWithRef<"details">, keyof AccordionItemOwnProps | "open" | "title">;

/** One section: native <details>, so it opens with Enter/Space and works without JavaScript. */
function AccordionItem({ title, description, defaultOpen = accordionItemDefaults.defaultOpen, children, ...rest }: AccordionItemProps) {
  return (
    <details {...rest} open={defaultOpen || undefined} data-slot={accordionItemSlot}>
      <summary data-slot="accordion-trigger">
        <span data-slot="accordion-heading"><span data-slot="accordion-title">{title}</span>{description ? <span data-slot="accordion-description">{description}</span> : null}</span>
        <span data-slot="accordion-icon" aria-hidden="true" />
      </summary>
      <div data-slot="accordion-content">{children}</div>
    </details>
  );
}
AccordionItem.urPart = "accordion-item";

/** With a name, items share it and the browser keeps only one open (exclusive accordion). */
function AccordionRoot({ name, children, ...rest }: AccordionProps) {
  const items = name
    ? Children.map(children, (child) =>
        isPart<AccordionItemProps>(child, AccordionItem) ? cloneElement(child, { name }) : child,
      )
    : children;
  return (
    <div {...rest} data-slot={accordionSlot}>
      {items}
    </div>
  );
}

export const Accordion = Object.assign(AccordionRoot, { Item: AccordionItem });
