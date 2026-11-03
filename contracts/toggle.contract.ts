import { defineContract, z } from "@urushi/contract";

export default defineContract({
  name: "toggle",
  tier: 1,
  summary: "A button-looking on/off control. It is a native checkbox, so it works in forms and without JavaScript.",
  use: ["Formatting in a toolbar (太字)", "Showing or hiding something in place"],
  avoid: [
    { case: "A setting that applies at once in a list of settings", instead: "switch" },
    { case: "One of several exclusive options", instead: "toggle-group" },
  ],
  rendering: "server",
  platform: { requires: [] },
  parts: [
    {
      jsx: "Toggle",
      slot: "toggle",
      element: "input",
      description: "A <label> drawn as a button around a checkbox. Other props go to the checkbox.",
      props: z.object({ size: z.enum(["sm", "md", "lg"]).default("md") }),
      overrides: ["margin", "layout", "position"],
    },
  ],
  states: ["checked"],
  a11y: { keyboard: { Space: "toggle" }, rules: ["Icon-only toggles need aria-label.", "It is exposed as a checkbox (checked / not checked)."] },
  tokens: ["color.ghost-hover", "color.text", "radius.control"],
  examples: [{ title: "Bold", code: `<Toggle aria-label="太字"><BoldIcon /></Toggle>` }],
});
