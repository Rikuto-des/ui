import { defineContract, z } from "@urushi/contract";

export default defineContract({
  name: "otp-input",
  styleDependencies: ["input"],
  tier: 1,
  summary: "A one-time code field: one native input drawn as separate boxes, with one-time-code autofill.",
  use: ["Codes sent by mail or SMS"],
  avoid: [{ case: "Passwords", instead: "input type=\"password\"" }],
  rendering: "server",
  platform: { requires: [] },
  parts: [
    {
      jsx: "OTPInput",
      slot: "otp-input",
      element: "input",
      description: "A single text input (inputmode=numeric, autocomplete=one-time-code, pattern) whose background draws the boxes.",
      props: z.object({
        length: z.number().int().min(4).max(8).default(6),
        invalid: z.boolean().default(false),
      }),
      overrides: ["margin", "layout", "position"],
    },
  ],
  states: ["invalid"],
  a11y: { rules: ["It is one field, so screen readers and paste work as for any input.", "Label it with a Field."] },
  tokens: ["color.field", "color.border-field", "radius.control"],
  examples: [{ title: "Sign-in code", code: `<Field id="code" label="確認コード"><OTPInput /></Field>` }],
});
