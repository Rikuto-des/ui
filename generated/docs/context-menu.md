# ContextMenu

A menu of actions that opens where the user right-clicks an area, long-presses it on touch, or presses Shift+F10 inside it. Its items are Menu's (Menu.Item, Menu.Separator, Menu.Sub) and behave the same way.

- Tier: 3
- Rendering: server
- Requires: popover, anchor-positioning
- Enhances with @urushi/core context-menu behavior (fallback: the browser's own context menu)

## When to use

- Shortcuts for actions on an item in a list, a file or a canvas (名前を変更・複製・削除)

## When not to use

- The only way to reach an action → use `menu`
- Actions on a button the user clicks → use `menu`

## Parts

### `<ContextMenu>`

The menu popover (role=menu), placed at the pointer, or under the focused element when opened from the keyboard. It flips at the viewport edges. Put Menu.Item, Menu.Link, Menu.Separator and Menu.Sub inside. Renders `<div data-slot="context-menu">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | **required** | Required. The area references it. |
| `label` | `string` | **required** | Required accessible name of the menu. |

className may only adjust: width.

### `<ContextMenu.Area>`

The region that opens the menu: right-click, a long press on touch, or Shift+F10 / the Menu key while focus is inside it. It adds no focus stop of its own; keyboard users reach it through the focusable elements it contains. Renders `<div data-slot="context-menu-area">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `menu` | `string` | **required** | Id of the context menu. |

className may only adjust: margin, width, layout, position.

## Accessibility

Pattern: menu

| Key | Behavior |
|---|---|
| Shift+F10 / Menu key | open the menu on its first item, under the focused element |
| ↑ / ↓ | move between items |
| Home / End | first / last item |
| Letters | jump to the next item starting with them |
| → / Enter / Space on a Menu.Sub | open the submenu on its first item |
| Escape | close the innermost menu and return focus to where it was |
| Tab | close |

- A context menu is hidden: every action in it must also be reachable another way (a Menu.Trigger, a button or a shortcut).
- Items are verbs (名前を変更, 複製, 削除).
- Put destructive items last, after a Menu.Separator.

## States

`open`

## Tokens

`color.surface-overlay`, `shadow.overlay`, `radius.overlay`, `color.ghost-hover`, `color.danger`

## Examples

### File actions

```tsx
<ContextMenu.Area menu="file-actions">
  <ul>…</ul>
</ContextMenu.Area>
<ContextMenu id="file-actions" label="ファイルの操作">
  <Menu.Item shortcut="F2">名前を変更</Menu.Item>
  <Menu.Item>複製</Menu.Item>
  <Menu.Separator />
  <Menu.Item variant="danger">削除</Menu.Item>
</ContextMenu>
```
