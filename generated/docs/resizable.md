# Resizable

Two panes split by a handle that changes their sizes, like a mail list beside the message. Drag the handle, or focus it and use the arrow keys (WAI-ARIA window splitter). Without the runtime the split stays at defaultSize.

- Tier: 2
- Rendering: server
- Requires: 
- Enhances with @urushi/core resizable behavior (fallback: the panes keep their default sizes)

## When to use

- A list beside its details in an application
- An editor beside its preview

## When not to use

- A page layout that should follow the screen size → use `CSS grid`
- Showing or hiding a side panel → use `sheet`

## Parts

### `<Resizable>`

The split: Resizable.Panel, Resizable.Handle, Resizable.Panel, in that order. Give it a height (or a parent that sets one) for a vertical split. Renders `<div data-slot="resizable">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | horizontal puts the panes side by side; vertical stacks them. |
| `defaultSize` | `number` | `50` | The first pane's share, in percent. |
| `min` | `number` | `20` | The smallest share of the first pane, in percent. |
| `max` | `number` | `80` | The largest share of the first pane, in percent. |

className may only adjust: margin, width, height, layout, position.

### `<Resizable.Panel>`

One pane. It scrolls when its content does not fit. Renders `<div data-slot="resizable-panel">`.

className may only adjust: nothing (visuals come from the pack).

### `<Resizable.Handle>`

The handle between the panes (role=separator, focusable). A thin line that thickens on hover and focus; grip adds a visible grip. Renders `<div data-slot="resizable-handle">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | **required** | Required. What the handle resizes, e.g. "一覧の幅". |
| `grip` | `boolean` | `false` | Show a grip in the middle, so it is visibly draggable. |

className may only adjust: nothing (visuals come from the pack).

## Accessibility

Pattern: windowsplitter

| Key | Behavior |
|---|---|
| ← → (horizontal) / ↑ ↓ (vertical) | move the handle by 2%; with Shift by 10% |
| Home / End | to the smallest or largest share |

- label is required; it names the handle.
- Put exactly two Resizable.Panel and one Resizable.Handle between them.
- Keep min large enough that the first pane stays usable.

## States

`focus-visible`, `dragging`

## Tokens

`color.border`, `color.focus-ring`, `color.border-strong`, `color.surface`

## Examples

### Mail list and message

```tsx
<Resizable defaultSize={35} min={25} max={60}>
  <Resizable.Panel>…一覧…</Resizable.Panel>
  <Resizable.Handle label="一覧の幅" />
  <Resizable.Panel>…本文…</Resizable.Panel>
</Resizable>
```
