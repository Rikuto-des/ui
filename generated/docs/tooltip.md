# Tooltip

A short description shown on hover and keyboard focus: popover="hint" opened through interestfor.

- Tier: 2
- Rendering: server
- Requires: popover=hint, anchor-positioning
- Enhances with interestfor (fallback: @yourlib/core tooltip behavior (loaded by <YourlibRuntime />))

## When to use

- Naming or describing an icon button
- A keyboard shortcut hint

## When not to use

- Anything interactive or essential → use `popover`
- Long explanations → use `popover`

## Parts

### `<Tooltip>`

The tooltip (role=tooltip, popover=hint). Renders `<div data-slot="tooltip">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | **required** | Required. The trigger references it. |
| `side` | `"top" \| "bottom" \| "start" \| "end"` | `"top"` |  |
| `align` | `"start" \| "center" \| "end"` | `"center"` |  |

className may only adjust: nothing (visuals come from the pack).

### `<Tooltip.Trigger>`

A Button that shows the tooltip on hover and focus and is described by it. Renders `<button data-slot="tooltip-trigger">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `tooltip` | `string` | **required** | Id of the tooltip. |
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"secondary"` | primary is the single main action of a view. danger is for destructive actions. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Control height. Density comes from the pack, not from this prop. |

className may only adjust: margin, width, layout, position.

## Accessibility

| Key | Behavior |
|---|---|
| Focus | shows the tooltip |
| Escape | hides it |

- The trigger still needs its own name (aria-label for icon buttons); the tooltip only describes it.
- Never put links or buttons in a tooltip.

## States

`open`

## Tokens

`color.text`, `color.bg`, `radius.control`, `motion.fast`

## Examples

### Icon button

```tsx
<Tooltip.Trigger tooltip="tip-copy" aria-label="コピー" variant="ghost">⧉</Tooltip.Trigger>
<Tooltip id="tip-copy">クリップボードにコピー（⌘C）</Tooltip>
```
