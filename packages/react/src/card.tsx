import type * as React from "react";
import { cardDefaults, cardSlot, type CardOwnProps } from "./generated/card.ts";

export type CardProps = CardOwnProps &
  Omit<React.ComponentPropsWithRef<"div">, keyof CardOwnProps>;

export function Card({
  selected = false,
  title,
  description,
  footer,
  headingLevel: Heading = cardDefaults.headingLevel,
  padding = cardDefaults.padding,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      {...rest}
      data-slot={cardSlot}
      data-padding={padding}
      data-selected={selected || undefined}
    >
      {title || description ? (
        <div data-slot="card-header">
          {title ? <Heading data-slot="card-title">{title}</Heading> : null}
          {description ? (
            <p data-slot="card-description">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children ? <div data-slot="card-content">{children}</div> : null}
      {footer ? <div data-slot="card-footer">{footer}</div> : null}
    </div>
  );
}
