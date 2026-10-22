# Separator

A thin rule between groups of content.

- Tier: 1
- Rendering: server
- Requires: 

## When to use

- Separating groups when spacing alone is not enough

## When not to use

- Decorating every block → use `card`

## Parts

### `<Separator>`

<hr> (horizontal) or a vertical separator. Renders `<hr data-slot="separator">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |  |
| `decorative` | `boolean` | `false` | Hide from assistive technology when it only decorates. |

className may only adjust: margin, width, height, layout, position.

## Accessibility

- Use decorative when the rule adds no structure.

## States



## Tokens

`color.border`

## Examples

### Between groups

```tsx
<Separator />
```
