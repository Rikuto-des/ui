# Item

A row of a list: an icon, a title, a description and one action, like the rows of a settings screen. Item.Group is the list (a bordered panel with lines between the rows); a row with href is one link.

- Tier: 1
- Rendering: server
- Requires: 

## When to use

- Settings screens
- Lists of accounts, files or members with one action per row

## When not to use

- Rows compared by column → use `table`
- Many rows to sort or filter → use `data-table`
- Actions in a popup → use `menu`

## Parts

### `<Item>`

One row (<li>). With href the whole row is a link and ends in a chevron; then it takes no action. Renders `<li data-slot="item">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `React.ReactNode` | **required** | Required. What the row is. |
| `description` | `React.ReactNode` | — | Optional supporting text: the current value or a hint. |
| `icon` | `React.ReactNode` | — | Optional decorative icon at the start. |
| `action` | `React.ReactNode` | — | Optional control at the end: a small Button, a Switch or a Badge. Not with href. |
| `href` | `string` | — | Makes the whole row a link to this URL. |

className may only adjust: nothing (visuals come from the pack).

### `<Item.Group>`

The list (<ul role=list>). outline draws the panel; plain leaves only the lines between the rows, for use inside a Card. Renders `<ul data-slot="item-group">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Accessible name of the list, when no heading names it. |
| `variant` | `"outline" \| "plain"` | `"outline"` |  |

className may only adjust: margin, width, layout, position.

## Accessibility

- Put Item only inside Item.Group.
- A row with href has no action: a link cannot contain another control.
- A Switch in action needs its own aria-label (the row title is not its label).
- The icon is decorative (aria-hidden); the title carries the meaning.

## States



## Tokens

`color.border`, `color.surface`, `color.text-muted`, `color.ghost-hover`, `radius.panel`

## Examples

### Account settings

```tsx
<Item.Group label="アカウント">
  <Item title="メールアドレス" description="hanako@example.jp" action={<Button size="sm" variant="secondary">変更</Button>} />
  <Item title="お知らせメール" description="締め切りの前日に送ります" action={<Switch aria-label="お知らせメール" defaultChecked />} />
  <Item title="パスワードと二段階認証" description="最後の変更は 3 か月前" href="/settings/security" />
</Item.Group>
```
