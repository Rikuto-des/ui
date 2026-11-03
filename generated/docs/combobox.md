# Combobox

検索して候補を絞り込み、1つの値を選択します。

- Tier: 3
- Rendering: client
- Requires: React 19, Popover API

## When to use

- 検索して候補を絞り込み、1つの値を選択します。

## When not to use

- 検索や複雑な操作が不要な場合 → use `select`

## Parts

### `<Combobox>`

検索して候補を絞り込み、1つの値を選択します。 Renders `<div data-slot="combobox">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | **required** | 画面に表示するラベル。必須です。 |
| `options` | `readonly import("../combobox.tsx").ComboboxOption[]` | **required** | valueは一意にします。無効な候補はキーボード移動で飛ばします。iconで装飾、keywordsで別名の検索語を追加できます。 |
| `value` | `string` | — |  |
| `defaultValue` | `string` | — |  |
| `onValueChange` | `(value: string, option: import("../combobox.tsx").ComboboxOption) => void` | — |  |
| `query` | `string` | — | 候補を検索する文字列。確定したvalueとは別に保持します。 |
| `onQueryChange` | `(query: string) => void` | — | 検索語の変更を受け取ります。候補を開くときと選択時には空文字になります。非同期取得の古い応答は呼び出し側で除外します。 |
| `filter` | `"local" \| "manual"` | `"local"` | manualではoptionsを再絞り込みせず表示します。サーバー側で検索・順位付けするときに指定します。確定した選択の表示は候補が入れ替わっても保持します。 |
| `loadOptions` | `import("../combobox.tsx").ComboboxLoader` | — | 非同期で候補を取得する関数。検索語と{signal}を受け取り、候補配列を返します。開く・検索する・再試行するたびに呼ばれ、結果は再絞り込みせず表示します。閉じる・無効化・削除時に中断し、古い応答も除外します。optionsには初期選択を含めます。関数の参照変更だけでは再取得しません。データ源を切り替える場合はReactのkeyも変えます。 |
| `loadingText` | `string` | — |  |
| `errorText` | `string` | — |  |
| `retryLabel` | `string` | — |  |
| `loading` | `boolean` | — |  |
| `emptyText` | `string` | — |  |
| `renderPreview` | `(option: import("../combobox.tsx").ComboboxOption) => import("react").ReactNode` | — | 候補の詳細を表示します。クリック・タップ・矢印キーではプレビューを切り替え、Enterまたは確定ボタンで選びます。プレビューには操作ボタンを含めず、重要な情報はdescriptionにも含めます。狭い画面では候補の下に表示します。 |
| `previewLabel` | `string` | — | 詳細領域のアクセシブルな名前。 |
| `previewActionLabel` | `string` | — | プレビュー中の候補を確定するボタンの文言。 |

className may only adjust: margin, width, layout, position.

## Accessibility

| Key | Behavior |
|---|---|
| ArrowDown / ArrowUp | 候補を開き、選択できる項目へ移動します。取得エラー時は再試行ボタンへ移動します |
| Enter | 現在の候補を選択します |
| Escape | 選択済みの値を変えずに閉じます |
| Tab | プレビューの詳細・確定ボタンへ順に移動します。取得エラー時は再試行へ移動します |

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
<Combobox label="担当者" options={[{ value: "mika", label: "Mika Sato" }, { value: "kai", label: "Kai Ito" }]} />
```
