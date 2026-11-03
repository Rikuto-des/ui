import { defineContract, node, z } from "@urushi/contract";

export default defineContract({
  name: "empty",
  tier: 1,
  summary: "What a list or page shows when there is nothing in it yet, and how to start.",
  use: ["An empty list, no search results, a first-run screen"],
  avoid: [{ case: "An error", instead: "alert" }],
  rendering: "server",
  platform: { requires: [] },
  parts: [
    {
      jsx: "Empty",
      slot: "empty",
      element: "div",
      description: "A centered title, explanation and action.",
      props: z.object({
        title: node("Required. Says what is empty, e.g. \"まだタスクがありません\"."),
        description: node("Optional: why, or what to do.").optional(),
        action: node("Optional: the action that fills it, usually a primary Button.").optional(),
        icon: node("Optional decorative icon.").optional(),
      }),
      overrides: ["margin", "width", "height", "layout", "position"],
    },
  ],
  states: [],
  a11y: { rules: ["The icon is decorative (aria-hidden); the title carries the meaning."] },
  tokens: ["color.text-muted"],
  examples: [{ title: "No tasks", code: `<Empty title="まだタスクがありません" description="最初のタスクを追加しましょう。" action={<Button variant="primary">タスクを追加</Button>} />` }],
});
