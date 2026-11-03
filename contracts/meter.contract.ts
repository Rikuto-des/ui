import { defineContract, node, z } from "@urushi/contract";

export default defineContract({
  name: "meter",
  tier: 1,
  summary: "A measurement within a known range, in a native <meter> that colors itself by low / high / optimum.",
  use: ["Storage used, a quota, a score"],
  avoid: [{ case: "How far a task has got", instead: "progress" }],
  rendering: "server",
  platform: { requires: ["meter"] },
  parts: [
    {
      jsx: "Meter",
      slot: "meter",
      element: "meter",
      description: "A label, the value as text and a <meter>.",
      props: z.object({
        label: node("Required visible label; it names the meter."),
        value: z.number().describe("Required. The measured value."),
        min: z.number().default(0),
        max: z.number().default(100),
        low: z.number().optional().describe("Below this the value is low."),
        high: z.number().optional().describe("Above this the value is high."),
        optimum: z.number().optional().describe("The best value; the browser colors the bar by how far the value is from it."),
        valueText: node("Optional text shown for the value, e.g. \"8.2 GB / 10 GB\". Defaults to the percentage.").optional(),
      }),
      overrides: ["margin", "width", "layout", "position"],
    },
  ],
  states: ["optimum", "suboptimum", "even-less-good"],
  a11y: { rules: ["label is required; it is linked with aria-labelledby.", "Say the value in text too: color alone does not tell how full it is."] },
  tokens: ["color.ok", "color.accent", "color.danger", "color.track"],
  examples: [{ title: "Storage", code: `<Meter label="使用容量" value={82} high={80} optimum={0} valueText="8.2 GB / 10 GB" />` }],
});
