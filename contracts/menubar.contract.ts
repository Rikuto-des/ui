import { defineContract, z } from "@urushi/contract";

export default defineContract({
  name: "menubar",
  styleDependencies: ["menu", "button"],
  tier: 3,
  summary:
    "A row of menus for an application (ファイル・編集・表示), like a desktop menu bar. Each Menubar.Menu is a trigger and its menu; the items are Menu's (Menu.Item, Menu.Separator, Menu.Sub). Opens without JavaScript; the runtime adds the menubar keyboard model and hover switching.",
  use: ["The command menus of an editor or a tool that works like a desktop application"],
  avoid: [
    { case: "Site navigation", instead: "navigation-menu" },
    { case: "A few actions on one item", instead: "menu" },
  ],
  rendering: "server",
  platform: {
    requires: ["popover", "anchor-positioning"],
    enhances: [{ feature: "@urushi/core menubar behavior", fallback: "each menu opens from its trigger, and Tab reaches every trigger and item" }],
  },
  parts: [
    {
      jsx: "Menubar",
      slot: "menubar",
      element: "div",
      description: "The bar (role=menubar). With the runtime it is one Tab stop; ← → move between its menus.",
      props: z.object({ label: z.string().min(1).describe("Required accessible name of the bar.") }),
      overrides: ["margin", "width", "layout", "position"],
    },
    {
      jsx: "Menubar.Menu",
      slot: "menubar-menu",
      element: "div",
      description:
        "One menu of the bar: a trigger (role=menuitem, aria-haspopup=menu) and the menu it opens below. Put Menu.Item, Menu.Link, Menu.Separator and Menu.Sub inside.",
      props: z.object({ label: z.string().min(1).describe("Required. The trigger text and the menu's accessible name.") }),
      overrides: [],
    },
  ],
  states: ["open"],
  a11y: {
    apg: "menubar",
    keyboard: {
      "← / →": "move between the bar's menus; with a menu open, open the next one instead",
      "Home / End": "first / last menu of the bar",
      "↓ / Enter / Space": "open the menu on its first item",
      "↑": "open the menu on its last item",
      "↑ / ↓ in a menu": "move between items",
      "→ / ← on an item": "open the next / previous menu of the bar (→ on a Menu.Sub opens the submenu)",
      Escape: "close the menu and return focus to its trigger",
      Tab: "close and leave the bar",
    },
    rules: [
      "Name each menu with one short noun (ファイル, 編集, 表示).",
      "Keep the bar to the menus of one application; links between pages belong in NavigationMenu.",
      "Show shortcuts with Menu.Item's shortcut; the app registers them.",
    ],
  },
  tokens: ["color.surface", "color.border", "radius.control", "color.ghost-hover", "color.surface-overlay", "shadow.overlay"],
  examples: [
    {
      title: "Editor menus",
      code: `<Menubar label="ノートのメニュー">
  <Menubar.Menu label="ファイル">
    <Menu.Item shortcut="⌘N">新しいノート</Menu.Item>
    <Menu.Item shortcut="⌘O">開く…</Menu.Item>
  </Menubar.Menu>
  <Menubar.Menu label="編集">
    <Menu.Item shortcut="⌘Z">元に戻す</Menu.Item>
    <Menu.Item shortcut="⇧⌘Z">やり直す</Menu.Item>
  </Menubar.Menu>
</Menubar>`,
    },
  ],
});
