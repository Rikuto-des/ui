import { defineContract, z } from "@urushi/contract";

export default defineContract({
  name: "toggle-group",
  tier: 1,
  summary: "A segmented control: native radios (one choice) or checkboxes (several) drawn as one row of buttons.",
  use: ["Choosing a view (リスト / ボード)", "Text alignment in a toolbar"],
  avoid: [{ case: "Navigation between pages", instead: "tabs or links" }],
  rendering: "server",
  platform: { requires: [] },
  parts: [
    {
      jsx: "ToggleGroup",
      slot: "toggle-group",
      element: "fieldset",
      description: "A fieldset; items get its name and type.",
      props: z.object({
        legend: z.string().min(1).describe("Required. Names the group."),
        hideLegend: z.boolean().default(true).describe("Keeps the legend for screen readers only."),
        name: z.string().min(1).describe("Required form name shared by the items."),
        type: z.enum(["single", "multiple"]).default("single").describe("single: radios. multiple: checkboxes."),
        defaultValue: z.string().optional().describe("single: the item checked initially."),
        size: z.enum(["sm", "md"]).default("md"),
      }),
      overrides: ["margin", "width", "layout", "position"],
    },
    {
      jsx: "ToggleGroup.Item",
      slot: "toggle-group-item",
      element: "input",
      description: "One segment: a radio or checkbox inside a <label>.",
      props: z.object({ value: z.string().describe("Required form value.") }),
      overrides: [],
    },
  ],
  states: ["checked"],
  a11y: { keyboard: { "← / →": "move the choice (single)", Space: "toggle (multiple)" }, rules: ["legend is required even when hidden.", "Icon-only items need aria-label."] },
  tokens: ["color.field", "color.text-muted", "shadow.control"],
  examples: [
    {
      title: "View",
      code: `<ToggleGroup legend="表示" name="view" defaultValue="list">
  <ToggleGroup.Item value="list">リスト</ToggleGroup.Item>
  <ToggleGroup.Item value="board">ボード</ToggleGroup.Item>
</ToggleGroup>`,
    },
  ],
});
