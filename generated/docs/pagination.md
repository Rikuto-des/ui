# Pagination

Links to the pages of a long list: previous, numbered pages with gaps, next.

- Tier: 1
- Rendering: server
- Requires: 

## When to use

- Search results and lists split into pages

## When not to use

- A feed that loads more as you scroll → use `a load-more Button`

## Parts

### `<Pagination>`

A nav of links. Each link's href comes from the template, so it works without JavaScript. Renders `<nav data-slot="pagination">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `page` | `number` | **required** | Required. The current page. |
| `total` | `number` | **required** | Required. The number of pages. |
| `href` | `string` | **required** | Required URL template; {page} is replaced, e.g. "/tasks?page={page}". |
| `siblings` | `number` | `1` | Pages shown on each side of the current one. |
| `label` | `string` | `"ページ送り"` |  |

className may only adjust: margin, width, layout, position.

## Accessibility

- The current page has aria-current="page"; each number says "n ページ目".

## States

`current`

## Tokens

`color.text`, `color.ghost-hover`, `color.field`, `shadow.control`

## Examples

### Tasks

```tsx
<Pagination page={3} total={12} href="/tasks?page={page}" />
```
