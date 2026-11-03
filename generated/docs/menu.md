# Menu

A list of actions in a popover (menu button pattern), with optional submenus. Opens without JavaScript; the runtime adds arrow keys, typeahead and submenu hover.

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

### `<Menu.Sub>`

A submenu: an item (role=menuitem, aria-haspopup=menu) that opens a nested menu of its children. On wide screens it flies out beside the item and flips at the viewport edge; on narrow screens (640px and below) the runtime opens it in place, indented under the item. Without JavaScript a click opens the flyout. Renders `<div data-slot="menu-sub">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | **required** | Required. The item text and the nested menu's accessible name. |

className may only adjust: nothing (visuals come from the pack).

## Accessibility

Pattern: menu button

| Key | Behavior |
|---|---|
| ↑ / ↓ | move between items |
| Home / End | first / last item |
| Letters | jump to the next item starting with them |
| → / Enter / Space on a Menu.Sub | open the submenu on its first item |
| ← in a submenu | close it and return to its item |
| Escape | close the innermost menu and return focus to its trigger or item |
| Tab | close |

- Items are verbs (編集, 複製, 削除).
- Put destructive items last, after a Menu.Separator.
- Nest one level of Menu.Sub at most; deeper choices belong in a dialog.

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

### Submenu

```tsx
<Menu id="task-actions" label="タスクの操作">
  <Menu.Item>編集する</Menu.Item>
  <Menu.Sub label="担当者を変える">
    <Menu.Item>佐藤 美咲</Menu.Item>
    <Menu.Item>鈴木 健太</Menu.Item>
  </Menu.Sub>
</Menu>
```
