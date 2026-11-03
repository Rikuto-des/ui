import { defineContract, z } from "@urushi/contract";

export default defineContract({
  name: "breadcrumb",
  tier: 1,
  summary: "Where the page sits in the site: a nav with an ordered list of links.",
  use: ["Pages more than two levels deep"],
  avoid: [{ case: "Steps of a process", instead: "steps" }],
  rendering: "server",
  platform: { requires: [] },
  parts: [
    {
      jsx: "Breadcrumb",
      slot: "breadcrumb",
      element: "nav",
      description: "The nav landmark and its list.",
      props: z.object({ label: z.string().min(1).default("パンくずリスト").describe("Names the nav landmark.") }),
      overrides: ["margin", "width", "layout", "position"],
    },
    {
      jsx: "Breadcrumb.Item",
      slot: "breadcrumb-item",
      element: "li",
      description: "One level: a link, or the current page (aria-current=\"page\").",
      props: z.object({
        href: z.string().optional().describe("Link target; leave out for the current page."),
        current: z.boolean().default(false),
      }),
      overrides: [],
    },
  ],
  states: ["current"],
  a11y: { rules: ["The last item is the current page.", "Separators are drawn by CSS and not read."] },
  tokens: ["color.text-muted", "color.link"],
  examples: [
    {
      title: "Settings",
      code: `<Breadcrumb>
  <Breadcrumb.Item href="/">ホーム</Breadcrumb.Item>
  <Breadcrumb.Item href="/settings">設定</Breadcrumb.Item>
  <Breadcrumb.Item current>通知</Breadcrumb.Item>
</Breadcrumb>`,
    },
  ],
});
