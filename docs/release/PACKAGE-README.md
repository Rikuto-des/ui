# Urushi 0.1.0-beta.1

UrushiはReactのUIコンポーネントと、AIによる実装を検査するCLIです。55コンポーネント、GraphiteとLucentのパック、型・静的検査・ブラウザ操作の検証を提供します。

この版はβ候補です。APIや見た目は変更する場合があります。対応環境と未検証の項目は、同梱の[COMPATIBILITY.md](COMPATIBILITY.md)で確認してください。npm公開前は、受け取った7つのtgzを同じフォルダに置いて導入します。

```sh
npm install /absolute/path/to/release/*.tgz react@19 react-dom@19
npx urushi init --pack graphite
npx urushi add button dialog combobox
```

npmへの公開後は、次のコマンドで同じ版を指定できます。

```sh
npm install @urushi/react@0.1.0-beta.1 @urushi/packs@0.1.0-beta.1 react@19 react-dom@19
npm install -D @urushi/cli@0.1.0-beta.1
npx urushi init --pack graphite
npx urushi add button dialog combobox
```

ルートのレイアウトでCSSを読み込み、`html`に`data-pack="graphite"`を指定します。`data-theme="light"`または`dark`で明暗を選べます。`lucent`にすると色・形・余白・動きが変わります。

```tsx
import "@urushi/packs/graphite.css";
import "@urushi/react/styles.css";
import { Button } from "@urushi/react/button";

export function Save() {
  return <Button variant="primary">保存する</Button>;
}
```

MenuやTabsの追加キー操作などを使う場合は、`@urushi/react/runtime`の`UrushiRuntime`をルートに一度配置します。Combobox、DataTable、DatePicker、CommandなどはClient Componentsです。すべてがJavaScriptなしで動くわけではありません。

```sh
npx urushi context button dialog combobox --compact
npx urushi check --project tsconfig.json --strict --json
npx urushi update --dry-run --json
```

CLIはNode.js 24以降を使います。`verify`や`workflow`で操作を検証する場合は、Playwrightのブラウザも導入してください。`workflow --repair`は利用者が指定する修正コマンドを実行するため、その送信先と対象ファイルを確認してから使ってください。

変更内容は[CHANGELOG.md](CHANGELOG.md)にあります。[GitHub Issues](https://github.com/Rikuto-des/ui/issues)には、使用した版、ブラウザ、再現手順、期待した動作を添えてください。リポジトリが非公開の間はアクセス権が必要です。報告に認証情報や実データを含めないでください。

UrushiのコードはMIT Licenseです。収録したPhosphor Iconsのライセンスは[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)に記載しています。
