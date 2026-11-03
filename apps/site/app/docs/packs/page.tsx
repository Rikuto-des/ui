import type { Metadata } from "next";
import { Button, Card } from "@urushi/react";
import { DocsShell, Prose } from "@/components/docs-shell";
import { SiteHeader } from "@/components/site-header";
import { repoFile } from "@/lib/content";
import { markdown } from "@/lib/markdown";

export const metadata: Metadata = { title: "パック" };

/** Rendered from design-system/packs.md, the same text the design system publishes. */
export default async function Page() {
  const md = await repoFile("design-system/packs.md");
  return (
    <>
      <SiteHeader section="docs" />
      <DocsShell current="/docs/packs/">
        <header className="page-head">
          <h1>パック</h1>
          <p className="lede">コンポーネントの見た目はパックで指定します。右上でパックを選ぶと、このサイト全体のデザインを切り替えられます。</p>
        </header>
        <div className="pack-pair">
          {["graphite", "lucent"].map((pack) => (
            <div key={pack} className="pack-sample" data-pack={pack}>
              <code>data-pack=&quot;{pack}&quot;</code>
              <Card
                padding="sm"
                title="秋のオンライン説明会"
                description={"新サービスの使い方を 30\u00a0分で紹介します。"}
                footer={
                  <>
                    <Button size="sm">詳しく見る</Button>
                    <Button variant="primary" size="sm">
                      申し込む
                    </Button>
                  </>
                }
              />
            </div>
          ))}
        </div>
        <Prose html={markdown(md.replace(/^# .*\n+/m, ""))} />
      </DocsShell>
    </>
  );
}
