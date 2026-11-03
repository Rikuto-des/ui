# Breadcrumb

Where the page sits in the site: a nav with an ordered list of links.

- Tier: 1
- Rendering: server
- Requires: 

## When to use

- Pages more than two levels deep

## When not to use

- Steps of a process → use `steps`

## Parts

### `<Breadcrumb>`

The nav landmark and its list. Renders `<nav data-slot="breadcrumb">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `"パンくずリスト"` | Names the nav landmark. |

className may only adjust: margin, width, layout, position.

### `<Breadcrumb.Item>`

One level: a link, or the current page (aria-current="page"). Renders `<li data-slot="breadcrumb-item">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `href` | `string` | — | Link target; leave out for the current page. |
| `current` | `boolean` | `false` |  |

className may only adjust: nothing (visuals come from the pack).

## Accessibility

- The last item is the current page.
- Separators are drawn by CSS and not read.

## States

`current`

## Tokens

`color.text-muted`, `color.link`

## Examples

### Settings

```tsx
<Breadcrumb>
  <Breadcrumb.Item href="/">ホーム</Breadcrumb.Item>
  <Breadcrumb.Item href="/settings">設定</Breadcrumb.Item>
  <Breadcrumb.Item current>通知</Breadcrumb.Item>
</Breadcrumb>
```
