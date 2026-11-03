import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@urushi/react";
import { CodeBlock } from "@/components/code-block";
import { DocsShell, Prose } from "@/components/docs-shell";
import { Example } from "@/components/example";
import { KeyboardTable, PropsTables } from "@/components/props-table";
import { SiteHeader } from "@/components/site-header";
import { bySlug, components } from "@/lib/components";
import { repoFile, schema, splitGuide } from "@/lib/content";
import { markdown } from "@/lib/markdown";

export const dynamicParams = false;

export function generateStaticParams() {
  return components.map((c) => ({ name: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const entry = bySlug.get((await params).name);
  return { title: entry?.name ?? "コンポーネント" };
}

export default async function ComponentPage({ params }: { params: Promise<{ name: string }> }) {
  const entry = bySlug.get((await params).name);
  if (!entry) notFound();
  const [contract, guide] = await Promise.all([schema(entry.slug), repoFile(`design-system/components/${entry.guide}.md`)]);
  const { summary, body } = splitGuide(guide);
  return (
    <>
      <SiteHeader section="components" />
      <DocsShell current={`/components/${entry.slug}/`} toc={[{id:"example",label:"Preview"},{id:"install",label:"Installation"},{id:"guide",label:"Usage"},{id:"props",label:"API Reference"},...(contract.a11y.keyboard ? [{id:"keyboard",label:"Keyboard"}] : [])]}>
        <header className="page-head">
          <p className="crumb">
            <a href="/components/">Components</a> / {entry.group}
          </p>
          <h1>{entry.name}</h1>
          <Prose html={markdown(summary)} />
          <dl className="facts">
            <div>
              <dt>土台</dt>
              <dd>
                <code>{entry.base}</code>
              </dd>
            </div>
            <div>
              <dt>JavaScript</dt>
              <dd>{entry.js === "不要" ? <Badge tone="ok">不要</Badge> : <Badge tone="accent">{entry.js}</Badge>}</dd>
            </div>
            <div>
              <dt>描画</dt>
              <dd>{contract.rendering === "server" ? "Server Components のまま" : contract.rendering}</dd>
            </div>
          </dl>
        </header>

        <section aria-labelledby="example">
          <h2 id="example" className="visually-hidden">Preview</h2>
          <Example slug={entry.slug} />
        </section>

        <section aria-labelledby="install">
          <h2 id="install">Installation</h2>
          <CodeBlock code={`npx urushi add ${entry.slug}`} lang="bash" />
        </section>

        <section aria-labelledby="guide">
          <h2 id="guide">Usage</h2>
          {/* The guide's own headings sit one level below this section's. */}
          <Prose html={markdown(body.replace(/^(#{2,5}) /gm, "#$1 "))} />
        </section>

        <section aria-labelledby="props">
          <h2 id="props">API Reference</h2>
          <p className="note">契約（contracts/{entry.slug}.contract.ts）から生成しています。lint もこの表のとおりに検査します。</p>
          <PropsTables schema={contract} />
        </section>

        {contract.a11y.keyboard ? (
          <section aria-labelledby="keyboard">
            <h2 id="keyboard">Keyboard</h2>
            <KeyboardTable keyboard={contract.a11y.keyboard} />
          </section>
        ) : null}
      </DocsShell>
    </>
  );
}
