import { defineContract, idref, node, z } from "@urushi/contract";
import { buttonProps } from "./button.contract.ts";

const { variant, size } = buttonProps;

export default defineContract({
  name: "dialog",
  styleDependencies: ["button"],
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
      { feature: "dialog-closedby", fallback: "@urushi/core/closedby (loaded by <UrushiRuntime />)" },
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
        initialFocus: idref("Id of the element inside the dialog to focus after opening. Requires UrushiRuntime. Use this for dynamic React content, where autoFocus alone can run before showModal().").optional(),
        returnFocus: idref("Id of the element to focus after closing or removing an open dialog. Requires UrushiRuntime. Useful for programmatic opening and conditional rendering; native trigger restoration remains the default.").optional(),
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
      description: "A Button that closes the dialog with a native command after the click handler. Do not disable or unmount this button in that handler: it would cancel the native default action. For a successful mutation, use a normal Button and close the dialog ref before changing state. For async work, close only after success.",
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
      "Install UrushiRuntime to restore the clicked invoker after closing on Safari too; without it, pointer focus follows browser settings.",
      "For dynamically rendered React content, set initialFocus to an input or safe button id. React autoFocus can run before showModal(); initialFocus runs after the dialog opens. Set returnFocus to a stable trigger id when opening programmatically or unmounting the dialog.",
      "title is required; it becomes the accessible name through aria-labelledby.",
      "Every Dialog.Trigger and Dialog.Close must reference an existing Dialog id.",
      "Destructive confirmations should put focus on the safe action with autofocus.",
      "For client-side mutations, hold a ref<HTMLDialogElement> on Dialog. On success call ref.current?.close() before removing the trigger or changing state. Use Button for that action; Dialog.Close is suitable for Cancel.",
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
