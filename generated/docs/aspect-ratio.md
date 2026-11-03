# AspectRatio

A box that keeps a ratio (CSS aspect-ratio); its media fills it.

- Tier: 1
- Rendering: server
- Requires: aspect-ratio

## When to use

- Thumbnails, video embeds, maps

## When not to use

- A square avatar → use `avatar`

## Parts

### `<AspectRatio>`

The box. An img, video or iframe inside fills it with object-fit: cover. Renders `<div data-slot="aspect-ratio">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `ratio` | `string` | `"16 / 9"` | Width / height, e.g. "4 / 3". |

className may only adjust: margin, width, layout, position.

## Accessibility

- The media inside still needs its own alt text or title.

## States



## Tokens

`radius.panel`

## Examples

### Thumbnail

```tsx
<AspectRatio ratio="4 / 3"><img src="/photo.jpg" alt="会場の様子" /></AspectRatio>
```
