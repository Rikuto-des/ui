# Urushi Studio sample app

2026-10-30

## 掲載先

- `/examples/`：実画面、アプリを開くリンク、使用コンポーネントへのリンク。
- `/examples/studio/`：ブラウザだけで動くプロジェクト管理アプリ。
- `/examples/studio/source/`：アプリ、保存処理、共通モデル、入力検証、CSSの実際のソースをビルド時に読み込んで掲載。
- サイトヘッダー、ドキュメントのナビゲーション、トップページのExamplesから移動できる。

## 実装

22種類のUrushiコンポーネントを使用。既存Studioのモデルと入力検証を再利用し、独立した保存キー `urushi-example-studio-v1` に保存する。既存Studioサーバーのデータは変更しない。新しい依存パッケージは追加していない。

- 一覧とボード、検索、状態・担当者の絞り込み、並び替え、ページ送り、行の選択と一括完了。
- Sheetで追加・編集し、Comboboxで担当者、DatePickerで期限を選択する。
- 削除確認、未保存の変更を破棄する確認、直前の変更の取り消し。
- コマンド検索、ワークスペース名、完了項目の表示設定、JSON書き出し、初期データへの復元。
- 保存できなかったときは入力を残す。壊れた保存データを自動で上書きしない。別タブの更新を検出した場合は保存を止めて再読み込みを案内する。
- モバイルでは進捗・期限を開閉でき、一覧への移動を短くした。パック・ライト／ダーク設定に追従する。

## 操作中に修正した共通コンポーネント

### DataTable

行選択とページ全選択の標準inputを、UrushiのCheckboxに置き換えた。チェックを描くアニメーション、一部選択のマーク、パック、テーマ、フォーカス表示を共有する。ラベルには44×44pxのクリック領域を確保した。

DataTable契約にCheckboxのCSS依存を宣言した。コンポーネント単位のCSS、CLIの生成CSSにも反映し、既存StudioのCSSも共通ソースから再生成した。

### DatePicker

表示中の月とフォーカス中の日付を分離した。前後の月の日付にポインターでフォーカスした瞬間にカレンダーが再構築され、クリックが届かなくなる問題を修正した。キーボードによる月の移動は維持する。

## 検証

- `pnpm --filter site build`：成功。
- `pnpm --filter studio build`：成功。
- `pnpm typecheck` / `pnpm lint`：成功。
- `node --test packages/cli/test/styles.test.ts`：3件成功。DataTable単体のCSSにCheckboxの表示とアニメーションが残ることを含む。
- Playwright site：`studio-example.spec.ts` と `client-components.spec.ts` がChromium / Firefox / WebKitで48件成功。
- Playwright product：既存Studioの検索・選択・カレンダー・コマンドに関する12件成功。
- サイトナビゲーションの24件はExamples追加後の検証で成功。
- 320pxと1440px、Graphite / Lucent、ライト／ダークでaxe違反なし。編集画面とボードも検査した。色や開閉の遷移が終わってから測定している。
- Checkboxの実際のSVGストロークが時間とともに描かれること、部分選択、全選択、Space操作、44pxのラベルの端からのクリック、動きを減らす設定を確認した。
- アプリ内ブラウザで追加、担当者検索、カレンダー選択、保存・再読み込み、破棄確認、一覧・ボード切り替え、モバイル編集を実際に操作した。

## 画面

`sample-app/` に実画面を保存。Examplesのプレビュー画像も実際のアプリから取得している。

- `studio-desktop.png`
- `studio-checkbox.png`
- `studio-mobile.png`
- `studio-mobile-editor.png`
- `examples-page.png`

## 対象外

ローカルサイトへの掲載まで実施。外部へのデプロイはしていない。認証、共有サーバー、端末間同期はこのサンプルの機能に含まれない。iPhone / Androidの実機、VoiceOver / NVDAでの今回の検証は行っていない。
