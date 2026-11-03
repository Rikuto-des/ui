# ToggleGroup

A segmented control: native radios (one choice) or checkboxes (several) drawn as one row of buttons.

- Tier: 1
- Rendering: server
- Requires: 

## When to use

- Choosing a view (リスト / ボード)
- Text alignment in a toolbar

## When not to use

- Navigation between pages → use `tabs or links`

## Parts

### `<ToggleGroup>`

A fieldset; items get its name and type. Renders `<fieldset data-slot="toggle-group">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `legend` | `string` | **required** | Required. Names the group. |
| `hideLegend` | `boolean` | `true` | Keeps the legend for screen readers only. |
| `name` | `string` | **required** | Required form name shared by the items. |
| `type` | `"single" \| "multiple"` | `"single"` | single: radios. multiple: checkboxes. |
| `defaultValue` | `string` | — | single: the item checked initially. |
| `size` | `"sm" \| "md"` | `"md"` |  |

className may only adjust: margin, width, layout, position.

### `<ToggleGroup.Item>`

One segment: a radio or checkbox inside a <label>. Renders `<input data-slot="toggle-group-item">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | **required** | Required form value. |

className may only adjust: nothing (visuals come from the pack).

## Accessibility

| Key | Behavior |
|---|---|
| ← / → | move the choice (single) |
| Space | toggle (multiple) |

- legend is required even when hidden.
- Icon-only items need aria-label.

## States

`checked`

## Tokens

`color.field`, `color.text-muted`, `shadow.control`

## Examples

### View

```tsx
<ToggleGroup legend="表示" name="view" defaultValue="list">
  <ToggleGroup.Item value="list">リスト</ToggleGroup.Item>
  <ToggleGroup.Item value="board">ボード</ToggleGroup.Item>
</ToggleGroup>
```
