# Checkbox

A native checkbox with its own label.

- Tier: 1
- Rendering: server
- Requires: appearance: none

## When to use

- Choosing any number of options
- Confirming a single statement (agree to terms)

## When not to use

- A setting that applies immediately → use `switch`
- Exactly one of several options → use `radio-group`

## Parts

### `<Checkbox>`

A <label> around the native <input type="checkbox">. Input attributes (name, value, checked…) go to the input. Renders `<label data-slot="checkbox">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `description` | `React.ReactNode` | — | Supporting text under the label. Linked with aria-describedby when id is set. |
| `invalid` | `boolean` | `false` |  |

className may only adjust: margin, width, layout, position.

## Accessibility

| Key | Behavior |
|---|---|
| Space | toggle |

- children is the label; never leave it empty.

## States

`checked`, `focus-visible`, `disabled`, `invalid`

## Tokens

`color.accent`, `color.field`, `color.border-strong`, `radius.checkbox`

## Examples

### Agree

```tsx
<Checkbox name="terms" required>利用規約に同意します</Checkbox>
```
