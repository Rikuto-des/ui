import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { DocsShell } from "@/components/docs-shell";
import { CodeBlock } from "@/components/code-block";
import { repoFile } from "@/lib/content";

export const metadata: Metadata = { title: "Studioの実装 — Examples" };
const files = [
  { label: "アプリの画面と操作", path: "apps/site/components/examples/studio-app.tsx", lang: "tsx" },
  { label: "保存データの読み込み", path: "apps/site/lib/studio-demo.ts", lang: "tsx" },
  { label: "データの型と初期値", path: "apps/studio/src/model.ts", lang: "tsx" },
  { label: "入力値の検証", path: "apps/studio/src/validation.ts", lang: "tsx" },
  { label: "画面のレイアウト", path: "apps/site/app/examples/examples.css", lang: "css" },
] as const;

export default async function Page() {
  const sources = await Promise.all(files.map(async file => ({ ...file, code: await repoFile(file.path) })));
  return <><SiteHeader section="examples" /><DocsShell current="/examples/studio/source/">
    <header className="page-head"><p className="crumb">Examples / Studio</p><h1>Studioの実装</h1><p className="lede">サンプルアプリで使っているコードをそのまま掲載しています。UIはUrushi、状態の管理はReact、保存にはlocalStorageを使います。</p><div className="cta"><a className="cta-primary" href="/examples/studio/">アプリを開く <span aria-hidden="true">→</span></a></div></header>
    <section className="prose"><h2>画面とデータをつなぐ</h2><p>DataTableとボードで同じデータを表示し、Sheetで編集します。行の選択にはUrushiのCheckboxを使っています。担当者はCombobox、期限はDatePickerで選びます。保存前に値を検証し、保存できなかった場合は入力内容を残します。</p><p>保存済みデータが壊れている場合や、別のタブで更新されている場合は、上書きを止めて案内を表示します。設定からデータを書き出したり、初期状態に戻したりできます。</p><p>これはブラウザだけで動くサンプルです。認証やサーバーへの保存、端末間の同期を製品に組み込む場合は、別途実装してください。</p></section>
    <div className="examples-source-files">{sources.map(file => <details key={file.path}><summary>{file.label}<code>{file.path}</code></summary><CodeBlock code={file.code} lang={file.lang} /></details>)}</div>
    <section className="prose"><h2>このリポジトリで起動する</h2><p>依存パッケージをインストールしてからサイトを起動し、/examples/studio/ を開いてください。共通レイアウトがUrushiのCSSとランタイムを読み込みます。</p></section><CodeBlock lang="bash" code={'pnpm install\npnpm --filter site dev'} />
  </DocsShell></>;
}
