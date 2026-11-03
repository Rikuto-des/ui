import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { StudioApp } from "@/components/examples/studio-app";
import { ArrowLeftIcon, NoteIcon } from "@urushi/react/icons";

export const metadata: Metadata = { title: "Studio — Examples" };

export default function Page() {
  return <>
    <SiteHeader section="examples" />
    <main id="main" className="examples-app-page">
      <div className="examples-app-toolbar"><a href="/examples/"><ArrowLeftIcon size={16} />Examples</a><span>Studio <span aria-hidden="true">/</span> プロジェクト管理</span><a href="/examples/studio/source/"><NoteIcon size={16} />実装コード</a></div>
      <noscript><p>このサンプルの検索や編集にはJavaScriptが必要です。有効にしてから開き直してください。</p></noscript>
      <StudioApp />
    </main>
  </>;
}
