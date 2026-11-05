# AIによるUI実装の比較

2026年10月27日に行った、Urushiの開発中の比較実験です。結果の概要は [集計JSON](../../generated/competition-summary.json)、画面付きの説明はローカルサイトの `/docs/comparison/` にあります。

## 比較条件

同じモデル `gpt-6.1-sol`、推論設定medium、同じ依頼文、React 19.3.1、同じTypeScript設定と共通CSSを使います。モデルには対象ライブラリの資料を最大30,000文字程度渡し、ツール・検索・過去の会話は渡しません。資料の長さはライブラリによって異なり、厳密な入力トークン数の一致ではありません。

削除確認、タブ、行メニューの3課題を各2回生成します。共通検査に失敗した場合だけ1回修正させ、さらにアプリの仕様を変更して、失敗した場合は1回修正させます。1回答の上限は240秒です。AIの出力を人手で書き換えて採点することはありません。

共通の合否は、TypeScript、指定部品の使用、キーボード・フォーカス・状態の保持、axeのWCAG A/AA検査、幅320pxでの横あふれです。Urushiの独自lintは追加の診断であり、競合に適用する合否条件ではありません。失敗や無回答も分母に残します。ブラウザーは比較ではChromium、Urushi本体の回帰検証ではChromium・Firefox・WebKitを使います。

更新とは「非同期削除の失敗と再試行」「外側のボタンからタブ選択」「アーカイブの取り消し」の追加です。依存ライブラリの実バージョン移行は測っていません。

## 記録

| ディレクトリ | 条件 |
| --- | --- |
| `runs/measured-v1` | 改善前。4ライブラリ各6件 |
| `runs/measured-v2` | `urushi context`と`Tabs.Activate`を追加。Urushiのみ6件 |
| `runs/measured-v3` | Dialogの契約とCSSリセットとの併用を修正。4ライブラリ各6件を新しく生成 |
| `runs/measured-v4` | 検査・資料・依存関係を固定後、4ライブラリ各6件の全工程を新しく実行。最終成績に使用 |
| `runs/claude-sonnet-v1` | 2026年11月5日。measured-v4と同じ課題・資料・検査で、モデルだけをclaude-sonnet-5-5（推論設定medium）に替えて全工程を実行 |

各試行に `request.json`、`reply.json`、AIが返した `App.tsx`、`score.json` を保存します。依頼文・コードにSHA-256を付け、回答のトークン数と実行時間も記録します。料金は従量課金APIから取得していないため、金額を推定していません。

`urushi-source`は計測したローカル実装、`reference.txt`はその試行へ渡した資料です。`sources/manifest.json`には競合資料の取得URL・ハッシュ・パッケージ版があります。shadcn/uiは公式new-york-v4レジストリのコードを使い、インポート先だけインストール後のパスに置き換えました。

`results.original.json`がある実験では、検査修正前の結果も保存しています。最初の3回の `results.json` は共通の最終検査で再評価した結果です。以前の判定で不要な修正を依頼していた場合も、回答を削除したり呼び出し回数から引いたりしていません。最終成績の `measured-v4` は途中で検査を変えず、生成・修正・仕様更新・再修正の全工程を実施しています。

## 検査の修正と限界

開発中の探索的な比較で、事前登録した独立ベンチマークではありません。次の検査修正は全ライブラリの保存済み出力に適用しています。

- 色の検査前に有限のアニメーション終了を待ちます。途中の色を最終的なコントラストとして扱いません。
- 削除した行はDOMからの除去と非表示の両方を認めます。取り消し後は行の順序も確認します。
- メニューの初期フォーカスを待ってから矢印キーを送ります。開く処理との競合で結果が変わることを避けます。
- 保存したハーネス自体をテスト対象から除き、検査が全件実行されなかった場合は実験基盤の失敗として扱います。

`baseline`のClaude呼び出しは契約上の利用制限で失敗し、`codex-baseline`はCLI警告の取り扱いを調整した試運転です。これらは計測4回の結果に混ぜていません。初期の重複React型、保存したハーネスの誤検出、ソース固定時のパス解決の失敗も基盤の調整として記録し、生成コードは変えずに再検査しています。

3回目の実験の途中で比較用tsconfigを追加した際、`jsx: react-jsx`の指定漏れで保存したUrushiソースが誤変換されました。元の生成コードを変えずに設定を直して再検査しています。その誤診断に対する回答は各試行の`infrastructure-update-repair`に分離して保存し、成績や修正回数に含めていません。除外の理由はモデルの回答内容ではなく、ライブラリ側のJSX変換設定の誤りです。

Base UIは無効な項目にもフォーカスを移せるため、今回の「無効項目を飛ばす」指定との不一致があります。一般的なアクセシビリティの欠陥とは区別してください。shadcn/uiの配色はこの実験の共通テーマとの組み合わせです。どのライブラリについても、全製品・全テーマの品質を示すものではありません。

JavaScript量は同じesbuildのproduction/minify設定でgzipした値です。React込みのビルドと、React・React DOMを外部化したビルドを分けています。後者にはUIライブラリ、ランタイム、アプリ処理が含まれます。共通のTailwind CSSやUrushiのCSS・トークンはJS量に含みません。実ページ全体の転送量や起動速度を示す指標ではありません。

2モデル（gpt-6.1-sol、claude-sonnet-5-5）・3課題・各2試行です。スクリーンリーダー利用者による評価、主観的なデザイン評価、大規模アプリ、別モデル、依存ライブラリのバージョン更新への一般化はできません。

## 再実行

リポジトリの依存関係とブラウザーを導入した環境で実行します。モデル呼び出しには利用可能なCodex CLIの認証が必要です。既存の実験IDは回答を再利用するため、新しい比較は別のIDにします。

```sh
pnpm --dir evals/competition install --frozen-lockfile
node evals/competition/setup.ts
node evals/competition/run.ts --id new-comparison --trials 2 --stage all
```

`setup.ts`は公式資料を再取得します。過去と同じ資料での再検査では、保存済みの `sources` と `ui` を保持してください。

Claudeでの実行は、Claude Code（`claude`）にログインした環境で `--provider claude` を付けます。Claude Codeをヘッドレスで呼び、ツール・MCP・CLAUDE.md・スキルなどの設定をすべて切ります（`--safe-mode --tools ""`）。

```sh
node evals/competition/run.ts --id new-claude-comparison --provider claude --trials 2 --stage all
```

```sh
node evals/competition/run.ts --id measured-v4 --stage all --rescore
node evals/competition/audit.ts
node evals/competition/summarize.ts
pnpm exec tsc -p evals/competition/tsconfig.json
```

比較用のブラウザー検証はポート4481と作業ファイルを共有するため、実験は1本ずつ実行します。新しい実行時はモデルの出力が変わるため、以前の点数の再現は保証しません。

最終比較では、ハーネスの不変性、同じ課題への資料の一致、依頼文と生成コードのハッシュ、モデルのツール利用0件、全回答へのブラウザー検査を照合しています。[照合結果](runs/measured-v4/audit.json)に65回答・24試行の記録を保存しました。
