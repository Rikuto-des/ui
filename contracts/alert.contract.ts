import { defineContract, node, z } from "@urushi/contract";

export default defineContract({
  name: "alert",
  tier: 1,
  summary: "A callout in the page: a title, supporting text and an optional action, in a tone.",
  use: ["A notice that stays on the page (maintenance, a limit reached)", "The result of a page-level check"],
  avoid: [
    { case: "Reporting the result of an action that just happened", instead: "toast" },
    { case: "An error on one input", instead: "field" },
  ],
  rendering: "server",
  platform: { requires: [] },
  parts: [
    {
      jsx: "Alert",
      slot: "alert",
      element: "div",
      description: "The callout. The title states the point; tone only reinforces it.",
      props: z.object({
        title: node("Required. One line that states the point."),
        tone: z.enum(["neutral", "accent", "ok", "warning", "danger"]).default("neutral"),
        action: node("Optional action, e.g. a Link or a small Button.").optional(),
      }),
      overrides: ["margin", "width", "layout", "position"],
    },
  ],
  states: [],
  a11y: { rules: ["Never rely on tone alone; the title says what happened.", "Not a live region: for news that arrives later, use a toast."] },
  tokens: ["color.accent", "color.ok", "color.warning", "color.danger", "color.text", "radius.panel"],
  examples: [{ title: "Maintenance notice", code: `<Alert tone="accent" title="10 月 30 日 2:00〜4:00 にメンテナンスを行います">この間は申し込みを受け付けられません。</Alert>` }],
});
