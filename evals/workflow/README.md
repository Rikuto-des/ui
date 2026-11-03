# Workflowの実測例

`result.json` は実際のgpt-6-luna応答を使った4回の記録です。最初の準備エラー、2回の不合格と復元、最後のフォーカス修正の合格を含みます。4回とも成功した、または1回で全部直ったという記録ではありません。

`fixture/App.tsx` は最後の合格した応答を保持しています。`before.tsx.txt` は空白入力を保存してしまう元の架空コードです。シナリオはどの実行でも同じ13手順です。

## 外部送信なしで検査する

リポジトリのルートで `node scripts/workflow-smoke.ts` を実行します。決定的なローカルアダプターを使い、不合格案の復元と合格案の採用を実ブラウザーで確認します。

実測画面を見る場合は、`fixture/`で `node build.ts`、リポジトリのルートで `node scripts/serve-static.ts evals/workflow/fixture/dist 4491` を実行します。その後、別のターミナルで次を実行します。

```sh
node packages/cli/src/bin.ts workflow \
  --cwd evals/workflow/fixture --config workflow.json \
  --out ../runs/local-review-001 --json
```

`--repair`を付けていないためモデルは呼びません。出力先は実行ごとに新しくしてください。

## 外部AIを使う場合

`workflow.json` のrepairコマンドは `evals/competition/codex-repair.ts` を指定しています。このアダプターは、既存のCodexログイン経由でgpt-6-lunaへ明示したソース、固定シナリオ、診断を送ります。プロジェクトを探索するツール、検索、メモリは無効にしています。今回の承認枠は64要求に到達済みです。新しい実測を行う場合は、送信範囲と追加回数を決めてから実行してください。

アダプターを他の用途に流用する場合、送信先・回数・利用料金はその利用者が設定・確認します。CLIは任意のローカルコマンドを隔離するサンドボックスではありません。
