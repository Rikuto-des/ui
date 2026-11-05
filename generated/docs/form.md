# Form

A native <form> whose errors are shown in the page instead of the browser's bubbles. On submit the runtime checks every control (the constraints you write: required, type, min, pattern…), writes each message under its Field, lists them in a summary at the top with links to the controls, and moves focus to the summary. Fixing a control clears its message. Without the runtime the browser's own validation still runs.

- Tier: 2
- Rendering: server
- Requires: form validation (constraint validation API)
- Enhances with @urushi/core form behavior (fallback: the browser's validation bubbles, one at a time)

## When to use

- Any form with more than one or two fields
- Forms where several errors can happen at once

## When not to use

- A single search box → use `input`

## Parts

### `<Form>`

The <form>. Put Fields with their controls inside; onSubmit runs only when every control is valid. Renders `<form data-slot="form">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `summaryTitle` | `React.ReactNode` | `"入力内容を確認してください"` | Heading of the error summary. |

className may only adjust: margin, width, layout, position.

## Accessibility

- Put every control in a Field with an id, so its message has a place and the summary can link to it.
- Write the constraints on the controls (required, type, min, maxLength, pattern); call setCustomValidity for rules the browser cannot check.
- Errors from the server go in Field's error prop; they are shown as they are.

## States

`invalid`

## Tokens

`color.danger`

## Examples

### Sign up

```tsx
<Form onSubmit={save}>
  <Field id="signup-email" label="メールアドレス" required><Input type="email" /></Field>
  <Field id="signup-age" label="年齢"><Input type="number" min={18} /></Field>
  <Button type="submit" variant="primary">登録する</Button>
</Form>
```
