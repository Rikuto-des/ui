import { defineContract, node, z } from "@yourlib/contract";

export default defineContract({
  name: "radio-group",
  tier: 1,
  summary: "A <fieldset> of native radio buttons: exactly one choice, arrow keys move between them.",
  use: ["Choosing exactly one of two to six visible options"],
  avoid: [{ case: "Many options or a long list", instead: "select" }, { case: "Any number of choices", instead: "checkbox" }],
  rendering: "server",
  platform: { requires: ["appearance: none"] },
  parts: [
    {
      jsx: "RadioGroup",
      slot: "radio-group",
      element: "fieldset",
      description: "The fieldset with its legend. Gives every RadioGroup.Item the group's name.",
      props: z.object({
        name: z.string().min(1).describe("Required form field name shared by the items."),
        legend: node("Required visible question or label for the group."),
        defaultValue: z.string().optional().describe("Value of the item checked initially."),
        orientation: z.enum(["vertical", "horizontal"]).default("vertical"),
        required: z.boolean().default(false),
      }),
      overrides: ["margin", "width", "layout", "position"],
    },
    {
      jsx: "RadioGroup.Item",
      slot: "radio",
      element: "label",
      description: "One option: a <label> around a native radio input.",
      props: z.object({
        value: z.string().describe("Required submitted value."),
        description: node("Supporting text under the option label.").optional(),
      }),
      overrides: [],
    },
  ],
  states: ["checked", "focus-visible", "disabled"],
  a11y: {
    apg: "radio group (native)",
    keyboard: { "Arrow keys": "move and select", Tab: "enters at the checked option" },
    rules: ["legend is required; it is the group's accessible name."],
  },
  tokens: ["color.accent", "color.field", "color.border-strong"],
  examples: [
    {
      title: "Plan",
      code: `<RadioGroup name="plan" legend="プラン" defaultValue="team">
  <RadioGroup.Item value="free">無料</RadioGroup.Item>
  <RadioGroup.Item value="team" description="5 人まで">チーム</RadioGroup.Item>
</RadioGroup>`,
    },
  ],
});
