# Skeleton

A placeholder shape shown while content loads.

- Tier: 1
- Rendering: server
- Requires: 

## When to use

- Reserving the space of content that is still loading

## When not to use

- An action in progress → use `spinner`

## Parts

### `<Skeleton>`

The placeholder. Hidden from assistive technology; announce loading elsewhere (aria-busy on the region). Renders `<div data-slot="skeleton">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `shape` | `"block" \| "text" \| "circle"` | `"block"` |  |
| `lines` | `number` | `1` | Number of text lines when shape is text. |

className may only adjust: margin, width, height, layout, position.

## Accessibility

- Set aria-busy="true" on the region that is loading.

## States



## Tokens

`color.border`, `radius.control`

## Examples

### Text lines

```tsx
<Skeleton shape="text" lines={3} />
```
