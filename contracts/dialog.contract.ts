import { defineContract, idref, node, z } from "@yourlib/contract";
import { buttonProps } from "./button.contract.ts";

const { variant, size } = buttonProps;

export default defineContract({
  name: "dialog",
  tier: 2,
  summary: "A modal native <dialog> that interrupts the user for a confirmation or a short task.",
  use: ["Confirming a destructive action", "A short form that must be finished before continuing"],
  avoid: [
    { case: "Showing supplementary information next to a control", instead: "popover" },
    { case: "Reporting the result of an action", instead: "toast" },
  ],
  rendering: "server",
  platform: {
    requires: ["dialog", "invoker-commands", ":modal", "@starting-style"],
    enhances: [
      { feature: "dialog-closedby", fallback: "@yourlib/core/closedby (loaded by <YourlibRuntime />)" },
      { feature: "overlay-transition", fallback: "the dialog closes without an exit animation" },
    ],
  },
  parts: [
    {
      jsx: "Dialog",
      slot: "dialog",
      element: "dialog",
      description: "The <dialog> element. Opened with showModal() by a trigger's `show-modal` command.",
      props: z.object({
        id: z.string().min(1).describe("Required. Triggers and close buttons reference it."),
        title: node("Required accessible title, rendered as the dialog heading."),
        description: node("Optional supporting text, linked with aria-describedby.").optional(),
        dismissible: z
          .enum(["any", "closerequest", "none"])
          .default("any")
          .describe("any: Escape or a click outside closes it. closerequest: Escape only. none: only explicit buttons."),
        size: z.enum(["sm", "md", "lg"]).default("md").describe("Maximum inline size."),
      }),
      overrides: ["width"],
    },
    {
      jsx: "Dialog.Trigger",
      slot: "dialog-trigger",
      element: "button",
      description: "A Button that opens the dialog (command=\"show-modal\").",
      props: z.object({ dialog: idref("Id of the dialog to open.", "dialog"), variant, size }),
      overrides: ["margin", "width", "layout", "position"],
    },
    {
      jsx: "Dialog.Close",
      slot: "dialog-close",
      element: "button",
      description: "A Button that closes the dialog (command=\"close\").",
      props: z.object({ dialog: idref("Id of the dialog to close.", "dialog"), variant, size }),
      overrides: ["margin", "width", "layout", "position"],
    },
    {
      jsx: "Dialog.Actions",
      slot: "dialog-actions",
      element: "div",
      description: "Footer row for the dialog's buttons. Put the primary action last.",
      props: z.object({}),
      overrides: [],
    },
  ],
  states: ["open", "modal"],
  a11y: {
    apg: "dialog-modal",
    keyboard: { Escape: "close (unless dismissible=\"none\")", Tab: "moves focus within the dialog only" },
    focus: { initial: "first focusable element, or the element with autofocus", restore: "the trigger" },
    rules: [
      "title is required; it becomes the accessible name through aria-labelledby.",
      "Every Dialog.Trigger and Dialog.Close must reference an existing Dialog id.",
      "Destructive confirmations should put focus on the safe action with autofocus.",
    ],
  },
  tokens: ["color.surface.overlay", "color.backdrop", "radius.overlay", "shadow.overlay", "motion.overlay", "dialog.size.*"],
  examples: [
    {
      title: "Confirm a destructive action",
      code: `<Dialog.Trigger dialog="confirm-delete" variant="danger">Delete</Dialog.Trigger>
<Dialog id="confirm-delete" title="Delete this project?" description="This cannot be undone.">
  <Dialog.Actions>
    <Dialog.Close dialog="confirm-delete" autoFocus>Cancel</Dialog.Close>
    <Button variant="danger" type="submit" form="delete-form">Delete</Button>
  </Dialog.Actions>
</Dialog>`,
    },
  ],
});
