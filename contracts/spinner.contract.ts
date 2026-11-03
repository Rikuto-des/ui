import { defineContract, z } from "@urushi/contract";

export default defineContract({
  name: "spinner",
  tier: 1,
  summary: "An indeterminate progress indicator with a status message for screen readers.",
  use: ["Short waits where the remaining time is unknown"],
  avoid: [{ case: "Loading a layout you can predict", instead: "skeleton" }, { case: "A button that is submitting", instead: "button (loading)" }],
  rendering: "server",
  platform: { requires: [] },
  parts: [
    {
      jsx: "Spinner",
      slot: "spinner",
      element: "span",
      description: "role=\"status\" with a visually hidden label.",
      props: z.object({
        label: z.string().default("読み込み中").describe("Announced to screen readers."),
        showLabel: z.boolean().default(false).describe("Also display the status label next to the ring."),
        size: z.enum(["sm", "md", "lg"]).default("md"),
      }),
      overrides: ["margin", "layout", "position"],
    },
  ],
  states: [],
  a11y: { rules: ["label says what is loading when it is not obvious."] },
  tokens: ["color.text-muted"],
  examples: [{ title: "Loading", code: `<Spinner label="検索結果を読み込み中" />` }],
});
