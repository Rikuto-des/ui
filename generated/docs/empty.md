# Empty

What a list or page shows when there is nothing in it yet, and how to start.

- Tier: 1
- Rendering: server
- Requires: 

## When to use

- An empty list, no search results, a first-run screen

## When not to use

- An error → use `alert`

## Parts

### `<Empty>`

A centered title, explanation and action. Renders `<div data-slot="empty">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `React.ReactNode` | **required** | Required. Says what is empty, e.g. "まだタスクがありません". |
| `description` | `React.ReactNode` | — | Optional: why, or what to do. |
| `action` | `React.ReactNode` | — | Optional: the action that fills it, usually a primary Button. |
| `icon` | `React.ReactNode` | — | Optional decorative icon. |

className may only adjust: margin, width, height, layout, position.

## Accessibility

- The icon is decorative (aria-hidden); the title carries the meaning.

## States



## Tokens

`color.text-muted`

## Examples

### No tasks

```tsx
<Empty title="まだタスクがありません" description="最初のタスクを追加しましょう。" action={<Button variant="primary">タスクを追加</Button>} />
```
