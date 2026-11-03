# コンポーネントのデザイン・操作・アクセシビリティのレビュー

2026年10月28日。shadcnの公開サイトとUrushiの一覧・詳細ページを実際に開き、見た目と操作を確認した。競合のデザインを参照したレビューであり、好みの評価や少数の操作から一般的な優劣を断定するものではない。

## 比較した画面

shadcnの[Dialog](https://ui.shadcn.com/docs/components/radix/dialog)、[Accordion](https://ui.shadcn.com/docs/components/radix/accordion)、[Tabs](https://ui.shadcn.com/docs/components/radix/tabs)、[Checkbox](https://ui.shadcn.com/docs/components/radix/checkbox)、[Button](https://ui.shadcn.com/docs/components/radix/button)を1280×960で確認した。Dialogの開閉、Accordionの展開、Tabsの矢印キー選択、CheckboxのクリックとSpaceを操作した。参照画像はこのフォルダーの `shadcn-*.png`。

Urushiは同じ幅でInput、Dialog、Checkbox、Tabs、Accordion、Navigation Menu、Tooltipを操作した。明暗テーマ、Dialogの390px・320px表示も目視確認した。一覧とその他の詳細ページは、以下の自動検査で補っている。

## 見つかった問題と修正

| 対象 | 問題 | 修正 |
| --- | --- | --- |
| 詳細プレビュー | 小さな例が左上に偏り、外側の文章と混ざって見えた | 300px以上の表示領域に中央配置。フォーム・小さな操作・幅広い例で幅を分けた |
| Dialog | サイトのh2指定が内部の見出しを上書きし、フォームの余白も重複していた | コンポーネントの見出しをサイトCSSから除外。見出し16px、Actionsの区切り、フォームの間隔を整理 |
| 入力・選択 | 枠のコントラストが背景に対して約1.5〜1.8:1だった | 明暗別の不透明な枠色に変更。2パック×4背景色の最小値は3.235:1。フォーカスは2pxの実線 |
| Checkbox / Switch | チェックに待ち時間があり、Switchの伸びが大きかった | チェックの遅延を削除。Switchを34×20pxにし、押下時の伸びを2pxに抑えた |
| オーバーレイ | 閉じる動作が表示時と同じ長さだった | 閉じる動作をGraphite 120ms、Lucent 160msに短縮 |
| Tooltip | 内容へポインタを移せず、代替ランタイムでは表示待ちをEscapeで取り消せなかった | ホバー可能にし、待機・表示中のEscapeを処理 |
| 動きを減らす設定 | Spinnerが回転を続け、Switchにも移動が残っていた | 回転とつまみの移動アニメーションを停止。状態と読み上げラベルは維持 |
| コントラストテーマ | カスタムの選択印やフォーカスが失われる可能性があった | システム色による枠・選択印・フォーカスを追加 |
| デモの状態 | 保存・入力エラー修正などの変化を十分に試せなかった | Buttonの保存中→完了→リセット、Inputのエラー解消、Tabsの入力保持を追加 |
| デモの文言 | 実際の送信・削除との区別や、説明用アイコンの意味が曖昧だった | プレビューであることを明記。Tooltipを説明アイコンに変更。ガイドの見出しを「必要な設定」「実装時の注意」に統一 |
| 配信 | 状態を持つInputの追加で、DialogページにもFieldの実装が入った | デモを個別チャンクに分割。SSRを残し、既存の配信検査も維持 |

主な修正箇所は `packages/react/styles/index.css`、`packages/packs/*/tokens.json`、`packages/core/src/tooltip.ts`、`apps/site/app/site.css`、`apps/site/examples/`、`apps/site/components/interactive-examples.tsx`。日本語はyomiyasuの方針で、動作・必須条件を変えずに推敲した。

非テキストの識別には[WCAGのNon-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)、Tooltipには[Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)、システム色には[MDN forced-colors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors)を参照した。[Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md)もレビューに使用した。

## 実施した検証

- Chromium・Firefox・WebKitのサイトテスト **153/153合格**。スキップ・不安定判定なし。記録は [site-tests.json](site-tests.json)。
- 48詳細プレビュー×2パック×明暗×3ブラウザの **576条件**でaxeのWCAG A/AA検査を通過。同じ条件で320pxの横はみ出しを検査。
- 開いたDialog・AlertDialog・Sheet・Popoverも各パック・テーマ・ブラウザでaxe検査。必須入力、Tabで背景へ移動しないこと、終了後のフォーカス復帰を確認。ネイティブDialogからブラウザUIへの移動は妨げない。
- Tooltipのホバー保持・Escape・キーボード表示、保存と入力修正、コントラストテーマ、動きを減らす設定、一覧操作、Navigation Menuの連続変形、JavaScript無効時の既存操作を確認。
- [色の計算結果](contrast.json)と色の単体テストを追加。関連単体テスト **14/14合格**。TypeScript、ESLint、[Urushi strict診断](strict-check.json)（82ファイル、エラー・警告0件）、本番ビルドも通過。
- 最終のガイド見出し・説明アイコン変更後は、全詳細ページ・Tooltip・配信コードの関連9テストを再確認。記録は `copy-tests.txt`。

自動検査はWCAGへの全面適合を保証しない。実機のVoiceOver/NVDA、Windows実機のコントラストテーマ、タッチ実機は未検証。WebKitではコントラストテーマのメディアクエリをエミュレートできるが、`forced-color-adjust`自体は未対応だったため、そのプロパティの値は対応エンジンで検査した。

## サイズと以前の比較記録

保存済みAI出力8件は変更せず、共通CSSと競合バージョンを固定して再ビルドした。新しいAI呼び出しは行っていない。`evals/navigation/runs/refinement-v1` の共通32テストが合格し、270ファイルのハッシュを照合した。

| ライブラリ | React・JS・CSS込みgzip |
| --- | ---: |
| Urushi | 86.22–86.23 KiB |
| Base UI | 115.24–115.39 KiB |
| Radix | 90.77–91.01 KiB |
| shadcn | 104.22–104.28 KiB |

このNavigation Menu課題の測定値であり、ライブラリ全体のサイズ順位や生成成功率を示すものではない。今回のアクセシビリティ改善でUrushiは前回の約86.1 KiBからわずかに増えた。測定対象・除外項目は[比較手順](../../navigation/README.md)を参照。

## 確認画像

- [Input / light](urushi-input-light.png)・[dark](urushi-input-dark.png)
- [Dialog / light](urushi-dialog-light.png)・[390px dark](urushi-dialog-mobile-dark.png)・[320px dark](urushi-dialog-320-dark.png)
- [Checkbox / dark](urushi-checkbox-dark.png)・[Accordion / dark](urushi-accordion-dark.png)
- [Tabs / light](urushi-tabs-light.png)・[Navigation Menu / dark](urushi-navigation-dark.png)
- [Components一覧](urushi-catalog-light.png)
