import type { Metadata } from "next";
import { DocsShell } from "@/components/docs-shell";
import { SiteHeader } from "@/components/site-header";
import { features } from "@/lib/content";

export const metadata: Metadata = { title: "ブラウザの対応" };

/** What each platform feature is used for, and what happens without it. */
const rows: { key: string; label: string; use: string; without: string }[] = [
  { key: "popover", label: "popover 属性", use: "Popover・Menu・Tooltip・Toast", without: "必須" },
  { key: "invokerCommands", label: "invoker commands", use: "Dialog をボタンだけで開閉", without: "必須" },
  { key: "anchorPositioning", label: "CSS anchor positioning", use: "Popover・Menu・Tooltip の位置、Tabs の下地", without: "必須" },
  { key: "positionTryFallbacks", label: "position-try-fallbacks", use: "画面の端で反対側に回る", without: "はみ出す" },
  { key: "dialogClosedBy", label: "dialog closedby", use: "Dialog の外側を押して閉じる", without: "ランタイムで補う" },
  { key: "popoverHint", label: 'popover="hint"', use: "Tooltip", without: "必須" },
  { key: "interestInvokers", label: "interestfor", use: "Tooltip を JavaScript なしで出す", without: "ランタイムで補う" },
  { key: "detailsName", label: "details name", use: "Accordion で 1 つだけ開く", without: "それぞれ独立して開く" },
  { key: "startingStyle", label: "@starting-style", use: "現れるときの動き", without: "動きなしで現れる" },
  { key: "overlayProperty", label: "overlay", use: "閉じるときの動き", without: "すぐに閉じる" },
  { key: "interpolateSize", label: "interpolate-size", use: "Accordion とトーストの高さの動き", without: "高さは一瞬で変わる" },
  { key: "fieldSizing", label: "field-sizing", use: "Textarea が入力に合わせて伸びる", without: "ランタイムで補い、なければrowsの高さを使う" },
  { key: "baseSelect", label: "appearance: base-select", use: "Selectの一覧にパックを適用する", without: "一覧は OS の標準" },
  { key: "userInvalid", label: ":user-invalid", use: "操作後の入力エラーを赤い枠で示す", without: "aria-invalid のときだけ" },
  { key: "cornerShape", label: "corner-shape", use: "Lucent のスクワークルの角", without: "ふつうの角丸" },
  { key: "textAutospace", label: "text-autospace", use: "和文と英数字のあいだの空き", without: "空きなし" },
  { key: "wordBreakAutoPhrase", label: "word-break: auto-phrase", use: "見出しを文節で改行", without: "どこでも改行" },
  { key: "lightDark", label: "light-dark()", use: "ライトとダーク", without: "必須" },
];

export default async function BrowsersPage() {
  const engines = await features();
  const name = { chromium: "Chromium", firefox: "Firefox", webkit: "Safari（WebKit）" } as Record<string, string>;
  return (
    <>
      <SiteHeader section="docs" />
      <DocsShell current="/docs/browsers/">
        <article className="prose">
          <h1>ブラウザの対応</h1>
          <p className="lede">
            Urushiはブラウザ標準の機能を使います。下の表は3つのブラウザエンジンで対応状況を検査した結果です。「未対応の場合」の列で、各機能が使えないブラウザの動作を確認できます。
          </p>
          <div className="table-scroll">
            <table className="support">
              <thead>
                <tr>
                  <th scope="col">機能</th>
                  <th scope="col">使いどころ</th>
                  {engines.map((e) => (
                    <th key={e.browser} scope="col">
                      {name[e.browser]}
                      <br />
                      <span className="muted">{String(e.version).split(".")[0]}</span>
                    </th>
                  ))}
                  <th scope="col">未対応の場合</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key}>
                    <td>
                      <code>{r.label}</code>
                    </td>
                    <td>{r.use}</td>
                    {engines.map((e) => (
                      <td key={e.browser} className="support-cell">
                        {e[r.key] === true ? "対応" : <span className="muted">未対応</span>}
                      </td>
                    ))}
                    <td>{r.without}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            「必須」の機能がそろうのは、Chrome・Edge 135、Safari 26.2、Firefox 147 以降です。それより古いブラウザは対象外です。
          </p>
        </article>
      </DocsShell>
    </>
  );
}
