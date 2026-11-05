import { defineContract, z } from "@urushi/contract";

export default defineContract({
  name: "chart",
  tier: 2,
  summary:
    "A bar or line chart drawn with HTML and CSS on the server, with the numbers as a table for screen readers. The first series takes the accent color and the others are greys, so the series to look at stands out; palette=\"multi\" gives each series its own color. Hovering a column shows its values (CSS only). Values start at zero.",
  use: ["A few series over a short range of labels: months, weeks, categories"],
  avoid: [
    { case: "Exact values people compare or copy", instead: "table" },
    { case: "Progress toward one goal", instead: "progress" },
  ],
  rendering: "server",
  platform: { requires: [] },
  parts: [
    {
      jsx: "Chart",
      slot: "chart",
      element: "figure",
      description: "The chart (<figure>): its title, a legend, the plot and a visually hidden table of the same numbers.",
      props: z.object({
        type: z.enum(["bar", "line"]).default("bar"),
        title: z.string().min(1).describe("Required. Says what is measured and in what unit, e.g. \"月ごとの売上（万円）\"."),
        labels: z.array(z.string()).min(1).describe("The labels along the bottom, one per value.").meta({ "x-ts-type": "readonly string[]" }),
        series: z
          .array(z.object({ name: z.string().min(1), values: z.array(z.number().min(0)) }))
          .min(1)
          .max(5)
          .describe("Up to 5 series; each has one value per label. The first is the one to look at.")
          .meta({ "x-ts-type": "readonly { name: string; values: readonly number[] }[]" }),
        unit: z.string().optional().describe("Written after each value in the tooltip and the table, e.g. \"万円\"."),
        hideTitle: z.boolean().default(false).describe("Hide the title visually (it still names the figure and the table), for a chart under a heading that already says it."),
        height: z.number().min(80).default(220).describe("Height of the plot in px."),
        palette: z.enum(["quiet", "multi"]).default("quiet").describe("quiet: accent and greys. multi: a color per series."),
      }),
      overrides: ["margin", "width", "layout", "position"],
    },
  ],
  states: ["hover"],
  a11y: {
    rules: [
      "title is required; it names the figure and the table.",
      "The plot is hidden from assistive technology; the table carries the numbers.",
      "Do not tell series apart by color alone in the text around the chart; name them.",
    ],
  },
  tokens: ["color.accent", "color.text", "color.border", "color.surface-overlay"],
  examples: [
    {
      title: "Monthly sales",
      code: `<Chart title="月ごとの売上（万円）" unit="万円" labels={["6月", "7月", "8月"]} series={[{ name: "今年", values: [42, 51, 47] }, { name: "去年", values: [38, 40, 45] }]} />`,
    },
  ],
});
