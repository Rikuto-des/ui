import { defineContract, z } from "@urushi/contract";

export default defineContract({
  name: "kbd",
  tier: 1,
  summary: "A key or keyboard shortcut, in a native <kbd>.",
  use: ["Shortcuts in help text and tooltips"],
  avoid: [{ case: "Code", instead: "code" }],
  rendering: "server",
  platform: { requires: [] },
  parts: [{ jsx: "Kbd", slot: "kbd", element: "kbd", description: "One key. Put several side by side for a combination.", props: z.object({ pressed: z.boolean().default(false).describe("Visual key-down state; the app owns shortcut handling.") }), overrides: ["margin"] }],
  states: [],
  a11y: { rules: ["Write the key's name as text (⌘ is read as its name on most screen readers)."] },
  tokens: ["color.border-strong", "radius.control"],
  examples: [{ title: "Shortcut", code: `<Kbd>⌘</Kbd><Kbd>K</Kbd>` }],
});
