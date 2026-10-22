import { defineContract, idref, node, z } from "@yourlib/contract";
import { buttonProps } from "./button.contract.ts";

const { variant, size } = buttonProps;

export default defineContract({
  name: "popover",
  tier: 2,
  summary: "A non-modal panel in the top layer (native `popover`), positioned against its trigger with CSS anchor positioning.",
  use: ["Filters or settings attached to a control", "Supplementary content that keeps the page usable"],
  avoid: [
    { case: "A task that must be finished before continuing", instead: "dialog" },
    { case: "A list of actions", instead: "menu" },
    { case: "A short label on hover", instead: "tooltip" },
  ],
  rendering: "server",
  platform: {
    requires: ["popover", "anchor-positioning", "invoker-commands", "@starting-style"],
    enhances: [{ feature: "overlay-transition", fallback: "the popover closes without an exit animation" }],
  },
  parts: [
    {
      jsx: "Popover",
      slot: "popover",
      element: "div",
      description: "The popover panel (role=dialog, popover=auto).",
      props: z.object({
        id: z.string().min(1).describe("Required. Triggers and close buttons reference it."),
        title: node("Accessible title rendered as a heading. Provide title or aria-label.").optional(),
        side: z.enum(["top", "bottom", "start", "end"]).default("bottom").describe("Logical side: start/end follow the writing direction."),
        align: z.enum(["start", "center", "end"]).default("start"),
        mode: z
          .enum(["auto", "manual"])
          .default("auto")
          .describe("auto: light dismiss (Escape / outside click) and closes other auto popovers. manual: only explicit commands."),
      }),
      overrides: ["width", "height"],
    },
    {
      jsx: "Popover.Trigger",
      slot: "popover-trigger",
      element: "button",
      description: "A Button that toggles the popover and acts as its anchor.",
      props: z.object({ popover: idref("Id of the popover to toggle.", "popover"), variant, size }),
      overrides: ["margin", "width", "layout", "position"],
    },
    {
      jsx: "Popover.Close",
      slot: "popover-close",
      element: "button",
      description: "A Button that hides the popover.",
      props: z.object({ popover: idref("Id of the popover to hide.", "popover"), variant, size }),
      overrides: ["margin", "width", "layout", "position"],
    },
  ],
  states: ["open"],
  a11y: {
    apg: "disclosure (non-modal dialog)",
    keyboard: { Escape: "close (mode=auto)", Tab: "moves from the trigger into the popover, then back to the page" },
    focus: { initial: "stays on the trigger unless an element inside has autofocus", restore: "the trigger, when focus was inside" },
    rules: [
      "Provide title or aria-label so the panel has an accessible name.",
      "Every Popover.Trigger and Popover.Close must reference an existing Popover id.",
    ],
  },
  tokens: ["color.surface.overlay", "radius.overlay", "shadow.overlay", "motion.overlay", "popover.offset"],
  examples: [
    {
      title: "Filters next to a button",
      code: `<Popover.Trigger popover="filters">Filters</Popover.Trigger>
<Popover id="filters" title="Filters" side="bottom" align="start">…</Popover>`,
    },
  ],
});
