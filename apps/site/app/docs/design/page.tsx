import type { Metadata } from "next";
import { DocsShell, Prose } from "@/components/docs-shell";
import { SiteHeader } from "@/components/site-header";
import { repoFile } from "@/lib/content";
import { markdown } from "@/lib/markdown";

export const metadata: Metadata = { title: "デザインの決まり" };

/** Rendered from design-system/README.md, the same text the design system publishes. */
export default async function Page() {
  const md = await repoFile("design-system/README.md");
  return (
    <>
      <SiteHeader section="design" />
      <DocsShell current="/docs/design/">
        <header className="page-head">
          <h1>デザインの決まり</h1>
          <p className="lede">Urushi で画面を作るときの決まりです。デザインシステムの README と同じ内容です。</p>
        </header>
        <Prose html={markdown(md.replace(/^# .*\n+/m, ""))} />
      </DocsShell>
    </>
  );
}
