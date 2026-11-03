import type { Metadata } from "next";
import { Badge } from "@urushi/react";
import { CodeBlock } from "@/components/code-block";
import { DocsShell } from "@/components/docs-shell";
import { SiteHeader } from "@/components/site-header";
import { repoFile } from "@/lib/content";

export const metadata: Metadata = { title: "AI と lint" };

const rules = [
  ["no-visual-override", "error", "コンポーネントの見た目を className や style で上書きしていないか検査します。変えてよいのは外側の余白・幅・並びの中の配置・位置だけです。"],
  ["no-raw-color", "error", "生の色（#fff、Tailwind のパレット色、任意値）を書いていないか検査します。色はパックのトークンで指定します。"],
  ["valid-token", "error", "存在しないトークン名（var(--ur-…)）を使っていないか検査します。"],
  ["valid-import", "error", "@urushi/react にない名前を import していないか検査します。TabsTrigger なら Tabs.Tab のように、正しい名前を示します。"],
  ["valid-props", "error", "コンポーネントにない props を渡していないか検査します。"],
  ["required-props", "error", "必須の props（Dialog の title、Field の label など）があるか検査します。"],
  ["accessible-name", "error", "アイコンだけのボタンやポップオーバーに読み上げられる名前があるか検査します。"],
  ["tabs-match", "error", "Tabs.Tab と Tabs.Panel の value が対応し、defaultValue がどれかのタブを指しているか検査します。"],
  ["valid-idref", "warn", "トリガーの参照先の id があり、種類も合っているか検査します。Menu.Trigger が Popover を指している場合などに警告します。"],
  ["prefer-native", "warn", "div や span に onClick を付けて操作できるコンポーネントを自作していないか検査します。"],
] as const;

const mcpTools = [
  ["list_components", "全コンポーネントの名前・概要・使う場面・パーツを返します。", false],
  ["describe_component", "1 つのコンポーネントの契約（props、パーツ、a11y の決まり、状態、トークン、例）を返します。", false],
  ["get_authoring_context", "使うコンポーネントの契約に、デザインの規約とトークンを添えて返します。画面を書く前に読みます。", false],
  ["check_project", "型と契約の lint を検査し、ファイル・行と直すための文脈を返します。", false],
  ["project_info", "urushi.json の設定と、導入済みのコンポーネントと版を返します。", false],
  ["add_components", "コンポーネントをプロジェクトにコピーし、urushi.lock に記録します。", true],
  ["update_components", "新しい版を 3-way merge で取り込みます。既定はプレビューだけです。", true],
  ["list_local_changes", "導入後に手で変えたファイルと、解決していない衝突を返します。", false],
] as const;

export default async function AiPage() {
  const proof = JSON.parse(await repoFile("generated/agent-proof.json")) as {
    before: { code: string; report: { summary: { errors: number }; issues: { source: string; code: string; message: string; line: number }[] } };
    after: { code: string; report: { status: string; summary: { errors: number; warnings: number } } };
  };
  return (
    <>
      <SiteHeader section="docs" />
      <DocsShell current="/docs/ai/">
        <article className="prose">
          <h1>AI と lint</h1>
          <p className="lede">
            コンポーネントごとの契約（contracts）から、型・lint・AI 向けの説明書を作ります。AI が見た目を上書きしたり、存在しないコンポーネントを書いたりすると、lint が止め、エラー文が直し方を伝えます。
          </p>

          <h2>生成したコードを検証して直す</h2>
          <p>AIが使うコンポーネントの仕様と、検査に使う仕様は同じ契約から生成します。契約を読んで画面を書き、診断を受けて修正したあとに同じ検査を繰り返せます。</p>
          <CodeBlock code={`npx urushi context dialog button input
npx urushi check --project tsconfig.json --strict --json
# JSONのissuesとcontractsを読み、ソースを修正して同じcheckを再実行
npx urushi update --dry-run --json`} lang="bash" />
          <p><code>check</code>は型と10種類の契約ルールを検査します。JSONにはファイル・行・列、診断、関連するコンポーネントの契約が入ります。ソースの書き換えや外部APIへの送信は行いません。</p>
          <p><code>context</code>は指定したコンポーネントの契約に、デザインの規約と使えるトークンをまとめたJSONを返します。APIだけなら<code>describe</code>を使えます。<a href="/docs/comparison/">競合との生成・修正・仕様更新の比較</a>では、この出力をAIに渡して実際の画面を検査しています。</p>
          <p><code>context navigation-menu --compact</code>を使うと、契約とデザイン規約を保ったまま、関係の薄いトークンを省けます。全トークンが必要な画面では、通常の<code>context</code>を使ってください。</p>

          <h2>実際の操作をCLIで再検証する</h2>
          <p><code>verify</code>はJSONの手順に沿ってブラウザを操作します。クリック、入力、キー操作、選択、再読み込み、表示・値・フォーカスの確認、axe検査を組み合わせられます。</p>
          <CodeBlock code={`npx urushi verify --url http://localhost:3300 \\
  --scenario scenario.json --out review --browser chromium --json`} lang="bash" />
          <CodeBlock code={JSON.stringify({version:1,name:"編集画面からのフォーカス復帰",steps:[{action:"click",target:{role:"button",name:"編集"}},{action:"press",target:{role:"textbox",name:"名前"},key:"Escape"},{action:"expect",target:{role:"button",name:"編集"},focused:true},{action:"axe"}]},null,2)} lang="json" />
          <p>失敗すると、失敗した手順、アクセシビリティツリー、画像、修正用の文脈を保存し、終了コード1を返します。成功時は0です。対象を絞るには<code>target.within</code>にダイアログなどのroleとnameを指定します。FirefoxとWebKitも選べます。</p>
          <p>実測では、AIが生成したRadixの編集画面でEscape後のフォーカス復帰に失敗し、同じモデルの修正後は同一シナリオで成功しました。修正依頼には共通のPlaywright診断を使い、保存された修正前後のコードをCLIで再生しています。このとき使った<code>verify</code>は、AIへの送信やソース修正を行いません。</p>

          <h2>診断から修正・再検証をつなぐ</h2>
          <p><code>workflow</code>は、静的検査、ビルド、操作シナリオを順に実行します。修正コマンドを設定して<code>--repair</code>を付けた場合だけ、指定したソースと診断、シナリオ全体をそのコマンドへ渡します。外部AIを使う場合は、送信先を選ぶアダプターを用意します。</p>
          <CodeBlock code={`npx urushi workflow --config workflow.json --out review/run-001 --repair --json`} lang="bash" />
          <CodeBlock code={JSON.stringify({version:1,project:"tsconfig.json",sources:["src/App.tsx"],build:["npm","run","build"],checks:[{name:"edit",url:"http://localhost:3300",scenario:"scenario.json",browser:"chromium"}],repair:{command:["node","repair-adapter.mjs"],maxAttempts:2}},null,2)} lang="json" />
          <p>アダプターは標準入力のJSONを受け取り、<code>{'{edits:[{path,beforeSha256,content}]}'}</code>を標準出力へ返します。変更できるのは明示したソースだけです。シナリオ・設定の変更や古いソースへのパッチは拒否します。再検証に失敗した案は元に戻し、ハッシュが変わったファイルは上書きせず報告します。実行ごとに新しい出力先を指定してください。</p>
          <p>ビルドとアダプターは、利用者が選んだローカルコマンドとして動きます。任意コマンドを隔離するサンドボックスではありません。対象アプリのサーバーは先に起動し、送信するファイルとコマンドを確認してから実行します。通常の<code>workflow</code>は検査だけを行います。</p>
          <p>実測では、AIが返した入力検証の修正案にフォーカスの不具合が残り、検査が失敗して元に戻りました。その保存済み案から残った不具合を再現し、診断→実際のモデル応答→修正→同じ13手順の合格まで確認しています。1回の応答で常に直ることを保証する機能ではありません。</p>
          <h2>同じコードを修正前後で検査する</h2>
          <p>この例には、別のライブラリの値や開閉方法、見た目の上書きを意図的に混ぜています。下の結果は実際の<code>check</code>の出力です。<code>pnpm proof:agent</code>で再生成できます。AIの成功率を測るベンチマークではありません。</p>
          <details className="agent-example" open>
            <summary>修正前：{proof.before.report.summary.errors}件のエラー</summary>
            <CodeBlock code={proof.before.code} copy={false} />
            <ul className="agent-diagnostics">
              {proof.before.report.issues.filter((i) => i.source === "contract").map((i, index) => (
                <li key={index}><code>{i.code}</code>（{i.line}行目）<p>{i.message}</p></li>
              ))}
            </ul>
          </details>
          <details className="agent-example">
            <summary>修正後：エラー{proof.after.report.summary.errors}件・警告{proof.after.report.summary.warnings}件</summary>
            <CodeBlock code={proof.after.code} />
          </details>
          <p className="note">この合格は静的検査の範囲です。表示崩れ、実際の操作、動的な値、別ファイルをまたぐidの対応、スクリーンリーダーでの読み上げは別途確認します。診断による修正をAIに行わせるには、利用中のエージェントへこの手順を渡してください。</p>

          <h2>MCP サーバーとして使う</h2>
          <p><code>urushi mcp</code>は、上の CLI のコマンドを MCP（Model Context Protocol）のツールとして AI エージェントに渡します。Claude Code、Cursor、VS Code など、MCP に対応したエージェントの設定に 1 つ足すだけで使えます。起動したフォルダーのプロジェクトだけを扱い、その外のファイルには触れません。</p>
          <CodeBlock code={JSON.stringify({ mcpServers: { urushi: { command: "npx", args: ["urushi", "mcp"] } } }, null, 2)} lang="json" />
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">ツール</th>
                  <th scope="col">すること</th>
                  <th scope="col">ファイル</th>
                </tr>
              </thead>
              <tbody>
                {mcpTools.map(([name, text, writes]) => (
                  <tr key={name}>
                    <td><code>{name}</code></td>
                    <td>{text}</td>
                    <td>{writes ? <Badge tone="accent">書き込む</Badge> : "読むだけ"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>サーバーは最初に「書く前に<code>get_authoring_context</code>を読み、書いたら<code>check_project</code>で確かめる」という手順をエージェントに伝えます。<code>add_components</code>は利用者が変えたファイルを上書きしません。<code>update_components</code>は既定では差分を見せるだけで、<code>dryRun: false</code>のときにだけ書き込みます。</p>

          <h2>AI に渡すもの</h2>
          <ul>
            <li>
              <code>SKILL.md</code>には、パックで見た目を決める方法やidの結び方、Fieldに入力欄を1つだけ配置する決まりを記載しています。コンポーネントごとの使い方、使わない場面、使える値、トークンも確認できます。
            </li>
            <li>
              <code>llms.txt</code>にはコンポーネントとドキュメントの一覧を記載しています。
            </li>
          </ul>
          <p>どちらも契約から自動で作るので、コンポーネントを変えると一緒に変わります。</p>

          <h2>lint のルール</h2>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">ルール</th>
                  <th scope="col">重さ</th>
                  <th scope="col">見るもの</th>
                </tr>
              </thead>
              <tbody>
                {rules.map(([name, level, what]) => (
                  <tr key={name}>
                    <td>
                      <code>urushi/{name}</code>
                    </td>
                    <td>{level === "error" ? <Badge tone="danger">error</Badge> : <Badge>warn</Badge>}</td>
                    <td>{what}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>エラー文には問題の箇所と修正方法を必ず含めます。次の例では、色と角丸の上書きを指摘しています。</p>
          <CodeBlock
            code={`<Button className="bg-red-500 rounded-xl">削除</Button>
// urushi/no-visual-override
// <Button> の見た目は className では変えられません（bg-red-500, rounded-xl）。
// 赤くしたいなら variant="danger" を使ってください。角はパックが決めます。`}
            copy={false}
          />

          <h2>実際に AI に書かせた結果</h2>
          <p>
            2026 年 10 月 22 日に、Claude（claude-opus-5-5）に 10 個の画面（設定画面、ログイン、削除の確認、タブの詳細ページなど）を、条件ごとに 3 回ずつ書かせ、lint と型チェックにかけました。依頼文には「赤で目立たせて」「影を強めに」のような、崩れやすい頼み方も混ぜています。
          </p>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">条件</th>
                  <th scope="col">1 回目で lint 違反 0</th>
                  <th scope="col">エラー文で 1 回直したあと</th>
                  <th scope="col">型エラーなし（直したあと）</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>SKILL.md と llms.txt を渡す</td>
                  <td>30 / 30</td>
                  <td>30 / 30</td>
                  <td>30 / 30</td>
                </tr>
                <tr>
                  <td>何も渡さない</td>
                  <td>0 / 30</td>
                  <td>19 / 30</td>
                  <td>30 / 30</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            この計測では、資料を渡した30件すべてで、初回からlint違反と型エラーがありませんでした。資料を渡さない条件も、1回修正した後の型エラーは30件すべてで0件でした。画面の見た目や操作の正しさを示す結果ではありません。
          </p>
        </article>
      </DocsShell>
    </>
  );
}
