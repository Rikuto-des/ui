import { defineContract, idref, z } from "@urushi/contract";
import { buttonProps } from "./button.contract.ts";

const { variant, size } = buttonProps;

export default defineContract({
  name: "menu",
  styleDependencies: ["button"],
  tier: 3,
  summary: "A list of actions in a popover (menu button pattern). Opens without JavaScript; the runtime adds arrow keys and typeahead.",
  use: ["Secondary actions on an item (編集・複製・削除)"],
  avoid: [{ case: "Choosing a value", instead: "select" }, { case: "Navigation", instead: "link" }],
  rendering: "server",
  platform: {
    requires: ["popover", "anchor-positioning"],
    enhances: [{ feature: "@urushi/core menu behavior", fallback: "items are reachable with Tab" }],
  },
  parts: [
    {
      jsx: "Menu",
      slot: "menu",
      element: "div",
      description: "The menu popover (role=menu).",
      props: z.object({
        id: z.string().min(1).describe("Required. The trigger references it."),
        label: z.string().min(1).describe("Required accessible name of the menu."),
        side: z.enum(["top", "bottom", "start", "end"]).default("bottom"),
        align: z.enum(["start", "center", "end"]).default("start"),
      }),
      overrides: ["width"],
    },
    {
      jsx: "Menu.Trigger",
      slot: "menu-trigger",
      element: "button",
      description: "A Button that toggles the menu (aria-haspopup=menu).",
      props: z.object({ menu: idref("Id of the menu.", "menu"), variant, size }),
      overrides: ["margin", "width", "layout", "position"],
    },
    {
      jsx: "Menu.Item",
      slot: "menu-item",
      element: "button",
      description: "An action (role=menuitem). Activating it closes the menu.",
      props: z.object({ variant: z.enum(["default", "danger"]).default("default"), description: z.string().optional().describe("Secondary explanation of the action."), shortcut: z.string().optional().describe("Displayed hint; app registers the shortcut.") }),
      overrides: [],
    },
    { jsx: "Menu.Link", slot: "menu-link", element: "a", description: "A navigation item (role=menuitem).", props: z.object({ href: z.string().min(1) }), overrides: [] },
    { jsx: "Menu.Separator", slot: "menu-separator", element: "div", description: "A rule between groups of items.", props: z.object({}), overrides: [] },
  ],
  states: ["open"],
  a11y: {
    apg: "menu button",
    keyboard: { "↑ / ↓": "move between items", "Home / End": "first / last item", "Letters": "jump to the next item starting with them", Escape: "close and return focus to the trigger", Tab: "close" },
    rules: ["Items are verbs (編集, 複製, 削除).", "Put destructive items last, after a Menu.Separator."],
  },
  tokens: ["color.surface-overlay", "shadow.overlay", "radius.overlay", "color.ghost-hover", "color.danger"],
  examples: [
    {
      title: "Row actions",
      code: `<Menu.Trigger menu="row-actions" variant="ghost" aria-label="操作">…</Menu.Trigger>
<Menu id="row-actions" label="タスクの操作">
  <Menu.Item>編集</Menu.Item>
  <Menu.Item>複製</Menu.Item>
  <Menu.Separator />
  <Menu.Item variant="danger">削除</Menu.Item>
</Menu>`,
    },
  ],
});
