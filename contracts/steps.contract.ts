import { defineContract, node, z } from "@urushi/contract";

export default defineContract({
  name: "steps",
  tier: 1,
  summary: "Where the user is in a fixed sequence: an ordered list with aria-current=\"step\".",
  use: ["Sign-up or checkout steps", "A setup checklist"],
  avoid: [{ case: "Switching between views", instead: "tabs" }],
  rendering: "server",
  platform: { requires: [] },
  parts: [
    {
      jsx: "Steps",
      slot: "steps",
      element: "ol",
      description: "The ordered list.",
      props: z.object({
        label: z.string().min(1).describe("Required. Names the sequence, e.g. \"申し込みの手順\"."),
        orientation: z.enum(["horizontal", "vertical"]).default("horizontal"),
      }),
      overrides: ["margin", "width", "layout", "position"],
    },
    {
      jsx: "Steps.Item",
      slot: "steps-item",
      element: "li",
      description: "One step. The current one gets aria-current=\"step\"; each says its state in hidden text.",
      props: z.object({
        title: node("Required step name."),
        description: node("Optional detail.").optional(),
        status: z.enum(["done", "current", "upcoming"]).default("upcoming"),
      }),
      overrides: [],
    },
  ],
  states: ["done", "current", "upcoming"],
  a11y: { rules: ["Exactly one step is current.", "State is spoken (完了 / 現在の手順), not only shown by color."] },
  tokens: ["color.accent", "color.on-action", "color.border-strong"],
  examples: [
    {
      title: "Sign-up",
      code: `<Steps label="申し込みの手順">
  <Steps.Item title="アカウント" status="done" />
  <Steps.Item title="お支払い" status="current" />
  <Steps.Item title="確認" />
</Steps>`,
    },
  ],
});
