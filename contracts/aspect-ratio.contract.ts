import { defineContract, z } from "@urushi/contract";

export default defineContract({
  name: "aspect-ratio",
  tier: 1,
  summary: "A box that keeps a ratio (CSS aspect-ratio); its media fills it.",
  use: ["Thumbnails, video embeds, maps"],
  avoid: [{ case: "A square avatar", instead: "avatar" }],
  rendering: "server",
  platform: { requires: ["aspect-ratio"] },
  parts: [
    {
      jsx: "AspectRatio",
      slot: "aspect-ratio",
      element: "div",
      description: "The box. An img, video or iframe inside fills it with object-fit: cover.",
      props: z.object({ ratio: z.string().regex(/^\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?$/).default("16 / 9").describe("Width / height, e.g. \"4 / 3\".") }),
      overrides: ["margin", "width", "layout", "position"],
    },
  ],
  states: [],
  a11y: { rules: ["The media inside still needs its own alt text or title."] },
  tokens: ["radius.panel"],
  examples: [{ title: "Thumbnail", code: `<AspectRatio ratio="4 / 3"><img src="/photo.jpg" alt="会場の様子" /></AspectRatio>` }],
});
