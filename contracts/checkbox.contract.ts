import { defineContract, node, z } from "@yourlib/contract";

export default defineContract({
  name: "checkbox",
  tier: 1,
  summary: "A native checkbox with its own label.",
  use: ["Choosing any number of options", "Confirming a single statement (agree to terms)"],
  avoid: [{ case: "A setting that applies immediately", instead: "switch" }, { case: "Exactly one of several options", instead: "radio-group" }],
  rendering: "server",
  platform: { requires: ["appearance: none"] },
  parts: [
    {
      jsx: "Checkbox",
      slot: "checkbox",
      element: "label",
      description: "A <label> around the native <input type=\"checkbox\">. Input attributes (name, value, checked…) go to the input.",
      props: z.object({
        description: node("Supporting text under the label. Linked with aria-describedby when id is set.").optional(),
        invalid: z.boolean().default(false),
      }),
      overrides: ["margin", "width", "layout", "position"],
    },
  ],
  states: ["checked", "focus-visible", "disabled", "invalid"],
  a11y: { keyboard: { Space: "toggle" }, rules: ["children is the label; never leave it empty."] },
  tokens: ["color.accent", "color.field", "color.border-strong", "radius.checkbox"],
  examples: [{ title: "Agree", code: `<Checkbox name="terms" required>利用規約に同意します</Checkbox>` }],
});
