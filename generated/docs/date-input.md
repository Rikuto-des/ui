# DateInput

A native date or time input with the browser's own picker, drawn like Input.

- Tier: 1
- Rendering: server
- Requires: input[type=date]

## When to use

- A date, time or month where typing or the system picker is enough

## When not to use

- Picking from a visible calendar on the page → use `a date picker (planned)`

## Parts

### `<DateInput>`

<input type="date"> (or time / datetime-local / month). Put it in a Field. Renders `<input data-slot="date-input">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `"date" \| "time" \| "datetime-local" \| "month"` | `"date"` |  |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` |  |
| `invalid` | `boolean` | `false` |  |

className may only adjust: margin, width, layout, position.

## Accessibility

- Label it with a Field; min and max are announced by the browser.

## States

`invalid`

## Tokens

`color.field`, `color.border-field`

## Examples

### Due date

```tsx
<Field id="due" label="期限"><DateInput min="2026-10-01" /></Field>
```
