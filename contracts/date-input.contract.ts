import { defineContract, z } from "@urushi/contract";

export default defineContract({
  name: "date-input",
  styleDependencies: ["input"],
  tier: 1,
  summary: "A native date or time input with the browser's own picker, drawn like Input.",
  use: ["A date, time or month where typing or the system picker is enough"],
  avoid: [{ case: "Picking from a visible calendar on the page", instead: "a date picker (planned)" }],
  rendering: "server",
  platform: { requires: ["input[type=date]"] },
  parts: [
    {
      jsx: "DateInput",
      slot: "date-input",
      element: "input",
      description: "<input type=\"date\"> (or time / datetime-local / month). Put it in a Field.",
      props: z.object({
        type: z.enum(["date", "time", "datetime-local", "month"]).default("date"),
        size: z.enum(["sm", "md", "lg"]).default("md"),
        invalid: z.boolean().default(false),
      }),
      overrides: ["margin", "width", "layout", "position"],
    },
  ],
  states: ["invalid"],
  a11y: { rules: ["Label it with a Field; min and max are announced by the browser."] },
  tokens: ["color.field", "color.border-field"],
  examples: [{ title: "Due date", code: `<Field id="due" label="期限"><DateInput min="2026-10-01" /></Field>` }],
});
