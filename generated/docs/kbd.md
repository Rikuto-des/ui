# Kbd

A key or keyboard shortcut, in a native <kbd>.

- Tier: 1
- Rendering: server
- Requires: 

## When to use

- Shortcuts in help text and tooltips

## When not to use

- Code → use `code`

## Parts

### `<Kbd>`

One key. Put several side by side for a combination. Renders `<kbd data-slot="kbd">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `pressed` | `boolean` | `false` | Visual key-down state; the app owns shortcut handling. |

className may only adjust: margin.

## Accessibility

- Write the key's name as text (⌘ is read as its name on most screen readers).

## States



## Tokens

`color.border-strong`, `radius.control`

## Examples

### Shortcut

```tsx
<Kbd>⌘</Kbd><Kbd>K</Kbd>
```
