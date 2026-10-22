# Popover

A non-modal panel in the top layer (native `popover`), positioned against its trigger with CSS anchor positioning.

- Tier: 2
- Rendering: server
- Requires: popover, anchor-positioning, invoker-commands, @starting-style
- Enhances with overlay-transition (fallback: the popover closes without an exit animation)

## When to use

- Filters or settings attached to a control
- Supplementary content that keeps the page usable

## When not to use

- A task that must be finished before continuing → use `dialog`
- A list of actions → use `menu`
- A short label on hover → use `tooltip`

## Parts

### `<Popover>`

The popover panel (role=dialog, popover=auto). Renders `<div data-slot="popover">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | **required** | Required. Triggers and close buttons reference it. |
| `title` | `React.ReactNode` | — | Accessible title rendered as a heading. Provide title or aria-label. |
| `side` | `"top" \| "bottom" \| "start" \| "end"` | `"bottom"` | Logical side: start/end follow the writing direction. |
| `align` | `"start" \| "center" \| "end"` | `"start"` |  |
| `mode` | `"auto" \| "manual"` | `"auto"` | auto: light dismiss (Escape / outside click) and closes other auto popovers. manual: only explicit commands. |

className may only adjust: width, height.

### `<Popover.Trigger>`

A Button that toggles the popover and acts as its anchor. Renders `<button data-slot="popover-trigger">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `popover` | `string` | **required** | Id of the popover to toggle. |
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"secondary"` | primary is the single main action of a view. danger is for destructive actions. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Control height. Density comes from the pack, not from this prop. |

className may only adjust: margin, width, layout, position.

### `<Popover.Close>`

A Button that hides the popover. Renders `<button data-slot="popover-close">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `popover` | `string` | **required** | Id of the popover to hide. |
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"secondary"` | primary is the single main action of a view. danger is for destructive actions. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Control height. Density comes from the pack, not from this prop. |

className may only adjust: margin, width, layout, position.

## Accessibility

Pattern: disclosure (non-modal dialog)

| Key | Behavior |
|---|---|
| Escape | close (mode=auto) |
| Tab | moves from the trigger into the popover, then back to the page |

- Initial focus: stays on the trigger unless an element inside has autofocus
- Focus restore: the trigger, when focus was inside
- Provide title or aria-label so the panel has an accessible name.
- Every Popover.Trigger and Popover.Close must reference an existing Popover id.

## States

`open`

## Tokens

`color.surface.overlay`, `radius.overlay`, `shadow.overlay`, `motion.overlay`, `popover.offset`

## Examples

### Filters next to a button

```tsx
<Popover.Trigger popover="filters">Filters</Popover.Trigger>
<Popover id="filters" title="Filters" side="bottom" align="start">…</Popover>
```
