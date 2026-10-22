/**
 * Proposal: replace the hand-built controls in the playground Showcase with
 * library components. Renders "now" and "after" side by side into
 * apps/playground/public/proposals/showcase-components.html (served by the dev
 * server at /proposals/showcase-components.html). Nothing in the Showcase changes.
 *   tsx scripts/proposal-showcase.tsx
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Badge, Button, Card, Checkbox, Dialog, Field, Input, Link, Popover, RadioGroup, Switch } from "@yourlib/react";

const root = join(import.meta.dirname, "..");
const out = join(root, "apps/playground/public/proposals");

const tasks = [
  { title: "告知メールの文面を確定する", due: "10/24", status: "doing" },
  { title: "SNS 広告を入稿する", due: "10/21", status: "late" },
  { title: "申し込みページの画像を差し替える", due: "10/25", status: "todo" },
  { title: "協賛企業へお礼状を送る", due: "10/18", status: "done" },
] as const;
const statusLabel = { todo: "未着手", doing: "対応中", late: "期限切れ", done: "完了" } as const;
const statusTone = { todo: "neutral", doing: "accent", late: "danger", done: "ok" } as const;

// --- the five places, as they are now and as they would be ----------------------------

const rowsNow = (
  <div className="panel">
    <ul className="rows">
      {tasks.map((task) => (
        <li key={task.title} className="row" data-done={task.status === "done" || undefined}>
          <input className="check" type="checkbox" defaultChecked={task.status === "done"} aria-label={task.title} />
          <span className="title">{task.title}</span>
          <span className="due">{task.due}</span>
          <span className="status" data-status={task.status}>
            {statusLabel[task.status]}
          </span>
        </li>
      ))}
    </ul>
  </div>
);
const rowsWith = (status: (task: (typeof tasks)[number]) => ReactNode) => (
  <div className="panel">
    <ul className="rows">
      {tasks.map((task) => (
        <li key={task.title} className="row" data-done={task.status === "done" || undefined}>
          <Checkbox defaultChecked={task.status === "done"} aria-label={task.title} />
          <span className="title">{task.title}</span>
          <span className="due">{task.due}</span>
          <span>{status(task)}</span>
        </li>
      ))}
    </ul>
  </div>
);
const rowsBadge = rowsWith((task) => (
  <Badge tone={statusTone[task.status]} dot>
    {statusLabel[task.status]}
  </Badge>
));
const rowsPlain = rowsWith((task) => (
  <span className="status" data-status={task.status}>
    {statusLabel[task.status]}
  </span>
));

// Each column gets its own radio name, or the browser would treat both as one group.
const selection = (name: string) => (
  <div className="cmp-sel">
    <Checkbox defaultChecked>リマインダーを受け取る</Checkbox>
    <Switch defaultChecked>メール通知</Switch>
    <RadioGroup name={name} legend="公開範囲" orientation="horizontal" defaultValue="team">
      <RadioGroup.Item value="all">全員</RadioGroup.Item>
      <RadioGroup.Item value="team">チーム内</RadioGroup.Item>
    </RadioGroup>
  </div>
);

const filtersNow = (
  <Popover id="filters-now" title="状態で絞り込む">
    <fieldset className="checks">
      <legend className="visually-hidden">状態</legend>
      <label>
        <input className="check" type="checkbox" defaultChecked />
        未着手<span className="count">1</span>
      </label>
      <label>
        <input className="check" type="checkbox" defaultChecked />
        対応中<span className="count">1</span>
      </label>
      <label>
        <input className="check" type="checkbox" />
        完了<span className="count">1</span>
      </label>
    </fieldset>
    <div className="actions end">
      <Popover.Close popover="filters-now" size="sm" variant="ghost">
        閉じる
      </Popover.Close>
    </div>
  </Popover>
);
const filtersAfter = (
  <Popover id="filters-after" title="状態で絞り込む">
    <fieldset className="checks">
      <legend className="visually-hidden">状態</legend>
      {[
        ["未着手", true],
        ["対応中", true],
        ["完了", false],
      ].map(([label, checked]) => (
        <div key={String(label)} className="cmp-check-row">
          <Checkbox defaultChecked={Boolean(checked)}>{label}</Checkbox>
          <span className="count">1</span>
        </div>
      ))}
    </fieldset>
    <div className="actions end">
      <Popover.Close popover="filters-after" size="sm" variant="ghost">
        閉じる
      </Popover.Close>
    </div>
  </Popover>
);

const dialogNow = (
  <Dialog id="task-now" title="タスクを追加" dismissible="none">
    <form className="form" method="dialog">
      <label className="field">
        <span>タスク名</span>
        <input name="title" required placeholder="例：告知メールを送る" />
      </label>
      <label className="field">
        <span>期限</span>
        <input name="due" type="date" defaultValue="2026-10-30" />
      </label>
      <Dialog.Actions>
        <Dialog.Close dialog="task-now" variant="ghost">
          キャンセル
        </Dialog.Close>
        <Button variant="primary" type="submit">
          追加
        </Button>
      </Dialog.Actions>
    </form>
  </Dialog>
);
const dialogAfter = (
  <Dialog id="task-after" title="タスクを追加" dismissible="none">
    <form className="form" method="dialog">
      <Field id="task-after-title" label="タスク名" required>
        <Input name="title" placeholder="例：告知メールを送る" />
      </Field>
      <Field id="task-after-due" label="期限">
        <Input name="due" type="date" defaultValue="2026-10-30" />
      </Field>
      <Dialog.Actions>
        <Dialog.Close dialog="task-after" variant="ghost">
          キャンセル
        </Dialog.Close>
        <Button variant="primary" type="submit">
          追加
        </Button>
      </Dialog.Actions>
    </form>
  </Dialog>
);

const tileNow = (
  <div className="panel tile">
    <h3>秋のオンライン説明会</h3>
    <p>新サービスの使い方を 30 分で紹介します。</p>
    <div className="actions">
      <Button variant="primary" size="sm">
        申し込む
      </Button>
      <Button size="sm">詳しく見る</Button>
    </div>
  </div>
);
const tileAfter = (
  <Card
    title="秋のオンライン説明会"
    description="新サービスの使い方を 30 分で紹介します。"
    footer={
      <>
        <Button size="sm">詳しく見る</Button>
        <Button variant="primary" size="sm">
          申し込む
        </Button>
      </>
    }
  />
);

const ctaNow = (
  <div className="cta">
    <Button variant="primary" size="lg">
      はじめる
    </Button>
    <a className="text-link" href="#size">
      何が違うのか
    </a>
  </div>
);
const ctaAfter = (
  <div className="cta">
    <Button variant="primary" size="lg">
      はじめる
    </Button>
    <Link variant="standalone" href="#size">
      何が違うのか
    </Link>
  </div>
);

// --- page ----------------------------------------------------------------------------

interface Item {
  title: string;
  where: string;
  changes: ReactNode[];
  /** `selection` pins a column to one checked color whatever the bar says. */
  columns: { label: string; body: ReactNode; selection?: "action" | "accent" }[];
  narrow?: boolean;
}
const items: Item[] = [
  {
    title: "先に決めたいこと：チェックしたときの色",
    where: "ライブラリの Checkbox・Switch・RadioGroup（Showcase だけでなく全体に効く）",
    changes: [
      "デザインシステムの決まりでは、Graphite で色が出るのは「フォーカス・選択・危険」の 3 つだけで、選択には accent（青）を使う。",
      "ところが今の部品は、チェックしたときに action（墨）を使っていて、この決まりと合っていない。Showcase の手作りのチェックボックスは、決まりどおり青になっている。",
      "Lucent は action と accent が同じ青緑なので、どちらにしても変わらない。下の比較は、上のバーの「チェックの色」で切り替えて見られる。",
    ],
    columns: [
      { label: "墨（今の部品）", body: selection("sel-action"), selection: "action" },
      { label: "青（accent・決まりどおり）", body: selection("sel-accent"), selection: "accent" },
    ],
    narrow: true,
  },
  {
    title: "タスクの行：チェックボックスと状態",
    where: "トップのデモパネルの一覧",
    changes: [
      "案 A：状態を Badge にすると、薄い色の地が付く。4 行並ぶと、今より色が多く、重く見える。",
      "案 B：チェックボックスだけを部品にして、状態は今の「点と文字」のまま（Showcase の CSS に残す）。",
    ],
    columns: [
      { label: "今", body: rowsNow },
      { label: "案 A：Checkbox ＋ Badge", body: rowsBadge },
      { label: "案 B：Checkbox ＋ 今の状態表示", body: rowsPlain },
    ],
  },
  {
    title: "フィルタのポップオーバー",
    where: "「フィルタ」と「表示」のポップオーバー",
    changes: [
      "チェックボックスが部品になる。件数は今と同じく右端に置く（Checkbox の外に置くので、読み上げる名前は「未着手」だけになる）。",
      "チェックボックスとラベルの間隔が、10px から部品の 8px になる。",
    ],
    columns: [
      { label: "今", body: filtersNow },
      { label: "置き換えたあと", body: filtersAfter },
    ],
    narrow: true,
  },
  {
    title: "タスクを追加するダイアログ",
    where: "「タスクを追加」で開くフォーム",
    changes: [
      "ラベルが「小さな灰色の文字」から、本文の色で太さ 500 に変わり、入力欄との結びつきが強く見える。",
      "必須の項目に「必須」が付く。入力欄の枠は border-field になる。",
    ],
    columns: [
      { label: "今", body: dialogNow },
      { label: "置き換えたあと", body: dialogAfter },
    ],
    narrow: true,
  },
  {
    title: "説明会のタイル",
    where: "「同じコードのまま、ブランドごと着せ替える」の 2 枚のタイル",
    changes: [
      "Card にすると、ボタンが右寄せになり、主な操作（申し込む）が右端に来る（ダイアログと同じ並び）。",
      "余白と文字の大きさは、ほぼ同じ。",
    ],
    columns: [
      { label: "今", body: tileNow },
      { label: "置き換えたあと", body: tileAfter },
    ],
    narrow: true,
  },
  {
    title: "ヒーローの「何が違うのか」",
    where: "トップの大見出しの下",
    changes: [
      "Link の standalone は、普段は下線を出さず、ホバーで下線が出る。今は常に薄い下線が出ている。",
      "文字の太さと色は同じ。",
    ],
    columns: [
      { label: "今", body: ctaNow },
      { label: "置き換えたあと", body: ctaAfter },
    ],
  },
];

function Column({ label, children, narrow, selection }: { label: string; children: ReactNode; narrow?: boolean; selection?: string }) {
  return (
    <figure className="cmp-col">
      <figcaption>{label}</figcaption>
      <div className="cmp-stage" data-narrow={narrow ? "" : undefined} data-selection={selection}>
        {children}
      </div>
    </figure>
  );
}

const body = renderToStaticMarkup(
  <div className="site cmp">
    <header className="cmp-head wrap">
      <h1>Showcase の部品の置き換え</h1>
      <p className="lede">
        トップページで手作りしている 5 か所を、ライブラリの部品に置き換えた場合の比較です。左が今、右が置き換えたあと。上のバーで、パック・テーマと、チェックしたときの色（墨か青か）を切り替えられます。
      </p>
    </header>
    {items.map((item, i) => (
      <section key={item.title} className="cmp-item wrap" aria-labelledby={`item-${i}`}>
        <h2 id={`item-${i}`}>{item.title}</h2>
        <p className="cmp-where">{item.where}</p>
        <ul className="cmp-changes">
          {item.changes.map((c, j) => (
            <li key={j}>{c}</li>
          ))}
        </ul>
        <div className="cmp-pair">
          {item.columns.map((c) => (
            <Column key={c.label} label={c.label} narrow={item.narrow} selection={c.selection}>
              {c.body}
            </Column>
          ))}
        </div>
      </section>
    ))}
  </div>,
)
  // Show the dialogs open, in place.
  .replace(/<dialog /g, "<dialog open ");

const css = (
  await Promise.all(
    ["packages/react/styles/index.css", "packages/packs/generated/all.css", "apps/playground/src/app.css"].map((p) =>
      readFile(join(root, p), "utf8"),
    ),
  )
).join("\n");

const pageCss = `
/* Comparison page. Overlays are shown open and in place. */
.cmp [data-slot="popover"],
.cmp dialog[open] {
  position: static;
  inset: auto;
  margin: 0;
  opacity: 1;
  scale: 1;
}
.cmp [data-slot="popover"] { display: block; }
.cmp dialog[open] { inline-size: 100%; max-block-size: none; }
.cmp-check-row { display: flex; align-items: center; gap: 10px; }
.cmp-check-row .count { margin-inline-start: auto; }
.cmp-sel { display: grid; justify-items: start; gap: 14px; }
/* Simulates the proposed library change: checked controls use accent (the selection color).
   A column pinned with data-selection keeps its color whatever the bar says. */
[data-selection="accent"] :is([data-slot="checkbox-input"], [data-slot="radio-input"]):is(:checked, :indeterminate),
[data-selection="accent"] [data-slot="switch-input"]:checked {
  background-color: var(--yl-color-accent);
}
.cmp-stage[data-selection="action"] :is([data-slot="checkbox-input"], [data-slot="radio-input"]):is(:checked, :indeterminate),
.cmp-stage[data-selection="action"] [data-slot="switch-input"]:checked {
  background-color: var(--yl-color-action);
}
.review .seg span { padding: 5px 4px 5px 11px; color: #8e8e95; }
.cmp-head { padding-block: 40px 8px; }
.cmp-head h1 { margin: 0; font-size: 30px; font-weight: 700; font-feature-settings: "palt"; }
.cmp-head .lede { margin-block-start: 12px; font-size: 15px; }
.cmp-item { padding-block: 36px; border-block-start: 1px solid var(--yl-color-border); }
.cmp-item:first-of-type { border: 0; }
.cmp-item h2 { margin: 0; font-size: 19px; font-weight: 700; }
.cmp-where { margin: 4px 0 0; font-size: 13px; color: var(--yl-color-text-muted); }
.cmp-changes { margin: 14px 0 20px; padding-inline-start: 1.2em; font-size: 14px; line-height: 1.8; max-inline-size: 46em; }
.cmp-pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(460px, 1fr)); gap: 20px; }
.cmp-col { margin: 0; display: grid; gap: 8px; align-content: start; }
.cmp-col figcaption { font-size: 12.5px; font-weight: 500; color: var(--yl-color-text-muted); }
.cmp-stage {
  position: relative; isolation: isolate; padding: 24px; border-radius: var(--yl-radius-panel);
  background: color-mix(in oklab, var(--yl-color-text) 2.5%, var(--yl-color-bg));
  box-shadow: inset 0 0 0 1px var(--yl-color-border);
}
.cmp-stage[data-narrow] > * { max-inline-size: 380px; }
.cmp-stage .cta { margin: 0; }
:root[data-pack="lucent"] .cmp-stage::before {
  content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit;
  background:
    radial-gradient(60% 80% at 12% 0%, color-mix(in oklab, var(--yl-color-accent) 16%, transparent), transparent 70%),
    radial-gradient(50% 70% at 100% 100%, color-mix(in oklab, var(--yl-color-danger) 9%, transparent), transparent 70%);
}
@media (max-width: 980px) { .cmp-pair { grid-template-columns: minmax(0, 1fr); } }
`;

const bar = `<div class="review" role="toolbar" aria-label="表示の切り替え">
  <b>比較</b>
  <div class="seg" role="group" aria-label="パック">
    <button type="button" data-set-pack="graphite" aria-pressed="true">Graphite</button>
    <button type="button" data-set-pack="lucent" aria-pressed="false">Lucent</button>
  </div>
  <div class="seg" role="group" aria-label="テーマ">
    <button type="button" data-set-theme="light" aria-pressed="true">ライト</button>
    <button type="button" data-set-theme="dark" aria-pressed="false">ダーク</button>
  </div>
  <div class="seg" role="group" aria-label="チェックしたときの色">
    <span>チェックの色</span>
    <button type="button" data-set-selection="action" aria-pressed="true">墨</button>
    <button type="button" data-set-selection="accent" aria-pressed="false">青</button>
  </div>
</div>`;
// The only script on the page: the pack and theme switches of the bar.
const script = `<script>
  const html = document.documentElement;
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-set-pack], [data-set-theme], [data-set-selection]");
    if (!b) return;
    const key = b.dataset.setPack ? "pack" : b.dataset.setTheme ? "theme" : "selection";
    html.dataset[key] = b.dataset.setPack ?? b.dataset.setTheme ?? b.dataset.setSelection;
    for (const x of b.parentElement.querySelectorAll("button")) x.setAttribute("aria-pressed", String(x === b));
  });
</script>`;

const html = `<!doctype html>
<html lang="ja" data-pack="graphite" data-theme="light" data-selection="action">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Showcase の部品の置き換え — 比較</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap">
<link rel="stylesheet" href="./showcase-components.css">
</head>
<body>
${bar}
${body}
${script}
</body>
</html>
`;

await mkdir(out, { recursive: true });
await writeFile(join(out, "showcase-components.css"), `${css}\n${pageCss}`);
await writeFile(join(out, "showcase-components.html"), html);
console.log("wrote apps/playground/public/proposals/showcase-components.html");
