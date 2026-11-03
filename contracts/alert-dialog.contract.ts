import { defineContract, idref, node, z } from "@urushi/contract";
import { buttonProps } from "./button.contract.ts";

const { variant, size } = buttonProps;

export default defineContract({
  name: "alert-dialog",
  styleDependencies: ["dialog"],
  tier: 2,
  summary: "A modal confirmation (role=alertdialog) that only its buttons can close.",
  use: ["Confirming something that cannot be undone"],
  avoid: [{ case: "A form or a longer task", instead: "dialog" }],
  rendering: "server",
  platform: { requires: ["dialog", "invoker-commands"] },
  parts: [
    {
      jsx: "AlertDialog",
      slot: "alert-dialog",
      element: "dialog",
      description: "A <dialog role=\"alertdialog\" closedby=\"none\">: Escape and clicks outside do not close it.",
      props: z.object({
        id: z.string().min(1).describe("Required. Triggers and buttons reference it."),
        title: node("Required. The question, e.g. \"削除しますか？\"."),
        description: node("Required. What happens, in concrete terms."),
      }),
      overrides: [],
    },
    {
      jsx: "AlertDialog.Trigger",
      slot: "alert-dialog-trigger",
      element: "button",
      description: "A Button that opens it.",
      props: z.object({ alertDialog: idref("Id of the alert dialog.", "alert-dialog"), variant, size }),
      overrides: ["margin", "width", "layout", "position"],
    },
    {
      jsx: "AlertDialog.Cancel",
      slot: "alert-dialog-cancel",
      element: "button",
      description: "The safe choice. It closes the dialog and gets focus when it opens.",
      props: z.object({ alertDialog: idref("Id of the alert dialog.", "alert-dialog") }),
      overrides: [],
    },
    {
      jsx: "AlertDialog.Action",
      slot: "alert-dialog-action",
      element: "button",
      description: "The action. It closes the dialog; submit a form or add onClick to act.",
      props: z.object({ alertDialog: idref("Id of the alert dialog.", "alert-dialog"), variant: variant.default("danger") }),
      overrides: [],
    },
  ],
  states: ["open", "modal"],
  a11y: {
    apg: "alertdialog",
    keyboard: { Tab: "moves focus within the dialog only" },
    focus: { initial: "AlertDialog.Cancel", restore: "the trigger" },
    rules: ["title and description are required.", "Focus starts on the safe choice."],
  },
  tokens: ["color.surface-overlay", "shadow.dialog", "radius.dialog"],
  examples: [
    {
      title: "Delete",
      code: `<AlertDialog.Trigger alertDialog="delete" variant="danger">削除</AlertDialog.Trigger>
<AlertDialog id="delete" title="削除しますか？" description="タスク 5 件が消えます。取り消せません。">
  <AlertDialog.Cancel alertDialog="delete">キャンセル</AlertDialog.Cancel>
  <AlertDialog.Action alertDialog="delete">削除する</AlertDialog.Action>
</AlertDialog>`,
    },
  ],
});
