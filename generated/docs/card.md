# Card

A surface that groups related content, with an optional title, description and footer.

- Tier: 1
- Rendering: server
- Requires: 

## When to use

- A self-contained group of content or settings

## When not to use

- Wrapping every block on a page (use spacing instead) → use `separator`

## Parts

### `<Card>`

The surface. Header and footer render only when given. Renders `<div data-slot="card">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `React.ReactNode` | — | Heading of the card. |
| `description` | `React.ReactNode` | — | Supporting text under the title. |
| `footer` | `React.ReactNode` | — | Actions or meta at the bottom. |
| `headingLevel` | `"h2" \| "h3" \| "h4"` | `"h3"` | Keeps the page's heading outline correct. |
| `selected` | `boolean` | `false` | Selection styling. Provide a real button, checkbox or radio to change selection. |
| `padding` | `"sm" \| "md" \| "lg"` | `"md"` |  |

className may only adjust: margin, width, height, layout, position.

## Accessibility

- Pick headingLevel so headings stay in order on the page.

## States



## Tokens

`color.surface`, `shadow.panel`, `radius.panel`, `space.*`

## Examples

### Settings card

```tsx
<Card title="通知" description="受け取る通知を選びます。" footer={<Button>保存</Button>}>…</Card>
```
