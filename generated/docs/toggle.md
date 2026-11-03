# Toggle

A button-looking on/off control. It is a native checkbox, so it works in forms and without JavaScript.

- Tier: 1
- Rendering: server
- Requires: 

## When to use

- Formatting in a toolbar (太字)
- Showing or hiding something in place

## When not to use

- A setting that applies at once in a list of settings → use `switch`
- One of several exclusive options → use `toggle-group`

## Parts

### `<Toggle>`

A <label> drawn as a button around a checkbox. Other props go to the checkbox. Renders `<input data-slot="toggle">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `"sm" \| "md" \| "lg"` | `"md"` |  |

className may only adjust: margin, layout, position.

## Accessibility

| Key | Behavior |
|---|---|
| Space | toggle |

- Icon-only toggles need aria-label.
- It is exposed as a checkbox (checked / not checked).

## States

`checked`

## Tokens

`color.ghost-hover`, `color.text`, `radius.control`

## Examples

### Bold

```tsx
<Toggle aria-label="太字"><BoldIcon /></Toggle>
```
