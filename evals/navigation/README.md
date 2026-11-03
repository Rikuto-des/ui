# Navigation Menuの比較とデザイン検証

[結果](REPORT.md) / [集計JSON](../../generated/navigation-summary.json) / [証拠ファイルのハッシュ](evidence-manifest.json)

2026年10月28日にホバー・横開き・パネル間の連続変形を追加し、続いてコンポーネントのデザインと一覧・詳細プレビューを改訂した。[連続変形のレビュー](review-morph/README.md)・[一覧のレビュー](../catalog/review/README.md)・[shadcnとのデザイン比較とアクセシビリティのレビュー](../design-review/2026-10-28/README.md)を参照。現在のサイトのサイズ比較は`runs/refinement-v1`を使用する。保存済みの生成コード8件を4ライブラリで再検査した記録で、新しいAI生成・修正の試行ではない。`runs/catalog-v1`、`runs/morph-v1`、[ホバー追加時の記録](review-hover/README.md)と下記のAI実験は、当時の証拠として保持する。

最終比較は `runs/measured-v3`、同じ不具合を入れた修正課題は `runs/repair-v3`。4ライブラリに同じモデル、依頼文、共通CSS、検査、各段階1回までの修正機会を使った。各条件は2試行。応答27件と不具合を入れた8件を保存している。生成コードは人手で直していない。

## 再実行

Node 24以上、リポジトリ本体の依存、Playwrightのブラウザー、サインイン済みのCodex CLIが必要。AI呼び出しはアカウントの利用枠を消費する。モデルの出力は再実行ごとに変わり得る。以下はリポジトリのルートで実行する。

```sh
pnpm --dir evals/navigation install --frozen-lockfile
node --import tsx evals/navigation/run.ts --id new-comparison --trials 2
node --import tsx evals/navigation/seed-repair.ts --source new-comparison --id new-repair
node --import tsx evals/navigation/run.ts --id new-repair --stage update --rescore
node --import tsx evals/navigation/run.ts --id new-repair --stage update-repair
```

新しいIDを使うこと。既存IDでは保存済みの応答を再利用する。修正課題は仕様変更後の全8画面が合格していることを前提とし、異なる場合は停止する。名前・リンク先・外側の幅という同じ3つの不具合を追加し、生成ではなく仕様変更後の検査を適用する。

保存済みの最終結果の整合性は、AIを呼ばずに次で確認できる。返答とTSXの一致、依頼文とコードのハッシュ、検査結果、ツール使用なし、不具合の注入元を照合する。

```sh
node --import tsx evals/navigation/audit.ts
node --import tsx evals/navigation/summarize.ts
```

`summarize.ts`は記録した最終2実験の集計で、新しい実験IDを自動採用しない。各実験には検査・ライブラリソース・資料・依頼文・返答・使用トークン・画面を保存している。古い実験を現行ソースで上書きせず、比較時点の状態として残す。

## 条件と限界

通常のリンク、Enter・Tab・Escape、兄弟の排他開閉、フォーカス、入力値の保持、項目の追加と削除、320pxの閉じた状態とパネル、strict TypeScript、axeを共通条件にした。ブラウザーはChromium。通常の要素のaxe違反は除外せず、空で1pxにクリップされたフォーカス移動用のspanだけ別記録にしている。

公式資料の構造と長さはライブラリごとに異なる。Urushiには公開CLIの `context --compact`、Base UIには公式Markdown、Radixには公式型定義、shadcnには公式レジストリのソースを渡した。完全な資料と取得時点のハッシュは保存済み。成功率の同点や以前の全件合格も含めて報告し、少数の試行を一般的な順位として扱わない。

gzipサイズは同じesbuild条件で、React込みと外部化を別計測した。CSS込みは各ファイルのgzipサイズの和。Urushiには全機能の任意ランタイム、必要な部品CSS、全Graphiteトークンを含む。全条件で共通CSSを含む。画像・フォント・HTML・ロード時間は含まない。

## デザインの検証

`design-fixtures.tsx`はサイトの47部品の見本をSSRで出力する（命令型のToastは対象外）。`design.spec.ts`は2パック×明暗×320px/1000pxの376条件で、axeと横はみ出しを検査し、画面を保存する。対話操作すべてやスクリーンリーダーの実利用を検証するものではない。

```sh
node --import tsx evals/navigation/design-fixtures.tsx
node node_modules/@playwright/test/cli.js test -c evals/navigation/design.config.ts
```

デザインの画面・結果は `runs/design-v1`。サイトの実操作は別の `tests/site` でChromium・Firefox・WebKitを使って検査する。
