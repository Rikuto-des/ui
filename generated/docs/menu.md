# Menu

A list of actions in a popover (menu button pattern). Opens without JavaScript; the runtime adds arrow keys and typeahead.

- Tier: 3
- Rendering: server
- Requires: popover, anchor-positioning
- Enhances with @urushi/core menu behavior (fallback: items are reachable with Tab)

## When to use

- Secondary actions on an item (編集・複製・削除)

## When not to use

- Choosing a value → use `select`
- Navigation → use `link`

## Parts

### `<Menu>`

The menu popover (role=menu). Renders `<div data-slot="menu">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | **required** | Required. The trigger references it. |
| `label` | `string` | **required** | Required accessible name of the menu. |
| `side` | `"top" \| "bottom" \| "start" \| "end"` | `"bottom"` |  |
| `align` | `"start" \| "center" \| "end"` | `"start"` |  |

className may only adjust: width.

### `<Menu.Trigger>`

A Button that toggles the menu (aria-haspopup=menu). Renders `<button data-slot="menu-trigger">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `menu` | `string` | **required** | Id of the menu. |
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"secondary"` | primary is the single main action of a view. danger is for destructive actions. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Control height. Density comes from the pack, not from this prop. |

className may only adjust: margin, width, layout, position.

### `<Menu.Item>`

An action (role=menuitem). Activating it closes the menu. Renders `<button data-slot="menu-item">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"default" \| "danger"` | `"default"` |  |
| `description` | `string` | — | Secondary explanation of the action. |
| `shortcut` | `string` | — | Displayed hint; app registers the shortcut. |

className may only adjust: nothing (visuals come from the pack).

### `<Menu.Link>`

A navigation item (role=menuitem). Renders `<a data-slot="menu-link">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `href` | `string` | **required** |  |

className may only adjust: nothing (visuals come from the pack).

### `<Menu.Separator>`

A rule between groups of items. Renders `<div data-slot="menu-separator">`.

className may only adjust: nothing (visuals come from the pack).

## Accessibility

Pattern: menu button

| Key | Behavior |
|---|---|
| ↑ / ↓ | move between items |
| Home / End | first / last item |
| Letters | jump to the next item starting with them |
| Escape | close and return focus to the trigger |
| Tab | close |

- Items are verbs (編集, 複製, 削除).
- Put destructive items last, after a Menu.Separator.

## States

`open`

## Tokens

`color.surface-overlay`, `shadow.overlay`, `radius.overlay`, `color.ghost-hover`, `color.danger`

## Examples

### Row actions

```tsx
<Menu.Trigger menu="row-actions" variant="ghost" aria-label="操作">…</Menu.Trigger>
<Menu id="row-actions" label="タスクの操作">
  <Menu.Item>編集</Menu.Item>
  <Menu.Item>複製</Menu.Item>
  <Menu.Separator />
  <Menu.Item variant="danger">削除</Menu.Item>
</Menu>
```
