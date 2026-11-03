# Meter

A measurement within a known range, in a native <meter> that colors itself by low / high / optimum.

- Tier: 1
- Rendering: server
- Requires: meter

## When to use

- Storage used, a quota, a score

## When not to use

- How far a task has got → use `progress`

## Parts

### `<Meter>`

A label, the value as text and a <meter>. Renders `<meter data-slot="meter">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `React.ReactNode` | **required** | Required visible label; it names the meter. |
| `value` | `number` | **required** | Required. The measured value. |
| `min` | `number` | `0` |  |
| `max` | `number` | `100` |  |
| `low` | `number` | — | Below this the value is low. |
| `high` | `number` | — | Above this the value is high. |
| `optimum` | `number` | — | The best value; the browser colors the bar by how far the value is from it. |
| `valueText` | `React.ReactNode` | — | Optional text shown for the value, e.g. "8.2 GB / 10 GB". Defaults to the percentage. |

className may only adjust: margin, width, layout, position.

## Accessibility

- label is required; it is linked with aria-labelledby.
- Say the value in text too: color alone does not tell how full it is.

## States

`optimum`, `suboptimum`, `even-less-good`

## Tokens

`color.ok`, `color.accent`, `color.danger`, `color.track`

## Examples

### Storage

```tsx
<Meter label="使用容量" value={82} high={80} optimum={0} valueText="8.2 GB / 10 GB" />
```
