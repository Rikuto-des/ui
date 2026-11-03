# Command

コマンドを検索し、キーボードで実行するダイアログです。

- Tier: 3
- Rendering: client
- Requires: React 19, dialog.showModal

## When to use

- コマンドを検索し、キーボードで実行するダイアログです。

## When not to use

- 検索や複雑な操作が不要な場合 → use `menu`

## Parts

### `<Command>`

コマンドを検索し、キーボードで実行するダイアログです。 Renders `<dialog data-slot="command">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | **required** |  |
| `open` | `boolean` | **required** |  |
| `onOpenChange` | `(open: boolean) => void` | **required** |  |
| `items` | `readonly import("../command.tsx").CommandItem[]` | **required** |  |
| `placeholder` | `string` | — |  |
| `emptyText` | `string` | — |  |
| `closeLabel` | `string` | — |  |
| `navigationHint` | `string` | — |  |
| `actionHint` | `string` | — |  |

className may only adjust: margin, width, layout, position.

## Accessibility

| Key | Behavior |
|---|---|
| ArrowDown / ArrowUp | 実行できるコマンドへ移動します |
| Enter | 現在のコマンドを実行します |
| Escape | 閉じて元のフォーカス位置へ戻ります |
| Tab | ダイアログ内の操作へ移動します |

- 用途が伝わるlabelを指定します。
- 候補・項目・行には重複しない固定のIDを指定します。
- 組み合わせた画面を、対象の支援技術で確認してください。

## States

`disabled`, `empty`, `focused`

## Tokens

`color.text`, `color.surface`, `color.focus-ring`, `radius.control`

## Examples

### Example

```tsx
<Command label="コマンド" open={open} onOpenChange={setOpen} items={[{id:"new",label:"作成",onSelect: createProject}]} />
```
