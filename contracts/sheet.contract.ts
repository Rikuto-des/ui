import { defineContract, idref, node, z } from "@urushi/contract";
import { buttonProps } from "./button.contract.ts";

const { variant, size } = buttonProps;

export default defineContract({
  name: "sheet",
  styleDependencies: ["dialog"],
  tier: 2,
  summary: "A modal <dialog> that slides in from an edge of the screen.",
  use: ["Details or a form next to a list", "Navigation or filters on small screens"],
  avoid: [{ case: "A short confirmation", instead: "alert-dialog" }],
  rendering: "server",
  platform: {
    requires: ["dialog", "invoker-commands"],
    enhances: [{ feature: "dialog-closedby", fallback: "@urushi/core/closedby (loaded by <UrushiRuntime />)" }],
  },
  parts: [
    {
      jsx: "Sheet",
      slot: "sheet",
      element: "dialog",
      description: "The <dialog>, pinned to one edge.",
      props: z.object({
        id: z.string().min(1).describe("Required. Triggers and close buttons reference it."),
        title: node("Required heading and accessible name."),
        description: node("Optional supporting text.").optional(),
        side: z.enum(["start", "end", "top", "bottom"]).default("end").describe("The edge it slides from (start/end follow the writing direction)."),
        size: z.enum(["sm", "md", "lg"]).default("md"),
        dismissible: z.enum(["any", "closerequest", "none"]).default("any"),
      }),
      overrides: [],
    },
    {
      jsx: "Sheet.Trigger",
      slot: "sheet-trigger",
      element: "button",
      description: "A Button that opens the sheet.",
      props: z.object({ sheet: idref("Id of the sheet to open.", "sheet"), variant, size }),
      overrides: ["margin", "width", "layout", "position"],
    },
    {
      jsx: "Sheet.Close",
      slot: "sheet-close",
      element: "button",
      description: "A Button that closes the sheet.",
      props: z.object({ sheet: idref("Id of the sheet to close.", "sheet"), variant, size }),
      overrides: ["margin", "width", "layout", "position"],
    },
  ],
  states: ["open", "modal"],
  a11y: {
    apg: "dialog-modal",
    keyboard: { Escape: "close (unless dismissible=\"none\")", Tab: "moves focus within the sheet only" },
    rules: ["title is required.", "Every trigger and close button references an existing Sheet id."],
  },
  tokens: ["color.surface-overlay", "shadow.dialog", "motion.overlay"],
  examples: [
    {
      title: "Task details",
      code: `<Sheet.Trigger sheet="task">詳細</Sheet.Trigger>
<Sheet id="task" title="告知メールの文面を確定する">…</Sheet>`,
    },
  ],
});
