# AlertDialog

A modal confirmation (role=alertdialog) that only its buttons can close.

- Tier: 2
- Rendering: server
- Requires: dialog, invoker-commands

## When to use

- Confirming something that cannot be undone

## When not to use

- A form or a longer task → use `dialog`

## Parts

### `<AlertDialog>`

A <dialog role="alertdialog" closedby="none">: Escape and clicks outside do not close it. Renders `<dialog data-slot="alert-dialog">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | **required** | Required. Triggers and buttons reference it. |
| `title` | `React.ReactNode` | **required** | Required. The question, e.g. "削除しますか？". |
| `description` | `React.ReactNode` | **required** | Required. What happens, in concrete terms. |

className may only adjust: nothing (visuals come from the pack).

### `<AlertDialog.Trigger>`

A Button that opens it. Renders `<button data-slot="alert-dialog-trigger">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `alertDialog` | `string` | **required** | Id of the alert dialog. |
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"secondary"` | primary is the single main action of a view. danger is for destructive actions. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Control height. Density comes from the pack, not from this prop. |

className may only adjust: margin, width, layout, position.

### `<AlertDialog.Cancel>`

The safe choice. It closes the dialog and gets focus when it opens. Renders `<button data-slot="alert-dialog-cancel">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `alertDialog` | `string` | **required** | Id of the alert dialog. |

className may only adjust: nothing (visuals come from the pack).

### `<AlertDialog.Action>`

The action. It closes the dialog; submit a form or add onClick to act. Renders `<button data-slot="alert-dialog-action">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `alertDialog` | `string` | **required** | Id of the alert dialog. |
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"danger"` | primary is the single main action of a view. danger is for destructive actions. |

className may only adjust: nothing (visuals come from the pack).

## Accessibility

Pattern: alertdialog

| Key | Behavior |
|---|---|
| Tab | moves focus within the dialog only |

- Initial focus: AlertDialog.Cancel
- Focus restore: the trigger
- title and description are required.
- Focus starts on the safe choice.

## States

`open`, `modal`

## Tokens

`color.surface-overlay`, `shadow.dialog`, `radius.dialog`

## Examples

### Delete

```tsx
<AlertDialog.Trigger alertDialog="delete" variant="danger">削除</AlertDialog.Trigger>
<AlertDialog id="delete" title="削除しますか？" description="タスク 5 件が消えます。取り消せません。">
  <AlertDialog.Cancel alertDialog="delete">キャンセル</AlertDialog.Cancel>
  <AlertDialog.Action alertDialog="delete">削除する</AlertDialog.Action>
</AlertDialog>
```
