# Collapsible

One section that opens and closes: a native <details>.

- Tier: 1
- Rendering: server
- Requires: details
- Enhances with ::details-content + interpolate-size (fallback: opens without animation)

## When to use

- Advanced options under a form
- Details most people skip

## When not to use

- Several sections in a row → use `accordion`

## Parts

### `<Collapsible>`

The <details>, with the title in its <summary>. Renders `<details data-slot="collapsible">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `React.ReactNode` | **required** | Required summary text. |
| `description` | `React.ReactNode` | — | Optional summary of the contents or current settings, visible while closed. |
| `defaultOpen` | `boolean` | `false` |  |

className may only adjust: margin, width, layout, position.

## Accessibility

| Key | Behavior |
|---|---|
| Enter / Space | toggle |

- The title says what is inside.

## States

`open`

## Tokens

`color.text-muted`, `motion.overlay`

## Examples

### Advanced

```tsx
<Collapsible title="詳細な設定">…</Collapsible>
```
