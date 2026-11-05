import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { PackEditor } from "@/components/pack-editor";

export const metadata: Metadata = { title: "パックを作る" };

export default function Page() {
  return (
    <>
      <SiteHeader section="themes" />
      <main id="main" className="themes-page wrap">
        <header className="examples-heading">
          <h1>パックを作る</h1>
          <p className="lede">
            色だけでなく、角の丸み・密度・文字の大きさ・動き・影まで、触りながらパックを作れます。
            <br />
            読みやすさは WCAG の基準でその場で確かめ、CSS と tokens.json に書き出せます。
          </p>
        </header>
        <PackEditor />
      </main>
    </>
  );
}
