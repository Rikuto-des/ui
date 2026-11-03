# 全52コンポーネントのUX確認・残り32種類の改善

2026-10-29。ローカルサイト `http://localhost:3200` に反映。

## 今回の範囲

未対応だった32種類すべてに、操作結果が画面に反映される例を実装した。32種類をin-app browserで実際に操作し、表示結果と画面を記録した。前回までに改善した20種類を含め、全52種類の詳細・一覧を3ブラウザで監査した。

コンポーネント本体と利用例を区別している。本体には9種類の公開APIを追加した。入力した内容の保存、アーカイブの復元、プロフィールの切替などのアプリ固有の状態は、コピー可能な利用例に実装した。新しいアニメーションライブラリや実行時依存は追加していない。

## 本体に追加したAPI

| Component | API・振る舞い |
|---|---|
| Command | `CommandItem.description` / `preview`、空白で区切った複数語のAND検索、`closeLabel` / `navigationHint` / `actionHint` |
| DatePicker | `presets`。不正日付・範囲外は無効。閉じたカレンダーを初期HTMLに含めず、ブラウザごとの日付表記による初期描画ずれを回避 |
| DataTable | `renderDetails`。固定の行IDに展開状態を結び付け、並び替え・ページ送り後も保持。選択領域を44pxに拡大 |
| Field | `success`。入力と説明を関連付け、エラーがあるときはエラーを優先 |
| Avatar | `status` / `statusLabel`。空の名前を安全に扱い、絵文字のまとまりを壊さない頭文字生成 |
| Kbd | `pressed`。押下の沈み込みを表現。キーの受付はアプリ側 |
| Spinner | `showLabel`。リングと処理内容を一緒に表示 |
| Card | `selected`。選択時の枠と背景。操作は実際のButton・Checkboxなどを使用 |
| Menu.Item | `description` / `shortcut`。説明とショートカットの表示。キーの登録はアプリ側 |

ScrollAreaの上下の影、Linkの下線、Tableの密度変更、詳細や補足の表示にも動きを追加した。動きを減らす設定では、新しい移動・フェードを省略する。画面全体を一時的に停止するテーマ切替をやめ、操作を受け付けたまま色をフェードさせる。

## 32種類の変更と操作時の画面

| Component | 確認した操作・改善 | 記録 |
|---|---|---|
| [command](http://localhost:3200/components/command/) | 複数語検索、候補の補足とプレビュー、設定への移動、編集内容の保持 | [画面](all-components-ux/command.png) |
| [date-picker](http://localhost:3200/components/date-picker/) | 日付候補、範囲外・不正日付の無効化、選択後のフォーカス復帰 | [画面](all-components-ux/date-picker.png) |
| [data-table](http://localhost:3200/components/data-table/) | 行内の詳細、検索、一括アーカイブと復元、44pxの選択操作領域 | [画面](all-components-ux/data-table.png) |
| [button](http://localhost:3200/components/button/) | 入力内容の保存、処理中の取消、完了のフィードバック | [画面](all-components-ux/button.png) |
| [link](http://localhost:3200/components/link/) | 実際のアンカー移動、到着先のフォーカス、下線の変化 | [画面](all-components-ux/link.png) |
| [button-group](http://localhost:3200/components/button-group/) | 縮小・拡大・等倍と、実際のプレビューへの反映 | [画面](all-components-ux/button-group.png) |
| [menu](http://localhost:3200/components/menu/) | 操作の補足とショートカット表示、複製・アーカイブ・復元 | [画面](all-components-ux/menu.png) |
| [field](http://localhost:3200/components/field/) | 成功メッセージと説明の関連付け、エラーの優先、修正例 | [画面](all-components-ux/field.png) |
| [input](http://localhost:3200/components/input/) | 表紙への即時反映、消去後の入力継続、デモ文字列の表示切替 | [画面](all-components-ux/input.png) |
| [input-group](http://localhost:3200/components/input-group/) | アドレスの接頭辞・入力・反映を同じ場所に集約 | [画面](all-components-ux/input-group.png) |
| [select](http://localhost:3200/components/select/) | 担当者に応じたプロフィールと次の作業の切替 | [画面](all-components-ux/select.png) |
| [date-input](http://localhost:3200/components/date-input/) | 開始日と終了日から期間を算出、逆転した日付の修正案内 | [画面](all-components-ux/date-input.png) |
| [otp-input](http://localhost:3200/components/otp-input/) | 貼り付け可能な単一入力、見本コードの照合、やり直し | [画面](all-components-ux/otp-input.png) |
| [card](http://localhost:3200/components/card/) | 選択状態、コレクションへの追加・解除、詳細の展開 | [画面](all-components-ux/card.png) |
| [badge](http://localhost:3200/components/badge/) | 状態と件数の表示、一覧の絞り込み | [画面](all-components-ux/badge.png) |
| [avatar](http://localhost:3200/components/avatar/) | 在席状態と読み上げ名、メンバー選択、絵文字の頭文字対応 | [画面](all-components-ux/avatar.png) |
| [kbd](http://localhost:3200/components/kbd/) | キーの押下表現、フォーカスが外れたときの解除 | [画面](all-components-ux/kbd.png) |
| [table](http://localhost:3200/components/table/) | 金額と合計の切替、数字の右寄せ、行の密度変更 | [画面](all-components-ux/table.png) |
| [separator](http://localhost:3200/components/separator/) | 操作のグループ分け、文字揃え・太字の実用例 | [画面](all-components-ux/separator.png) |
| [aspect-ratio](http://localhost:3200/components/aspect-ratio/) | 縦横比の連続変化、構図の移動 | [画面](all-components-ux/aspect-ratio.png) |
| [scroll-area](http://localhost:3200/components/scroll-area/) | 残りの内容を示す上下の影、末尾・先頭への移動 | [画面](all-components-ux/scroll-area.png) |
| [spinner](http://localhost:3200/components/spinner/) | 見える処理ラベル、取消・完了・再試行 | [画面](all-components-ux/spinner.png) |
| [skeleton](http://localhost:3200/components/skeleton/) | 読込前後の位置・高さの保持、内容への切替、再読み込み | [画面](all-components-ux/skeleton.png) |
| [breadcrumb](http://localhost:3200/components/breadcrumb/) | 親・子の階層移動、移動先の見出しへのフォーカス | [画面](all-components-ux/breadcrumb.png) |
| [pagination](http://localhost:3200/components/pagination/) | 一覧の実際の切替、ページ番号へのフォーカス、位置保持 | [画面](all-components-ux/pagination.png) |
| [sidebar](http://localhost:3200/components/sidebar/) | 選択した内容の表示、現在地の表示、グループの折りたたみ | [画面](all-components-ux/sidebar.png) |
| [dialog](http://localhost:3200/components/dialog/) | 編集・確認・反映、戻ったときの入力保持、手順ごとのフォーカス | [画面](all-components-ux/dialog.png) |
| [alert-dialog](http://localhost:3200/components/alert-dialog/) | 操作前の確認、安全な初期フォーカス、操作後の復元 | [画面](all-components-ux/alert-dialog.png) |
| [sheet](http://localhost:3200/components/sheet/) | 編集中のプレビュー、キャンセルで破棄、保存時に背面へ反映 | [画面](all-components-ux/sheet.png) |
| [popover](http://localhost:3200/components/popover/) | 設定を開いたままキャンバスのグリッド・ガイドを調整 | [画面](all-components-ux/popover.png) |
| [hover-card](http://localhost:3200/components/hover-card/) | フォーカスとホバーで概要、クリック・タップで詳細へ移動 | [画面](all-components-ux/hover-card.png) |
| [tooltip](http://localhost:3200/components/tooltip/) | 名前付きの保存・通知ボタン、操作結果に応じた補足 | [画面](all-components-ux/tooltip.png) |

## 検証

- TypeScript、ESLint、サイトの静的ビルド。
- 単体テスト287件。ブラウザ検証は重複する再実行を除き510件（サイト369件・コンポーネント141件）。失敗を修正した項目は最終結果で集計。
- Chromium・Firefox・WebKitで32種類の操作、取消・復元、キーボード操作、フォーカス復帰。
- 全52種類の詳細をGraphite / Lucent、light / darkで監査。デスクトップでaxe、320pxでページとプレビューの横はみ出しを確認。
- 一覧も全52種類を320px / 1440px、2パック・明暗テーマで確認。
- 状態変更後の10種類を320px・明暗テーマでaxe監査。メニューやダイアログを開いた状態も確認。
- DatePickerの閏日・不正日付・上下限、DataTableの並び替えと展開状態、Commandの無効項目・複数語検索・動きを減らす設定を追加検証。
- 既存のCheckboxの動き、ネイティブ操作、サイドバーのスクロール保持、JavaScriptなしの基本操作も回帰確認。

集計と実行ログは[validation.json](all-components-ux/validation.json)。実操作の記録は[manual-checks.json](all-components-ux/manual-checks.json)、全52種類の対応表は[coverage.json](all-components-ux/coverage.json)。画面は操作時の記録のため、後から短くした見出しと一部表記が異なるものがある。完成時の画面は[DataTable](all-components-ux/final-data-table.png)と[Command](all-components-ux/final-command-mobile.png)。

## 実操作・監査で修正した問題

- DialogのIDがページのPreviewタブと衝突し、開けない問題。
- Skeletonの完了時に高さが変わり、内容と余白がずれる問題。
- 小さい画面でDataTableの選択領域が隣の操作と重なる問題。
- ドキュメントの表用CSSがDataTableの余白に干渉する問題。読み上げ用の見出しもスクロール領域内に収め、狭い画面ではみ出さないようにした。
- 成功メッセージのコントラストとAvatarの見える名前・読み上げ名の不一致。
- Safari系で日付の空白や円記号がサーバーの表示と異なり、初期描画がずれる問題。
- Breadcrumb、確認コード、復元操作の後でフォーカスを失う問題。
- テーマ切替直後の入力が一時的に受け付けられない問題。

## 未検証・範囲外

この変更後のiPhone / Android実機、VoiceOver / NVDAによる読み上げ操作は未実施。モバイル幅のブラウザ検証を実機検証とは扱っていない。保存・認証・アーカイブの利用例はページ内だけのデモで、バックエンド接続や実際の公開処理は追加していない。競合とのAI生成比較を今回再実行したという意味ではない。

## サイズ

[サイズ計測ログ](all-components-ux/size.log)を保存。Reactなどの外部依存を含まない個別のgzip計測で、全52コンポーネント17.79 KB、全runtime 11.62 KB、全コンポーネントCSS 16.58 KB、Graphite 1.18 KB。個別の圧縮値をそのまま実配信の合計とは扱わない。
