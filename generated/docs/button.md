# Button

A native <button> that runs or confirms an action.

- Tier: 1
- Rendering: server
- Requires: invoker-commands
- Enhances with corner-shape (fallback: border-radius only)

## When to use

- Submitting a form
- Confirming a dialog
- Opening a dialog or popover through `command`

## When not to use

- Navigating to another page → use `link`
- Toggling a setting on and off → use `switch`

## Parts

### `<Button>`

The button itself. Defaults to type="button" so it never submits by accident. Renders `<button data-slot="button">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"secondary"` | primary is the single main action of a view. danger is for destructive actions. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Control height. Density comes from the pack, not from this prop. |
| `loading` | `boolean` | `false` | While true the button reports aria-disabled, ignores activation and never submits a form. |
| `command` | `"show-modal" \| "close" \| "request-close" \| "toggle-popover" \| "show-popover" \| "hide-popover"` | — | Invoker command (HTML `command` attribute). Works without JavaScript. |
| `commandfor` | `string` | — | Id of the dialog or popover the command targets (HTML `commandfor`). |

className may only adjust: margin, width, layout, position.

## Accessibility

Pattern: button

| Key | Behavior |
|---|---|
| Enter | activate |
| Space | activate |

- An icon-only button needs aria-label.
- Use at most one primary button per view.
- Loading buttons stay focusable (aria-disabled), they are never natively disabled.

## States

`disabled`, `loading`, `hover`, `active`, `focus-visible`

## Tokens

`color.action`, `color.secondary`, `color.danger`, `radius.control`, `control.*`, `motion.fast`

## Examples

### Primary action

```tsx
<Button variant="primary" type="submit">Save</Button>
```

### Open a dialog without JavaScript

```tsx
<Button command="show-modal" commandfor="confirm">Delete</Button>
```
