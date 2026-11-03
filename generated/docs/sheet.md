# Sheet

A modal <dialog> that slides in from an edge of the screen.

- Tier: 2
- Rendering: server
- Requires: dialog, invoker-commands
- Enhances with dialog-closedby (fallback: @urushi/core/closedby (loaded by <UrushiRuntime />))

## When to use

- Details or a form next to a list
- Navigation or filters on small screens

## When not to use

- A short confirmation → use `alert-dialog`

## Parts

### `<Sheet>`

The <dialog>, pinned to one edge. Renders `<dialog data-slot="sheet">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | **required** | Required. Triggers and close buttons reference it. |
| `title` | `React.ReactNode` | **required** | Required heading and accessible name. |
| `description` | `React.ReactNode` | — | Optional supporting text. |
| `side` | `"start" \| "end" \| "top" \| "bottom"` | `"end"` | The edge it slides from (start/end follow the writing direction). |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` |  |
| `dismissible` | `"any" \| "closerequest" \| "none"` | `"any"` |  |

className may only adjust: nothing (visuals come from the pack).

### `<Sheet.Trigger>`

A Button that opens the sheet. Renders `<button data-slot="sheet-trigger">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `sheet` | `string` | **required** | Id of the sheet to open. |
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"secondary"` | primary is the single main action of a view. danger is for destructive actions. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Control height. Density comes from the pack, not from this prop. |

className may only adjust: margin, width, layout, position.

### `<Sheet.Close>`

A Button that closes the sheet. Renders `<button data-slot="sheet-close">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `sheet` | `string` | **required** | Id of the sheet to close. |
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"secondary"` | primary is the single main action of a view. danger is for destructive actions. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Control height. Density comes from the pack, not from this prop. |

className may only adjust: margin, width, layout, position.

## Accessibility

Pattern: dialog-modal

| Key | Behavior |
|---|---|
| Escape | close (unless dismissible="none") |
| Tab | moves focus within the sheet only |

- title is required.
- Every trigger and close button references an existing Sheet id.

## States

`open`, `modal`

## Tokens

`color.surface-overlay`, `shadow.dialog`, `motion.overlay`

## Examples

### Task details

```tsx
<Sheet.Trigger sheet="task">詳細</Sheet.Trigger>
<Sheet id="task" title="告知メールの文面を確定する">…</Sheet>
```
