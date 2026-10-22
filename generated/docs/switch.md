# Switch

A native checkbox with role="switch" for settings that take effect immediately.

- Tier: 1
- Rendering: server
- Requires: appearance: none

## When to use

- Turning a setting on or off right away

## When not to use

- A choice that is submitted with a form → use `checkbox`

## Parts

### `<Switch>`

A <label> around <input type="checkbox" role="switch">. Renders `<label data-slot="switch">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `description` | `React.ReactNode` | — | Supporting text under the label. |

className may only adjust: margin, width, layout, position.

## Accessibility

| Key | Behavior |
|---|---|
| Space | toggle |

- The label names the setting, not its state ('通知', not '通知をオンにする').

## States

`checked`, `focus-visible`, `disabled`

## Tokens

`color.accent`, `color.border-strong`, `motion.fast`

## Examples

### Notifications

```tsx
<Switch name="notify" defaultChecked>メール通知</Switch>
```
