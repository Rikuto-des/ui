# Progress

How far a task has got, in a native <progress> with a visible label.

- Tier: 1
- Rendering: server
- Requires: progress

## When to use

- Uploads, imports, multi-step processes

## When not to use

- A measurement within a range (disk usage, a score) → use `meter`
- Waiting with no known length → use `spinner`

## Parts

### `<Progress>`

A label and a <progress>. Without value it is indeterminate. Renders `<progress data-slot="progress">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `React.ReactNode` | **required** | Required visible label; it names the progress bar. |
| `value` | `number` | — | Current amount. Leave out while the total is unknown. |
| `max` | `number` | `100` |  |
| `milestones` | `readonly { value: number; label: string }[]` | — | Labelled checkpoints in the same units as value and max. |
| `valueText` | `string` | — | Readable progress, e.g. 3 of 8 files. Also announced by assistive technology. |
| `showValue` | `boolean` | `true` | Shows the percentage next to the label. |

className may only adjust: margin, width, layout, position.

## Accessibility

- label is required; it is linked with aria-labelledby.

## States

`indeterminate`

## Tokens

`color.accent`, `color.track`

## Examples

### Upload

```tsx
<Progress label="写真をアップロード中" value={42} />
```
