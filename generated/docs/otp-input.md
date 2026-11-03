# OTPInput

A one-time code field: one native input drawn as separate boxes, with one-time-code autofill.

- Tier: 1
- Rendering: server
- Requires: 

## When to use

- Codes sent by mail or SMS

## When not to use

- Passwords → use `input type="password"`

## Parts

### `<OTPInput>`

A single text input (inputmode=numeric, autocomplete=one-time-code, pattern) whose background draws the boxes. Renders `<input data-slot="otp-input">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `length` | `number` | `6` |  |
| `invalid` | `boolean` | `false` |  |

className may only adjust: margin, layout, position.

## Accessibility

- It is one field, so screen readers and paste work as for any input.
- Label it with a Field.

## States

`invalid`

## Tokens

`color.field`, `color.border-field`, `radius.control`

## Examples

### Sign-in code

```tsx
<Field id="code" label="確認コード"><OTPInput /></Field>
```
