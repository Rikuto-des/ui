/**
 * Proposal: the look of Menubar. Three live prototypes of the same editor's
 * menu bar, side by side, written to apps/playground/public/proposals/menubar.html
 * (served by the dev server at /proposals/menubar.html). The menus are the
 * library's Menu markup; only the bar and its triggers differ between options.
 *   tsx scripts/proposal-menubar.tsx
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const out = join(root, "apps/playground/public/proposals");

const menus = [
  { key: "file", label: "ファイル", items: [["新しいノート", "⌘N"], ["開く…", "⌘O"], ["-"], ["書き出す…", ""], ["印刷…", "⌘P"]] },
  { key: "edit", label: "編集", items: [["元に戻す", "⌘Z"], ["やり直す", "⇧⌘Z"], ["-"], ["切り取り", "⌘X"], ["コピー", "⌘C"], ["貼り付け", "⌘V"]] },
  { key: "view", label: "表示", items: [["目次を表示", ""], ["文字を大きく", "⌘+"], ["文字を小さく", "⌘−"]] },
  { key: "help", label: "ヘルプ", items: [["ショートカット一覧", "?"], ["使い方のガイド", ""]] },
];
const item = ([label, key]: string[]) =>
  label === "-"
    ? `<div role="separator" data-slot="menu-separator"></div>`
    : `<button type="button" role="menuitem" data-slot="menu-item" data-variant="default" tabindex="-1"><span data-slot="menu-item-label">${label}</span>${key ? `<kbd aria-hidden="true">${key}</kbd>` : ""}</button>`;

const bar = (option: string) =>
  `<div class="m-window" data-option="${option}">
  <div role="menubar" aria-label="ノートのメニュー" class="m-bar">${menus
    .map(
      (m, i) =>
        `<button type="button" role="menuitem" class="m-trigger" aria-haspopup="menu" tabindex="${i ? -1 : 0}" popovertarget="${option}-${m.key}" style="anchor-name:--${option}-${m.key}">${m.label}</button>`,
    )
    .join("")}</div>
  ${menus
    .map(
      (m) =>
        `<div id="${option}-${m.key}" popover="auto" role="menu" aria-label="${m.label}" data-slot="menu" data-side="bottom" data-align="start" style="position-anchor:--${option}-${m.key}">${m.items.map(item).join("")}</div>`,
    )
    .join("")}
  <div class="m-doc">
    <h3>週次レポート</h3>
    <p>今週は申し込みページの画像を差し替え、告知メールの文面を確定しました。</p>
    <p>来週は問い合わせフォームの見直しに入ります。</p>
  </div>
</div>`;

const options = [
  {
    key: "a",
    title: "A 囲んだバー",
    good: "どこに置いてもメニューのまとまりだと分かる。Button の ghost と同じ押し心地で、ほかの部品と見た目がそろう。shadcn/ui や Radix と同じ形で、見慣れている。",
    concern: "アプリの上端に置くと、枠の中にさらに枠があるように見えることがある。",
    tech: "バーに面の色・枠線・角丸を付け、項目は小さい ghost ボタンの見た目。開いている項目は押した状態の色になる。",
  },
  {
    key: "b",
    title: "B 上端の帯",
    good: "デスクトップのアプリと同じで、画面の上端に溶け込む。エディターや管理画面のように、ページ全体がアプリになっている場面に合う。",
    concern: "ページの途中に置くと、ただの区切り線に見えて、メニューだと気づきにくい。",
    tech: "バーは下の線だけで、角丸も面の色もない。項目は低めで、開いている項目だけ背景が付く。",
  },
  {
    key: "c",
    title: "C 文字だけ",
    good: "一番軽い。ヘッダーの中にリンクのように並べられる。",
    concern: "押せる場所の大きさが見えず、ナビゲーションのリンクと見分けにくい。キーボードで動いたときの位置も追いにくい。",
    tech: "バーにも項目にも面を付けず、開いている項目は文字の色と下線で示す。",
  },
];

const body = `<div class="site s">
<header class="s-head wrap">
  <h1>Menubar の見た目</h1>
  <p class="lede">同じノートアプリのメニューバーを 3 つの形で作りました。「ファイル」などを押してメニューを開き、開いたまま隣の項目にポインタを動かすと、メニューが切り替わります。中のメニューは今の Menu と同じです。</p>
  <p class="s-reco"><b>おすすめは A です。</b>置く場所を選ばず、ほかの部品と押し心地がそろいます。上端の帯（B）にしたいときは、バーの枠を消す指定で近い見た目にできます。</p>
</header>
<div class="s-grid wrap">
${options
  .map(
    (o) => `<section class="s-col" aria-labelledby="s-${o.key}-title">
  <h2 id="s-${o.key}-title">${o.title}</h2>
  <div class="s-stage">${bar(o.key)}</div>
  <dl class="s-notes">
    <div><dt>良い点</dt><dd>${o.good}</dd></div>
    <div><dt>気になる点</dt><dd>${o.concern}</dd></div>
    <div><dt>作り</dt><dd>${o.tech}</dd></div>
  </dl>
</section>`,
  )
  .join("\n")}
</div>
</div>`;

const pageCss = `
body { margin: 0; background: var(--ur-color-bg); color: var(--ur-color-text); font-family: "Noto Sans JP", sans-serif; }
.wrap { max-inline-size: 1180px; margin-inline: auto; padding-inline: 24px; }
.review { position: sticky; top: 0; z-index: 10; display: flex; flex-wrap: wrap; align-items: center; gap: 16px; padding: 10px 24px; background: var(--ur-color-surface); box-shadow: 0 1px 0 var(--ur-color-border); font-size: 13px; }
.review .seg { display: inline-flex; gap: 4px; }
.review button { font: inherit; padding: 4px 10px; border-radius: 6px; border: 1px solid var(--ur-color-border); background: transparent; color: var(--ur-color-text); cursor: pointer; }
.review button[aria-pressed="true"] { background: var(--ur-color-text); color: var(--ur-color-bg); border-color: transparent; }
.s-head { padding-block: 28px 0; }
.s-head h1 { margin: 0 0 12px; font-size: 28px; }
.lede { margin: 0; max-inline-size: 46em; color: var(--ur-color-text-muted); line-height: 1.8; }
.s-reco { margin: 16px 0 0; max-inline-size: 46em; line-height: 1.8; }
.s-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; padding-block: 24px 80px; }
.s-col h2 { margin: 0 0 12px; font-size: 17px; }
.s-stage { min-block-size: 330px; }
.s-notes { margin: 16px 0 0; display: grid; gap: 10px; font-size: 13.5px; line-height: 1.75; }
.s-notes dt { font-weight: 700; }
.s-notes dd { margin: 0; color: var(--ur-color-text-muted); }

.m-window { border: 1px solid var(--ur-color-border); border-radius: 12px; background: var(--ur-color-surface); overflow: clip; }
.m-doc { padding: 16px 20px 22px; font-size: 14px; line-height: 1.8; }
.m-doc h3 { margin: 0 0 6px; font-size: 16px; }
.m-doc p { margin: 0 0 6px; color: var(--ur-color-text-muted); }
.m-bar { display: flex; gap: 2px; }
.m-trigger { font: inherit; font-size: 14px; color: var(--ur-color-text); background: transparent; border: 0; cursor: default; }
.m-trigger:focus-visible { outline: 2px solid var(--ur-color-focus-ring); outline-offset: -2px; }

/* A: a bordered bar of small ghost buttons. */
[data-option="a"] .m-bar { margin: 12px 12px 0; padding: 3px; inline-size: fit-content; border: 1px solid var(--ur-color-border); border-radius: var(--ur-radius-control); background: var(--ur-color-bg); }
[data-option="a"] .m-trigger { min-block-size: 30px; padding: 0 10px; border-radius: calc(var(--ur-radius-control) - 3px); }
[data-option="a"] .m-trigger:hover, [data-option="a"] .m-trigger[aria-expanded="true"] { background: var(--ur-color-ghost-hover); }

/* B: a strip along the top edge. */
[data-option="b"] .m-bar { padding: 2px 8px; border-block-end: 1px solid var(--ur-color-border); }
[data-option="b"] .m-trigger { min-block-size: 28px; padding: 0 9px; border-radius: 5px; font-size: 13px; }
[data-option="b"] .m-trigger:hover { background: var(--ur-color-ghost-hover); }
[data-option="b"] .m-trigger[aria-expanded="true"] { background: var(--ur-color-ghost-hover); }

/* C: text only. */
[data-option="c"] .m-bar { gap: 18px; padding: 12px 20px 0; }
[data-option="c"] .m-trigger { min-block-size: 28px; padding: 0; color: var(--ur-color-text-muted); }
[data-option="c"] .m-trigger:hover { color: var(--ur-color-text); }
[data-option="c"] .m-trigger[aria-expanded="true"] { color: var(--ur-color-text); text-decoration: underline; text-underline-offset: 6px; text-decoration-thickness: 2px; }
`;

// Only enough behavior to compare the looks: open state, hover switching, ← → between triggers.
const script = `
const sync = () => document.querySelectorAll('.m-trigger').forEach(t => t.setAttribute('aria-expanded', String(document.getElementById(t.getAttribute('popovertarget')).matches(':popover-open'))));
document.addEventListener('toggle', () => requestAnimationFrame(sync), true);
document.addEventListener('pointerover', e => {
  const t = e.target.closest?.('.m-trigger'); if (!t) return;
  const bar = t.closest('.m-bar');
  const open = [...bar.querySelectorAll('.m-trigger')].find(o => document.getElementById(o.getAttribute('popovertarget')).matches(':popover-open'));
  if (open && open !== t) document.getElementById(t.getAttribute('popovertarget')).showPopover({ source: t });
});
document.addEventListener('keydown', e => {
  const t = e.target.closest?.('.m-trigger'); if (!t || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  const all = [...t.closest('.m-bar').querySelectorAll('.m-trigger')];
  const next = all[(all.indexOf(t) + (e.key === 'ArrowRight' ? 1 : -1) + all.length) % all.length];
  all.forEach(o => o.tabIndex = o === next ? 0 : -1); next.focus(); e.preventDefault();
});
document.querySelectorAll('[data-set-pack]').forEach(b => b.addEventListener('click', () => { document.documentElement.dataset.pack = b.dataset.setPack; document.querySelectorAll('[data-set-pack]').forEach(o => o.setAttribute('aria-pressed', String(o === b))); }));
document.querySelectorAll('[data-set-theme]').forEach(b => b.addEventListener('click', () => { document.documentElement.dataset.theme = b.dataset.setTheme; document.querySelectorAll('[data-set-theme]').forEach(o => o.setAttribute('aria-pressed', String(o === b))); }));
`;

const css = (
  await Promise.all(["packages/react/styles/index.css", "packages/packs/generated/all.css"].map((p) => readFile(join(root, p), "utf8")))
).join("\n");

const review = `<div class="review" role="toolbar" aria-label="表示の切り替え">
  <b>Menubar の比較</b>
  <div class="seg" role="group" aria-label="パック">
    <button type="button" data-set-pack="graphite" aria-pressed="true">Graphite</button>
    <button type="button" data-set-pack="lucent" aria-pressed="false">Lucent</button>
  </div>
  <div class="seg" role="group" aria-label="テーマ">
    <button type="button" data-set-theme="light" aria-pressed="true">ライト</button>
    <button type="button" data-set-theme="dark" aria-pressed="false">ダーク</button>
  </div>
</div>`;

const html = `<!doctype html>
<html lang="ja" data-pack="graphite" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Menubar の見た目 — 比較</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap">
<link rel="stylesheet" href="./menubar.css">
</head>
<body>
${review}
${body}
<script src="./menubar.js"></script>
</body>
</html>
`;

await mkdir(out, { recursive: true });
await writeFile(join(out, "menubar.css"), `${css}\n${pageCss}`);
await writeFile(join(out, "menubar.js"), script);
await writeFile(join(out, "menubar.html"), html);
console.log("wrote apps/playground/public/proposals/menubar.html");
