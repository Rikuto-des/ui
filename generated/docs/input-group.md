# InputGroup

An Input with fixed text or a button attached before or after it, drawn as one field.

- Tier: 1
- Rendering: server
- Requires: :has()

## When to use

- A URL prefix (https://)
- A unit (円, %)
- A search field with its button

## When not to use

- Several inputs on one line → use `a grid of Fields`

## Parts

### `<InputGroup>`

The frame. It passes the Field's id, aria-describedby, aria-invalid and required on to its Input. Renders `<div data-slot="input-group">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `"sm" \| "md" \| "lg"` | `"md"` |  |

className may only adjust: margin, width, layout, position.

### `<InputGroup.Addon>`

Fixed text before or after the input. Renders `<span data-slot="input-group-addon">`.

className may only adjust: nothing (visuals come from the pack).

## Accessibility

- Put the meaning in the Field label too: addon text is not part of the input's name.

## States

`focus-within`, `invalid`

## Tokens

`color.field`, `color.border-field`, `color.text-muted`

## Examples

### URL

```tsx
<Field id="site" label="サイトの URL">
  <InputGroup><InputGroup.Addon>https://</InputGroup.Addon><Input /></InputGroup>
</Field>
```
