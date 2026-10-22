import { defineContract, z } from "@yourlib/contract";

export default defineContract({
  name: "textarea",
  tier: 1,
  summary: "A native <textarea> that grows with its content (field-sizing).",
  use: ["Comments, descriptions and other multi-line text"],
  avoid: [{ case: "A single line", instead: "input" }],
  rendering: "server",
  platform: { requires: [], enhances: [{ feature: "field-sizing", fallback: "fixed height of `rows` lines" }] },
  parts: [
    {
      jsx: "Textarea",
      slot: "textarea",
      element: "textarea",
      description: "The textarea. All native attributes pass through.",
      props: z.object({
        rows: z.number().int().min(1).default(3).describe("Minimum visible lines."),
        autoResize: z.boolean().default(true).describe("Grow with the content up to 12 lines."),
        invalid: z.boolean().default(false),
      }),
      overrides: ["margin", "width", "height", "layout", "position"],
    },
  ],
  states: ["focus-visible", "invalid", "user-invalid", "disabled"],
  a11y: { rules: ["Wrap in Field so it has a label."] },
  tokens: ["color.field", "color.border-strong", "radius.control"],
  examples: [{ title: "Comment", code: `<Field id="comment" label="コメント"><Textarea name="comment" rows={4} /></Field>` }],
});
