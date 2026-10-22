# Select

A native <select>; with appearance: base-select its picker follows the pack.

- Tier: 2
- Rendering: server
- Requires: 
- Enhances with appearance: base-select (fallback: the platform's own picker)

## When to use

- Choosing one option from a list of about 5 to 15

## When not to use

- Two to five visible options → use `radio-group`
- Actions → use `menu`

## Parts

### `<Select>`

The select. Children are native <option> and <optgroup> elements. Renders `<select data-slot="select">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `"sm" \| "md" \| "lg"` | `"md"` |  |
| `invalid` | `boolean` | `false` |  |
| `placeholder` | `string` | — | Adds a disabled first option shown until a choice is made. |

className may only adjust: margin, width, layout, position.

## Accessibility

| Key | Behavior |
|---|---|
| Arrow keys | move |
| Enter | choose |

- Wrap in Field so it has a label.

## States

`open`, `focus-visible`, `invalid`, `disabled`

## Tokens

`color.field`, `color.surface-overlay`, `shadow.overlay`, `radius.control`

## Examples

### Assignee

```tsx
<Field id="owner" label="担当"><Select name="owner" placeholder="選択してください"><option>山田</option><option>佐藤</option></Select></Field>
```
