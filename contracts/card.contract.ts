import { defineContract, node, z } from "@yourlib/contract";

export default defineContract({
  name: "card",
  tier: 1,
  summary: "A surface that groups related content, with an optional title, description and footer.",
  use: ["A self-contained group of content or settings"],
  avoid: [{ case: "Wrapping every block on a page (use spacing instead)", instead: "separator" }],
  rendering: "server",
  platform: { requires: [] },
  parts: [
    {
      jsx: "Card",
      slot: "card",
      element: "div",
      description: "The surface. Header and footer render only when given.",
      props: z.object({
        title: node("Heading of the card.").optional(),
        description: node("Supporting text under the title.").optional(),
        footer: node("Actions or meta at the bottom.").optional(),
        headingLevel: z.enum(["h2", "h3", "h4"]).default("h3").describe("Keeps the page's heading outline correct."),
        padding: z.enum(["sm", "md", "lg"]).default("md"),
      }),
      overrides: ["margin", "width", "height", "layout", "position"],
    },
  ],
  states: [],
  a11y: { rules: ["Pick headingLevel so headings stay in order on the page."] },
  tokens: ["color.surface", "shadow.panel", "radius.panel", "space.*"],
  examples: [{ title: "Settings card", code: `<Card title="通知" description="受け取る通知を選びます。" footer={<Button>保存</Button>}>…</Card>` }],
});
