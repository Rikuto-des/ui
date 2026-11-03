import { defineContract, node, z } from "@urushi/contract";

export default defineContract({
  name: "table",
  tier: 1,
  summary: "A native <table> styled by the pack. You write thead, tbody, th and td as usual.",
  use: ["Comparing items across the same columns", "Lists with several attributes per row"],
  avoid: [{ case: "Laying out a page", instead: "CSS grid" }],
  rendering: "server",
  platform: { requires: [] },
  parts: [
    {
      jsx: "Table",
      slot: "table",
      element: "table",
      description: "The table inside a horizontally scrolling wrapper. Children are native thead / tbody / tr / th / td.",
      props: z.object({
        caption: node("Required. Names the table; hide it visually with hideCaption."),
        hideCaption: z.boolean().default(false),
        density: z.enum(["default", "compact"]).default("default"),
        striped: z.boolean().default(false),
      }),
      overrides: ["margin", "width", "layout", "position"],
    },
  ],
  states: [],
  a11y: { rules: ["caption is required: it is the table's accessible name.", "Use th with scope=\"col\" / scope=\"row\" for headers."] },
  tokens: ["color.border", "color.text-muted", "font.size.control"],
  examples: [
    {
      title: "Tasks",
      code: `<Table caption="タスク">
  <thead><tr><th scope="col">タスク</th><th scope="col">期限</th></tr></thead>
  <tbody><tr><td>告知メールの文面を確定する</td><td>10/24</td></tr></tbody>
</Table>`,
    },
  ],
});
