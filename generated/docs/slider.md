# Slider

A native range input with optional live value feedback and directly selectable labelled marks.

- Tier: 1
- Rendering: server
- Requires: accent-color

## When to use

- An approximate value where the exact number matters less (音量, 明るさ)

## When not to use

- An exact number → use `input`

## Parts

### `<Slider>`

The range input. Put it in a Field for its label; min, max, step and value are native. Renders `<input data-slot="slider">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `showValue` | `boolean` | `false` | Shows a value bubble following the thumb. Requires UrushiRuntime for live feedback; the range itself works without JavaScript. |
| `valueSuffix` | `string` | `""` | Visible unit appended to the value, such as % or px. Use aria-valuetext for a spoken custom unit. |
| `marks` | `readonly import("../slider.tsx").SliderMark[]` | — | Positions with {value,label?}. UrushiRuntime makes them selectable and sends native input/change events, including to React onChange. Keep labels short and sparse. |

className may only adjust: margin, width, layout, position.

## Accessibility

| Key | Behavior |
|---|---|
| ← / → / ↑ / ↓ | step |
| Home / End | min / max |
| Page Up / Page Down | larger steps |

- Label it with a Field.

## States



## Tokens

`color.accent`

## Examples

### Volume

```tsx
<Field id="volume" label="音量"><Slider min={0} max={100} defaultValue={60} /></Field>
```
