# Dialog

A modal native <dialog> that interrupts the user for a confirmation or a short task.

- Tier: 2
- Rendering: server
- Requires: dialog, invoker-commands, :modal, @starting-style
- Enhances with dialog-closedby (fallback: @urushi/core/closedby (loaded by <UrushiRuntime />))
- Enhances with overlay-transition (fallback: the dialog closes without an exit animation)

## When to use

- Confirming a destructive action
- A short form that must be finished before continuing

## When not to use

- Showing supplementary information next to a control → use `popover`
- Reporting the result of an action → use `toast`

## Parts

### `<Dialog>`

The <dialog> element. Opened with showModal() by a trigger's `show-modal` command. Renders `<dialog data-slot="dialog">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | **required** | Required. Triggers and close buttons reference it. |
| `title` | `React.ReactNode` | **required** | Required accessible title, rendered as the dialog heading. |
| `description` | `React.ReactNode` | — | Optional supporting text, linked with aria-describedby. |
| `initialFocus` | `string` | — | Id of the element inside the dialog to focus after opening. Requires UrushiRuntime. Use this for dynamic React content, where autoFocus alone can run before showModal(). |
| `returnFocus` | `string` | — | Id of the element to focus after closing or removing an open dialog. Requires UrushiRuntime. Useful for programmatic opening and conditional rendering; native trigger restoration remains the default. |
| `dismissible` | `"any" \| "closerequest" \| "none"` | `"any"` | any: Escape or a click outside closes it. closerequest: Escape only. none: only explicit buttons. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Maximum inline size. |

className may only adjust: width.

### `<Dialog.Trigger>`

A Button that opens the dialog (command="show-modal"). Renders `<button data-slot="dialog-trigger">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `dialog` | `string` | **required** | Id of the dialog to open. |
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"secondary"` | primary is the single main action of a view. danger is for destructive actions. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Control height. Density comes from the pack, not from this prop. |

className may only adjust: margin, width, layout, position.

### `<Dialog.Close>`

A Button that closes the dialog with a native command after the click handler. Do not disable or unmount this button in that handler: it would cancel the native default action. For a successful mutation, use a normal Button and close the dialog ref before changing state. For async work, close only after success. Renders `<button data-slot="dialog-close">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `dialog` | `string` | **required** | Id of the dialog to close. |
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"secondary"` | primary is the single main action of a view. danger is for destructive actions. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Control height. Density comes from the pack, not from this prop. |

className may only adjust: margin, width, layout, position.

### `<Dialog.Actions>`

Footer row for the dialog's buttons. Put the primary action last. Renders `<div data-slot="dialog-actions">`.

className may only adjust: nothing (visuals come from the pack).

## Accessibility

Pattern: dialog-modal

| Key | Behavior |
|---|---|
| Escape | close (unless dismissible="none") |
| Tab | moves focus within the dialog only |

- Initial focus: first focusable element, or the element with autofocus
- Focus restore: the trigger
- Install UrushiRuntime to restore the clicked invoker after closing on Safari too; without it, pointer focus follows browser settings.
- For dynamically rendered React content, set initialFocus to an input or safe button id. React autoFocus can run before showModal(); initialFocus runs after the dialog opens. Set returnFocus to a stable trigger id when opening programmatically or unmounting the dialog.
- title is required; it becomes the accessible name through aria-labelledby.
- Every Dialog.Trigger and Dialog.Close must reference an existing Dialog id.
- Destructive confirmations should put focus on the safe action with autofocus.
- For client-side mutations, hold a ref<HTMLDialogElement> on Dialog. On success call ref.current?.close() before removing the trigger or changing state. Use Button for that action; Dialog.Close is suitable for Cancel.

## States

`open`, `modal`

## Tokens

`color.surface.overlay`, `color.backdrop`, `radius.overlay`, `shadow.overlay`, `motion.overlay`, `dialog.size.*`

## Examples

### Confirm a destructive action

```tsx
<Dialog.Trigger dialog="confirm-delete" variant="danger">Delete</Dialog.Trigger>
<Dialog id="confirm-delete" title="Delete this project?" description="This cannot be undone.">
  <Dialog.Actions>
    <Dialog.Close dialog="confirm-delete" autoFocus>Cancel</Dialog.Close>
    <Button variant="danger" type="submit" form="delete-form">Delete</Button>
  </Dialog.Actions>
</Dialog>
```
