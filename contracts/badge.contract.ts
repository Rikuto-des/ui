import { defineContract, z } from "@urushi/contract";

export default defineContract({
  name: "badge",
  tier: 1,
  summary: "A short status or count label.",
  use: ["Status of an item (対応中, 完了)", "A count next to a label"],
  avoid: [{ case: "An action", instead: "button" }],
  rendering: "server",
  platform: { requires: [] },
  parts: [
    {
      jsx: "Badge",
      slot: "badge",
      element: "span",
      description: "The badge. Its text carries the meaning; tone only reinforces it.",
      props: z.object({
        tone: z.enum(["neutral", "accent", "ok", "danger"]).default("neutral"),
        dot: z.boolean().default(false).describe("Shows a small status dot before the text."),
      }),
      overrides: ["margin", "layout", "position"],
    },
  ],
  states: [],
  a11y: { rules: ["Never rely on tone alone; the text states the status."] },
  tokens: ["color.accent", "color.ok", "color.danger", "color.text-muted"],
  examples: [{ title: "Status", code: `<Badge tone="danger" dot>期限切れ</Badge>` }],
});
