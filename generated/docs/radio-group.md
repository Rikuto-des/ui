# RadioGroup

A <fieldset> of native radio buttons: exactly one choice, arrow keys move between them.

- Tier: 1
- Rendering: server
- Requires: appearance: none

## When to use

- Choosing exactly one of two to six visible options

## When not to use

- Many options or a long list → use `select`
- Any number of choices → use `checkbox`

## Parts

### `<RadioGroup>`

The fieldset with its legend. Gives every RadioGroup.Item the group's name. Renders `<fieldset data-slot="radio-group">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | **required** | Required form field name shared by the items. |
| `legend` | `React.ReactNode` | **required** | Required visible question or label for the group. |
| `defaultValue` | `string` | — | Value of the item checked initially. |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` |  |
| `required` | `boolean` | `false` |  |

className may only adjust: margin, width, layout, position.

### `<RadioGroup.Item>`

One option: a <label> around a native radio input. Renders `<label data-slot="radio">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | **required** | Required submitted value. |
| `description` | `React.ReactNode` | — | Supporting text under the option label. |

className may only adjust: nothing (visuals come from the pack).

## Accessibility

Pattern: radio group (native)

| Key | Behavior |
|---|---|
| Arrow keys | move and select |
| Tab | enters at the checked option |

- legend is required; it is the group's accessible name.

## States

`checked`, `focus-visible`, `disabled`

## Tokens

`color.accent`, `color.field`, `color.border-strong`

## Examples

### Plan

```tsx
<RadioGroup name="plan" legend="プラン" defaultValue="team">
  <RadioGroup.Item value="free">無料</RadioGroup.Item>
  <RadioGroup.Item value="team" description="5 人まで">チーム</RadioGroup.Item>
</RadioGroup>
```
