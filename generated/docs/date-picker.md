# DatePicker

日付を直接入力するか、カレンダーから選択します。

- Tier: 3
- Rendering: client
- Requires: React 19, dialog.showModal

## When to use

- 日付を直接入力するか、カレンダーから選択します。

## When not to use

- 検索や複雑な操作が不要な場合 → use `date-input`

## Parts

### `<DatePicker>`

日付を直接入力するか、カレンダーから選択します。 Renders `<div data-slot="date-picker">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | **required** | 画面に表示するラベル。必須です。 |
| `value` | `string` | — | YYYY-MM-DD形式。タイムゾーン変換は行いません。 |
| `defaultValue` | `string` | — |  |
| `onValueChange` | `(value: string) => void` | — |  |
| `min` | `string` | — |  |
| `max` | `string` | — |  |
| `locale` | `string` | `"en"` |  |
| `presets` | `readonly { label: string; value: string }[]` | — | 日付候補。valueはYYYY-MM-DD形式。範囲外は選択できません。 |

className may only adjust: margin, width, layout, position.

## Accessibility

| Key | Behavior |
|---|---|
| Arrow keys | 左右で1日、上下で1週間移動します |
| Home / End | 週の最初または最後の日へ移動します |
| PageUp / PageDown | 前月・翌月へ移動します。Shiftを押すと年を切り替えます |
| Enter | 日付を選択します |
| Escape | カレンダーを閉じ、開いたボタンへ戻ります |

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
<DatePicker label="期限" defaultValue="2026-10-30" locale="ja" />
```
