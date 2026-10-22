import { defineContract, node, z } from "@yourlib/contract";

export default defineContract({
  name: "field",
  tier: 1,
  summary: "Labels a single form control and links its description and error message to it.",
  use: ["Every text input, textarea and select in a form"],
  avoid: [
    { case: "A checkbox or switch (they carry their own label)", instead: "checkbox" },
    { case: "A group of radio buttons", instead: "radio-group" },
  ],
  rendering: "server",
  platform: { requires: [":user-invalid"] },
  parts: [
    {
      jsx: "Field",
      slot: "field",
      element: "div",
      description: "Wraps one control (its only child) and gives it id, aria-describedby, aria-invalid and required.",
      props: z.object({
        id: z.string().min(1).describe("Required. Becomes the control's id; the label points at it."),
        label: node("Required visible label."),
        description: node("Hint shown under the label, linked with aria-describedby.").optional(),
        error: node("Error message; marks the control aria-invalid and links the message.").optional(),
        required: z.boolean().default(false).describe("Marks the control required and shows a visual marker."),
        hideLabel: z.boolean().default(false).describe("Keeps the label for screen readers only. Use sparingly."),
      }),
      overrides: ["margin", "width", "layout", "position"],
    },
  ],
  states: ["invalid", "required", "disabled"],
  a11y: {
    rules: [
      "Every control has a visible label; hideLabel only when the context already labels it visually.",
      "Error messages say what is wrong and how to fix it.",
    ],
  },
  tokens: ["color.text-muted", "color.danger", "space.*"],
  examples: [
    {
      title: "Email with an error",
      code: `<Field id="email" label="メールアドレス" error="@ を含むアドレスを入力してください。" required>
  <Input type="email" name="email" />
</Field>`,
    },
  ],
});
