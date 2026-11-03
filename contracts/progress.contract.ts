import { defineContract, node, z } from "@urushi/contract";

export default defineContract({
  name: "progress",
  tier: 1,
  summary: "How far a task has got, in a native <progress> with a visible label.",
  use: ["Uploads, imports, multi-step processes"],
  avoid: [
    { case: "A measurement within a range (disk usage, a score)", instead: "meter" },
    { case: "Waiting with no known length", instead: "spinner" },
  ],
  rendering: "server",
  platform: { requires: ["progress"] },
  parts: [
    {
      jsx: "Progress",
      slot: "progress",
      element: "progress",
      description: "A label and a <progress>. Without value it is indeterminate.",
      props: z.object({
        label: node("Required visible label; it names the progress bar."),
        value: z.number().min(0).optional().describe("Current amount. Leave out while the total is unknown."),
        max: z.number().positive().default(100),
        milestones: z.array(z.object({ value: z.number(), label: z.string() })).optional().describe("Labelled checkpoints in the same units as value and max."),
        valueText: z.string().optional().describe("Readable progress, e.g. 3 of 8 files. Also announced by assistive technology."),
        showValue: z.boolean().default(true).describe("Shows the percentage next to the label."),
      }),
      overrides: ["margin", "width", "layout", "position"],
    },
  ],
  states: ["indeterminate"],
  a11y: { rules: ["label is required; it is linked with aria-labelledby."] },
  tokens: ["color.accent", "color.track"],
  examples: [{ title: "Upload", code: `<Progress label="写真をアップロード中" value={42} />` }],
});
