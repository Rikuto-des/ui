# NavigationMenu

Site navigation with native disclosures, pointer-intent hover, collision-aware flyouts and responsive inline layout.

- Tier: 1
- Rendering: server
- Requires: details
- Enhances with Hover intent, flyouts, Escape, outside dismissal and arrow keys (fallback: Tab through links; Enter or Space toggles native summaries. Submenus stay inline without runtime or Popover API.)

## When to use

- A website header with grouped links
- Nested navigation that remains usable before JavaScript loads

## When not to use

- Actions such as delete or archive → use `menu`
- Persistent application sidebar → use `sidebar`

## Parts

### `<NavigationMenu>`

Named navigation landmark. Children are Group or Link. Already renders a styled internal list and panels. Do not attach list/panel presentation classes to Root; use className only for outer width, margin, placement or position. openOnHover applies only to a mouse on a wide hover-capable screen; click and keyboard always work. Renders `<nav data-slot="navigation-menu">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | **required** |  |
| `openOnHover` | `boolean` | `true` |  |

className may only adjust: margin, width, layout, position.

### `<NavigationMenu.Group>`

A disclosure. title is plain text, children are Link or nested Group. columns=2 lays out a wider desktop panel. Nested groups fly out with runtime, flipping at viewport edges; submenu=inline keeps them in flow. Narrow screens or insufficient side space use inline layout. No interactive content in title. Renders `<details data-slot="navigation-menu-group">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | **required** |  |
| `defaultOpen` | `boolean` | `false` |  |
| `columns` | `1 \| 2` | `1` |  |
| `submenu` | `"flyout" \| "inline"` | `"flyout"` |  |

className may only adjust: nothing (visuals come from the pack).

### `<NavigationMenu.Link>`

Native link, wrapped in a list item. current marks the current page. Renders `<a data-slot="navigation-menu-link">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `href` | `string` | **required** |  |
| `current` | `boolean` | `false` |  |
| `description` | `React.ReactNode` | — | Optional supporting text. |

className may only adjust: nothing (visuals come from the pack).

## Accessibility

Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/

| Key | Behavior |
|---|---|
| Tab | All visible summaries and links remain in normal DOM tab order. |
| Enter / Space | Toggle a focused disclosure. |
| Escape | Close the nearest open group and restore its summary; dismiss pointer-opened menus even when focus is outside. |
| ArrowDown / ArrowUp | Open a focused group and focus first/last entry; move within an open panel. |
| ArrowLeft / ArrowRight | Move between top-level entries; when a panel is already open, switch to the focused group. Inside panels, open a child in the forward direction or close the current submenu in the backward direction, respecting RTL. |
| Home / End | First/last entry in the current level. |

- Use navigation links, not role=menu or menuitem.
- Give the navigation a unique label.
- Use at most one current link per navigation.
- Do not put buttons, links or inputs inside Group title.
- Install UrushiRuntime for hover intent, flyouts, Escape, outside dismissal and arrow keys. Basic disclosure and links need no runtime.
- Hover must not move focus or hide a panel containing keyboard focus. Touch and narrow screens use explicit activation.

## States

`open`, `current`, `focus-visible`

## Tokens

`color.text`, `color.text-muted`, `color.surface`, `color.border`, `color.ghost-hover`, `radius.control`

## Examples

### Site navigation

```tsx
<NavigationMenu label="Main navigation">
  <NavigationMenu.Group title="Product">
    <NavigationMenu.Link href="/overview" current>Overview</NavigationMenu.Link>
    <NavigationMenu.Group title="Developers">
      <NavigationMenu.Link href="/docs">Documentation</NavigationMenu.Link>
    </NavigationMenu.Group>
  </NavigationMenu.Group>
  <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
</NavigationMenu>
```
