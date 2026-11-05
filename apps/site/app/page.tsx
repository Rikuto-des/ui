import { Badge, Button, Card } from "@urushi/react";
import { ComponentShowcase } from "@/components/component-showcase";
import { CodeBlock } from "@/components/code-block";
import { SiteHeader } from "@/components/site-header";
import { components } from "@/lib/components";
import { repoFile } from "@/lib/content";
import { NavigationStudy } from "@/components/navigation-study";

export default async function Home() {
  const navigation = JSON.parse(await repoFile("generated/navigation-enhanced-summary.json")) as { libraries: { id: string; label: string; totalGzip: number[] }[] };
  const sizes = navigation.libraries.map(r => ({ name: r.label, kb: Math.max(...r.totalGzip) / 1024, ours: r.id === "urushi" }));
  const maxKb = Math.max(...sizes.map(s => s.kb));
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="hero hero-library wrap" aria-labelledby="hero-title">
          <div className="hero-text">
            <a className="hero-announcement" href="/components/navigation-menu/">Navigation Menuのパネルがなめらかに切り替わります<span aria-hidden="true">→</span></a>
            <h1 id="hero-title">Beautiful UI.<br />Built to evolve.</h1>
            <p className="lede">60のReactコンポーネントでUIを作れます。<br />デザインを整えながら、AIが書いたコードを仕様に照らして検証できます。</p>
            <div className="cta">
              <a className="cta-primary" href="/docs/">Get Started <span aria-hidden="true">→</span></a>
              <a className="cta-secondary" href="/components/">View Components</a>
            </div>
          </div>
        </section>

        <section className="showcase-section wrap" aria-label="アプリケーションのプレビュー">
          <div className="showcase-toolbar"><span>Examples</span><a href="/examples/studio/">サンプルアプリを開く <span aria-hidden="true">↗</span></a></div>
          <ComponentShowcase />
        </section>

        <section className="interaction-section wrap" aria-labelledby="interaction-title">
          <div><span className="section-kicker">INTERACTIONS</span><h2 id="interaction-title">メニューの動きを試す</h2><p>このメニューでホバーの追従や横に開くサブメニュー、パネルが連続して変形する動きを試せます。</p><a className="text-link" href="/components/navigation-menu/">Navigation Menu <span aria-hidden="true">→</span></a></div>
          <NavigationStudy />
        </section>

        <div className="proofs wrap">
          <section className="proof" aria-labelledby="size-title">
            <div>
              <h2 id="size-title">ブラウザの機能で配信コードを減らす</h2>
              <p>
                開閉、フォーカスの閉じ込め、重なり順、位置合わせにブラウザの機能を使い、配信するコードを減らします。Server Componentsで使えば、コンポーネント本体のJavaScriptをブラウザに送りません。キーボード操作などを補うランタイムは別途読み込みます。
              </p>
              <p className="fine">2026年10月28日に保存済みのAI生成コードを4ライブラリで再計測しました。Urushiはホバー・横開き・パネルの連続変形を含みます。Reactと共通CSSを含むJS＋CSSのgzipサイズで、合格した2画面の大きいほうを表示しています。画像・フォント・HTMLは含みません。</p>
              <p><a className="text-link" href="/docs/comparison/">条件と全結果を見る</a></p>
            </div>
            <div className="panel bars" role="img" aria-label={sizes.map((s) => `${s.name} ${s.kb.toFixed(1)} KiB`).join("、")}>
              {sizes.map((s) => (
                <div key={s.name} className="bar" data-ours={s.ours || undefined}>
                  <div className="bar-head">
                    <b>{s.name}</b>
                    <span>{s.kb.toFixed(1)} KiB</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ inlineSize: `${(s.kb / maxKb) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="proof" aria-labelledby="packs-title">
            <div>
              <h2 id="packs-title">コードを変えずにブランドを切り替える</h2>
              <p>
                見た目はパックで指定します。属性を 1 つ変えると、アプリ全体や指定した範囲のデザインを切り替えられます。顧客ごとにブランドが違う SaaS や、埋め込み先に合わせて見た目を変える画面に向いています。
              </p>
              <p>
                <a className="text-link" href="/docs/packs/">パックについて</a>
              </p>
            </div>
            <div className="pack-pair">
              {["graphite", "lucent"].map((pack) => (
                <div key={pack} className="pack-sample" data-pack={pack}>
                  <code>data-pack=&quot;{pack}&quot;</code>
                  <Card
                    padding="sm"
                    title="秋のオンライン説明会"
                    description={"新サービスの使い方を 30 分で紹介します。"}
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
          </section>

          <section className="proof" aria-labelledby="ai-title">
            <div>
              <h2 id="ai-title">誤りの場所と直し方をAIへ返す</h2>
              <p>
                コンポーネントにないpropsや値、見た目の上書きを検出します。checkのJSONには行番号、診断、関連する契約が入り、AIはその情報を読んで修正・再検査できます。Navigation Menuでは生成・仕様変更・不具合修正の各2件が、動作と独自診断の両方を通りました。
              </p>
              <p>
                <a className="text-link" href="/docs/comparison/">AIによる生成・修正の実測結果</a>
              </p>
              <p className="fine">モデル1種類・各2試行での結果です。共通の動作検査ではBase UI・Radixも同点でした。</p>
            </div>
            <div className="panel numbers">
              <div>
                <b>2 / 2</b>
                <span>初回生成で動作と独自診断に合格しました</span>
              </div>
              <div>
                <b>2 / 2</b>
                <span>項目の追加・改名・削除と復元に対応しました</span>
              </div>
              <div>
                <b>2 / 2</b>
                <span>同じ3つの不具合を診断から1回で修正しました</span>
              </div>
            </div>
          </section>

          <section className="proof" aria-labelledby="update-title">
            <div>
              <h2 id="update-title">手元で編集したコードに更新を取り込む</h2>
              <p>
                手元にはコンポーネントを再エクスポートする短いファイルを配置します。導入時の版と元のファイルを記録しているため、自分で編集した箇所を残しながら新しい版を 3-way merge で取り込めます。
              </p>
              <p>
                <a className="text-link" href="/docs/cli/">CLI について</a>
              </p>
            </div>
            <CodeBlock
              code={`$ npx urushi update
  ↑ updated     components/ui/card.tsx  (0.1.0 → 0.2.0)
  M merged      components/ui/tabs.tsx  (0.1.0 → 0.2.0)`}
              lang="bash"
              copy={false}
            />
          </section>

          <section className="proof" aria-labelledby="type-title">
            <div>
              <h2 id="type-title">日本語の組版を標準で整える</h2>
              <p>
                約物の詰めや禁則、文節での改行、和文と英数字のあいだの空きを標準で設定しています。日本語の画面を作るたびに同じ組版の設定を追加する手間を減らせます。
              </p>
              <p>
                <a className="text-link" href="/docs/typesetting/">日本語組版について</a>
              </p>
            </div>
            <div className="type-compare">
              <div className="panel type-sample" data-variant="plain">
                <span className="type-label">一般的な既定値</span>
                <h3>「秋のキャンペーン」の申し込みを受け付けています</h3>
                <p>Webhookの設定は管理画面の「連携」から行えます。APIキーは発行から1時間で失効します。</p>
              </div>
              <div className="panel type-sample" data-variant="urushi">
                <span className="type-label">Urushi</span>
                <h3>「秋のキャンペーン」の申し込みを受け付けています</h3>
                <p>Webhookの設定は管理画面の「連携」から行えます。APIキーは発行から1時間で失効します。</p>
              </div>
            </div>
          </section>
        </div>

        <section className="all wrap" aria-labelledby="all-title">
          <h2 id="all-title">{components.length} のコンポーネント</h2>
          <ul className="all-list">
            {components.map((c) => (
              <li key={c.slug}>
                <a href={`/components/${c.slug}/`}>{c.name}</a>
                {c.js === "不要" ? null : <Badge tone="accent">JS</Badge>}
              </li>
            ))}
          </ul>
          <p className="fine">JS の印があるコンポーネントは、任意のランタイムで操作を補います。各コンポーネントのページで動作条件を確認できます。</p>
        </section>
      </main>
    </>
  );
}
