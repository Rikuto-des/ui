import { defineContract, z } from "@yourlib/contract";

export default defineContract({
  name: "input",
  tier: 1,
  summary: "A native single-line <input> styled by the pack.",
  use: ["Short free text, email, numbers, dates, search"],
  avoid: [{ case: "Several lines of text", instead: "textarea" }, { case: "Picking from a known list", instead: "select" }],
  rendering: "server",
  platform: { requires: [":user-invalid"] },
  parts: [
    {
      jsx: "Input",
      slot: "input",
      element: "input",
      description: "The input. All native attributes (type, name, required, pattern…) pass through.",
      props: z.object({
        size: z.enum(["sm", "md", "lg"]).default("md").describe("Control height, matching Button sizes."),
        invalid: z.boolean().default(false).describe("Shows the error style and sets aria-invalid."),
      }),
      overrides: ["margin", "width", "layout", "position"],
    },
  ],
  states: ["focus-visible", "invalid", "user-invalid", "disabled", "read-only"],
  a11y: { rules: ["Wrap in Field so it has a label.", "Use the right type and autocomplete for the data."] },
  tokens: ["color.field", "color.border-strong", "color.accent", "radius.control", "control.*"],
  examples: [{ title: "Email", code: `<Field id="email" label="メールアドレス"><Input type="email" name="email" autoComplete="email" /></Field>` }],
});
