# Toaster

Brief notifications about the result of an action. Place one <Toaster /> per page and call toast() from client code.

- Tier: 2
- Rendering: server
- Requires: popover=manual

## When to use

- Confirming that an action finished (保存しました)
- Reporting a recoverable failure

## When not to use

- Anything the user must decide → use `dialog`
- Errors in a form field → use `field`

## Parts

### `<Toaster>`

The live region toasts appear in. A manual popover so it stays above modal dialogs. Renders `<section data-slot="toaster">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `"通知"` | Accessible name of the region. |
| `position` | `"bottom-end" \| "bottom-center" \| "top-end"` | `"bottom-end"` |  |

className may only adjust: nothing (visuals come from the pack).

## Accessibility

- Messages are short and name the result in the same words as the action (保存 → 保存しました).
- Toasts are announced politely; never put the only copy of important information in one.

## States

`closing`, `loading`

## Tokens

`color.surface-overlay`, `shadow.overlay`, `radius.overlay`, `color.ok`, `color.danger`

## Examples

### After saving

```tsx
toast("保存しました", { tone: "ok" })
```

### Follow an async operation

```tsx
toast.promise(saveProject(), {
  loading: "保存しています…",
  success: "保存しました",
  error: "保存できませんでした",
})
```

### Update progress in place

```tsx
const id = toast("書き出しています…", { loading: true, progress: 0 })
toast.update(id, { progress: 50 })
toast.update(id, { message: "書き出しました", loading: false, progress: undefined, tone: "ok" })
```
