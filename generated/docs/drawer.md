# Drawer

A modal <dialog> that slides up from the bottom with a handle, and closes when dragged down. A bottom Sheet for phones: the runtime adds the drag; without it, Escape, the backdrop and Drawer.Close still close it.

- Tier: 2
- Rendering: server
- Requires: dialog, invoker-commands
- Enhances with dialog-closedby (fallback: @urushi/core/closedby (loaded by <UrushiRuntime />))
- Enhances with @urushi/core drawer behavior (fallback: no drag; it closes with Escape, the backdrop or Drawer.Close)

## When to use

- A short form or a choice on a phone
- Details of a list row on small screens

## When not to use

- A panel beside a list on large screens → use `sheet`
- A short confirmation → use `alert-dialog`

## Parts

### `<Drawer>`

The <dialog>, along the bottom edge, with a handle above the title. Drag the handle or the title down to close it. Renders `<dialog data-slot="drawer">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | **required** | Required. Triggers and close buttons reference it. |
| `title` | `React.ReactNode` | **required** | Required heading and accessible name. |
| `description` | `React.ReactNode` | — | Optional supporting text. |
| `dismissible` | `"any" \| "closerequest" \| "none"` | `"any"` | none also turns off closing by drag. |

className may only adjust: nothing (visuals come from the pack).

### `<Drawer.Trigger>`

A Button that opens the drawer. Renders `<button data-slot="drawer-trigger">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `drawer` | `string` | **required** | Id of the drawer to open. |
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"secondary"` | primary is the single main action of a view. danger is for destructive actions. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Control height. Density comes from the pack, not from this prop. |

className may only adjust: margin, width, layout, position.

### `<Drawer.Close>`

A Button that closes the drawer. Renders `<button data-slot="drawer-close">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `drawer` | `string` | **required** | Id of the drawer to close. |
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"secondary"` | primary is the single main action of a view. danger is for destructive actions. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Control height. Density comes from the pack, not from this prop. |

className may only adjust: margin, width, layout, position.

## Accessibility

Pattern: dialog-modal

| Key | Behavior |
|---|---|
| Escape | close (unless dismissible="none") |
| Tab | moves focus within the drawer only |

- title is required.
- The handle is decorative: give every drawer a visible way to close it (a Drawer.Close, or an action that closes it).
- Every trigger and close button references an existing Drawer id.

## States

`open`, `modal`

## Tokens

`color.surface-overlay`, `color.border-strong`, `shadow.dialog`, `motion.overlay`

## Examples

### Add an event

```tsx
<Drawer.Trigger drawer="add-event" variant="primary">予定を追加</Drawer.Trigger>
<Drawer id="add-event" title="予定を追加">
  <Field label="題名"><Input /></Field>
  <Drawer.Close drawer="add-event">やめる</Drawer.Close>
</Drawer>
```
