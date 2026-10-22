Input は、1 行の文字を入力するネイティブの `<input>` です。

## 使う場面

- 名前・メールアドレス・URL・数値・日付など、短い入力。

## 使わない場面

- 複数行の入力には Textarea を使います。
- 決まった選択肢から選ぶなら Select か RadioGroup を使います。

## 利用者が用意するもの

- Field の中に置きます。ラベル・説明・エラーの結びつけは Field が行います。
- 内容に合った `type` と `autoComplete`（`email`・`name` など）。
- `size`（`sm`・`md`・`lg`）：高さは同じ大きさの Button とそろいます。

## 振る舞い

- フォーカスで枠がアクセントの色になり、外側に薄い輪が出ます。
- `invalid` または `aria-invalid`、ブラウザ標準の `:user-invalid` で枠が danger の色になります。

## してはいけないこと

- 例の値を placeholder に書いてラベルの代わりにしない。ラベルは Field の `label` です。
- `className` で枠や色を変えない。幅（`w-*`）と外側の余白（`m-*`）だけ変えられます。
