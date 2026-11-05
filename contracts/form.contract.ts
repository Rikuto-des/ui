import { defineContract, node, z } from "@urushi/contract";

export default defineContract({
  name: "form",
  styleDependencies: ["alert", "field"],
  tier: 2,
  summary:
    "A native <form> whose errors are shown in the page instead of the browser's bubbles. On submit the runtime checks every control (the constraints you write: required, type, min, pattern…), writes each message under its Field, lists them in a summary at the top with links to the controls, and moves focus to the summary. Fixing a control clears its message. Without the runtime the browser's own validation still runs.",
  use: ["Any form with more than one or two fields", "Forms where several errors can happen at once"],
  avoid: [{ case: "A single search box", instead: "input" }],
  rendering: "server",
  platform: {
    requires: ["form validation (constraint validation API)"],
    enhances: [{ feature: "@urushi/core form behavior", fallback: "the browser's validation bubbles, one at a time" }],
  },
  parts: [
    {
      jsx: "Form",
      slot: "form",
      element: "form",
      description: "The <form>. Put Fields with their controls inside; onSubmit runs only when every control is valid.",
      props: z.object({
        summaryTitle: node("Heading of the error summary.").default("入力内容を確認してください"),
      }),
      overrides: ["margin", "width", "layout", "position"],
    },
  ],
  states: ["invalid"],
  a11y: {
    rules: [
      "Put every control in a Field with an id, so its message has a place and the summary can link to it.",
      "Write the constraints on the controls (required, type, min, maxLength, pattern); call setCustomValidity for rules the browser cannot check.",
      "Errors from the server go in Field's error prop; they are shown as they are.",
    ],
  },
  tokens: ["color.danger"],
  examples: [
    {
      title: "Sign up",
      code: `<Form onSubmit={save}>
  <Field id="signup-email" label="メールアドレス" required><Input type="email" /></Field>
  <Field id="signup-age" label="年齢"><Input type="number" min={18} /></Field>
  <Button type="submit" variant="primary">登録する</Button>
</Form>`,
    },
  ],
});
