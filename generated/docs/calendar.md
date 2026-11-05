# Calendar

A month of days to pick a date from, always on the page (a booking or schedule view). DatePicker uses the same calendar in its dialog.

- Tier: 3
- Rendering: client
- Requires: React 19

## When to use

- Choosing a date while the month stays in view (予約日・配達日を選ぶ)

## When not to use

- A date field in a form → use `date-picker`
- A date the user already knows and types → use `date-input`

## Parts

### `<Calendar>`

A named group with the month, its previous and next buttons, and a grid of day buttons. One day holds the Tab stop. Renders `<div data-slot="calendar">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | **required** | Required accessible name (配達日 など). |
| `value` | `string` | — | YYYY-MM-DD. No time zone conversion. |
| `defaultValue` | `string` | — |  |
| `onValueChange` | `(value: string) => void` | — |  |
| `min` | `string` | — | YYYY-MM-DD. Earlier days are disabled. |
| `max` | `string` | — | YYYY-MM-DD. Later days are disabled. |
| `locale` | `string` | `"en"` |  |
| `defaultFocusedDate` | `string` | — | YYYY-MM-DD. The day that first holds the Tab stop; defaults to the value, else today. |
| `autoFocus` | `boolean` | `false` | Move focus into the grid on mount, as inside a dialog. |

className may only adjust: margin, width, layout, position.

## Accessibility

Pattern: date picker dialog (grid)

| Key | Behavior |
|---|---|
| ← / → | previous / next day |
| ↑ / ↓ | same day of the previous / next week |
| Home / End | first / last day of the week |
| PageUp / PageDown | previous / next month; with Shift, previous / next year |
| Enter / Space | choose the day |

- Give a label that says what the date is for.
- Show the chosen date in words next to the calendar as well; a highlighted day alone is easy to miss.

## States

`disabled`, `focused`

## Tokens

`color.text`, `color.surface`, `color.action`, `color.focus-ring`, `radius.control`, `radius.panel`

## Examples

### Delivery date

```tsx
<Calendar label="配達日" defaultValue="2026-11-12" min="2026-11-05" locale="ja" />
```
