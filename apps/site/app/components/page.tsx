import type { Metadata } from "next";
import { ComponentShowcase } from "@/components/component-showcase";
import { ComponentCatalog } from "@/components/component-catalog";
import { CatalogPreview } from "@/components/catalog-previews";
import { DocsShell } from "@/components/docs-shell";
import { SiteHeader } from "@/components/site-header";
import { components, groups } from "@/lib/components";
import { repoFile, splitGuide } from "@/lib/content";

export const metadata: Metadata = { title: "Components" };

export default async function ComponentsIndex() {
  const featured = ["button", "input", "card", "tabs", "switch", "dialog", "select", "checkbox", "navigation-menu"];
  const ordered = [...components].sort((a,b) => (featured.includes(a.slug) ? featured.indexOf(a.slug) : featured.length) - (featured.includes(b.slug) ? featured.indexOf(b.slug) : featured.length));
  const summaries = new Map(
    await Promise.all(
      components.map(async (c) => [c.slug, splitGuide(await repoFile(`design-system/components/${c.guide}.md`)).summary] as const),
    ),
  );
  return (
    <>
      <SiteHeader section="components" />
      <DocsShell current="/components/">
        <header className="page-head">
          <h1>Components</h1>
          <p className="lede">
            {components.length}のReactコンポーネントをこのページで操作できます。入力や切り替え、開閉を試してからプロジェクトに取り込めます。
          </p>
        </header>
        <ComponentCatalog entries={ordered.map(c => ({slug:c.slug,name:c.name,group:c.group,js:c.js,summary:summaries.get(c.slug)?.replace(/`/g, "") ?? "",preview:<CatalogPreview slug={c.slug}/>}))} groups={[...groups]} />
        <section className="component-composition" aria-label="コンポーネントを組み合わせた使用例"><div className="section-heading"><div><h2>Examples</h2></div></div><ComponentShowcase /></section>
      </DocsShell>
    </>
  );
}
