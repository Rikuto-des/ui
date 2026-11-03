# Carousel

Slides in a horizontal scroll-snap strip; where CSS ::scroll-button and ::scroll-marker exist, the browser adds the buttons and dots.

- Tier: 2
- Rendering: server
- Requires: scroll-snap
- Enhances with ::scroll-button / ::scroll-marker (fallback: scroll by swipe, trackpad or the arrow keys)

## When to use

- A set of images or cards of equal weight that do not all fit

## When not to use

- Content most people must see → use `a list or grid`

## Parts

### `<Carousel>`

A named region (aria-roledescription="カルーセル") with a focusable scroll strip. Renders `<section data-slot="carousel">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | **required** | Required. Names the carousel. |
| `previousLabel` | `string` | `"前のスライド"` | Accessible name for the previous-slide control. |
| `nextLabel` | `string` | `"次のスライド"` | Accessible name for the next-slide control. |

className may only adjust: margin, width, layout, position.

### `<Carousel.Item>`

One slide; it is named "n / total". Renders `<div data-slot="carousel-item">`.

className may only adjust: nothing (visuals come from the pack).

## Accessibility

| Key | Behavior |
|---|---|
| ← / → | move between slides when the strip is focused; respects RTL |
| Home / End | first / last slide with the runtime |
| Tab | previous, numbered positions and next controls |

- Slides never move by themselves.
- The optional runtime adds controls and a current position in every supported browser; reduced motion uses immediate scrolling.

## States



## Tokens

`color.text`, `color.border-strong`, `radius.panel`

## Examples

### Photos

```tsx
<Carousel label="会場の写真">
  <Carousel.Item><img src="/1.jpg" alt="受付" /></Carousel.Item>
  <Carousel.Item><img src="/2.jpg" alt="講演" /></Carousel.Item>
</Carousel>
```
