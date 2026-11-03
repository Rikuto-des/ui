import { defineContract, idref, z } from "@urushi/contract";
import { buttonProps } from "./button.contract.ts";

const { variant, size } = buttonProps;

export default defineContract({
  name: "tooltip",
  styleDependencies: ["button"],
  tier: 2,
  summary: "A short description shown on hover and keyboard focus: popover=\"hint\" opened through interestfor.",
  use: ["Naming or describing an icon button", "A keyboard shortcut hint"],
  avoid: [
    { case: "Anything interactive or essential", instead: "popover" },
    { case: "Long explanations", instead: "popover" },
  ],
  rendering: "server",
  platform: {
    requires: ["popover=hint", "anchor-positioning"],
    enhances: [{ feature: "interestfor", fallback: "@urushi/core tooltip behavior (loaded by <UrushiRuntime />)" }],
  },
  parts: [
    {
      jsx: "Tooltip",
      slot: "tooltip",
      element: "div",
      description: "The tooltip (role=tooltip, popover=hint).",
      props: z.object({
        id: z.string().min(1).describe("Required. The trigger references it."),
        side: z.enum(["top", "bottom", "start", "end"]).default("top"),
        align: z.enum(["start", "center", "end"]).default("center"),
      }),
      overrides: [],
    },
    {
      jsx: "Tooltip.Trigger",
      slot: "tooltip-trigger",
      element: "button",
      description: "A Button that shows the tooltip on hover and focus and is described by it.",
      props: z.object({ tooltip: idref("Id of the tooltip.", "tooltip"), variant, size }),
      overrides: ["margin", "width", "layout", "position"],
    },
  ],
  states: ["open"],
  a11y: {
    keyboard: { Focus: "shows the tooltip", Escape: "hides it" },
    rules: ["The trigger still needs its own name (aria-label for icon buttons); the tooltip only describes it.", "Never put links or buttons in a tooltip."],
  },
  tokens: ["color.text", "color.bg", "radius.control", "motion.fast"],
  examples: [
    {
      title: "Icon button",
      code: `<Tooltip.Trigger tooltip="tip-copy" aria-label="コピー" variant="ghost">⧉</Tooltip.Trigger>
<Tooltip id="tip-copy">クリップボードにコピー（⌘C）</Tooltip>`,
    },
  ],
});
