import { defineContract, z } from "@urushi/contract";

export default defineContract({
  name: "avatar",
  tier: 1,
  summary: "A person's picture, or their initial when there is no picture or it fails to load.",
  use: ["Who wrote, owns or is assigned something"],
  avoid: [{ case: "A logo or an illustration", instead: "img" }],
  rendering: "server",
  platform: { requires: [] },
  parts: [
    {
      jsx: "Avatar",
      slot: "avatar",
      element: "span",
      description: "role=img named by `name`. The initial sits behind the picture and shows if it is missing or broken (no JavaScript).",
      props: z.object({
        name: z.string().min(1).describe("Required. The person's name: the accessible name and the source of the initial."),
        status: z.enum(["online", "away", "busy", "offline"]).optional().describe("Presence indicator. Include a localized statusLabel."),
        statusLabel: z.string().optional().describe("Accessible presence text, appended to the name."),
        src: z.string().optional().describe("Optional picture URL."),
        size: z.enum(["sm", "md", "lg"]).default("md"),
      }),
      overrides: ["margin", "layout", "position"],
    },
  ],
  states: [],
  a11y: { rules: ["name is required; the picture itself is decorative."] },
  tokens: ["color.surface", "color.text-muted"],
  examples: [{ title: "Assignee", code: `<Avatar name="佐藤 美咲" src="/people/sato.jpg" />` }],
});
