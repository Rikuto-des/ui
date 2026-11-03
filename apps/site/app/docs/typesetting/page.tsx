import type { Metadata } from "next";
import { DocsShell, Prose } from "@/components/docs-shell";
import { SiteHeader } from "@/components/site-header";
import { repoFile } from "@/lib/content";
import { markdown } from "@/lib/markdown";

export const metadata: Metadata = { title: "日本語組版" };

/** Rendered from design-system/typesetting.md, the same text the design system publishes. */
export default async function Page() {
  const md = await repoFile("design-system/typesetting.md");
  return (
    <>
      <SiteHeader section="docs" />
      <DocsShell current="/docs/typesetting/">
        <header className="page-head">
          <h1>日本語組版</h1>
          <p className="lede">約物の詰めや禁則、文節での改行、和文と英数字のあいだの空きを標準で設定しています。</p>
        </header>
        <Prose html={markdown(md.replace(/^# .*\n+/m, ""))} />
      </DocsShell>
    </>
  );
}
