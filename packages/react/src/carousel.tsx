import { CaretLeftIcon, CaretRightIcon } from "./icons.tsx";
import { Children, cloneElement } from "react";
import type * as React from "react";
import { carouselItemSlot, carouselSlot, type CarouselOwnProps } from "./generated/carousel.ts";
import { isPart } from "./util.ts";

export type CarouselProps = CarouselOwnProps & Omit<React.ComponentPropsWithRef<"section">, keyof CarouselOwnProps>;
export type CarouselItemProps = React.ComponentPropsWithRef<"div">;

/** What Carousel passes to its items (not part of the public API). */
type Wiring = { __index?: number; __total?: number };

function CarouselItem({ __index, __total, ...rest }: CarouselItemProps & Wiring) {
  return (
    <div
      {...rest}
      role="group"
      aria-roledescription="スライド"
      aria-label={__index && __total ? `${__index} / ${__total}` : undefined}
      data-slot={carouselItemSlot}
    />
  );
}
CarouselItem.urPart = "carousel-item";

/**
 * A scroll-snap strip. Where CSS ::scroll-button and ::scroll-marker exist the
 * browser draws the previous / next buttons and the dots; elsewhere it scrolls
 * by swipe, trackpad or the arrow keys once focused.
 */
function CarouselRoot({ label, previousLabel = "前のスライド", nextLabel = "次のスライド", children, ...rest }: CarouselProps) {
  const total = Children.toArray(children).filter((child) => isPart(child, CarouselItem)).length;
  let index = 0;
  const items = Children.map(children, (child) =>
    isPart<Wiring>(child, CarouselItem) ? cloneElement(child, { __index: ++index, __total: total }) : child,
  );
  return (
    <section {...rest} aria-roledescription="カルーセル" aria-label={label} data-slot={carouselSlot}>
      <div data-slot="carousel-viewport" tabIndex={0}>
        {items}
      </div>
      {total > 1 && <div data-slot="carousel-controls" hidden>
        <button type="button" data-slot="carousel-previous" aria-label={previousLabel} disabled><CaretLeftIcon size={16} /></button>
        <div data-slot="carousel-positions">{Array.from({ length: total }, (_, i) => <button key={i} type="button" data-slot="carousel-position" data-index={i} aria-label={`${i + 1} / ${total}`} aria-current={i === 0 ? "true" : undefined}><span aria-hidden="true" /></button>)}</div>
        <span data-slot="carousel-count" role="status" aria-atomic="true">1 / {total}</span>
        <button type="button" data-slot="carousel-next" aria-label={nextLabel}><CaretRightIcon size={16} /></button>
      </div>}
    </section>
  );
}

export const Carousel = Object.assign(CarouselRoot, { Item: CarouselItem });
