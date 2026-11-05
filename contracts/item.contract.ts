import { defineContract, node, z } from "@urushi/contract";

export default defineContract({
  name: "item",
  tier: 1,
  summary:
    "A row of a list: an icon, a title, a description and one action, like the rows of a settings screen. Item.Group is the list (a bordered panel with lines between the rows); a row with href is one link.",
  use: ["Settings screens", "Lists of accounts, files or members with one action per row"],
  avoid: [
    { case: "Rows compared by column", instead: "table" },
    { case: "Many rows to sort or filter", instead: "data-table" },
    { case: "Actions in a popup", instead: "menu" },
  ],
  rendering: "server",
  platform: { requires: [] },
  parts: [
    {
      jsx: "Item",
      slot: "item",
      element: "li",
      description: "One row (<li>). With href the whole row is a link and ends in a chevron; then it takes no action.",
      props: z.object({
        title: node("Required. What the row is."),
        description: node("Optional supporting text: the current value or a hint.").optional(),
        icon: node("Optional decorative icon at the start.").optional(),
        action: node("Optional control at the end: a small Button, a Switch or a Badge. Not with href.").optional(),
        href: z.string().optional().describe("Makes the whole row a link to this URL."),
      }),
      overrides: [],
    },
    {
      jsx: "Item.Group",
      slot: "item-group",
      element: "ul",
      description: "The list (<ul role=list>). outline draws the panel; plain leaves only the lines between the rows, for use inside a Card.",
      props: z.object({
        label: z.string().optional().describe("Accessible name of the list, when no heading names it."),
        variant: z.enum(["outline", "plain"]).default("outline"),
      }),
      overrides: ["margin", "width", "layout", "position"],
    },
  ],
  states: [],
  a11y: {
    rules: [
      "Put Item only inside Item.Group.",
      "A row with href has no action: a link cannot contain another control.",
      "A Switch in action needs its own aria-label (the row title is not its label).",
      "The icon is decorative (aria-hidden); the title carries the meaning.",
    ],
  },
  tokens: ["color.border", "color.surface", "color.text-muted", "color.ghost-hover", "radius.panel"],
  examples: [
    {
      title: "Account settings",
      code: `<Item.Group label="アカウント">
  <Item title="メールアドレス" description="hanako@example.jp" action={<Button size="sm" variant="secondary">変更</Button>} />
  <Item title="お知らせメール" description="締め切りの前日に送ります" action={<Switch aria-label="お知らせメール" defaultChecked />} />
  <Item title="パスワードと二段階認証" description="最後の変更は 3 か月前" href="/settings/security" />
</Item.Group>`,
    },
  ],
});
