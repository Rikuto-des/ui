import { defineContract, node, z } from "@urushi/contract";

export default defineContract({
  name: "navigation-menu",
  tier: 1,
  summary: "Site navigation with native disclosures, pointer-intent hover, collision-aware flyouts and responsive inline layout.",
  use: ["A website header with grouped links", "Nested navigation that remains usable before JavaScript loads"],
  avoid: [{ case: "Actions such as delete or archive", instead: "menu" }, { case: "Persistent application sidebar", instead: "sidebar" }],
  rendering: "server",
  platform: { requires: ["details"], enhances: [{ feature: "Hover intent, flyouts, Escape, outside dismissal and arrow keys", fallback: "Tab through links; Enter or Space toggles native summaries. Submenus stay inline without runtime or Popover API." }] },
  parts: [
    { jsx: "NavigationMenu", slot: "navigation-menu", element: "nav", description: "Named navigation landmark. Children are Group or Link. Already renders a styled internal list and panels. Do not attach list/panel presentation classes to Root; use className only for outer width, margin, placement or position. openOnHover applies only to a mouse on a wide hover-capable screen; click and keyboard always work.", props: z.object({ label: z.string().min(1), openOnHover: z.boolean().default(true) }), overrides: ["margin", "width", "layout", "position"] },
    { jsx: "NavigationMenu.Group", slot: "navigation-menu-group", element: "details", description: "A disclosure. title is plain text, children are Link or nested Group. columns=2 lays out a wider desktop panel. Nested groups fly out with runtime, flipping at viewport edges; submenu=inline keeps them in flow. Narrow screens or insufficient side space use inline layout. No interactive content in title.", props: z.object({ title: z.string().min(1), defaultOpen: z.boolean().default(false), columns: z.union([z.literal(1), z.literal(2)]).default(1), submenu: z.enum(["flyout", "inline"]).default("flyout") }), overrides: [] },
    { jsx: "NavigationMenu.Link", slot: "navigation-menu-link", element: "a", description: "Native link, wrapped in a list item. current marks the current page.", props: z.object({ href: z.string().min(1), current: z.boolean().default(false), description: node("Optional supporting text.").optional() }), overrides: [] },
  ],
  states: ["open", "current", "focus-visible"],
  a11y: {
    apg: "https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/",
    keyboard: { Tab: "All visible summaries and links remain in normal DOM tab order.", "Enter / Space": "Toggle a focused disclosure.", Escape: "Close the nearest open group and restore its summary; dismiss pointer-opened menus even when focus is outside.", "ArrowDown / ArrowUp": "Open a focused group and focus first/last entry; move within an open panel.", "ArrowLeft / ArrowRight": "Move between top-level entries; when a panel is already open, switch to the focused group. Inside panels, open a child in the forward direction or close the current submenu in the backward direction, respecting RTL.", "Home / End": "First/last entry in the current level." },
    rules: ["Use navigation links, not role=menu or menuitem.", "Give the navigation a unique label.", "Use at most one current link per navigation.", "Do not put buttons, links or inputs inside Group title.", "Install UrushiRuntime for hover intent, flyouts, Escape, outside dismissal and arrow keys. Basic disclosure and links need no runtime.", "Hover must not move focus or hide a panel containing keyboard focus. Touch and narrow screens use explicit activation."],
  },
  tokens: ["color.text", "color.text-muted", "color.surface", "color.border", "color.ghost-hover", "radius.control"],
  examples: [{ title: "Site navigation", code: `<NavigationMenu label="Main navigation">
  <NavigationMenu.Group title="Product">
    <NavigationMenu.Link href="/overview" current>Overview</NavigationMenu.Link>
    <NavigationMenu.Group title="Developers">
      <NavigationMenu.Link href="/docs">Documentation</NavigationMenu.Link>
    </NavigationMenu.Group>
  </NavigationMenu.Group>
  <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
</NavigationMenu>` }],
});
