# Urushi

ReactのUIコンポーネントと、AIによる実装を確認・修正するためのツールです。コンポーネントのAPI、用途、キーボード操作をcontractにまとめ、型・ドキュメント・静的検査へ反映します。

55コンポーネントを収録しています。HTML標準で動くコンポーネントはServer Componentsとして使えます。Combobox、DataTable、DatePicker、Calendar、Commandなど、状態を扱うコンポーネントはClient Componentsです。すべてがJavaScriptなしで動くわけではありません。

現在は `0.1.0-beta.1` の配布候補を検証しています。npm公開はまだ行っていません。APIや見た目はβ期間中に変わる場合があります。比較結果は測定した課題・モデル・試行数の範囲に限られます。

[対応環境と既知の制約](docs/release/COMPATIBILITY.md)、[変更履歴](CHANGELOG.md)、[不具合の報告方法](CONTRIBUTING.md)を確認してから導入してください。

## リポジトリを動かす

Node.js 24以降とpnpm 12を使用します。

```sh
pnpm install --frozen-lockfile
pnpm gen
pnpm --filter studio build
pnpm --filter studio start
```

[Urushi Studio](http://localhost:3301)で、検索、状態の絞り込み、並び替え、複数選択、編集、新規作成、設定保存を試せます。初期データは架空のプロジェクトです。保存先は`apps/studio/data/workspace.json`です。`URUSHI_STUDIO_DATA`で変更できます。

このアプリはローカルで使う実装例です。認証・権限管理・共有サーバー運用は含みません。実機確認のため同じLANから開く場合だけ、`HOST=0.0.0.0 PORT=3300 pnpm --filter studio start`を使ってください。

ドキュメントと操作プレビューは`pnpm --filter site dev`で起動します。

## 配布物から導入する

```sh
pnpm package:release
```

`dist/release/`に7パッケージのtgzとSHA-256一覧ができます。JavaScript、型宣言、CSS、registryを同梱し、Reactの`"use client"`境界を維持します。新しいReactプロジェクトで、生成した7つのtgzをまとめてインストールしてください。

```sh
npm install /absolute/path/to/ui/dist/release/*.tgz react react-dom
npx urushi init
npx urushi add button combobox data-table date-picker command
```

`init`はCLIに同梱されたregistryを使います。独自registryは`--registry <dir|url>`で指定できます。作られた`components/ui/`のラッパーは、アプリに合わせて編集できます。

```tsx
"use client";
import { Combobox } from "@urushi/react/combobox";
import "@urushi/packs/graphite.css";
import "@urushi/react/styles/combobox.css";

export function Owner() {
  return <Combobox label="担当者" name="owner" options={[
    { value: "mika", label: "Mika Sato" },
    { value: "kai", label: "Kai Ito" },
  ]} />;
}
```

`html`に`data-pack="graphite"`と、必要に応じて`data-theme="light"`または`dark`を指定します。複数コンポーネントのCSSは`urushi css button combobox > urushi.css`でもまとめられます。

Menu、Tabsなどの補助動作が必要な場合は`@urushi/react/runtime`の`UrushiRuntime`を一度配置します。用途とブラウザごとの差は各コンポーネントのcontractを確認してください。

## AIによる生成・確認・修正

```sh
npx urushi context combobox data-table date-picker command --compact
npx urushi check --project tsconfig.json --strict --json
npx urushi verify --url http://localhost:3301 --scenario scenario.json --out review
```

`verify`は実際のブラウザ操作を再生します。失敗すると、失敗した手順、期待値、アクセシビリティツリー、スクリーンショットを出力します。AIにはこの診断と実装を渡し、シナリオを変えずに修正・再検証します。Playwrightのブラウザは初回に`npx playwright install chromium firefox webkit`で導入してください。

```json
{"version":1,"name":"検索","steps":[
  {"action":"fill","target":{"role":"searchbox","name":"プロジェクトを検索"},"value":"Website"},
  {"action":"expect","target":{"role":"button","name":"Website redesign PRJ-001"},"visible":true},
  {"action":"axe"}
]}
```

`workflow`を使うと、静的検査→ビルド→操作検査→修正コマンド→同じ検査の再実行をつなげられます。

```sh
npx urushi workflow --config workflow.json --out review/run-001 --repair --json
```

修正は明示したソースだけに限定し、変更前ハッシュを照合します。検査に通らない案は元に戻します。`--repair`を付けなければ検査だけです。アダプターのJSON形式と設定例はサイトの「AI と lint」、信頼するコマンドの範囲と更新方針は[配布前の対応範囲](docs/release/COMPATIBILITY.md)を参照してください。

実機確認用の手順と結果記録はStudioの`/device-check.html`にあります。結果は端末内に保存し、自動検査の結果とは分けて扱います。

### MCPサーバー

`urushi mcp`は、`context`・`describe`・`check`・`add`・`update`・`diff`・`info`をMCPのツールとしてAIエージェントに渡します。MCPに対応したエージェントの設定に次を足します。

```json
{"mcpServers":{"urushi":{"command":"npx","args":["urushi","mcp"]}}}
```

起動したフォルダーのプロジェクトだけを扱います。`add_components`は手で変えたファイルを上書きせず、`update_components`は`dryRun: false`を指定したときだけ書き込みます。

## 編集を残して更新する

```sh
npx urushi update --dry-run --json
npx urushi update --json
npx urushi diff
```

更新は、導入時の内容・現在のローカル編集・新しいregistryの3つを比較します。同じ箇所を双方が変更した場合は競合を報告します。競合を解決してから、型・静的検査・操作検証をやり直してください。パッケージ依存の更新はnpm／pnpmで別途行います。

## 検証

```sh
pnpm typecheck
pnpm test
pnpm test:product
pnpm test:site
pnpm test:release
```

自動検査はスクリーンリーダーや実機操作の代わりにはなりません。実測した環境、未確認の環境、比較の条件は`docs/delivery/`と`evals/product/`に記録します。

MIT License
