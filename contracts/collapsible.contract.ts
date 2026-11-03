import { defineContract, node, z } from "@urushi/contract";

export default defineContract({
  name: "collapsible",
  tier: 1,
  summary: "One section that opens and closes: a native <details>.",
  use: ["Advanced options under a form", "Details most people skip"],
  avoid: [{ case: "Several sections in a row", instead: "accordion" }],
  rendering: "server",
  platform: { requires: ["details"], enhances: [{ feature: "::details-content + interpolate-size", fallback: "opens without animation" }] },
  parts: [
    {
      jsx: "Collapsible",
      slot: "collapsible",
      element: "details",
      description: "The <details>, with the title in its <summary>.",
      props: z.object({ title: node("Required summary text."), description: node("Optional summary of the contents or current settings, visible while closed.").optional(), defaultOpen: z.boolean().default(false) }),
      overrides: ["margin", "width", "layout", "position"],
    },
  ],
  states: ["open"],
  a11y: { keyboard: { "Enter / Space": "toggle" }, rules: ["The title says what is inside."] },
  tokens: ["color.text-muted", "motion.overlay"],
  examples: [{ title: "Advanced", code: `<Collapsible title="詳細な設定">…</Collapsible>` }],
});
