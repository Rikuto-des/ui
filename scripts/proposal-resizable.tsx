/**
 * Proposal: the look of Resizable (panes split by a handle you drag, or move
 * with the arrow keys). Three live prototypes of the same mail-like layout,
 * written to apps/playground/public/proposals/resizable.html (served by the
 * dev server at /proposals/resizable.html). Only the handle differs.
 *   tsx scripts/proposal-resizable.tsx
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const out = join(root, "apps/playground/public/proposals");

const mails = [
  ["佐藤 美咲", "告知メールの文面", "最終版を共有します。件名だけもう一度確認させてください。"],
  ["鈴木 健太", "画像の差し替え", "申し込みページの画像を 3 点差し替えました。"],
  ["高橋 陽子", "来週の打ち合わせ", "火曜の 13:30 からでいかがでしょうか。"],
];

const layout = (option: string) => `<div class="r-group" data-option="${option}" style="--_size:40%">
  <div class="r-panel r-list">
    ${mails.map(([from, subject], i) => `<div class="r-mail${i === 0 ? " is-current" : ""}"><b>${from}</b><span>${subject}</span></div>`).join("")}
  </div>
  <div class="r-handle" role="separator" tabindex="0" aria-orientation="vertical" aria-label="一覧の幅" aria-valuemin="20" aria-valuemax="80" aria-valuenow="40"><span class="r-grip" aria-hidden="true"></span></div>
  <div class="r-panel r-body">
    <h3>${mails[0][1]}</h3>
    <p class="r-from">${mails[0][0]}</p>
    <p>${mails[0][2]}</p>
  </div>
</div>`;

const options = [
  {
    key: "a",
    title: "A 線だけ（触ると太る）",
    good: "普段は区切り線にしか見えず、画面が静か。ポインタを乗せるかフォーカスすると線が太くなり、動かせると分かる。VS Code・Figma・Linear と同じ。",
    concern: "動かせることに、乗せるまで気づかない。",
    tech: "1px の線。左右 4px ずつを掴める範囲にし、ホバー・フォーカス・ドラッグ中は 3px のアクセント色の線にする。",
  },
  {
    key: "b",
    title: "B 線＋つまみ",
    good: "線の真ん中に小さなつまみがあり、動かせることが最初から分かる。shadcn/ui の withHandle と同じ形。",
    concern: "つまみが一覧の行と重なると、少しうるさい。",
    tech: "A の線に、縦長の小さなつまみ（枠付き、点 2 列）を重ねる。",
  },
  {
    key: "c",
    title: "C 溝",
    good: "パネルの間に 8px の溝があり、パネルが独立したカードに見える。掴む場所がはっきりしている。",
    concern: "溝の分だけ幅を使う。パネルに枠が要るので、置ける場所を選ぶ。",
    tech: "パネルを角丸の枠で囲み、間の溝を掴む範囲にする。ホバーで溝の中央に線が出る。",
  },
];

const body = `<div class="site s">
<header class="s-head wrap">
  <h1>Resizable の見た目</h1>
  <p class="lede">メールの一覧と本文を、ドラッグで幅を変えられる区切りで分けました。区切りをドラッグするか、Tab でフォーカスして ← → で動かせます（20%〜80%）。3 つの違いは区切りの見た目だけです。</p>
  <p class="s-reco"><b>おすすめは A です。</b>普段は静かで、アプリの画面に溶け込みます。動かせることを強く見せたい場面のために、B のつまみを指定で出せるようにします。</p>
</header>
<div class="s-grid wrap">
${options
  .map(
    (o) => `<section class="s-col" aria-labelledby="s-${o.key}-title">
  <h2 id="s-${o.key}-title">${o.title}</h2>
  <div class="s-stage">${layout(o.key)}</div>
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
.s-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 28px; padding-block: 24px 80px; }
.s-col h2 { margin: 0 0 12px; font-size: 17px; }
.s-notes { margin: 16px 0 0; display: grid; gap: 10px; font-size: 13.5px; line-height: 1.75; }
.s-notes dt { font-weight: 700; }
.s-notes dd { margin: 0; color: var(--ur-color-text-muted); }

.r-group { display: grid; grid-template-columns: minmax(0, var(--_size)) auto minmax(0, 1fr); block-size: 300px; border: 1px solid var(--ur-color-border); border-radius: var(--ur-radius-panel); background: var(--ur-color-surface); overflow: clip; }
.r-panel { min-inline-size: 0; overflow: auto; }
.r-list { display: grid; align-content: start; }
.r-mail { display: grid; gap: 2px; padding: 12px 14px; border-block-end: 1px solid var(--ur-color-border); font-size: 13px; }
.r-mail span { color: var(--ur-color-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.r-mail.is-current { background: var(--ur-color-ghost-hover); }
.r-body { padding: 16px 18px; font-size: 14px; line-height: 1.8; }
.r-body h3 { margin: 0 0 4px; font-size: 16px; }
.r-from { margin: 0 0 10px; font-size: 12.5px; color: var(--ur-color-text-muted); }
.r-body p { margin: 0 0 8px; }
.r-handle { position: relative; inline-size: 1px; background: var(--ur-color-border); cursor: col-resize; touch-action: none; outline: none; }
.r-handle::before { content: ""; position: absolute; inset: 0 -4px; }
.r-handle::after { content: ""; position: absolute; inset-block: 0; inset-inline-start: -1px; inline-size: 3px; background: var(--ur-color-focus-ring); opacity: 0; transition: opacity .12s; }
.r-handle:is(:hover, :focus-visible, [data-dragging])::after { opacity: 1; }
.r-grip { display: none; }
[data-option="b"] .r-grip { display: grid; position: absolute; inset-block-start: 50%; inset-inline-start: 50%; translate: -50% -50%; z-index: 1; inline-size: 12px; block-size: 22px; border: 1px solid var(--ur-color-border-strong); border-radius: 4px; background: var(--ur-color-surface) radial-gradient(circle, var(--ur-color-text-muted) 1px, transparent 1.2px) 1px 1px / 5px 5px; }
[data-option="c"].r-group { gap: 0; border: 0; background: transparent; border-radius: 0; }
[data-option="c"] .r-panel { border: 1px solid var(--ur-color-border); border-radius: var(--ur-radius-panel); background: var(--ur-color-surface); }
[data-option="c"] .r-handle { inline-size: 8px; background: transparent; }
[data-option="c"] .r-handle::before { inset: 0; }
[data-option="c"] .r-handle::after { inset-inline-start: 3px; inline-size: 2px; border-radius: 1px; }
`;

const script = `
document.querySelectorAll('.r-handle').forEach(h => {
  const group = h.closest('.r-group');
  const set = v => { v = Math.min(80, Math.max(20, Math.round(v))); group.style.setProperty('--_size', v + '%'); h.setAttribute('aria-valuenow', v); };
  h.addEventListener('pointerdown', e => {
    h.setPointerCapture(e.pointerId); h.dataset.dragging = '';
    const move = ev => { const r = group.getBoundingClientRect(); set((ev.clientX - r.left) / r.width * 100); };
    const up = () => { delete h.dataset.dragging; h.removeEventListener('pointermove', move); h.removeEventListener('pointerup', up); };
    h.addEventListener('pointermove', move); h.addEventListener('pointerup', up);
  });
  h.addEventListener('keydown', e => {
    const now = +h.getAttribute('aria-valuenow');
    const step = e.shiftKey ? 10 : 2;
    const next = { ArrowLeft: now - step, ArrowRight: now + step, Home: 20, End: 80 }[e.key];
    if (next != null) { e.preventDefault(); set(next); }
  });
});
document.querySelectorAll('[data-set-pack]').forEach(b => b.addEventListener('click', () => { document.documentElement.dataset.pack = b.dataset.setPack; document.querySelectorAll('[data-set-pack]').forEach(o => o.setAttribute('aria-pressed', String(o === b))); }));
document.querySelectorAll('[data-set-theme]').forEach(b => b.addEventListener('click', () => { document.documentElement.dataset.theme = b.dataset.setTheme; document.querySelectorAll('[data-set-theme]').forEach(o => o.setAttribute('aria-pressed', String(o === b))); }));
`;

const css = (
  await Promise.all(["packages/react/styles/index.css", "packages/packs/generated/all.css"].map((p) => readFile(join(root, p), "utf8")))
).join("\n");

const review = `<div class="review" role="toolbar" aria-label="表示の切り替え">
  <b>Resizable の比較</b>
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
<title>Resizable の見た目 — 比較</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap">
<link rel="stylesheet" href="./resizable.css">
</head>
<body>
${review}
${body}
<script src="./resizable.js"></script>
</body>
</html>
`;

await mkdir(out, { recursive: true });
await writeFile(join(out, "resizable.css"), `${css}\n${pageCss}`);
await writeFile(join(out, "resizable.js"), script);
await writeFile(join(out, "resizable.html"), html);
console.log("wrote apps/playground/public/proposals/resizable.html");
