Popover は、トリガーの横に出る、モーダルでないパネルです。ネイティブの `popover` 属性と CSS anchor positioning で動きます。

## 使う場面

- 操作に付随するフィルタや設定。
- ページを使い続けながら見られる補足情報。

## 使わない場面

- 終わらせないと先に進めない作業には Dialog を使います。
- 操作の一覧は Menu を使います。
- ホバーで出る短い補足は Tooltip を使います。

## 利用者が用意するもの

- `id`：`Popover.Trigger` と `Popover.Close` がこの id を参照します。
- `title` か `aria-label`：パネルの名前です。どちらかが必須です。
- `side`（`top`・`bottom`・`start`・`end`）と `align`（`start`・`center`・`end`）：トリガーに対する位置です。start と end は文字の方向に従います。

## 振る舞い

- 画面の端で場所が足りないときは、反対側に回ります（`position-try-fallbacks`）。
- `mode="auto"`（既定）では、Esc キーや外側のクリックで閉じ、ほかの auto のポップオーバーを開くと閉じます。`mode="manual"` は明示的な操作でしか閉じません。
- トリガーから Tab キーでパネルの中に入れます。閉じると、フォーカスはトリガーに戻ります。
- JavaScript なしで動きます。

## してはいけないこと

- ポップオーバーの中に、ダイアログのような重い作業を詰め込まない。
- 位置を `style` や `className` で動かさない。`side` と `align` を使います。
