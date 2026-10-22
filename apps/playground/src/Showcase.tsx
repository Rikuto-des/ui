import { Button, Card, Checkbox, Dialog, Field, Input, Popover } from "@yourlib/react";

const tasks = [
  { title: "告知メールの文面を確定する", due: "10/24", status: "doing" },
  { title: "SNS 広告を入稿する", due: "10/21", status: "late" },
  { title: "申し込みページの画像を差し替える", due: "10/25", status: "todo" },
  { title: "協賛企業へお礼状を送る", due: "10/18", status: "done" },
] as const;

const statusLabel = { todo: "未着手", doing: "対応中", late: "期限切れ", done: "完了" } as const;

const filters = [
  { id: "filter-todo", label: "未着手", count: 1, checked: true, testid: "filter-open" },
  { id: "filter-doing", label: "対応中", count: 1, checked: true },
  { id: "filter-done", label: "完了", count: 1, checked: false },
];

const sizes = [
  { name: "yourlib", kb: 0.99, ours: true },
  { name: "Radix", kb: 25.72, ours: false },
  { name: "Base UI", kb: 42.71, ours: false },
];

/**
 * The playground page. It uses no hooks and no event handlers, so the same
 * tree renders in the client playground and in the script-free static page.
 */
export function Showcase() {
  return (
    <div className="site">
      <header className="nav wrap">
        <span className="wordmark">
          yourlib<small>仮称</small>
        </span>
        <nav className="nav-links" aria-label="サイト">
          <a href="#size">特長</a>
          <a href="#packs">パック</a>
          <a href="#type">日本語</a>
        </nav>
      </header>

      <section className="hero wrap" aria-labelledby="hero-title">
        <div>
          <h1 id="hero-title">動きはブラウザに、見た目はパックに。</h1>
          <p className="lede">
            ダイアログもポップオーバーも、ブラウザが持っている仕組みで動く React の UI ライブラリです。JavaScript
            はほとんど要りません。見た目はパックで丸ごと着せ替えられ、AI に書かせても崩れません。
          </p>
          <div className="cta">
            <Button variant="primary" size="lg">
              はじめる
            </Button>
            <a className="text-link" href="#size">
              何が違うのか
            </a>
          </div>
          <code className="install">npx yourlib init</code>
        </div>

        <div className="demo">
          <div className="panel" role="region" aria-label="タスク一覧のデモ">
            <div className="app-head">
              <div>
                <h2 className="app-title">秋のキャンペーン</h2>
                <p className="app-meta">5 件のタスク、うち 1 件が期限切れ</p>
              </div>
              <div className="toolbar">
                <Popover.Trigger popover="view" variant="ghost" size="sm" data-testid="open-edge">
                  表示
                </Popover.Trigger>
                <Popover.Trigger popover="filters" size="sm" data-testid="open-filters">
                  フィルタ
                </Popover.Trigger>
                <Dialog.Trigger dialog="new-task" variant="primary" size="sm" data-testid="open-new-task">
                  タスクを追加
                </Dialog.Trigger>
              </div>
            </div>
            <ul className="rows">
              {tasks.map((task) => (
                <li key={task.title} className="row" data-done={task.status === "done" || undefined}>
                  <Checkbox defaultChecked={task.status === "done"} aria-label={task.title} />
                  <span className="title">{task.title}</span>
                  <span className="due">{task.due}</span>
                  <span className="status" data-status={task.status}>
                    {statusLabel[task.status]}
                  </span>
                </li>
              ))}
            </ul>
            <div className="app-foot">
              <Button variant="ghost" size="sm" data-testid="background-button">
                共有
              </Button>
              <Dialog.Trigger dialog="confirm-delete" variant="danger" size="sm" data-testid="open-confirm">
                プロジェクトを削除
              </Dialog.Trigger>
            </div>
          </div>
          <p className="demo-caption">
            このパネルの開閉はどれも JavaScript を使っていません。<a href="/static/index.html">スクリプトが 0 個の版</a>
            でも同じように動きます。
          </p>
        </div>
      </section>

      <div className="proofs wrap">
        <section className="proof" id="size" aria-labelledby="size-title">
          <div>
            <h2 id="size-title">ダイアログとポップオーバーで 1 KB</h2>
            <p>
              開閉、フォーカスの閉じ込め、重なり順、位置合わせをブラウザに任せているので、同じ部品を数十分の一のコードで実装できます。表示が速く、Server
              Components のまま使え、JavaScript を読み込む前から動きます。
            </p>
            <p className="fine">Dialog と Popover、minify と gzip 後、React 本体を除く。2026 年 10 月 22 日に同じ条件で実測。</p>
          </div>
          <div className="panel bars" role="img" aria-label="yourlib 0.99 KB、Radix 25.72 KB、Base UI 42.71 KB">
            {sizes.map((s) => (
              <div key={s.name} className="bar" data-ours={s.ours || undefined}>
                <div className="bar-head">
                  <b>{s.name}</b>
                  <span>{s.kb.toFixed(2)} KB</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ inlineSize: `${(s.kb / 42.71) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="proof" id="packs" aria-labelledby="packs-title">
          <div>
            <h2 id="packs-title">同じコードのまま、ブランドごと着せ替える</h2>
            <p>
              見た目はコードに焼き付けず、パックが当てます。属性を 1
              つ変えるだけで、アプリ全体でも一部分だけでも切り替わります。顧客ごとにブランドが違う SaaS
              や、別の見た目の埋め込みウィジェットに向いています。
            </p>
            <pre className="code">
              <span className="dim">{"<!-- 違うのはこの属性だけ -->"}</span>
              {"\n<section "}
              <span className="hl">data-pack="graphite"</span>
              {">…</section>\n<section "}
              <span className="hl">data-pack="lucent"</span>
              {">…</section>"}
            </pre>
          </div>
          <div className="pack-tiles">
            <div className="pack-tile" data-pack="graphite">
              <span className="pack-name">data-pack="graphite"</span>
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
            <div className="pack-tile" data-pack="lucent" data-testid="preview">
              <span className="pack-name">data-pack="lucent"</span>
              <Card
                padding="sm"
                title="秋のオンライン説明会"
                description={"新サービスの使い方を 30\u00a0分で紹介します。"}
                footer={
                  <>
                    <Dialog.Trigger dialog="nested-dialog" variant="ghost" size="sm">
                      参加条件
                    </Dialog.Trigger>
                    <Popover.Trigger popover="nested-popover" size="sm">
                      持ち物
                    </Popover.Trigger>
                    <Button variant="primary" size="sm" data-testid="nested-primary">
                      申し込む
                    </Button>
                  </>
                }
              />
              <Popover id="nested-popover" title="持ち物" side="top">
                パソコンかスマートフォンだけで参加できます。
              </Popover>
              <Dialog id="nested-dialog" title="参加条件" description="どなたでも参加できます。申し込みにはメールアドレスが必要です。">
                <Dialog.Actions>
                  <Dialog.Close dialog="nested-dialog" variant="primary">
                    わかりました
                  </Dialog.Close>
                </Dialog.Actions>
              </Dialog>
            </div>
          </div>
        </section>

        <section className="proof" aria-labelledby="lint-title">
          <div>
            <h2 id="lint-title">AI に書かせても、デザインが崩れない</h2>
            <p>
              部品ごとの契約から、型・lint・AI
              向けの説明書を自動で作ります。色や角を直接書くとエラーになり、エラー文が直し方を伝えます。エージェントはそれを読んで、自分で直します。
            </p>
          </div>
          <div>
            <pre className="code">
              <span className="dim">{"// エージェントが書いたコード"}</span>
              {"\n<Button "}
              <span className="bad">className="bg-red-500 rounded-xl px-6"</span>
              {">\n  削除\n</Button>"}
            </pre>
            <div className="lint" role="note">
              <span className="lint-rule">yourlib/no-visual-override</span>
              <span>Button の色・角・余白は className では変えられません。</span>
              <span className="fix">
                代わりに <code>variant="danger"</code> を使ってください。角と余白はパックが決めます。
              </span>
            </div>
          </div>
        </section>

        <section className="proof" aria-labelledby="update-title">
          <div>
            <h2 id="update-title">コピーして所有しても、更新を受け取れる</h2>
            <p>
              手元にコピーされるのは薄いファイルだけ。入れたときの版とハッシュを記録しているので、自分で変えた箇所を残したまま新しい版を取り込めます。
            </p>
            <p className="fine">diff は実装済み、update は次の段階で実装します。</p>
          </div>
          <pre className="code">
            <span className="dim">$</span>
            {" yourlib diff\n"}
            <span className="dim">変更なし</span>
            {"  components/ui/button.tsx\n"}
            <span className="hl">変更あり</span>
            {"  components/ui/dialog.tsx\n\n"}
            <span className="dim">$</span>
            {" yourlib update dialog\ndialog 0.1.0 → 0.2.0\n"}
            <span className="good">あなたの変更を残して更新しました</span>
          </pre>
        </section>

        <section className="proof" id="type" aria-labelledby="type-title">
          <div>
            <h2 id="type-title">日本語が、最初から綺麗に組まれる</h2>
            <p>
              約物の詰め、禁則、文節での改行、和文と英数字のあいだの空き、日本語に合った行間を標準にしています。英語を前提にしたライブラリでは、ここを毎回自分で整える必要があります。
            </p>
          </div>
          <div className="type-compare">
            <div className="panel type-sample" data-variant="plain">
              <span className="type-label">一般的な既定値</span>
              <h3>「秋のキャンペーン」の申し込みを受け付けています</h3>
              <p>Webhookの設定は管理画面の「連携」から行えます。APIキーは発行から1時間で失効します。</p>
            </div>
            <div className="panel type-sample" data-variant="ours">
              <span className="type-label">yourlib</span>
              <h3>「秋のキャンペーン」の申し込みを受け付けています</h3>
              <p>Webhookの設定は管理画面の「連携」から行えます。APIキーは発行から1時間で失効します。</p>
            </div>
          </div>
        </section>
      </div>

      <footer className="foot wrap">yourlib playground</footer>

      <Popover id="filters" title="状態で絞り込む" data-testid="filters">
        <fieldset className="checks">
          <legend className="visually-hidden">状態</legend>
          {filters.map((f) => (
            // The count sits at the row's end, outside the label, and describes the checkbox.
            <div key={f.id} className="check-row">
              <Checkbox defaultChecked={f.checked} aria-describedby={`${f.id}-count`} data-testid={f.testid}>
                {f.label}
              </Checkbox>
              <span id={`${f.id}-count`} className="count">
                {f.count}
              </span>
            </div>
          ))}
        </fieldset>
        <div className="actions end">
          <Popover.Close popover="filters" size="sm" variant="ghost" data-testid="close-filters">
            閉じる
          </Popover.Close>
        </div>
      </Popover>

      <Popover id="view" title="表示する列" align="end" data-testid="edge">
        <fieldset className="checks">
          <legend className="visually-hidden">表示する列</legend>
          <Checkbox defaultChecked>期限</Checkbox>
          <Checkbox defaultChecked>状態</Checkbox>
        </fieldset>
      </Popover>

      <Dialog id="new-task" title="タスクを追加" dismissible="none" data-testid="new-task">
        <form className="form" method="dialog">
          <Field id="task-title" label="タスク名" required>
            <Input name="title" placeholder="例：告知メールを送る" data-testid="task-title" />
          </Field>
          <Field id="task-due" label="期限">
            <Input name="due" type="date" defaultValue="2026-10-30" data-testid="task-due" />
          </Field>
          <Dialog.Actions>
            <Dialog.Close dialog="new-task" variant="ghost" data-testid="new-task-cancel">
              キャンセル
            </Dialog.Close>
            <Button variant="primary" type="submit" data-testid="new-task-save">
              追加
            </Button>
          </Dialog.Actions>
        </form>
      </Dialog>

      <Dialog
        id="confirm-delete"
        title="「秋のキャンペーン」を削除しますか？"
        description="タスク 5 件とコメントがすべて消えます。この操作は取り消せません。"
        size="sm"
      >
        <Dialog.Actions>
          <Dialog.Close dialog="confirm-delete" variant="ghost" autoFocus data-testid="cancel-delete">
            キャンセル
          </Dialog.Close>
          <Dialog.Close dialog="confirm-delete" variant="danger">
            削除する
          </Dialog.Close>
        </Dialog.Actions>
      </Dialog>
    </div>
  );
}
