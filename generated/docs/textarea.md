# Textarea

A native <textarea> that grows with its content (field-sizing).

- Tier: 1
- Rendering: server
- Requires: 
- Enhances with field-sizing (fallback: fixed height of `rows` lines)

## When to use

- Comments, descriptions and other multi-line text

## When not to use

- A single line → use `input`

## Parts

### `<Textarea>`

The textarea. All native attributes pass through. Renders `<textarea data-slot="textarea">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `rows` | `number` | `3` | Minimum visible lines. |
| `autoResize` | `boolean` | `true` | Grow with the content up to 12 lines. |
| `invalid` | `boolean` | `false` |  |

className may only adjust: margin, width, height, layout, position.

## Accessibility

- Wrap in Field so it has a label.

## States

`focus-visible`, `invalid`, `user-invalid`, `disabled`

## Tokens

`color.field`, `color.border-strong`, `radius.control`

## Examples

### Comment

```tsx
<Field id="comment" label="コメント"><Textarea name="comment" rows={4} /></Field>
```
