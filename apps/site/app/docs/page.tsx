import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { DocsShell } from "@/components/docs-shell";
import { SiteHeader } from "@/components/site-header";
import { components } from "@/lib/components";

export const metadata: Metadata = { title: "はじめかた" };

export default function GettingStarted() {
  return (
    <>
      <SiteHeader section="docs" />
      <DocsShell current="/docs/">
        <article className="prose">
          <h1>はじめかた</h1>
          <p className="lede">
            Urushi のコンポーネントは、リポジトリに配置する短いファイルから使えます。実装は <code>@urushi/react</code> にあり、手を入れたあとも <code>urushi update</code> で新しい版を取り込めます。
          </p>

          <h2>用意するもの</h2>
          <ul>
            <li>React 19とNode.js 24以降が必要です。標準HTMLで動くコンポーネントはServer Componentsで使えます。ComboboxやDataTableなど、状態を扱うコンポーネントはClient Componentsです。Viteでも使えます。</li>
            <li>
              このβ候補はChromium 156、Firefox 157、WebKit 27.2で検証しています。最低対応バージョンは未確定で、iPhone・Android実機とスクリーンリーダーは未検証です。使用する機能は<a href="/docs/browsers/">ブラウザの対応</a>で確認できます。
            </li>
          </ul>

          <h2>1. 初期設定</h2>
          <p>コンポーネントを置く場所と使うパックを決めます。設定は <code>urushi.json</code> に書かれます。</p>
          <CodeBlock code={'npm install /absolute/path/to/release/*.tgz react@19 react-dom@19\nnpx urushi init --pack graphite'} lang="bash" />
          <p className="note">現在は<code>0.1.0-beta.1</code>の配布候補で、npm公開前です。受け取った7つのtgzを同じフォルダに置き、上のパスを置き換えてください。CLIにregistryを同梱しているため、追加の取得先を設定する必要はありません。APIや見た目はβ期間中に変わる場合があります。</p>

          <h2>2. コンポーネントを入れる</h2>
          <CodeBlock code="npx urushi add button dialog popover" lang="bash" />
          <p>
            <code>components/ui/</code> にファイルが入り、入れた版とハッシュが <code>urushi.lock</code> に記録されます。内容とハッシュが一致しない配布データは入れません。
          </p>

          <h2>3. スタイルとランタイムを読み込む</h2>
          <p>ルートのレイアウトで一度だけ読み込みます。パックは <code>data-pack</code> 属性で選び、ページの一部だけ別のパックにもできます。</p>
          <CodeBlock
            code={`// app/layout.tsx
import "@urushi/react/styles.css";
import "@urushi/packs/graphite.css";
import { Toaster } from "@urushi/react";
import { UrushiRuntime } from "@urushi/react/runtime";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" data-pack="graphite">
      <body>
        {/* 任意。メニューとタブのキーボード操作、Chromium 以外のツールチップ、トースト */}
        <UrushiRuntime />
        {children}
        <Toaster />
      </body>
    </html>
  );
}`}
          />

          <h2>4. 使う</h2>
          <p>
            トリガーと開く要素はHTML の <code>&lt;label for&gt;</code> と同じように id で結びます。ブラウザが開閉を処理するため、開閉状態をコードで管理する必要はありません。このページは Server Component のままです。
          </p>
          <CodeBlock
            code={`import { Dialog } from "@/components/ui/dialog";

export default function Page() {
  return (
    <>
      <Dialog.Trigger dialog="confirm" variant="danger">
        プロジェクトを削除
      </Dialog.Trigger>
      <Dialog id="confirm" title="「秋のキャンペーン」を削除しますか？" description="この操作は取り消せません。">
        <Dialog.Actions>
          <Dialog.Close dialog="confirm" variant="ghost">キャンセル</Dialog.Close>
          <Dialog.Close dialog="confirm" variant="danger">削除する</Dialog.Close>
        </Dialog.Actions>
      </Dialog>
    </>
  );
}`}
          />

          <h2>5. lint を入れる</h2>
          <p>
            見た目の上書きやid の書き間違い、存在しない props をコードを書いた時点で知らせます。エラー文には直し方が書いてあるので、AI エージェントも自分で直せます。詳しくは<a href="/docs/ai/">AI と lint</a>にあります。
          </p>
          <CodeBlock
            code={`// eslint.config.js
import tseslint from "typescript-eslint";
import urushi from "@urushi/eslint-plugin";

export default [
  {
    ...urushi.configs.recommended,
    files: ["**/*.tsx"],
    languageOptions: { parser: tseslint.parser },
  },
];`}
          />

          <h2>次に読むもの</h2>
          <ul>
            <li>
              <a href="/components/">コンポーネント</a>では{components.length}種類の使い方とpropsを確認できます。
            </li>
            <li>
              <a href="/docs/packs/">パック</a>ではGraphite と Lucent の違いと切り替えのしくみを説明しています。
            </li>
            <li>
              <a href="/docs/cli/">CLI</a>では編集したコンポーネントに更新を取り込む方法を説明しています。
            </li>
          </ul>
        </article>
      </DocsShell>
    </>
  );
}
