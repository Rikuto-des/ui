# 入力・選択・進行を確かめられる12のプレビュー

2026年10月29日。前回のCheckbox、Slider、Carousel、Switchに続き、以下の12コンポーネントの機能・動き・操作例を改善しました。

## 共通コンポーネントの変更

| 対象 | 内容 |
| --- | --- |
| Textarea | `showCount`で文字数と上限の目安を表示。上限に近づくと小さな円の色が変わります。`field-sizing`未対応のブラウザではRuntimeが高さを補います。 |
| FileInput | `showFiles`でファイル名、容量、画像プレビュー、個別取消を表示。取消は実際のFileListに反映し、リセットと無効化にも追従します。 |
| ToggleGroup | 単一選択の背景が260msで移動。幅の異なる項目、折り返し、RTL、キーボード操作、リセットに追従します。 |
| RadioGroup | `variant="cards"`で説明を含む面全体を選択。選択枠、フォーカスリング、ラジオの点の動きを整えました。 |
| Accordion / Collapsible | `description`で現在の設定や要約を見出しに表示。閉じても設定が分かり、入力も保持されます。 |
| Progress | `milestones`で通過点を表示。`valueText`でページ数などを伝え、帯の幅を連続して変化させます。 |
| Meter | 値が変わる際の帯の動きを追加しました。 |
| Steps | 現在位置のリング、完了の印、接続線の変化を整えました。 |
| Toggle | 押した際の反応を追加しました。 |

文字数はネイティブの`maxLength`と同じUTF-16単位です。日本語の変換中の文字を独自に削除しません。FileInputはファイルを端末内で扱い、送信しません。画像用のObject URLは選び直し・取消・コンポーネントの削除・Runtimeの解除時に破棄します。

Textareaの文字数、FileInputの追加表示、ToggleGroupの追従表示にはUrushiRuntimeを使います。JavaScriptを無効にしても、ネイティブの入力・選択・開閉は利用できます。動きを減らす設定に対応し、アニメーション用の依存パッケージは追加していません。API契約、生成ファイル、説明、一覧のプレビューも更新しました。

## 詳細ページの操作例

- Textareaでメモを確定し、未反映の変更を確認できます。
- FileInputで見本の画像とテキストのプレビュー・取消・リセットを試せます。
- RadioGroupで公開範囲を選ぶと、閲覧者の見本が変わります。
- ToggleGroupで同じノートをリスト・グリッド・コンパクト表示に切り替えます。
- Accordionで基本情報・共有・通知の設定を見出しに反映します。
- Collapsibleで画質とメタデータの設定を閉じた見出しに反映します。
- Progressで6ページの処理を再現し、一時停止と再開ができます。完了後もキーボードフォーカスを保持します。
- Meterで保存形式に応じた容量の見本を表示します。分割した図とネイティブの帯で、同じ段階の色を使います。
- Stepsで名前・共有・確認の3段階を進めます。前に戻っても入力が残り、移動先の見出しにフォーカスします。
- Emptyで白紙・見本からの作成、検索結果なし、検索解除を試せます。
- Alertで再試行から復帰までを再現し、処理後も同じボタンにフォーカスを残します。
- Toggleで太字・斜体・ハイライトが文章に反映されます。

EmptyとAlertの変更は操作例で、共通APIは変更していません。これらの例の作成・保存・書き出し・通信はページ内の見本で、外部への送信や永続保存は行いません。

## 検証

| 対象 | 結果 |
| --- | --- |
| 新機能、アニメーション途中の位置、JavaScript無効時 | 9課題×3ブラウザ、27件成功 |
| 既存フォーム、開閉、Checkbox、Slider、Carouselなど | 195件成功 |
| 12の詳細ページ、全52件の一覧、サイドバー | 45件成功 |
| 単体テスト | 284件成功 |
| 型検査、lint、生成、サイトビルド | 成功 |

再確認の重複を除いたブラウザテストは267件です。Chromium、Firefox、WebKitで確認しました。詳細ページは320pxと1280px、ライトとダークの48通りを各ブラウザで検査し、axeの対象ルールで違反はありませんでした。一覧も2パック・2テーマの既存検証を通っています。

最初の検査で見つけたFileInput無効化時の監視の循環、ファイル種類表示のコントラストを修正しました。実画面では完了ボタンの文言、処理後のフォーカス、日本語の改行、容量表示の色も整えました。WebKitはポインタで押したボタンを必ずしもフォーカスしないため、保持の検証はキーボードで操作を開始して確かめています。

アプリ内ブラウザで12種類を実際に操作しました。319px幅でも入力と選択を確認しています。端末実機とスクリーンリーダーによる今回の追加機能の検証は未実施です。

記録の保存時にディスク容量が不足したため、この作業で再生成できるサイトのTurbopackキャッシュとビルド時の中間出力を削除しました。ソースと静的サイトの出力は保持しています。

## サイズ

`pnpm size`によるgzip計測です。React本体は外部扱いで、次の数値は独立した計測値です。

| 対象 | gzip |
| --- | --- |
| 全52コンポーネントのJavaScript | 17.10 KB |
| 全振る舞いを含むRuntime | 11.62 KB |
| コンポーネントCSS全体 | 15.84 KB |
| Graphiteパック | 1.18 KB |

既存のAI比較結果は変更していません。競合との追加比較は今回実施していません。

## 記録

- [FileInputの実画面](remaining-ux/file-input-desktop.png)
- [Progressの一時停止](remaining-ux/progress-desktop.png)
- [モバイル幅のRadioGroup](remaining-ux/radio-group-mobile.png)
- [新機能](remaining-ux/components.log)・[ファイル操作の最終確認](remaining-ux/files-final.log)
- [アニメーション途中とJavaScript無効時](remaining-ux/native-motion.log)
- [回帰テスト](remaining-ux/regressions.log)
- [サイト初回検査](remaining-ux/site-initial.log)・[コントラスト修正後](remaining-ux/site-themes.log)・[フォーカス保持](remaining-ux/focus-final.log)
- [単体テスト](remaining-ux/unit.log)・[型検査](remaining-ux/typecheck.log)・[lint](remaining-ux/lint.log)・[ビルド](remaining-ux/build.log)・[サイズ](remaining-ux/size.log)
