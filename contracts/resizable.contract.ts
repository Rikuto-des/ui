import { defineContract, z } from "@urushi/contract";

export default defineContract({
  name: "resizable",
  tier: 2,
  summary:
    "Two panes split by a handle that changes their sizes, like a mail list beside the message. Drag the handle, or focus it and use the arrow keys (WAI-ARIA window splitter). Without the runtime the split stays at defaultSize.",
  use: ["A list beside its details in an application", "An editor beside its preview"],
  avoid: [
    { case: "A page layout that should follow the screen size", instead: "CSS grid" },
    { case: "Showing or hiding a side panel", instead: "sheet" },
  ],
  rendering: "server",
  platform: {
    requires: [],
    enhances: [{ feature: "@urushi/core resizable behavior", fallback: "the panes keep their default sizes" }],
  },
  parts: [
    {
      jsx: "Resizable",
      slot: "resizable",
      element: "div",
      description: "The split: Resizable.Panel, Resizable.Handle, Resizable.Panel, in that order. Give it a height (or a parent that sets one) for a vertical split.",
      props: z.object({
        orientation: z.enum(["horizontal", "vertical"]).default("horizontal").describe("horizontal puts the panes side by side; vertical stacks them."),
        defaultSize: z.number().min(0).max(100).default(50).describe("The first pane's share, in percent."),
        min: z.number().min(0).max(100).default(20).describe("The smallest share of the first pane, in percent."),
        max: z.number().min(0).max(100).default(80).describe("The largest share of the first pane, in percent."),
      }),
      overrides: ["margin", "width", "height", "layout", "position"],
    },
    {
      jsx: "Resizable.Panel",
      slot: "resizable-panel",
      element: "div",
      description: "One pane. It scrolls when its content does not fit.",
      props: z.object({}),
      overrides: [],
    },
    {
      jsx: "Resizable.Handle",
      slot: "resizable-handle",
      element: "div",
      description: "The handle between the panes (role=separator, focusable). A thin line that thickens on hover and focus; grip adds a visible grip.",
      props: z.object({
        label: z.string().min(1).describe("Required. What the handle resizes, e.g. \"一覧の幅\"."),
        grip: z.boolean().default(false).describe("Show a grip in the middle, so it is visibly draggable."),
      }),
      overrides: [],
    },
  ],
  states: ["focus-visible", "dragging"],
  a11y: {
    apg: "windowsplitter",
    keyboard: {
      "← → (horizontal) / ↑ ↓ (vertical)": "move the handle by 2%; with Shift by 10%",
      "Home / End": "to the smallest or largest share",
    },
    rules: [
      "label is required; it names the handle.",
      "Put exactly two Resizable.Panel and one Resizable.Handle between them.",
      "Keep min large enough that the first pane stays usable.",
    ],
  },
  tokens: ["color.border", "color.focus-ring", "color.border-strong", "color.surface"],
  examples: [
    {
      title: "Mail list and message",
      code: `<Resizable defaultSize={35} min={25} max={60}>
  <Resizable.Panel>…一覧…</Resizable.Panel>
  <Resizable.Handle label="一覧の幅" />
  <Resizable.Panel>…本文…</Resizable.Panel>
</Resizable>`,
    },
  ],
});
