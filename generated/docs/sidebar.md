# Sidebar

An app's side navigation: groups of links, optionally collapsible with native <details>.

- Tier: 1
- Rendering: server
- Requires: details

## When to use

- The main navigation of an app with many sections

## When not to use

- A short list of top-level pages → use `a header nav`

## Parts

### `<Sidebar>`

The nav landmark. Renders `<nav data-slot="sidebar">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | **required** | Required. Names the nav landmark. |

className may only adjust: margin, width, height, layout, position.

### `<Sidebar.Group>`

A titled group of items. collapsible makes it a <details>. Renders `<div data-slot="sidebar-group">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `React.ReactNode` | **required** | Required group title. |
| `collapsible` | `boolean` | `false` |  |
| `defaultOpen` | `boolean` | `true` |  |

className may only adjust: nothing (visuals come from the pack).

### `<Sidebar.Item>`

A link. The current page gets aria-current="page". Renders `<a data-slot="sidebar-item">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `href` | `string` | **required** | Required link target. |
| `current` | `boolean` | `false` |  |
| `icon` | `React.ReactNode` | — | Optional decorative icon. |

className may only adjust: nothing (visuals come from the pack).

## Accessibility

- Exactly one item is current per page.
- Icons are decorative; the text names the link.

## States

`current`, `open`

## Tokens

`color.text-muted`, `color.ghost-hover`, `radius.control`

## Examples

### App

```tsx
<Sidebar label="メイン">
  <Sidebar.Group title="プロジェクト">
    <Sidebar.Item href="/tasks" current>タスク</Sidebar.Item>
    <Sidebar.Item href="/members">メンバー</Sidebar.Item>
  </Sidebar.Group>
</Sidebar>
```
