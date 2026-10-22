# Input

A native single-line <input> styled by the pack.

- Tier: 1
- Rendering: server
- Requires: :user-invalid

## When to use

- Short free text, email, numbers, dates, search

## When not to use

- Several lines of text → use `textarea`
- Picking from a known list → use `select`

## Parts

### `<Input>`

The input. All native attributes (type, name, required, pattern…) pass through. Renders `<input data-slot="input">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Control height, matching Button sizes. |
| `invalid` | `boolean` | `false` | Shows the error style and sets aria-invalid. |

className may only adjust: margin, width, layout, position.

## Accessibility

- Wrap in Field so it has a label.
- Use the right type and autocomplete for the data.

## States

`focus-visible`, `invalid`, `user-invalid`, `disabled`, `read-only`

## Tokens

`color.field`, `color.border-strong`, `color.accent`, `radius.control`, `control.*`

## Examples

### Email

```tsx
<Field id="email" label="メールアドレス"><Input type="email" name="email" autoComplete="email" /></Field>
```
