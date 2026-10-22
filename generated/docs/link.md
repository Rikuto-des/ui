# Link

A native <a> that navigates to another page or place.

- Tier: 1
- Rendering: server
- Requires: 

## When to use

- Navigating to another page
- Linking to an external site

## When not to use

- Running an action on the current page → use `button`

## Parts

### `<Link>`

The anchor. Underlined so it never relies on color alone. Renders `<a data-slot="link">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `href` | `string` | **required** | Destination URL. |
| `variant` | `"inline" \| "standalone"` | `"inline"` | inline: inside running text. standalone: on its own line or in a list. |
| `external` | `boolean` | `false` | Opens in a new tab and says so to screen readers. |

className may only adjust: margin, width, layout, position.

## Accessibility

- Link text names the destination; never 'here' or 'more'.
- External links announce that they open a new tab.

## States

`hover`, `focus-visible`, `visited`

## Tokens

`color.link`, `focus-ring.*`

## Examples

### Inline link

```tsx
<p>詳しくは<Link href="/docs">使い方ガイド</Link>をご覧ください。</p>
```
