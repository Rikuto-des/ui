/**
 * Proposal: the looks of Item (a list row) and Drawer (a bottom sheet you can
 * swipe down). Live prototypes side by side, written to
 * apps/playground/public/proposals/item-drawer.html (served by the dev server
 * at /proposals/item-drawer.html). Rows use the library's Button and Switch
 * markup; the drawers are the library's Sheet dialog with a different top edge.
 *   tsx scripts/proposal-item.tsx
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const out = join(root, "apps/playground/public/proposals");

const icon = (d: string) =>
  `<svg class="p-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const icons = {
  mail: icon('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/>'),
  bell: icon('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>'),
  key: icon('<circle cx="8" cy="15" r="4"/><path d="m11 12 8-8M16 7l2 2"/>'),
};
const chevron = `<svg class="p-chevron" aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m6 3.5 4.5 4.5L6 12.5"/></svg>`;
const button = (label: string) =>
  `<button type="button" data-slot="button" data-variant="secondary" data-size="sm">${label}</button>`;
const toggle = (label: string, on: boolean) =>
  `<label data-slot="switch"><input type="checkbox" role="switch" data-slot="switch-input" aria-label="${label}"${on ? " checked" : ""}></label>`;

const rows = (option: string) =>
  `<div class="p-list" data-option="${option}" role="list" aria-label="設定">
  <div class="p-item" role="listitem">${icons.mail}<div class="p-text"><span class="p-title">メールアドレス</span><span class="p-desc">hanako@example.jp</span></div>${button("変更")}</div>
  <div class="p-item" role="listitem">${icons.bell}<div class="p-text"><span class="p-title">お知らせメール</span><span class="p-desc">新しいコメントと締め切りの前日に送ります</span></div>${toggle("お知らせメール", true)}</div>
  <a class="p-item" role="listitem" href="#security">${icons.key}<div class="p-text"><span class="p-title">パスワードと二段階認証</span><span class="p-desc">最後の変更は 3 か月前</span></div>${chevron}</a>
</div>`;

const itemOptions = [
  {
    key: "a",
    title: "A 囲んで区切る",
    good: "設定画面で一番よく見る形。まとまりが一目で分かり、行が多くても線で追える。iOS の設定や GitHub の設定と同じ並び。",
    concern: "枠の中に Card を入れるなど、枠が重なると窮屈に見える。",
    tech: "一覧（Item.Group）に枠線と角丸を付け、行の間に線を引く。リンクの行だけホバーで背景が付く。",
  },
  {
    key: "b",
    title: "B 1 行ずつの枠",
    good: "行ごとに独立して見えるので、並べ替えや削除がある一覧に合う。行の間が空くので、指でも押し分けやすい。",
    concern: "行が多いと縦に長くなる。設定のような短い行の連続には重い。",
    tech: "行ごとに枠線と角丸を付け、行の間を 8px 空ける。",
  },
  {
    key: "c",
    title: "C 線だけ",
    good: "一番軽く、ページの本文にそのまま置ける。Card の中に入れても窮屈にならない。",
    concern: "どこまでが一覧か、外側の区切りが見えにくい。",
    tech: "枠は付けず、行の間の線だけを引く。左右の余白はなし。",
  },
];

const drawer = (option: string) => `<div class="d-phone" data-option="${option}">
  <div class="d-screen">
    <div class="d-app">
      <h3>今日の予定</h3>
      <p>10:00 デザインの確認</p><p>13:30 週次の打ち合わせ</p><p>16:00 リリースの準備</p>
      ${`<button type="button" data-slot="button" data-variant="primary" data-size="md" class="d-open" data-drawer="${option}">予定を追加</button>`}
    </div>
    <dialog class="d-sheet" id="drawer-${option}" aria-labelledby="drawer-${option}-title">
      ${option === "c" ? "" : `<div class="d-handle" aria-hidden="true"></div>`}
      <div class="d-head">
        <h2 id="drawer-${option}-title">予定を追加</h2>
        ${option === "c" ? `<button type="button" class="d-close" data-slot="button" data-variant="ghost" data-size="sm" aria-label="閉じる" commandfor="drawer-${option}" command="close">✕</button>` : ""}
      </div>
      <label class="d-field">題名<input data-slot="input" value="デザインの確認"></label>
      <label class="d-field">時刻<input data-slot="input" value="10:00"></label>
      <div class="d-actions">
        <button type="button" data-slot="button" data-variant="secondary" data-size="md" commandfor="drawer-${option}" command="close">やめる</button>
        <button type="button" data-slot="button" data-variant="primary" data-size="md" commandfor="drawer-${option}" command="close">追加する</button>
      </div>
    </dialog>
  </div>
</div>`;

const drawerOptions = [
  {
    key: "a",
    title: "A つまみ付き",
    good: "上のつまみで「下に引ける」と分かる。iOS・Android の標準のシートと同じ見た目で、スマホで見慣れている。",
    concern: "つまみは飾りなので、キーボードやスクリーンリーダーでは閉じるボタンか Esc が別に要る（中の「やめる」がその役）。",
    tech: "Sheet（下から）の上端につまみを付け、上の角を大きめに丸める。下に引くと指について動き、4 分の 1 を超えるか素早く払うと閉じる。",
  },
  {
    key: "b",
    title: "B つまみ＋後ろが下がる",
    good: "後ろの画面が少し縮んで奥に下がり、重なりがはっきりする。vaul（shadcn/ui の Drawer）と同じ演出。",
    concern: "後ろの画面を縮めるには、ページの一番外側に印を付ける必要があり、導入の手間が 1 つ増える。動きが大きいので好みが分かれる。",
    tech: "A に加えて、開いている間は後ろの画面を 96% に縮めて角を丸める（動きを減らす設定では縮めない）。",
  },
  {
    key: "c",
    title: "C つまみなし、閉じるボタン",
    good: "閉じ方が目に見えるので、パソコンでも迷わない。今の Sheet（下から）とほぼ同じで、違いは引いて閉じられることだけ。",
    concern: "引いて閉じられることに気づきにくい。",
    tech: "Sheet（下から）のまま、右上に閉じるボタンを置く。下に引いて閉じる動きは A と同じ。",
  },
];

const section = (heading: string, lede: string, reco: string, opts: typeof itemOptions, stage: (k: string) => string) => `<section class="s-part wrap">
  <h2>${heading}</h2>
  <p class="lede">${lede}</p>
  <p class="s-reco">${reco}</p>
  <div class="s-grid">
${opts
  .map(
    (o) => `<div class="s-col">
  <h3>${o.title}</h3>
  <div class="s-stage">${stage(o.key)}</div>
  <dl class="s-notes">
    <div><dt>良い点</dt><dd>${o.good}</dd></div>
    <div><dt>気になる点</dt><dd>${o.concern}</dd></div>
    <div><dt>作り</dt><dd>${o.tech}</dd></div>
  </dl>
</div>`,
  )
  .join("\n")}
  </div>
</section>`;

const body = `<div class="site s">
<header class="s-head wrap">
  <h1>Item と Drawer の見た目</h1>
  <p class="lede">新しく足す 2 つの部品を、それぞれ 3 つの形で作りました。パックとテーマは上の切り替えで変えられます。</p>
</header>
${section(
  "Item（一覧の 1 行）",
  "アイコン・題・説明・操作を 1 行にまとめる部品です。同じ設定画面の 3 行を、3 つの形で並べました。3 行目はリンクの行で、押すと別の画面へ移る想定です。",
  "<b>おすすめは A です。</b>設定や一覧で一番よく使う形で、行の種類が混ざっても揃って見えます。Card の中に置くときは C の形（枠なし）を指定で選べるようにします。",
  itemOptions,
  rows,
)}
${section(
  "Drawer（下から出して引いて閉じるシート）",
  "「予定を追加」を押すと、下からシートが出ます。シートを下に引くと閉じます（マウスでもドラッグできます）。中身は今の Sheet と同じ dialog です。",
  "<b>おすすめは A です。</b>スマホで見慣れた形で、導入の手間も増えません。B の後ろが下がる演出は、あとから選べる指定として足せます。",
  drawerOptions,
  drawer,
)}
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
.s-reco { margin: 12px 0 0; max-inline-size: 46em; line-height: 1.8; }
.s-part { padding-block: 36px 8px; }
.s-part > h2 { margin: 0 0 10px; font-size: 21px; }
.s-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 28px; padding-block: 24px 32px; }
.s-col h3 { margin: 0 0 12px; font-size: 16px; }
.s-notes { margin: 16px 0 0; display: grid; gap: 10px; font-size: 13.5px; line-height: 1.75; }
.s-notes dt { font-weight: 700; }
.s-notes dd { margin: 0; color: var(--ur-color-text-muted); }

/* Item rows. */
.p-item { display: flex; align-items: center; gap: 12px; min-block-size: 56px; padding: 10px 14px; color: inherit; text-decoration: none; }
.p-icon { inline-size: 20px; block-size: 20px; flex: none; color: var(--ur-color-text-muted); }
.p-text { display: grid; gap: 2px; flex: 1; min-inline-size: 0; }
.p-title { font-size: var(--ur-font-size-control); font-weight: 500; }
.p-desc { font-size: var(--ur-font-size-small); color: var(--ur-color-text-muted); line-height: 1.5; }
.p-chevron { inline-size: 16px; block-size: 16px; flex: none; color: var(--ur-color-text-muted); }
a.p-item:focus-visible { outline: 2px solid var(--ur-color-focus-ring); outline-offset: -2px; }
@media (hover:hover) { a.p-item:hover { background: var(--ur-color-ghost-hover); } }
[data-option="a"].p-list { border: 1px solid var(--ur-color-border); border-radius: var(--ur-radius-panel); background: var(--ur-color-surface); overflow: clip; }
[data-option="a"] .p-item + .p-item { border-block-start: 1px solid var(--ur-color-border); }
[data-option="b"].p-list { display: grid; gap: 8px; }
[data-option="b"] .p-item { border: 1px solid var(--ur-color-border); border-radius: var(--ur-radius-panel); background: var(--ur-color-surface); }
[data-option="c"] .p-item { padding-inline: 0; }
[data-option="c"] .p-item + .p-item { border-block-start: 1px solid var(--ur-color-border); }
[data-option="c"] a.p-item:hover { background: transparent; }
[data-option="c"] a.p-item:hover .p-title { text-decoration: underline; text-underline-offset: 3px; }

/* Drawer: a phone-sized frame; the dialog is positioned inside it, not over the page. */
.d-phone { inline-size: 300px; max-inline-size: 100%; block-size: 520px; margin-inline: auto; border: 1px solid var(--ur-color-border-strong); border-radius: 32px; padding: 8px; background: var(--ur-color-surface); }
.d-screen { position: relative; block-size: 100%; border-radius: 25px; overflow: clip; background: #000; container-type: size; }
.d-app { block-size: 100%; box-sizing: border-box; padding: 26px 20px; background: var(--ur-color-bg); transition: scale .35s var(--ur-motion-ease-out), border-radius .35s; transform-origin: 50% 0; }
.d-app h3 { margin: 0 0 12px; font-size: 18px; }
.d-app p { margin: 0 0 10px; padding: 10px 12px; border-radius: 10px; background: var(--ur-color-surface); border: 1px solid var(--ur-color-border); font-size: 14px; }
.d-open { margin-block-start: 8px; inline-size: 100%; }
[data-option="b"] .d-screen:has(.d-sheet[open]) .d-app { scale: .94; border-radius: 16px; translate: 0 10px; }
.d-sheet { position: absolute; inset: auto 0 0 0; inline-size: 100%; max-inline-size: none; margin: 0; box-sizing: border-box; padding: 10px 20px 22px; border: 0; border-radius: 22px 22px 0 0; background: var(--ur-color-surface-overlay, var(--ur-color-surface)); color: var(--ur-color-text); box-shadow: var(--ur-shadow-dialog); translate: 0 var(--_drag, 0px); touch-action: none; transition: translate .3s var(--ur-motion-ease-out); }
.d-sheet[data-dragging] { transition: none; }
.d-sheet::backdrop { background: transparent; }
.d-screen:has(.d-sheet[open])::after { content: ""; position: absolute; inset: 0; background: rgb(0 0 0 / .32); pointer-events: none; }
.d-sheet[open] { display: block; z-index: 1; }
.d-handle { inline-size: 40px; block-size: 5px; margin: 0 auto 12px; border-radius: 3px; background: var(--ur-color-border-strong); cursor: grab; }
.d-head { display: flex; align-items: center; justify-content: space-between; min-block-size: 32px; margin-block-end: 10px; }
.d-head h2 { margin: 0; font-size: 17px; }
[data-option="c"] .d-sheet { padding-block-start: 16px; border-radius: 14px 14px 0 0; }
.d-field { display: grid; gap: 6px; margin-block-end: 12px; font-size: 13px; font-weight: 500; }
.d-actions { display: flex; gap: 8px; margin-block-start: 6px; }
.d-actions > * { flex: 1; }
`;

// Enough behavior to compare: open each sheet inside its phone, drag it down to close.
const script = `
document.querySelectorAll('.d-open').forEach(b => b.addEventListener('click', () => {
  const d = document.getElementById('drawer-' + b.dataset.drawer);
  d.style.position = 'absolute'; d.show(); d.style.setProperty('--_drag', '100%'); d.dataset.dragging = '';
  requestAnimationFrame(() => { delete d.dataset.dragging; requestAnimationFrame(() => d.style.setProperty('--_drag', '0px')); });
  d.querySelector('input')?.focus({ preventScroll: true });
}));
document.querySelectorAll('.d-sheet').forEach(d => {
  let start = null, last = 0, lastT = 0, v = 0;
  const close = () => { d.style.setProperty('--_drag', '100%'); setTimeout(() => { d.close(); d.style.setProperty('--_drag', '0px'); }, 280); };
  d.addEventListener('command', e => { if (e.command === 'close') { e.preventDefault(); close(); } });
  d.addEventListener('pointerdown', e => { if (e.target.closest('input, button')) return; start = e.clientY; last = e.clientY; lastT = e.timeStamp; d.setPointerCapture(e.pointerId); d.dataset.dragging = ''; });
  d.addEventListener('pointermove', e => { if (start == null) return; v = (e.clientY - last) / Math.max(1, e.timeStamp - lastT); last = e.clientY; lastT = e.timeStamp; d.style.setProperty('--_drag', Math.max(0, e.clientY - start) + 'px'); });
  const end = e => { if (start == null) return; const moved = e.clientY - start; start = null; delete d.dataset.dragging; if (moved > d.offsetHeight / 4 || v > 0.5) close(); else d.style.setProperty('--_drag', '0px'); };
  d.addEventListener('pointerup', end); d.addEventListener('pointercancel', end);
  d.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); close(); } });
});
document.querySelectorAll('[data-set-pack]').forEach(b => b.addEventListener('click', () => { document.documentElement.dataset.pack = b.dataset.setPack; document.querySelectorAll('[data-set-pack]').forEach(o => o.setAttribute('aria-pressed', String(o === b))); }));
document.querySelectorAll('[data-set-theme]').forEach(b => b.addEventListener('click', () => { document.documentElement.dataset.theme = b.dataset.setTheme; document.querySelectorAll('[data-set-theme]').forEach(o => o.setAttribute('aria-pressed', String(o === b))); }));
`;

const css = (
  await Promise.all(["packages/react/styles/index.css", "packages/packs/generated/all.css"].map((p) => readFile(join(root, p), "utf8")))
).join("\n");

const review = `<div class="review" role="toolbar" aria-label="表示の切り替え">
  <b>Item と Drawer の比較</b>
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
<title>Item と Drawer の見た目 — 比較</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap">
<link rel="stylesheet" href="./item-drawer.css">
</head>
<body>
${review}
${body}
<script src="./item-drawer.js"></script>
</body>
</html>
`;

await mkdir(out, { recursive: true });
await writeFile(join(out, "item-drawer.css"), `${css}\n${pageCss}`);
await writeFile(join(out, "item-drawer.js"), script);
await writeFile(join(out, "item-drawer.html"), html);
console.log("wrote apps/playground/public/proposals/item-drawer.html");
