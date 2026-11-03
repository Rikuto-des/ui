import { defineContract, node, z } from "@urushi/contract";

export default defineContract({
  name: "sidebar",
  tier: 1,
  summary: "An app's side navigation: groups of links, optionally collapsible with native <details>.",
  use: ["The main navigation of an app with many sections"],
  avoid: [{ case: "A short list of top-level pages", instead: "a header nav" }],
  rendering: "server",
  platform: { requires: ["details"] },
  parts: [
    {
      jsx: "Sidebar",
      slot: "sidebar",
      element: "nav",
      description: "The nav landmark.",
      props: z.object({ label: z.string().min(1).describe("Required. Names the nav landmark.") }),
      overrides: ["margin", "width", "height", "layout", "position"],
    },
    {
      jsx: "Sidebar.Group",
      slot: "sidebar-group",
      element: "div",
      description: "A titled group of items. collapsible makes it a <details>.",
      props: z.object({
        title: node("Required group title."),
        collapsible: z.boolean().default(false),
        defaultOpen: z.boolean().default(true),
      }),
      overrides: [],
    },
    {
      jsx: "Sidebar.Item",
      slot: "sidebar-item",
      element: "a",
      description: "A link. The current page gets aria-current=\"page\".",
      props: z.object({
        href: z.string().min(1).describe("Required link target."),
        current: z.boolean().default(false),
        icon: node("Optional decorative icon.").optional(),
      }),
      overrides: [],
    },
  ],
  states: ["current", "open"],
  a11y: { rules: ["Exactly one item is current per page.", "Icons are decorative; the text names the link."] },
  tokens: ["color.text-muted", "color.ghost-hover", "radius.control"],
  examples: [
    {
      title: "App",
      code: `<Sidebar label="メイン">
  <Sidebar.Group title="プロジェクト">
    <Sidebar.Item href="/tasks" current>タスク</Sidebar.Item>
    <Sidebar.Item href="/members">メンバー</Sidebar.Item>
  </Sidebar.Group>
</Sidebar>`,
    },
  ],
});
