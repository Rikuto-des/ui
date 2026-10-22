import { defineContract, z } from "@yourlib/contract";

export default defineContract({
  name: "toast",
  tier: 2,
  summary: "Brief notifications about the result of an action. Place one <Toaster /> per page and call toast() from client code.",
  use: ["Confirming that an action finished (保存しました)", "Reporting a recoverable failure"],
  avoid: [{ case: "Anything the user must decide", instead: "dialog" }, { case: "Errors in a form field", instead: "field" }],
  rendering: "server",
  platform: { requires: ["popover=manual"] },
  parts: [
    {
      jsx: "Toaster",
      slot: "toaster",
      element: "section",
      description: "The live region toasts appear in. A manual popover so it stays above modal dialogs.",
      props: z.object({
        label: z.string().default("通知").describe("Accessible name of the region."),
        position: z.enum(["bottom-end", "bottom-center", "top-end"]).default("bottom-end"),
      }),
      overrides: [],
    },
  ],
  states: ["closing"],
  a11y: {
    rules: [
      "Messages are short and name the result in the same words as the action (保存 → 保存しました).",
      "Toasts are announced politely; never put the only copy of important information in one.",
    ],
  },
  tokens: ["color.surface-overlay", "shadow.overlay", "radius.overlay", "color.ok", "color.danger"],
  examples: [{ title: "After saving", code: `toast("保存しました", { tone: "ok" })` }],
});
