# Avatar

A person's picture, or their initial when there is no picture or it fails to load.

- Tier: 1
- Rendering: server
- Requires: 

## When to use

- Who wrote, owns or is assigned something

## When not to use

- A logo or an illustration → use `img`

## Parts

### `<Avatar>`

role=img named by `name`. The initial sits behind the picture and shows if it is missing or broken (no JavaScript). Renders `<span data-slot="avatar">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | **required** | Required. The person's name: the accessible name and the source of the initial. |
| `status` | `"online" \| "away" \| "busy" \| "offline"` | — | Presence indicator. Include a localized statusLabel. |
| `statusLabel` | `string` | — | Accessible presence text, appended to the name. |
| `src` | `string` | — | Optional picture URL. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` |  |

className may only adjust: margin, layout, position.

## Accessibility

- name is required; the picture itself is decorative.

## States



## Tokens

`color.surface`, `color.text-muted`

## Examples

### Assignee

```tsx
<Avatar name="佐藤 美咲" src="/people/sato.jpg" />
```
