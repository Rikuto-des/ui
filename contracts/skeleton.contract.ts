import { defineContract, z } from "@urushi/contract";

export default defineContract({
  name: "skeleton",
  tier: 1,
  summary: "A placeholder shape shown while content loads.",
  use: ["Reserving the space of content that is still loading"],
  avoid: [{ case: "An action in progress", instead: "spinner" }],
  rendering: "server",
  platform: { requires: [] },
  parts: [
    {
      jsx: "Skeleton",
      slot: "skeleton",
      element: "div",
      description: "The placeholder. Hidden from assistive technology; announce loading elsewhere (aria-busy on the region).",
      props: z.object({
        shape: z.enum(["block", "text", "circle"]).default("block"),
        lines: z.number().int().min(1).max(8).default(1).describe("Number of text lines when shape is text."),
      }),
      overrides: ["margin", "width", "height", "layout", "position"],
    },
  ],
  states: [],
  a11y: { rules: ["Set aria-busy=\"true\" on the region that is loading."] },
  tokens: ["color.border", "radius.control"],
  examples: [{ title: "Text lines", code: `<Skeleton shape="text" lines={3} />` }],
});
