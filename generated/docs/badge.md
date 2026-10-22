# Badge

A short status or count label.

- Tier: 1
- Rendering: server
- Requires: 

## When to use

- Status of an item (対応中, 完了)
- A count next to a label

## When not to use

- An action → use `button`

## Parts

### `<Badge>`

The badge. Its text carries the meaning; tone only reinforces it. Renders `<span data-slot="badge">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `tone` | `"neutral" \| "accent" \| "ok" \| "danger"` | `"neutral"` |  |
| `dot` | `boolean` | `false` | Shows a small status dot before the text. |

className may only adjust: margin, layout, position.

## Accessibility

- Never rely on tone alone; the text states the status.

## States



## Tokens

`color.accent`, `color.ok`, `color.danger`, `color.text-muted`

## Examples

### Status

```tsx
<Badge tone="danger" dot>期限切れ</Badge>
```
