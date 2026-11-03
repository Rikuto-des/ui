# ButtonGroup

Buttons that belong together, joined into one shape (role=group).

- Tier: 1
- Rendering: server
- Requires: 

## When to use

- Related actions on one object
- A split between an action and its menu

## When not to use

- Choosing one of several options → use `toggle-group`

## Parts

### `<ButtonGroup>`

role=group named by label. Inner corners and borders between the buttons are removed. Renders `<div data-slot="button-group">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | **required** | Required. Names the group. |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |  |

className may only adjust: margin, layout, position.

## Accessibility

- label is required: a group needs a name.

## States



## Tokens

`radius.control`, `color.border-control`

## Examples

### Copy / share

```tsx
<ButtonGroup label="リンク"><Button>コピー</Button><Button>共有</Button></ButtonGroup>
```
