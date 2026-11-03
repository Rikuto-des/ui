import { defineContract, idref, z } from "@urushi/contract";

export const buttonProps = {
  variant: z
    .enum(["primary", "secondary", "ghost", "danger"])
    .default("secondary")
    .describe("primary is the single main action of a view. danger is for destructive actions."),
  size: z.enum(["sm", "md", "lg"]).default("md").describe("Control height. Density comes from the pack, not from this prop."),
  loading: z
    .boolean()
    .default(false)
    .describe("While true the button reports aria-disabled, ignores activation and never submits a form."),
};

export const commandProps = {
  command: z
    .enum(["show-modal", "close", "request-close", "toggle-popover", "show-popover", "hide-popover"])
    .optional()
    .describe("Invoker command (HTML `command` attribute). Works without JavaScript."),
  commandfor: idref("Id of the dialog or popover the command targets (HTML `commandfor`).").optional(),
};

export default defineContract({
  name: "button",
  tier: 1,
  summary: "A native <button> that runs or confirms an action.",
  use: ["Submitting a form", "Confirming a dialog", "Opening a dialog or popover through `command`"],
  avoid: [
    { case: "Navigating to another page", instead: "link" },
    { case: "Toggling a setting on and off", instead: "switch" },
  ],
  rendering: "server",
  platform: {
    requires: ["invoker-commands"],
    enhances: [{ feature: "corner-shape", fallback: "border-radius only" }],
  },
  parts: [
    {
      jsx: "Button",
      slot: "button",
      element: "button",
      description: "The button itself. Defaults to type=\"button\" so it never submits by accident.",
      props: z.object({ ...buttonProps, ...commandProps }),
      overrides: ["margin", "width", "layout", "position"],
    },
  ],
  states: ["disabled", "loading", "hover", "active", "focus-visible"],
  a11y: {
    apg: "button",
    keyboard: { Enter: "activate", Space: "activate" },
    rules: [
      "An icon-only button needs aria-label.",
      "Use at most one primary button per view.",
      "Loading buttons stay focusable (aria-disabled), they are never natively disabled.",
    ],
  },
  tokens: ["color.action", "color.secondary", "color.danger", "radius.control", "control.*", "motion.fast"],
  examples: [
    { title: "Primary action", code: `<Button variant="primary" type="submit">Save</Button>` },
    { title: "Open a dialog without JavaScript", code: `<Button command="show-modal" commandfor="confirm">Delete</Button>` },
  ],
});
