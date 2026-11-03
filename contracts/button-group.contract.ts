import { defineContract, z } from "@urushi/contract";

export default defineContract({
  name: "button-group",
  tier: 1,
  summary: "Buttons that belong together, joined into one shape (role=group).",
  use: ["Related actions on one object", "A split between an action and its menu"],
  avoid: [{ case: "Choosing one of several options", instead: "toggle-group" }],
  rendering: "server",
  platform: { requires: [] },
  parts: [
    {
      jsx: "ButtonGroup",
      slot: "button-group",
      element: "div",
      description: "role=group named by label. Inner corners and borders between the buttons are removed.",
      props: z.object({
        label: z.string().min(1).describe("Required. Names the group."),
        orientation: z.enum(["horizontal", "vertical"]).default("horizontal"),
      }),
      overrides: ["margin", "layout", "position"],
    },
  ],
  states: [],
  a11y: { rules: ["label is required: a group needs a name."] },
  tokens: ["radius.control", "color.border-control"],
  examples: [{ title: "Copy / share", code: `<ButtonGroup label="リンク"><Button>コピー</Button><Button>共有</Button></ButtonGroup>` }],
});
