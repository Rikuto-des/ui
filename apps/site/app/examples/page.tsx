import type { Metadata } from "next";
import { Badge } from "@urushi/react";
import { ArrowRightIcon, NoteIcon } from "@urushi/react/icons";
import { SiteHeader } from "@/components/site-header";
import { studioComponents } from "@/lib/studio-demo";

export const metadata: Metadata = { title: "Examples" };

export default function Page() {
  return <>
    <SiteHeader section="examples" />
    <main id="main" className="examples-index wrap">
      <header className="examples-heading"><p className="section-kicker">BUILT WITH URUSHI</p><h1>Examples</h1><p className="lede">Urushiのコンポーネントを使ったサンプルアプリです。<br />実際に操作して、画面の構成と使い心地を確かめられます。</p></header>
      <article className="examples-feature">
        <div className="examples-feature-copy"><div><Badge tone="accent" dot>操作できます</Badge><h2>Studio</h2><p>デザインチームのプロジェクトを管理するアプリです。一覧とボードを切り替えて、担当者や期限、進み具合を編集できます。</p><p className="fine">変更はこのブラウザに保存されます。アカウントは不要です。</p></div><div className="cta"><a className="cta-primary" href="/examples/studio/">アプリを開く<ArrowRightIcon size={16} /></a><a className="cta-secondary" href="/examples/studio/source/"><NoteIcon size={16} />実装コード</a></div></div>
        <a className="examples-preview" href="/examples/studio/" aria-label="Studioのサンプルアプリを開く"><img src="/examples/studio.png" width="1392" height="1242" alt="Studioのプロジェクト一覧。進捗と期限を確認し、担当者や状態で絞り込めます。" /></a>
      </article>
      <section className="examples-details" aria-labelledby="example-components"><div><h2 id="example-components">使っているコンポーネント</h2><p>表、入力フォーム、検索、確認画面をUrushiで構成しています。サイト上部でパックやテーマを切り替えると、アプリの見た目にも反映されます。</p><p>編集画面で担当者を探したり、カレンダーから期限を選んだりしてみてください。保存した変更は再読み込み後も残り、直前の操作は取り消せます。</p></div><ul className="examples-component-links">{studioComponents.map(([name, slug]) => <li key={slug}><a href={`/components/${slug}/`}>{name}<span aria-hidden="true">↗</span></a></li>)}</ul></section>
    </main>
  </>;
}
