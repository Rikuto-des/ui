# Tabs

Switches between panels of equal weight. Server-rendered; the runtime adds clicking and arrow keys.

- Tier: 2
- Rendering: server
- Requires: 
- Enhances with @urushi/core tabs behavior (fallback: only the default panel is reachable)

## When to use

- Views of the same object (概要・設定・履歴)

## When not to use

- Steps of a process → use `stepper (planned)`
- Content most people skip → use `accordion`

## Parts

### `<Tabs>`

The root. Generates the ids that link tabs and panels. Renders `<div data-slot="tabs">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | **required** | Required. Prefix for the tab and panel ids. |
| `label` | `string` | **required** | Required accessible name of the tab list. |
| `defaultValue` | `string` | **required** | Required value of the tab selected initially. |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |  |
| `motion` | `"smooth" \| "none"` | `"smooth"` | Moves the selected indicator and interpolates panel height without scaling text. Respects reduced motion; none switches immediately. |

className may only adjust: margin, width, layout, position.

### `<Tabs.List>`

role=tablist; holds the Tabs.Tab elements. Renders `<div data-slot="tabs-list">`.

className may only adjust: nothing (visuals come from the pack).

### `<Tabs.Tab>`

role=tab. Renders `<button data-slot="tabs-tab">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | **required** | Required; matches a Tabs.Panel value. |

className may only adjust: nothing (visuals come from the pack).

### `<Tabs.Activate>`

A button outside the tab list that selects a panel by Tabs id and value. The runtime keeps it in sync with pointer and keyboard selection; no DOM query or React selection state is needed. It does not move focus into the tab list; keyboard focus remains on the activating button. Disabled targets are not activated. Renders `<button data-slot="tabs-activate">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `tabs` | `string` | **required** | Id of the Tabs root to control. |
| `value` | `string` | **required** | Value of the Tabs.Tab to select. |
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"secondary"` |  |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` |  |

className may only adjust: margin, width, layout, position.

### `<Tabs.Panel>`

role=tabpanel. Renders `<div data-slot="tabs-panel">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | **required** | Required; matches a Tabs.Tab value. |

className may only adjust: nothing (visuals come from the pack).

## Accessibility

Pattern: tabs (automatic activation)

| Key | Behavior |
|---|---|
| ← / → | move to and select the previous / next tab |
| Home / End | first / last tab |
| Tab | moves into the selected panel |

- Tabs.Tab and Tabs.Panel must be direct children of Tabs.List and Tabs.

## States

`selected`

## Tokens

`color.text`, `color.text-muted`, `color.border`, `color.action`

## Examples

### Select a view from outside the tab list

```tsx
<Tabs.Activate tabs="project" value="settings">設定を開く</Tabs.Activate>
<Tabs id="project" label="プロジェクト" defaultValue="overview">
  <Tabs.List><Tabs.Tab value="overview">概要</Tabs.Tab><Tabs.Tab value="settings">設定</Tabs.Tab></Tabs.List>
  <Tabs.Panel value="overview">…</Tabs.Panel><Tabs.Panel value="settings">…</Tabs.Panel>
</Tabs>
```

### Project views

```tsx
<Tabs id="project" label="プロジェクト" defaultValue="overview">
  <Tabs.List>
    <Tabs.Tab value="overview">概要</Tabs.Tab>
    <Tabs.Tab value="settings">設定</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="overview">…</Tabs.Panel>
  <Tabs.Panel value="settings">…</Tabs.Panel>
</Tabs>
```
