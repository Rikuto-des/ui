import { defineContract, node, z } from "@urushi/contract";

export default defineContract({
  name: "switch",
  tier: 1,
  summary: "A native checkbox with role=\"switch\" for settings that take effect immediately.",
  use: ["Turning a setting on or off right away"],
  avoid: [{ case: "A choice that is submitted with a form", instead: "checkbox" }],
  rendering: "server",
  platform: { requires: ["appearance: none"] },
  parts: [
    {
      jsx: "Switch",
      slot: "switch",
      element: "label",
      description: "A <label> around <input type=\"checkbox\" role=\"switch\">.",
      props: z.object({
        description: node("Supporting text under the label.").optional(),
        showState: z.boolean().default(false).describe("Adds on/off marks to the track so its state is also visible without relying on color."),
      }),
      overrides: ["margin", "width", "layout", "position"],
    },
  ],
  states: ["checked", "focus-visible", "disabled"],
  a11y: { keyboard: { Space: "toggle" }, rules: ["The label names the setting, not its state ('通知', not '通知をオンにする')."] },
  tokens: ["color.accent", "color.border-strong", "motion.fast"],
  examples: [{ title: "Notifications", code: `<Switch name="notify" defaultChecked>メール通知</Switch>` }],
});
