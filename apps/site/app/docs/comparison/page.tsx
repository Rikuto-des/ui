import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { DocsShell } from "@/components/docs-shell";
import { SiteHeader } from "@/components/site-header";
import { CompositionStudyResults, type CompositionStudy } from "@/components/composition-study";
import { repoFile } from "@/lib/content";

export const metadata: Metadata = { title: "AIによる実装の比較" };
type Result = { id: string; label: string; n: number; generate: number; repaired: number; update: number; final: number; internalCleanGenerate: number | null; jsGzip: number[]; excludingReactGzip: number[]; libraryCssGzip: number[]; assetGzip: number[]; calls: number };
type Lifecycle = { libraries: { id: string; label: string; n: number; before: number; after: number; regressions: number; afterTotalGzip: number[] }[]; css: { fullGzip: number[] }; currentUrushi: { cssGzip: number[]; totalGzip: number[]; withoutReactGzip: number[] } };
type Run = { id: string; protocol: { model: string }; libraries: Result[] };
type NavigationResult = { libraries: { id: string; label: string; generate: number; generatedAfterRepair: number; final: number; seededRepair: number; withoutReactGzip: number[]; totalGzip: number[]; sourceBytes: number[] }[] };
type NavigationSizes = { libraries: Pick<NavigationResult["libraries"][number], "id" | "label" | "withoutReactGzip" | "totalGzip" | "sourceBytes">[] };
type ProductResult = { completeModel: string; complete: { id: string; label: string; n: number; generate: number; afterRepair: number; update: number; afterUpdateRepair: number; sizes: { totalGzip: number; fullTotalGzip: number; cssGzip: number; fullCssGzip: number; pass: boolean }[] }[]; partial: { label: string; responses: number; pass: number; missing: number }[] };
const kb = (range: number[]) => { if (!range.length) return "—"; const low=(Math.min(...range)/1024).toFixed(1), high=(Math.max(...range)/1024).toFixed(1); return low===high?low:`${low}–${high}`; };

export default async function ComparisonPage() {
  const { runs } = JSON.parse(await repoFile("generated/competition-summary.json")) as { runs: Run[] };
  const lifecycle = JSON.parse(await repoFile("generated/lifecycle-summary.json")) as Lifecycle;
  const navigation = JSON.parse(await repoFile("generated/navigation-summary.json")) as NavigationResult;
  const enhanced = JSON.parse(await repoFile("generated/navigation-enhanced-summary.json")) as NavigationSizes;
  const product = JSON.parse(await repoFile("generated/product-summary.json")) as ProductResult;
  const compound = JSON.parse(await repoFile("generated/compound-summary.json")) as { libraries: { library: string; initialPass: boolean; finalPass: boolean; modelResponses: number; stages: { elapsedMs: number; usage: { input_tokens: number; output_tokens: number } }[] }[] };
  const composition = JSON.parse(await repoFile("generated/composition-summary.json")) as CompositionStudy;
  const labels: Record<string,string> = {urushi:"Urushi",base:"Base UI",radix:"Radix UI",shadcn:"shadcn/ui"};
  const final = runs.find(r => r.id === "measured-v4")!;
  const second = runs.find(r => r.id === "claude-sonnet-v1")!;
  return <><SiteHeader section="docs" /><DocsShell current="/docs/comparison/"><article className="prose">
    <h1>AIによる実装の比較</h1>
    <p className="lede">同じ課題をAIに実装させ、生成・修正・仕様更新を検査しています。Urushi、Base UI、Radix UI、shadcn/uiの結果を、失敗や計測できなかった条件も含めて記録します。</p>
    <CompositionStudyResults study={composition} />
    <h2>2つのモデルで同じ比較</h2>
    <p>削除確認・タブ・行メニューの3課題（各2試行、各段階の修正は最大1回）を、gpt-6.1-solに加えて{second.protocol.model}でもやり直しました（2026年11月5日）。課題・資料・検査は同じで、モデルにはツールも検索も渡していません。</p>
    <div className="table-scroll"><table><caption>初回生成で共通検査に合格した画面</caption><thead><tr><th scope="col">ライブラリ</th><th scope="col">gpt-6.1-sol</th><th scope="col">{second.protocol.model}</th><th scope="col">最終（gpt / Claude）</th></tr></thead><tbody>{final.libraries.map(l=>{const c=second.libraries.find(x=>x.id===l.id)!;return <tr key={l.id}><th scope="row">{l.label}</th><td>{l.generate} / {l.n}</td><td>{c.generate} / {c.n}</td><td>{l.final} / {l.n}・{c.final} / {c.n}</td></tr>;})}</tbody></table></div>
    <p>どちらのモデルでも、初回生成で全件合格したのはUrushiだけでした。ほかのライブラリの初回の失敗は、メニューを開いたあとの読み上げ対象外の要素へのフォーカス、タブの色のコントラスト、無効項目へのフォーカスなどです。修正を挟んだあとの差は小さくなります。2モデル・3つの小さな課題の結果で、すべての画面への一般化はできません。</p>
    <h2>以前の比較：非同期検索と入れ子の画面を追加</h2>
    <p>2026年10月29日に以前の実生成コードへ入れ子の担当者選択、応答順が逆転する検索、独立した設定フォームを追加させました。gpt-6-lunaで各1試行、修正は最大1回です。型検査に加え、以前の操作を保つことも含めて7項目を同じ条件で確認しました。</p>
    <div className="table-scroll"><table><caption>既存コードへの仕様変更・各1試行</caption><thead><tr><th scope="col">ライブラリ</th><th scope="col">仕様変更直後</th><th scope="col">修正後の最終</th><th scope="col">AI応答数</th><th scope="col">AI応答待ち</th></tr></thead><tbody>{compound.libraries.map(row=><tr key={row.library}><th scope="row">{labels[row.library]}</th><td>{row.initialPass?1:0} / 1</td><td>{row.finalPass?1:0} / 1</td><td>{row.modelResponses}</td><td>{Math.round(row.stages.reduce((sum,stage)=>sum+stage.elapsedMs,0)/1000)}秒</td></tr>)}</tbody></table></div>
    <p>UrushiとBase UIは7項目すべて通過しました。Radixとshadcnには修正後もフォーカスや狭い画面での問題が残りました。各ライブラリの以前の生成結果を出発点にしているため、同一ソースの比較ではありません。各1試行の結果であり、一般的な成功率や応答速度の順位は付けていません。</p>
    <p>手書きの正解例と、検索結果の上書き・送信先の混同を加えた例で検査を校正しました。検索入力のHTMLタイプの差を誤判定した箇所は、ラベル指定へ修正し、全ライブラリの保存済みコードを再評価してから修正依頼に進んでいます。AIのコードは人手で直していません。<a href="/evals/compound-summary.json" download>条件・検査項目・トークン数のJSON</a>を保存できます。</p>
    <h2>実用アプリでの比較を追加</h2>
    <p>2026年10月28日、検索・絞り込み・行の選択・一括変更・編集・保存失敗と再試行を持つプロジェクト管理画面を依頼しました。続けて、アーカイブの表示切替と担当者の編集を追加させました。同じAPI応答、操作シナリオ、型検査、axe、幅390pxの検査を使い、各ライブラリ2試行、各段階の修正は最大1回です。</p>
    <div className="table-scroll"><table><caption>{product.completeModel}・共通検査に合格した画面</caption><thead><tr><th scope="col">ライブラリ</th><th scope="col">初回生成</th><th scope="col">修正後</th><th scope="col">仕様変更</th><th scope="col">再修正後</th></tr></thead><tbody>{product.complete.map(row=><tr key={row.id}><th scope="row">{row.label}</th><td>{row.generate} / {row.n}</td><td>{row.afterRepair} / {row.n}</td><td>{row.update} / {row.n}</td><td>{row.afterUpdateRepair} / {row.n}</td></tr>)}</tbody></table></div>
    <p>UrushiとBase UIはどちらも修正なしで全件通過し、成功率の差は出ませんでした。Radixを使った生成画面にはフォーカス復帰、shadcnを使った生成画面には狭い画面での横はみ出しが残りました。各ライブラリで実現できないことを示す結果ではありません。</p>
    <p>gpt-6.1-solも実行しましたが、HTTP 429により生成8件のうち3件と、仕様変更の応答を取得できませんでした。取得できた生成コードでは、Urushi 1/1、Base UI 2/2、Radix UI 1/1、shadcn/ui 0/1が合格しています。未取得の応答は不合格に数えず、2モデル共通の順位も付けていません。</p>
    <h3>同じ生成コードでCSS込みのサイズを再計測</h3>
    <p>Urushiの読み込みを全コンポーネントのCSSから公開のDialog用CSSへ変更しました。生成コード、React、任意ランタイム、Graphiteの全トークン、共通CSSは保っています。コンポーネントとパックのCSSは13.6 KiBから3.0 KiBになり、生成・仕様変更の4画面は操作検査にも引き続き合格しました。</p>
    <div className="table-scroll"><table><caption>仕様変更後・各2画面のgzipサイズ</caption><thead><tr><th scope="col">ライブラリ</th><th scope="col">JS＋CSS＋React</th><th scope="col">最終操作検査</th></tr></thead><tbody>{product.complete.map(row=><tr key={row.id}><th scope="row">{row.label}</th><td>{kb(row.sizes.map(size=>size.totalGzip))} KiB</td><td>{row.sizes.filter(size=>size.pass).length} / {row.n}</td></tr>)}</tbody></table></div>
    <p>この課題ではUrushiが最小でした。共通CSSも合計に含めています。実用アプリ全般のサイズや起動速度へは一般化できません。今回の変更はアプリの仕様変更であり、下に掲載する依存バージョン更新の比較とは別の計測です。</p>
    <p>検査側のラベル指定とアニメーション待機の誤判定は修正し、保存済みコードを再評価しました。応答と修正依頼は書き換えていません。比較はChromium、Urushiの独立した製品テストは3ブラウザで実施しています。スクリーンリーダーの読み上げと実機タッチは未検証です。<a href="/evals/product-summary.json" download>条件・欠測・サイズを含むJSON</a>を保存できます。</p>
    <h2>以前のコンポーネント別比較</h2>
    <p>2026年10月27日に計測しました。モデルはgpt-6.1-solで、推論設定はmediumです。各条件を2回ずつ実施し、各段階の修正は最大1回です。生成コードを人手で直した結果は含みません。</p>
    <h2>Navigation Menuの生成・修正を実測</h2>
    <p>2つのグループを持つヘッダーを生成し、リンクの追加・改名・削除と復元を依頼しました。型、キーボード、フォーカス、リンク先、現在のページ、アクセシビリティ、320pxでの表示を共通の検査で確認しています。</p>
    <div className="table-scroll"><table><thead><tr><th scope="col">ライブラリ</th><th scope="col">初回生成</th><th scope="col">生成後の修正まで</th><th scope="col">仕様変更後の最終</th><th scope="col">同じ不具合を修正</th></tr></thead><tbody>{navigation.libraries.map(r=><tr key={r.id}><th scope="row">{r.label}</th><td>{r.generate} / 2</td><td>{r.generatedAfterRepair} / 2</td><td>{r.final} / 2</td><td>{r.seededRepair} / 2</td></tr>)}</tbody></table></div>
    <p>右端の列は別の修正課題です。合格済みのコードに、ナビゲーション名の誤り、リンク先の誤り、最小幅640pxを同じように加え、実際の診断を渡して1回だけ修正させました。最終比較と修正課題を合わせて、実モデルの応答は27回です。</p>
    <p>Urushi、Base UI、Radixは同点でした。shadcnの修正課題では、320px幅に対して13pxと1pxの横はみ出しが残りました。直前の比較では4ライブラリとも生成・仕様変更に全件合格しています。この少数の試行だけで、成功率の一般的な順位は決められません。</p>
    <h2>パネルの連続変形まで含む配信サイズ</h2>
    <p>2026年10月28日に保存済みの生成コード8件を変更せず再計測しました。Urushiはホバー・横開き・連続変形に対応した実装へ差し替え、全4ライブラリを同じ設定でビルドしています。共通CSSは前回と完全に同じファイルです。動作・型・アクセシビリティの共通検査は8件とも通りました。新しいAI生成・修正の試行は行っていません。</p>
    <div className="table-scroll"><table><thead><tr><th scope="col">ライブラリ</th><th scope="col">JS・Reactを外部化</th><th scope="col">JS＋CSS・React込み</th><th scope="col">生成したTSX</th></tr></thead><tbody>{enhanced.libraries.map(r=><tr key={r.id}><th scope="row">{r.label}</th><td>{kb(r.withoutReactGzip)} KiB</td><td>{kb(r.totalGzip)} KiB</td><td>{kb(r.sourceBytes)} KiB</td></tr>)}</tbody></table></div>
    <p>成功した仕様変更後の2画面を、同じ設定でビルドした範囲です。Urushiは全機能の任意ランタイム、必要コンポーネントのCSS、Graphiteの全トークンを含みます。右から2列目には全条件で同一の共通CSSも含みます。画像・フォント・HTML・起動時間は対象外です。</p>
    <p>この条件ではUrushiのJSが約52〜83%小さく、CSSとReactを含む合計は約5〜25%小さくなりました。連続変形の追加分は合計約0.7 KiBで、ホバー対応前からの増加は約3.0 KiBです。一方、AIへの入力トークンはRadixより少なくありません。配信する量と、AIに渡す量は分けて評価しています。</p>
    <p>保存済みの8画面には入れ子の横開きはありません。ホバー・斜め移動・横開き・画面端での反転・変形途中での切替は、別の3ブラウザー回帰テストで確認しています。<a href="/evals/navigation-enhanced-summary.json" download>追加後のサイズと再検査のJSON</a>を保存できます。</p>
    <p>Urushiでは、素早いグループ切替で古い開閉イベントが残る不具合を修正しました。<code>context --compact</code>では契約と共通規約を保ち、関係の薄いトークンを省きます。最終の生成・仕様変更・不具合修正の6画面は、共通検査とUrushiの独自診断をともに通りました。</p>
    <p>空で1pxにクリップされたフォーカス移動用のspanは、axeの指摘を別記録にしています。通常の要素の違反は除外していません。スクリーンリーダーの実利用は未検証です。<a href="/evals/navigation-summary.json" download>条件・サイズ・AI使用トークンのJSON</a>を保存できます。</p>
    <h2>CSS込みのサイズを改善</h2>
    <p>必要なコンポーネントのCSSだけを読み込めるようにしました。コンポーネントの開閉、フォーカス、画面幅による変化、読み上げ用の非表示テキストは残します。アプリ側で使える公開トークンも削りません。今回の6画面では、UrushiのコンポーネントとパックのCSSが{kb(lifecycle.css.fullGzip)} KiBから{kb(lifecycle.currentUrushi.cssGzip)} KiBになりました。</p>
    <CodeBlock code={`import "@urushi/packs/graphite.css";
import "@urushi/react/styles/dialog.css";
// 複数コンポーネントを一つにまとめる場合：
// npx urushi css dialog button input > app/urushi.css`} lang="tsx" />
    <p>次の表は前回の記録です。当時のUrushiを、AIが生成した削除確認・タブ・行メニューの6画面で再ビルドしました。React・共通CSS・コンポーネントCSSを含むgzipサイズで、共通CSSは全条件で同じファイルです。</p>
    <div className="table-scroll"><table><thead><tr><th scope="col">ライブラリ</th><th scope="col">JS＋CSS、React込み</th></tr></thead><tbody>{lifecycle.libraries.map(r=><tr key={r.id}><th scope="row">{r.id === 'urushi' ? 'Urushi・必要コンポーネントのCSS' : r.label}</th><td>{kb(r.id === 'urushi' ? lifecycle.currentUrushi.totalGzip : r.afterTotalGzip)} KiB</td></tr>)}</tbody></table></div>
    <p>この条件では、CSS込みでもUrushiが最小でした。画像・フォント・HTML、起動速度は測っていません。各アプリで最適化したCSSの比較や、大規模な画面での結果にそのまま一般化はできません。</p>
    <h2>依存バージョンを実際に更新</h2>
    <p>ReactとReact DOMを19.3.0から19.3.1へ更新しました。Base UIは1.8.0から1.9.0、Radix UIとshadcn/uiのRadix依存は1.7.0から1.8.1へ更新しています。旧版・新版を別々にインストールし、生成コード、共通CSS、検査を変えずに比較しました。</p>
    <div className="table-scroll"><table><thead><tr><th scope="col">ライブラリ</th><th scope="col">更新前</th><th scope="col">更新後</th><th scope="col">更新で増えた失敗</th></tr></thead><tbody>{lifecycle.libraries.map(r=><tr key={r.id}><th scope="row">{r.label}</th><td>{r.before} / {r.n}</td><td>{r.after} / {r.n}</td><td>{r.regressions}</td></tr>)}</tbody></table></div>
    <p>全ライブラリで更新による新しい失敗はありません。Base UIの2件は更新前から同じキーボード条件で不合格です。この更新比較ではUrushiだけの優位性は出ていません。</p>
    <p>今回は生成済みのコードを変更せずに検査しています。AIに移行修正を行わせた成功率ではありません。Urushiは公開前の0.0.0なので、自身の旧リリースから新リリースへの移行は対象外です。shadcn/uiのコピー済みソースも同じ版を使っています。</p>
    <p><a href="/evals/lifecycle-summary.json" download>依存の実バージョン・サイズ・検査結果のJSON</a></p>
    <h2>Navigation Menuの操作を拡張</h2>
    <p><a href="/components/navigation-menu/">NavigationMenuの使用例</a>では、サイトの階層をたどれます。ネイティブのリンクと開閉を使い、JavaScriptがなくても操作できます。ランタイムを入れると、Escapeでのフォーカス復帰、外側クリック、矢印キー、RTLにも対応します。狭い画面では入れ子を縦に展開します。</p>
    <p><code>{"columns={2}"}</code>で2列のパネルを指定でき、狭い画面では1列に戻ります。2026年10月28日にはホバー切替、横方向のサブメニュー、背景の連続変形を追加しました。斜め移動、画面端での反転、タッチ、RTLに対応します。背景の位置と大きさを動かし、文字は拡大縮小しません。動きを減らす設定では即座に切り替えます。生成・修正の成績は追加前、配信サイズは追加後の記録です。編集・削除には<a href="/components/menu/">Menu</a>、アプリの常設ナビゲーションには<a href="/components/sidebar/">Sidebar</a>を使います。</p>
    <h2>AIによる生成・修正・仕様更新の結果</h2>
    <p>型検査、指定したコンポーネントの使用、キーボード操作、状態の保持、axeによるWCAG A/AAの検査、幅320pxでの表示をすべて通った件数です。Urushi独自のlintは共通の合否に含めていません。</p>
    <div className="table-scroll"><table><thead><tr><th scope="col">ライブラリ</th><th scope="col">初回生成</th><th scope="col">修正後</th><th scope="col">仕様更新</th><th scope="col">再修正後</th><th scope="col">AI呼び出し</th></tr></thead><tbody>
      {final.libraries.map(r => <tr key={r.id}><th scope="row">{r.label}</th><td>{r.generate} / {r.n}</td><td>{r.repaired} / {r.n}</td><td>{r.update} / {r.n}</td><td>{r.final} / {r.n}</td><td>{r.calls}回</td></tr>)}
    </tbody></table></div>
    <p>呼び出し回数は6画面の生成・修正・仕様更新・再修正の合計です。資料の長さや回答のトークン数が異なるため、そのまま料金の差を表すものではありません。</p>
    <p>Base UIのタブやメニューは無効な項目にもフォーカスを移せるため、今回の「無効な項目を飛ばす」という指定との不一致がありました。これをライブラリ全体のアクセシビリティの優劣とは扱っていません。shadcn/uiには共通の評価用テーマを設定しており、配色の失敗はこの組み合わせでの結果です。</p>
    <h2>Urushiで直したこと</h2>
    <p><code>describe</code>でAPIだけを渡した初回実験では、操作に合格してもデザイン規約への違反が残りました。<code>context</code>を追加し、契約・デザイン規約・使えるトークンをまとめて渡せるようにしました。</p>
    <CodeBlock code={`npx urushi context dialog button input
npx urushi check --project tsconfig.json --strict --json`} lang="bash" />
    <p>タブの外側から選択を変える<code>Tabs.Activate</code>も追加しました。DOMの順序を調べてクリックするコードをアプリ側に書かずに、対象のタブを指定できます。存在しない静的なidやvalueはlintで検出します。</p>
    <CodeBlock code={`<Tabs.Activate tabs="account" value="security">セキュリティを開く</Tabs.Activate>
<Tabs id="account" label="アカウント" defaultValue="profile">
  <Tabs.List>
    <Tabs.Tab value="profile">プロフィール</Tabs.Tab>
    <Tabs.Tab value="security">セキュリティ</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="profile">プロフィール設定</Tabs.Panel>
  <Tabs.Panel value="security">セキュリティ設定</Tabs.Panel>
</Tabs>`} />
    <p>CSSリセットでダイアログが左上に寄る問題を修正しました。削除成功時はダイアログを閉じてから状態を変える手順も契約に追加し、ネイティブのclose処理が途中で取り消される書き方を避けています。</p>
    <h2>改善前からの記録</h2>
    <div className="table-scroll"><table><thead><tr><th scope="col">Urushiの条件</th><th scope="col">初回生成</th><th scope="col">最終合格</th><th scope="col">初回の独自lint違反なし</th></tr></thead><tbody>
      {runs.map((run, i) => { const r=run.libraries.find(r=>r.id==='urushi')!; return <tr key={run.id}><th scope="row">{["API資料のみ", "contextと外部タブ操作を追加", "実表示と契約を修正後", "検査を固定した最終比較"][i]}</th><td>{r.generate} / {r.n}</td><td>{r.final} / {r.n}</td><td>{r.internalCleanGenerate} / {r.n}</td></tr>; })}
    </tbody></table></div>
    <p>途中の失敗も残しています。最初の3回は検査方法の修正後に保存済みコードを再評価しており、修正時に渡した診断は当時の結果です。最後の比較では、生成前から検査を固定し、4ライブラリに同じ修正機会を与えています。生成コードを人手で修正して合格にした結果は含みません。</p>
    <h2>CSS改善前のサイズ記録</h2>
    <p>仕様更新と修正を終えた各6画面の範囲です。同じesbuild設定で圧縮し、gzip後のKiBで表示しています。右列はReactとReact DOMを外部化した別ビルドで、UIライブラリ・ランタイム・アプリの処理を含みます。CSS、画像、フォントは含みません。</p>
    <div className="table-scroll"><table><thead><tr><th scope="col">ライブラリ</th><th scope="col">React込み</th><th scope="col">Reactを外部化</th></tr></thead><tbody>{final.libraries.map(r=><tr key={r.id}><th scope="row">{r.label}</th><td>{kb(r.jsGzip)} KiB</td><td>{kb(r.excludingReactGzip)} KiB</td></tr>)}</tbody></table></div>
    <p>UrushiにはコンポーネントとパックのCSSが別途{kb(final.libraries.find(r=>r.id==='urushi')!.libraryCssGzip)} KiBあります。JSの削減率をページ全体の軽量化率として扱うことはできません。この全CSSを読み込んだ初回の比較では、タブの画面はRadix UIのほうが小さくなりました。冒頭の表は、この弱点を修正したあとの値です。</p>
    <div className="table-scroll"><table><thead><tr><th scope="col">ライブラリ</th><th scope="col">JS＋CSS、React込み</th></tr></thead><tbody>{final.libraries.map(r=><tr key={r.id}><th scope="row">{r.label}</th><td>{kb(r.assetGzip)} KiB</td></tr>)}</tbody></table></div>
    <p>この合計は共通の評価用CSSも含む各ファイルのgzipサイズの和です。画像・フォント・HTMLは含まず、実際の起動速度は測っていません。</p>
    <h2>条件と適用範囲</h2>
    <p>Base UI 1.9.0、radix-ui 1.8.1、shadcn/uiのnew-york-v4公式レジストリ、React 19.3.1を使いました。依頼文・モデル・修正回数・共通CSS・Chromiumの検査をそろえ、各ライブラリのAPI資料を添えています。AIにはツール、検索、以前の会話を渡していません。</p>
    <p>更新課題は「削除処理の失敗と再試行」「外部からのタブ選択」「アーカイブの取り消し」の追加です。依存バージョンの更新は、冒頭の別実験で検証しました。課題は小規模で、モデルは1種類、各条件は6件です。大規模アプリ、別のモデル、スクリーンリーダーでの操作、デザインの好みまで一般化できる結果ではありません。</p>
    <p>Urushiの開発中に行った探索的な比較です。成功率だけで全面的な優位性を主張せず、生成時の規約順守、修正後の動作、配信するコード量を分けて評価しています。</p>
    <p><a href="/evals/competition-summary.json" download>条件・集計値をJSONで保存</a>できます。依頼文、生成コード、診断、スクリーンショットはリポジトリの<code>evals/competition/runs/</code>に保存しています。</p>
    <p>公式資料は<a href="https://base-ui.com/react/components/tabs">Base UI Tabs</a>、<a href="https://www.radix-ui.com/primitives/docs/components/tabs">Radix UI Tabs</a>、<a href="https://ui.shadcn.com/docs/components/tabs">shadcn/ui Tabs</a>を参照しました。</p>
  </article></DocsShell></>;
}
