# Table

A native <table> styled by the pack. You write thead, tbody, th and td as usual.

- Tier: 1
- Rendering: server
- Requires: 

## When to use

- Comparing items across the same columns
- Lists with several attributes per row

## When not to use

- Laying out a page → use `CSS grid`

## Parts

### `<Table>`

The table inside a horizontally scrolling wrapper. Children are native thead / tbody / tr / th / td. Renders `<table data-slot="table">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `caption` | `React.ReactNode` | **required** | Required. Names the table; hide it visually with hideCaption. |
| `hideCaption` | `boolean` | `false` |  |
| `density` | `"default" \| "compact"` | `"default"` |  |
| `striped` | `boolean` | `false` |  |

className may only adjust: margin, width, layout, position.

## Accessibility

- caption is required: it is the table's accessible name.
- Use th with scope="col" / scope="row" for headers.

## States



## Tokens

`color.border`, `color.text-muted`, `font.size.control`

## Examples

### Tasks

```tsx
<Table caption="タスク">
  <thead><tr><th scope="col">タスク</th><th scope="col">期限</th></tr></thead>
  <tbody><tr><td>告知メールの文面を確定する</td><td>10/24</td></tr></tbody>
</Table>
```
