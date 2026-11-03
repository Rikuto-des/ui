# HoverCard

A preview card for a link, shown on hover and keyboard focus (interestfor).

- Tier: 2
- Rendering: server
- Requires: popover, anchor-positioning
- Enhances with interestfor (fallback: @urushi/core hover-card behavior (loaded by <UrushiRuntime />))

## When to use

- A person or page preview behind a link

## When not to use

- Information needed to act → use `popover`
- A short label → use `tooltip`

## Parts

### `<HoverCard>`

The card: an auto popover anchored to its link. Renders `<div data-slot="hover-card">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | **required** | Required. The trigger references it. |
| `side` | `"top" \| "bottom" \| "start" \| "end"` | `"bottom"` |  |
| `align` | `"start" \| "center" \| "end"` | `"start"` |  |

className may only adjust: nothing (visuals come from the pack).

### `<HoverCard.Trigger>`

The link that shows the card on hover and focus; it still navigates when clicked. Renders `<a data-slot="hover-card-trigger">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `hoverCard` | `string` | **required** | Id of the hover card. |
| `href` | `string` | **required** | Required link target. |

className may only adjust: margin, layout, position.

## Accessibility

| Key | Behavior |
|---|---|
| Tab | focusing the link shows the card |
| Escape | hides it |

- Everything in the card is also reachable through the link's page.

## States

`open`

## Tokens

`color.surface-overlay`, `shadow.overlay`, `radius.overlay`

## Examples

### Person

```tsx
<HoverCard.Trigger hoverCard="sato" href="/people/sato">佐藤 美咲</HoverCard.Trigger>
<HoverCard id="sato">…</HoverCard>
```
