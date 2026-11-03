# ScrollArea

A scrolling region with pack-styled scrollbars, focusable and named so keyboards can scroll it.

- Tier: 1
- Rendering: server
- Requires: 
- Enhances with scrollbar-color (fallback: the system scrollbar)

## When to use

- A long list inside a fixed-height panel
- Wide content that scrolls sideways

## When not to use

- The page itself → use `the document scroll`

## Parts

### `<ScrollArea>`

role=region with a name and tabIndex=0. Set its height (or width) from the outside. Renders `<div data-slot="scroll-area">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | **required** | Required. Names the region for screen readers. |
| `orientation` | `"vertical" \| "horizontal" \| "both"` | `"vertical"` |  |

className may only adjust: margin, width, height, layout, position.

## Accessibility

| Key | Behavior |
|---|---|
| ↑ / ↓ / ← / → | scroll when focused |
| Page Up / Page Down | scroll by a page |

- label is required: a focusable region needs a name.

## States



## Tokens

`color.border-strong`

## Examples

### Members

```tsx
<ScrollArea label="参加者" style={{ blockSize: 240 }}>…</ScrollArea>
```
