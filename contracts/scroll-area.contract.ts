import { defineContract, z } from "@urushi/contract";

export default defineContract({
  name: "scroll-area",
  tier: 1,
  summary: "A scrolling region with pack-styled scrollbars, focusable and named so keyboards can scroll it.",
  use: ["A long list inside a fixed-height panel", "Wide content that scrolls sideways"],
  avoid: [{ case: "The page itself", instead: "the document scroll" }],
  rendering: "server",
  platform: { requires: [], enhances: [{ feature: "scrollbar-color", fallback: "the system scrollbar" }] },
  parts: [
    {
      jsx: "ScrollArea",
      slot: "scroll-area",
      element: "div",
      description: "role=region with a name and tabIndex=0. Set its height (or width) from the outside.",
      props: z.object({
        label: z.string().min(1).describe("Required. Names the region for screen readers."),
        orientation: z.enum(["vertical", "horizontal", "both"]).default("vertical"),
      }),
      overrides: ["margin", "width", "height", "layout", "position"],
    },
  ],
  states: [],
  a11y: { keyboard: { "↑ / ↓ / ← / →": "scroll when focused", "Page Up / Page Down": "scroll by a page" }, rules: ["label is required: a focusable region needs a name."] },
  tokens: ["color.border-strong"],
  examples: [{ title: "Members", code: `<ScrollArea label="参加者" style={{ blockSize: 240 }}>…</ScrollArea>` }],
});
