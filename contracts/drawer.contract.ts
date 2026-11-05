import { defineContract, idref, node, z } from "@urushi/contract";
import { buttonProps } from "./button.contract.ts";

const { variant, size } = buttonProps;

export default defineContract({
  name: "drawer",
  styleDependencies: ["sheet"],
  tier: 2,
  summary:
    "A modal <dialog> that slides up from the bottom with a handle, and closes when dragged down. A bottom Sheet for phones: the runtime adds the drag; without it, Escape, the backdrop and Drawer.Close still close it.",
  use: ["A short form or a choice on a phone", "Details of a list row on small screens"],
  avoid: [
    { case: "A panel beside a list on large screens", instead: "sheet" },
    { case: "A short confirmation", instead: "alert-dialog" },
  ],
  rendering: "server",
  platform: {
    requires: ["dialog", "invoker-commands"],
    enhances: [
      { feature: "dialog-closedby", fallback: "@urushi/core/closedby (loaded by <UrushiRuntime />)" },
      { feature: "@urushi/core drawer behavior", fallback: "no drag; it closes with Escape, the backdrop or Drawer.Close" },
    ],
  },
  parts: [
    {
      jsx: "Drawer",
      slot: "drawer",
      element: "dialog",
      description: "The <dialog>, along the bottom edge, with a handle above the title. Drag the handle or the title down to close it.",
      props: z.object({
        id: z.string().min(1).describe("Required. Triggers and close buttons reference it."),
        title: node("Required heading and accessible name."),
        description: node("Optional supporting text.").optional(),
        dismissible: z.enum(["any", "closerequest", "none"]).default("any").describe("none also turns off closing by drag."),
      }),
      overrides: [],
    },
    {
      jsx: "Drawer.Trigger",
      slot: "drawer-trigger",
      element: "button",
      description: "A Button that opens the drawer.",
      props: z.object({ drawer: idref("Id of the drawer to open.", "drawer"), variant, size }),
      overrides: ["margin", "width", "layout", "position"],
    },
    {
      jsx: "Drawer.Close",
      slot: "drawer-close",
      element: "button",
      description: "A Button that closes the drawer.",
      props: z.object({ drawer: idref("Id of the drawer to close.", "drawer"), variant, size }),
      overrides: ["margin", "width", "layout", "position"],
    },
  ],
  states: ["open", "modal"],
  a11y: {
    apg: "dialog-modal",
    keyboard: { Escape: "close (unless dismissible=\"none\")", Tab: "moves focus within the drawer only" },
    rules: [
      "title is required.",
      "The handle is decorative: give every drawer a visible way to close it (a Drawer.Close, or an action that closes it).",
      "Every trigger and close button references an existing Drawer id.",
    ],
  },
  tokens: ["color.surface-overlay", "color.border-strong", "shadow.dialog", "motion.overlay"],
  examples: [
    {
      title: "Add an event",
      code: `<Drawer.Trigger drawer="add-event" variant="primary">予定を追加</Drawer.Trigger>
<Drawer id="add-event" title="予定を追加">
  <Field label="題名"><Input /></Field>
  <Drawer.Close drawer="add-event">やめる</Drawer.Close>
</Drawer>`,
    },
  ],
});
