import { defineContract, idref, z } from "@urushi/contract";

export default defineContract({
  name: "hover-card",
  tier: 2,
  summary: "A preview card for a link, shown on hover and keyboard focus (interestfor).",
  use: ["A person or page preview behind a link"],
  avoid: [
    { case: "Information needed to act", instead: "popover" },
    { case: "A short label", instead: "tooltip" },
  ],
  rendering: "server",
  platform: {
    requires: ["popover", "anchor-positioning"],
    enhances: [{ feature: "interestfor", fallback: "@urushi/core hover-card behavior (loaded by <UrushiRuntime />)" }],
  },
  parts: [
    {
      jsx: "HoverCard",
      slot: "hover-card",
      element: "div",
      description: "The card: an auto popover anchored to its link.",
      props: z.object({
        id: z.string().min(1).describe("Required. The trigger references it."),
        side: z.enum(["top", "bottom", "start", "end"]).default("bottom"),
        align: z.enum(["start", "center", "end"]).default("start"),
      }),
      overrides: [],
    },
    {
      jsx: "HoverCard.Trigger",
      slot: "hover-card-trigger",
      element: "a",
      description: "The link that shows the card on hover and focus; it still navigates when clicked.",
      props: z.object({
        hoverCard: idref("Id of the hover card.", "hover-card"),
        href: z.string().min(1).describe("Required link target."),
      }),
      overrides: ["margin", "layout", "position"],
    },
  ],
  states: ["open"],
  a11y: { keyboard: { Tab: "focusing the link shows the card", Escape: "hides it" }, rules: ["Everything in the card is also reachable through the link's page."] },
  tokens: ["color.surface-overlay", "shadow.overlay", "radius.overlay"],
  examples: [
    {
      title: "Person",
      code: `<HoverCard.Trigger hoverCard="sato" href="/people/sato">佐藤 美咲</HoverCard.Trigger>
<HoverCard id="sato">…</HoverCard>`,
    },
  ],
});
