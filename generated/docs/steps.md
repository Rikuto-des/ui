# Steps

Where the user is in a fixed sequence: an ordered list with aria-current="step".

- Tier: 1
- Rendering: server
- Requires: 

## When to use

- Sign-up or checkout steps
- A setup checklist

## When not to use

- Switching between views → use `tabs`

## Parts

### `<Steps>`

The ordered list. Renders `<ol data-slot="steps">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | **required** | Required. Names the sequence, e.g. "申し込みの手順". |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |  |

className may only adjust: margin, width, layout, position.

### `<Steps.Item>`

One step. The current one gets aria-current="step"; each says its state in hidden text. Renders `<li data-slot="steps-item">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `React.ReactNode` | **required** | Required step name. |
| `description` | `React.ReactNode` | — | Optional detail. |
| `status` | `"done" \| "current" \| "upcoming"` | `"upcoming"` |  |

className may only adjust: nothing (visuals come from the pack).

## Accessibility

- Exactly one step is current.
- State is spoken (完了 / 現在の手順), not only shown by color.

## States

`done`, `current`, `upcoming`

## Tokens

`color.accent`, `color.on-action`, `color.border-strong`

## Examples

### Sign-up

```tsx
<Steps label="申し込みの手順">
  <Steps.Item title="アカウント" status="done" />
  <Steps.Item title="お支払い" status="current" />
  <Steps.Item title="確認" />
</Steps>
```
