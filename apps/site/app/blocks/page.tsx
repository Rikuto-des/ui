import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { CodeBlock } from "@/components/code-block";
import { repoFile } from "@/lib/content";
import { blocks } from "@/lib/blocks";

export const metadata: Metadata = { title: "Blocks" };

export default async function Page() {
  const sources = await Promise.all(blocks.map(async (block) => ({ ...block, code: await repoFile(`blocks/${block.name}.tsx`) })));
  return (
    <>
      <SiteHeader section="blocks" />
      <main id="main" className="blocks-index wrap">
        <header className="examples-heading">
          <h1>Blocks</h1>
          <p className="lede">
            Urushi のコンポーネントで組んだ画面のひな形です。
            <br />
            <code>urushi add</code> で画面のファイルと CSS がプロジェクトに入り、あとは自由に書き換えられます。
          </p>
        </header>
        {sources.map((block) => (
          <section key={block.name} className="block-entry" aria-labelledby={`block-${block.name}`}>
            <div className="block-entry-head">
              <div>
                <h2 id={`block-${block.name}`}>{block.title}</h2>
                <p>{block.summary}</p>
              </div>
              <a href={`/blocks/${block.name}/view/`}>全画面で開く</a>
            </div>
            <iframe className="block-frame" src={`/blocks/${block.name}/view/`} title={`${block.title}のひな形`} loading="lazy" />
            <CodeBlock lang="bash" code={`npx urushi add ${block.name}`} />
            <details className="block-code">
              <summary>
                コード<code>{block.name}.tsx</code>
              </summary>
              <CodeBlock code={block.code} lang="tsx" />
            </details>
          </section>
        ))}
      </main>
    </>
  );
}
