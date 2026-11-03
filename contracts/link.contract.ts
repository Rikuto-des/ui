import { defineContract, z } from "@urushi/contract";

export default defineContract({
  name: "link",
  tier: 1,
  summary: "A native <a> that navigates to another page or place.",
  use: ["Navigating to another page", "Linking to an external site"],
  avoid: [{ case: "Running an action on the current page", instead: "button" }],
  rendering: "server",
  platform: { requires: [] },
  parts: [
    {
      jsx: "Link",
      slot: "link",
      element: "a",
      description: "The anchor. Underlined so it never relies on color alone.",
      props: z.object({
        href: z.string().min(1).describe("Destination URL."),
        variant: z.enum(["inline", "standalone"]).default("inline").describe("inline: inside running text. standalone: on its own line or in a list."),
        external: z.boolean().default(false).describe("Opens in a new tab and says so to screen readers."),
      }),
      overrides: ["margin", "width", "layout", "position"],
    },
  ],
  states: ["hover", "focus-visible", "visited"],
  a11y: { rules: ["Link text names the destination; never 'here' or 'more'.", "External links announce that they open a new tab."] },
  tokens: ["color.link", "focus-ring.*"],
  examples: [{ title: "Inline link", code: `<p>詳しくは<Link href="/docs">使い方ガイド</Link>をご覧ください。</p>` }],
});
