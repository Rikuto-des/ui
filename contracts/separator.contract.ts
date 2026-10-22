import { defineContract, z } from "@yourlib/contract";

export default defineContract({
  name: "separator",
  tier: 1,
  summary: "A thin rule between groups of content.",
  use: ["Separating groups when spacing alone is not enough"],
  avoid: [{ case: "Decorating every block", instead: "card" }],
  rendering: "server",
  platform: { requires: [] },
  parts: [
    {
      jsx: "Separator",
      slot: "separator",
      element: "hr",
      description: "<hr> (horizontal) or a vertical separator.",
      props: z.object({
        orientation: z.enum(["horizontal", "vertical"]).default("horizontal"),
        decorative: z.boolean().default(false).describe("Hide from assistive technology when it only decorates."),
      }),
      overrides: ["margin", "width", "height", "layout", "position"],
    },
  ],
  states: [],
  a11y: { rules: ["Use decorative when the rule adds no structure."] },
  tokens: ["color.border"],
  examples: [{ title: "Between groups", code: `<Separator />` }],
});
