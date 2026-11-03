# Alert

A callout in the page: a title, supporting text and an optional action, in a tone.

- Tier: 1
- Rendering: server
- Requires: 

## When to use

- A notice that stays on the page (maintenance, a limit reached)
- The result of a page-level check

## When not to use

- Reporting the result of an action that just happened → use `toast`
- An error on one input → use `field`

## Parts

### `<Alert>`

The callout. The title states the point; tone only reinforces it. Renders `<div data-slot="alert">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `React.ReactNode` | **required** | Required. One line that states the point. |
| `tone` | `"neutral" \| "accent" \| "ok" \| "warning" \| "danger"` | `"neutral"` |  |
| `action` | `React.ReactNode` | — | Optional action, e.g. a Link or a small Button. |

className may only adjust: margin, width, layout, position.

## Accessibility

- Never rely on tone alone; the title says what happened.
- Not a live region: for news that arrives later, use a toast.

## States



## Tokens

`color.accent`, `color.ok`, `color.warning`, `color.danger`, `color.text`, `radius.panel`

## Examples

### Maintenance notice

```tsx
<Alert tone="accent" title="10 月 30 日 2:00〜4:00 にメンテナンスを行います">この間は申し込みを受け付けられません。</Alert>
```
