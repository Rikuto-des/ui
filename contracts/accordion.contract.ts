import { defineContract, node, z } from "@urushi/contract";

export default defineContract({
  name: "accordion",
  tier: 1,
  summary: "Collapsible sections built on native <details>/<summary>; a shared name makes them exclusive.",
  use: ["FAQs", "Secondary settings that most people skip"],
  avoid: [{ case: "Switching between views of equal weight", instead: "tabs" }],
  rendering: "server",
  platform: { requires: ["details", "details[name]"], enhances: [{ feature: "::details-content + interpolate-size", fallback: "opens without animation" }] },
  parts: [
    {
      jsx: "Accordion",
      slot: "accordion",
      element: "div",
      description: "Groups items. With a name, opening one item closes the others (native exclusive accordion).",
      props: z.object({
        name: z.string().optional().describe("Shared details name: only one item open at a time."),
      }),
      overrides: ["margin", "width", "layout", "position"],
    },
    {
      jsx: "Accordion.Item",
      slot: "accordion-item",
      element: "details",
      description: "One section: <details> with the title in its <summary>.",
      props: z.object({
        title: node("Required summary text."), description: node("Optional summary of the contents or current settings, visible while closed.").optional(),
        defaultOpen: z.boolean().default(false),
      }),
      overrides: [],
    },
  ],
  states: ["open"],
  a11y: { keyboard: { "Enter / Space": "toggle the focused item" }, rules: ["Titles are short and say what the section holds."] },
  tokens: ["color.border", "motion.overlay"],
  examples: [
    {
      title: "FAQ",
      code: `<Accordion name="faq">
  <Accordion.Item title="料金はかかりますか？">無料で始められます。</Accordion.Item>
  <Accordion.Item title="解約はいつでもできますか？">はい、いつでもできます。</Accordion.Item>
</Accordion>`,
    },
  ],
});
