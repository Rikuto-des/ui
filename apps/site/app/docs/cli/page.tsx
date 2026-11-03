import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { DocsShell } from "@/components/docs-shell";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "CLI" };

export default function CliPage() {
  return (
    <>
      <SiteHeader section="docs" />
      <DocsShell current="/docs/cli/">
        <article className="prose">
          <h1>CLI</h1>
          <p className="lede">
            コンポーネントを使うためのファイルをリポジトリにコピーし、自由に編集できます。導入時の版と元のファイルを記録しているため、編集した箇所を残しながら新しい版を取り込めます。
          </p>

          <h2>urushi context / describe / check</h2>
          <p><code>context</code>は指定したコンポーネントの契約、デザインの規約、使えるトークンをJSONでまとめて返します。外部APIを使わず、AIに渡す資料を取得できます。</p>
          <CodeBlock code="npx urushi context dialog button input" lang="bash" />
          <p><code>describe</code>はコンポーネントの正確な契約をJSONで返します。<code>check</code>はTypeScriptのプロジェクトを読み、型と契約ルールを検査します。AIへ診断と関連する契約を渡し、修正後に同じ検査を実行できます。</p>
          <CodeBlock code={`npx urushi describe Dialog.Trigger
npx urushi check --project tsconfig.json --strict --json`} lang="bash" />
          <p>エラーがあると終了コード1、通過すると0を返します。<code>--strict</code>では警告も失敗として扱います。設定ファイルがない場合や検査対象が0件の場合も失敗します。JSONの<code>notChecked</code>には、この検査では確認できない項目を記録します。</p>

          <h2>urushi css</h2>
          <p>指定したコンポーネントと内部で使うコンポーネントのCSSを出力します。開閉やフォーカスなどの状態とレスポンシブ規則を残し、複数コンポーネントで共有する規則をまとめます。読み上げ用の非表示テキストも保持します。</p>
          <CodeBlock code="npx urushi css dialog button input > app/urushi.css" lang="bash" />
          <p>保存したCSSと使うパックのCSSを読み込みます。<code>--pack</code>で出力にパックが含まれるわけではありません。パックは別途読み込み、公開トークンをすべて保持してください。</p>
          <CodeBlock code={`import "@urushi/packs/graphite.css";
import "./urushi.css";`} lang="tsx" />
          <p>コンポーネントを個別に読み込む<code>@urushi/react/styles/dialog.css</code>などのエクスポートも用意しています。<code>add</code>は必要なCSSのimportを案内します。既存の全CSS用<code>@urushi/react/styles.css</code>も使えます。使うコンポーネントを増やしたら、CSSのimportか出力対象も追加してください。</p>

          <h2>urushi init</h2>
          <p>
            設定ファイル <code>urushi.json</code> を作ります。<code>--pack</code> で使うパック、<code>--components</code> でコンポーネントを置く場所（既定は <code>components/ui</code>）を選びます。
          </p>
          <CodeBlock code="npx urushi init --pack graphite --components components/ui" lang="bash" />
          <p className="note">現在はnpm公開前です。<a href="/docs/">はじめかた</a>に沿ってtgzを導入すると、CLIに同梱したregistryを使えます。自分で用意したregistryを使う場合は<code>--registry</code>で指定します。別のディレクトリを対象にするときは<code>--cwd</code>を付けます。</p>

          <h2>urushi add</h2>
          <p>
            コンポーネントを入れます。入れた版とハッシュを <code>urushi.lock</code> に、元のファイルを <code>.urushi/base</code> に記録します。配布データのハッシュが合わないときは、入れずに止まります。手元のファイルを変えていた場合は、<code>--overwrite</code> を付けない限り残します。
          </p>
          <CodeBlock code="npx urushi add tabs menu toast" lang="bash" />

          <h2>urushi diff</h2>
          <p>導入後に編集したファイルと未解決の競合を一覧にします。</p>
          <CodeBlock
            code={`npx urushi diff
unmodified components/ui/button.tsx (button)
modified   components/ui/dialog.tsx (dialog)`}
            lang="bash"
            copy={false}
          />

          <h2>urushi update</h2>
          <p>
            新しい版を取り込みます。手を入れていないファイルは置き換え、編集したファイルは、元のファイル・手元の版・新しい版の3つを3-way mergeで統合します。変更が重なったところには衝突のしるしを残し、終了コード 2 で知らせます。
          </p>
          <CodeBlock
            code={`npx urushi update
  ↑ updated          components/ui/card.tsx   (card 0.1.0 → 0.2.0)
  M merged           components/ui/tabs.tsx   (tabs 0.1.0 → 0.2.0)
  C conflict         components/ui/badge.tsx  (badge 0.1.0 → 0.2.0)`}
            lang="bash"
            copy={false}
          />
          <p>競合したファイルには次の印が入ります。新しい版と手元の変更を確認して内容を統合し、印を消してください。</p>
          <CodeBlock
            code={`<<<<<<< yours
export { Badge as MyBadge, type BadgeProps } from "@urushi/react/badge";
||||||| base
export { Badge, type BadgeProps } from "@urushi/react/badge";
=======
export { Badge, type BadgeProps } from "@urushi/react/badge-v2";
>>>>>>> urushi badge@0.2.0`}
            copy={false}
          />
          <p>
            <code>--dry-run</code> で書き込まずに結果だけを、<code>--json</code> で機械が読める形を出します。
          </p>
          <p>配布データの全ファイルを検査してから変更を始めます。相対パスの親ディレクトリ参照や、管理対象のシンボリックリンクは拒否します。ハッシュは内容の一致を確かめるもので、配布元の本人性を証明する署名ではありません。未解決の競合がある場合は、再実行しても競合として報告します。</p>

          <h2>urushi info</h2>
          <p>設定と導入済みのコンポーネントの版を表示します。</p>
          <CodeBlock code="npx urushi info --json" lang="bash" />
        </article>
      </DocsShell>
    </>
  );
}
