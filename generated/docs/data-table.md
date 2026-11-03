# DataTable

並び替え、ページ送り、行の選択に対応したテーブルです。

- Tier: 3
- Rendering: client
- Requires: React 19, HTML table

## When to use

- 並び替え、ページ送り、行の選択に対応したテーブルです。

## When not to use

- 検索や複雑な操作が不要な場合 → use `table`

## Parts

### `<DataTable>`

並び替え、ページ送り、行の選択に対応したテーブルです。 Renders `<div data-slot="data-table">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | **required** | テーブルの用途が伝わる名前。 |
| `rows` | `readonly unknown[]` | **required** |  |
| `columns` | `readonly import("../data-table.tsx").DataTableColumn<unknown>[]` | **required** |  |
| `getRowId` | `(row: unknown) => string` | **required** | 並び順が変わっても一定のID。行番号は使いません。 |
| `getRowLabel` | `(row: unknown) => string` | — |  |
| `selectedIds` | `readonly string[]` | — |  |
| `onSelectionChange` | `(ids: string[]) => void` | — |  |
| `locale` | `string` | `"en"` | 操作ラベルはen・jaに対応。並び替えにも使います。 |
| `pageSize` | `number` | `10` |  |
| `loading` | `boolean` | — |  |
| `renderDetails` | `(row: unknown) => React.ReactNode` | — | 行末のボタンで展開する詳細。 |
| `empty` | `React.ReactNode` | — | 0件のときに表示する内容 |

className may only adjust: margin, width, layout, position.

## Accessibility

| Key | Behavior |
|---|---|
| Tab | 並び替え・選択・ページ送りの操作へ移動します |
| Space | 行の選択を切り替えます |
| Enter | 列を並び替えるか、ページを切り替えます |

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
<DataTable label="プロジェクト" rows={[{id:"1",name:"Website"}]} getRowId={row => row.id} columns={[{id:"name",header:"名前",cell: row => row.name,sortValue: row => row.name}]} />
```
