import type { Metadata } from "next";
import { DocsShell } from "@/components/docs-shell";
import { SiteHeader } from "@/components/site-header";
import { CodeBlock } from "@/components/code-block";
import { SHADCN } from "../../../../../packages/cli/src/migrate.ts";

export const metadata: Metadata = { title: "shadcn/ui から移る" };

export default function Page() {
  const rows = Object.entries(SHADCN).sort(([a], [b]) => a.localeCompare(b));
  return (
    <>
      <SiteHeader section="docs" />
      <DocsShell current="/docs/migrate/">
        <header className="page-head">
          <h1>shadcn/ui から移る</h1>
          <p className="lede">shadcn/ui の画面を、1 画面ずつ Urushi に置き換えられます。置き換えている間も、両方を同じプロジェクトで使えます。</p>
        </header>
        <section className="prose">
          <h2>どこで何を使っているかを調べる</h2>
          <p>プロジェクトのフォルダで次のコマンドを実行すると、shadcn/ui のコンポーネントを読み込んでいるファイルと行、置き換える Urushi のコンポーネント、使い方の違いが一覧になります。ファイルは書き換えません。<code>components.json</code> があれば、その読み込み先（<code>@/components/ui</code> など）を使います。</p>
        </section>
        <CodeBlock lang="bash" code={"npx urushi migrate shadcn\nnpx urushi migrate shadcn --json"} />
        <section className="prose">
          <p>AI エージェントには、<code>urushi mcp</code> の <code>plan_shadcn_migration</code> ツールで同じ一覧を渡せます。</p>
          <h2>進め方</h2>
          <ol>
            <li>一覧の最後に出る <code>urushi add</code> で、使う Urushi のコンポーネントを入れます。</li>
            <li>1 画面ずつ、下の表の違いに沿って書き換えます。開閉の状態（open と onOpenChange）は、多くの場合いらなくなります。</li>
            <li>書き換えたら <code>urushi check</code> で、型と使い方の誤りを確かめます。</li>
            <li>どの画面からも読み込まれなくなった shadcn/ui のファイルを消します。</li>
          </ol>
          <h2>対応表</h2>
        </section>
        <div className="table-scroll">
          <table>
            <caption>shadcn/ui のコンポーネントと Urushi の対応</caption>
            <thead>
              <tr>
                <th scope="col">shadcn/ui</th>
                <th scope="col">Urushi</th>
                <th scope="col">違い</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([name, { urushi, note }]) => (
                <tr key={name}>
                  <th scope="row">
                    <code>{name}</code>
                  </th>
                  <td>{urushi ? <a href={`/components/${urushi}/`}>{urushi}</a> : "—"}</td>
                  <td lang="en">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocsShell>
    </>
  );
}
