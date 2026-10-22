# Field

Labels a single form control and links its description and error message to it.

- Tier: 1
- Rendering: server
- Requires: :user-invalid

## When to use

- Every text input, textarea and select in a form

## When not to use

- A checkbox or switch (they carry their own label) → use `checkbox`
- A group of radio buttons → use `radio-group`

## Parts

### `<Field>`

Wraps one control (its only child) and gives it id, aria-describedby, aria-invalid and required. Renders `<div data-slot="field">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | **required** | Required. Becomes the control's id; the label points at it. |
| `label` | `React.ReactNode` | **required** | Required visible label. |
| `description` | `React.ReactNode` | — | Hint shown under the label, linked with aria-describedby. |
| `error` | `React.ReactNode` | — | Error message; marks the control aria-invalid and links the message. |
| `required` | `boolean` | `false` | Marks the control required and shows a visual marker. |
| `hideLabel` | `boolean` | `false` | Keeps the label for screen readers only. Use sparingly. |

className may only adjust: margin, width, layout, position.

## Accessibility

- Every control has a visible label; hideLabel only when the context already labels it visually.
- Error messages say what is wrong and how to fix it.

## States

`invalid`, `required`, `disabled`

## Tokens

`color.text-muted`, `color.danger`, `space.*`

## Examples

### Email with an error

```tsx
<Field id="email" label="メールアドレス" error="@ を含むアドレスを入力してください。" required>
  <Input type="email" name="email" />
</Field>
```
