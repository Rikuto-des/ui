# Accordion

Collapsible sections built on native <details>/<summary>; a shared name makes them exclusive.

- Tier: 1
- Rendering: server
- Requires: details, details[name]
- Enhances with ::details-content + interpolate-size (fallback: opens without animation)

## When to use

- FAQs
- Secondary settings that most people skip

## When not to use

- Switching between views of equal weight → use `tabs`

## Parts

### `<Accordion>`

Groups items. With a name, opening one item closes the others (native exclusive accordion). Renders `<div data-slot="accordion">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | — | Shared details name: only one item open at a time. |

className may only adjust: margin, width, layout, position.

### `<Accordion.Item>`

One section: <details> with the title in its <summary>. Renders `<details data-slot="accordion-item">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `React.ReactNode` | **required** | Required summary text. |
| `description` | `React.ReactNode` | — | Optional summary of the contents or current settings, visible while closed. |
| `defaultOpen` | `boolean` | `false` |  |

className may only adjust: nothing (visuals come from the pack).

## Accessibility

| Key | Behavior |
|---|---|
| Enter / Space | toggle the focused item |

- Titles are short and say what the section holds.

## States

`open`

## Tokens

`color.border`, `motion.overlay`

## Examples

### FAQ

```tsx
<Accordion name="faq">
  <Accordion.Item title="料金はかかりますか？">無料で始められます。</Accordion.Item>
  <Accordion.Item title="解約はいつでもできますか？">はい、いつでもできます。</Accordion.Item>
</Accordion>
```
