import type { Metadata } from "next";
import { DocsShell } from "@/components/docs-shell";
import { SiteHeader } from "@/components/site-header";
import { IconGallery } from "@/components/icon-gallery";
import { CodeBlock } from "@/components/code-block";

export const metadata: Metadata = { title: "Icons" };

export default function Page() {
  return <>
    <SiteHeader section="docs" />
    <DocsShell current="/docs/icons/">
      <header className="page-head"><p className="crumb">Design / Icons</p><h1>Icons</h1><p className="lede">Phosphorのアイコンを52種類同梱しています。一部のアイコンは線画と塗りつぶしを切り替えられます。</p></header>
      <IconGallery />
      <section className="prose"><h2>必要なアイコンだけ使う</h2><p>個別にimportすると未使用のアイコンをバンドルから除外できます。アイコン用の外部ランタイムやCDNへの接続は必要ありません。</p></section>
      <CodeBlock code={'import { Button } from "@urushi/react";\nimport { BookmarkSimpleIcon } from "@urushi/react/icons";\n\n<Button aria-pressed={saved} onClick={() => setSaved(!saved)}>\n  <BookmarkSimpleIcon weight={saved ? "fill" : "regular"} size={20} />\n  {saved ? "保存済み" : "保存"}\n</Button>'} />
      <section className="prose"><h2>サイズと読み上げ</h2><p>サイズは16・20・24pxから選べます。色は周囲の文字色に合わせるため、ライト／ダークのどちらでも使えます。隣にラベルがあるアイコンは既定で読み上げを省略します。アイコンだけのボタンにはボタン側にaria-labelを付けてください。</p><p>アイコン自体に意味を持たせるときは、aria-labelまたはaria-labelledbyで名前を付けます。コンポーネントのchildrenやiconには別のアイコンセットのSVGも渡せます。</p><h2>出典とライセンス</h2><p><a href="https://phosphoricons.com/">Phosphor Icons</a>の公式SVGを使用しています。採用バージョンは@phosphor-icons/core 2.1.1です。SVGの形は変更せず、ReactとCSSで使える形式へ変換しています。Checkboxの描画アニメーションなど、コントロール固有の印はUrushiの実装です。</p><p><a href="/licenses/phosphor.txt">MITライセンス全文</a>を配布物にも同梱しています。</p></section>
    </DocsShell>
  </>;
}
