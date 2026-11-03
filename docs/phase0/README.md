# Phase 0 の結果（2026-10-22）

一番大きなリスクだった「オーバーレイのアクセシビリティを、ブラウザ標準の要素で保証できるか」に答えを出した。あわせて、契約からの生成、パック、配布、lint、Next.js での動作まで、一通りつながることを確かめた。

`pnpm verify` 1 つで全部を検証できる（生成 → 型チェック → 単体テスト → lint → 静的ページ → E2E → Next.js の E2E）。

## できたもの

| 領域 | 中身 |
|---|---|
| 契約 | `contracts/*.contract.ts`（zod）。`urushi build` で、型・JSON Schema・ドキュメント・lint 用データ・SKILL.md・llms.txt・配布用データ・パックの CSS を生成する |
| 部品 | Button・Dialog・Popover（`@urushi/react`）。実行時に依存するのは react だけ。Server Components のまま使える |
| パック | Graphite・Lucent（DTCG トークン、ライト／ダーク、Noto Sans JP）。実行時に切り替えられ、範囲ごとに入れ子にもできる |
| CLI | `urushi init / add / diff / info / build`。lockfile に版とハッシュを記録し、元のファイルを `.urushi/base` に保存する。改ざんされた配布データはインストールしない |
| lint | `@urushi/eslint-plugin` の 6 ルール。エラー文には「何が駄目か」と「代わりにどう書くか」を必ず書く |
| デザインシステム | https://claude.ai/artifact/81F4wiBJYhaYfJKNKvqqZg 。`pnpm ds` でコードから生成する |
| 提案 | `apps/playground/public/proposals/`（v1、v2） |

## 検証結果

| 対象 | 件数 | 結果 |
|---|---|---|
| 単体テスト（トークン変換、CLI、lint ルール 40 件、違反見本） | 48 | すべて成功 |
| playground の E2E（Dialog、Popover、JS なしの静的ページ、機能検出、axe、アクセシビリティツリー） | 117（うち 5 件スキップ） | すべて成功 |
| Next.js 16.4 の本番ビルドの E2E（JS あり・なし × 3 エンジン） | 12 | すべて成功 |
| 型チェック（TypeScript 6.0.3） | — | 通過 |
| lint（リポジトリ全体） | — | 違反 0 件 |

スキップした 5 件は、そのエンジンでは測れない項目。WebKit の Tab 移動（macOS の設定に依存）と、Chromium の CDP でしか読めないアクセシビリティツリーの検証。

### React Aria が「汎用ライブラリでは `<dialog>` は使えない」とした 5 つの懸念に対する結論

| 懸念 | 結論 |
|---|---|
| ① top layer の相互運用 | ライブラリ内のオーバーレイはすべて top layer にそろえた。入れ子のパックのトークンも、top layer の中でそのまま継承される（テストで確認） |
| ② 閉じるときのアニメーション | Chromium ではアニメーションする。Firefox と WebKit は `overlay` に対応していないため、すぐに閉じる。壊れはしない |
| ③ 背景のスクロール止め | `:root:has(:modal)` で止まり、レイアウトの幅もずれない |
| ④ フォーカスの閉じ込め | ネイティブのモーダルで、フォーカスが外に出ない。背景はクリックもできない。Chromium のアクセシビリティツリーでも、背景が外れていることを確認した |
| ⑤ aria-modal の副作用 | ARIA を自前で付けず、ネイティブの意味づけに任せた。名前・説明・modal が正しく公開されている |

### アクセシビリティ

- **axe（WCAG 2.2 の A・AA）**: 2 パック × ライト／ダーク × 通常・ダイアログを開いた状態・ポップオーバーを開いた状態で、3 エンジンとも違反 0 件。
- **文字のコントラスト**: 4 テーマすべてで、文字は 4.5:1、フォーカスリングは 3:1 以上になるよう、パックの色を計算して調整した。
- **スクリーンリーダー**: 実際の読み上げは手動で確認する必要がある。手順は [screen-reader-checklist.md](screen-reader-checklist.md)。VoiceOver・NVDA・TalkBack の実機確認はまだ。

### Server Components と JavaScript なしでの動作

- **静的ページ**: スクリプトが 0 個のページでも、ダイアログ・ポップオーバー・フォーム送信が 3 エンジンで動く。
- **Next.js 16.4**:
  - `urushi add` で入れた部品を Server Components のまま使い、ページは静的に事前生成された。
  - ブラウザに送られる JS のうち、部品のコードを含むファイルは 0 個。送られるのは、任意で入れる補助スクリプト（Safari 向けの `closedby` の代わり）だけ。

### サイズ（minify + gzip、React は含まない）

| | Dialog と Popover |
|---|---|
| Urushi（Button 込み） | 0.99 KB |
| Radix | 25.72 KB |
| Base UI | 42.71 KB |

## 途中で決めたこと・分かったこと

- **TypeScript**: 7（Go 版）は typescript-eslint がまだ対応していないので、6.0.3 にそろえた。
- **素材の指定**: Graphite では `backdrop-filter` 自体を付けない（`none`）。ぼかし 0 のままでも、背景の彩度が変わり、配置の基準（containing block）まで変わってしまうため。
- **Safari のフォーカス**: マウスでクリックしてもボタンにフォーカスが移らない（Safari 標準の動き）。そのため、マウスで閉じたときはトリガーにフォーカスが戻らない。キーボード操作なら戻る。
- **lint の効き目**: lint ルールは自分のコードにも効いた。デザインシステムの見本で Dialog に付けていた className を検出したので、直した。

## 次（Phase 1）

→ 結果は [../phase1/README.md](../phase1/README.md)。

- **部品を約 20 個に増やす**: Field、Input、Textarea、Checkbox、RadioGroup、Switch、Accordion、Card、Badge、Separator、Skeleton、Spinner、Tooltip、Toast、Tabs、Select、Menu。
- **`urushi update`**: 3-way merge で更新を取り込めるようにする。
- **スクリーンリーダーの実機確認**: 手順書の表を埋める。
- **名前を決める**: パッケージのスコープ、CLI の名前。
