# Spinner

An indeterminate progress indicator with a status message for screen readers.

- Tier: 1
- Rendering: server
- Requires: 

## When to use

- Short waits where the remaining time is unknown

## When not to use

- Loading a layout you can predict → use `skeleton`
- A button that is submitting → use `button (loading)`

## Parts

### `<Spinner>`

role="status" with a visually hidden label. Renders `<span data-slot="spinner">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `"読み込み中"` | Announced to screen readers. |
| `showLabel` | `boolean` | `false` | Also display the status label next to the ring. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` |  |

className may only adjust: margin, layout, position.

## Accessibility

- label says what is loading when it is not obvious.

## States



## Tokens

`color.text-muted`

## Examples

### Loading

```tsx
<Spinner label="検索結果を読み込み中" />
```
