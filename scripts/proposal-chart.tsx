/**
 * Proposal: the look of Chart (bar and line charts drawn as SVG on the
 * server, with the numbers as a table for screen readers). Three looks of the
 * same two charts, written to apps/playground/public/proposals/chart.html
 * (served by the dev server at /proposals/chart.html).
 *   tsx scripts/proposal-chart.tsx
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const out = join(root, "apps/playground/public/proposals");

const months = ["6月", "7月", "8月", "9月", "10月", "11月"];
const series = [
  { name: "今年", values: [42, 51, 47, 63, 71, 78] },
  { name: "去年", values: [38, 40, 45, 49, 52, 58] },
];
const W = 340, H = 180, PAD = { l: 34, r: 8, t: 10, b: 24 };
const max = 80;
const x = (i: number, n: number) => PAD.l + ((W - PAD.l - PAD.r) / n) * (i + 0.5);
const y = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / max);

function axes(option: string) {
  const ticks = [0, 20, 40, 60, 80];
  return `${ticks.map((t) => `<line class="c-grid" x1="${PAD.l}" x2="${W - PAD.r}" y1="${y(t)}" y2="${y(t)}"/><text class="c-tick" x="${PAD.l - 6}" y="${y(t) + 4}" text-anchor="end">${t}</text>`).join("")}
  ${months.map((m, i) => `<text class="c-tick" x="${x(i, months.length)}" y="${H - 6}" text-anchor="middle">${m}</text>`).join("")}${option === "c" ? "" : ""}`;
}
function bars(option: string) {
  const n = months.length, slot = (W - PAD.l - PAD.r) / n, bw = option === "c" ? slot * 0.3 : slot * 0.32;
  return months
    .map((_, i) =>
      series
        .map((s, k) => {
          const bx = x(i, n) - bw + k * bw + (k ? 1 : -1);
          const top = y(s.values[i]);
          const r = option === "c" ? Math.min(4, bw / 2) : option === "a" ? 1.5 : 0;
          return `<rect class="c-bar c-s${k}" x="${bx}" y="${top}" width="${bw - 2}" height="${y(0) - top}" rx="${r}"/>`;
        })
        .join(""),
    )
    .join("");
}
function lines(option: string) {
  return series
    .map((s, k) => {
      const pts = s.values.map((v, i) => [x(i, months.length), y(v)]);
      const d = pts.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`).join("");
      const area = option === "c" && k === 0 ? `<path class="c-area" d="${d}L${pts.at(-1)![0]},${y(0)}L${pts[0][0]},${y(0)}Z"/>` : "";
      const dots = option !== "a" ? pts.map(([px, py]) => `<circle class="c-dot c-s${k}" cx="${px}" cy="${py}" r="${option === "c" ? 3.5 : 2.5}"/>`).join("") : "";
      return `${area}<path class="c-line c-s${k}" d="${d}"/>${dots}`;
    })
    .join("");
}
const legend = `<div class="c-legend">${series.map((s, k) => `<span><i class="c-key c-s${k}"></i>${s.name}</span>`).join("")}</div>`;
const chart = (option: string, kind: "bar" | "line") => `<figure class="c-chart" data-option="${option}">
  <figcaption>${kind === "bar" ? "月ごとの売上（万円）" : "月ごとの訪問者（千人）"}</figcaption>
  ${legend}
  <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${kind === "bar" ? "月ごとの売上の棒グラフ" : "月ごとの訪問者の折れ線グラフ"}">${axes(option)}${kind === "bar" ? bars(option) : lines(option)}</svg>
</figure>`;

const options = [
  {
    key: "a",
    title: "A 静か（主役 1 色＋灰色）",
    good: "比べる相手（去年）を灰色にして、見てほしい系列だけに色を使う。Graphite の「色は状態にだけ」という考えに合い、どのパックでも落ち着く。色の見分けに頼らない。",
    concern: "系列が 3 つ以上になると、灰色の濃さだけでは見分けにくい（そのときは C のパレットに切り替える指定を足す）。",
    tech: "1 系列目はアクセント、2 系列目以降は文字色の透明度違い。棒の角はわずかに丸め、目盛り線は点線。点は打たない。",
  },
  {
    key: "b",
    title: "B パレット（系列ごとに色）",
    good: "系列ごとにはっきり違う色で、凡例と対応させやすい。系列が多いダッシュボードに向く。shadcn/ui の Chart（Recharts）と同じ考え方。",
    concern: "パックごとに 5 色ほどのパレットを決める必要がある。色覚の違いで見分けにくい組み合わせが出やすい。",
    tech: "パックに chart-1〜5 のトークンを足し、系列の順に当てる。棒の角は丸めない。点を打つ。",
  },
  {
    key: "c",
    title: "C やわらか（太め・塗り）",
    good: "棒が太く角が丸く、折れ線の下を薄く塗る。数字に詳しくない人向けの画面（家計簿、学習記録）で親しみやすい。",
    concern: "塗りと丸みで、細かい差が読みにくくなる。業務の画面には甘く見える。",
    tech: "A の配色に、角丸 4px・太い線・面の塗り（透明度 15%）・大きめの点を足す。",
  },
];

const body = `<div class="site s">
<header class="s-head wrap">
  <h1>Chart の見た目</h1>
  <p class="lede">同じ棒グラフと折れ線グラフを 3 つの形で描きました。どれも SVG をサーバーで描き、読み上げには数字の表を渡します（JavaScript なしで表示できます）。ホバーで値を出す動きは、どの形にも同じように付けます。</p>
  <p class="s-reco"><b>おすすめは A です。</b>Urushi のパックの考え（色は意味のあるところだけ）に合い、どのパックでもそのまま使えます。系列が多いときのために、B のパレットへ切り替える指定を足します。</p>
</header>
<div class="s-grid wrap">
${options
  .map(
    (o) => `<section class="s-col" aria-labelledby="s-${o.key}-title">
  <h2 id="s-${o.key}-title">${o.title}</h2>
  <div class="s-stage">${chart(o.key, "bar")}${chart(o.key, "line")}</div>
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
.s-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 28px; padding-block: 24px 80px; }
.s-col h2 { margin: 0 0 12px; font-size: 17px; }
.s-stage { display: grid; gap: 16px; }
.s-notes { margin: 16px 0 0; display: grid; gap: 10px; font-size: 13.5px; line-height: 1.75; }
.s-notes dt { font-weight: 700; }
.s-notes dd { margin: 0; color: var(--ur-color-text-muted); }

.c-chart { margin: 0; padding: 16px; border: 1px solid var(--ur-color-border); border-radius: var(--ur-radius-panel); background: var(--ur-color-surface); }
.c-chart figcaption { margin-block-end: 6px; font-size: 14px; font-weight: 600; }
.c-chart svg { display: block; inline-size: 100%; block-size: auto; overflow: visible; }
.c-legend { display: flex; gap: 14px; margin-block-end: 8px; font-size: 12px; color: var(--ur-color-text-muted); }
.c-legend span { display: inline-flex; align-items: center; gap: 6px; }
.c-key { display: inline-block; inline-size: 10px; block-size: 10px; border-radius: 2px; }
.c-tick { font-size: 10px; fill: var(--ur-color-text-muted); }
.c-grid { stroke: var(--ur-color-border); stroke-width: 1; }
.c-line { fill: none; stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
.c-dot { stroke: var(--ur-color-surface); stroke-width: 1.5; }

/* A: the first series in the accent, the rest in text-colored greys. */
[data-option="a"] .c-grid { stroke-dasharray: 2 3; }
[data-option="a"] .c-s0 { fill: var(--ur-color-accent); stroke: var(--ur-color-accent); background: var(--ur-color-accent); }
[data-option="a"] .c-s1 { fill: color-mix(in oklab, var(--ur-color-text) 28%, transparent); stroke: color-mix(in oklab, var(--ur-color-text) 35%, transparent); background: color-mix(in oklab, var(--ur-color-text) 28%, transparent); }
[data-option="a"] .c-line { fill: none; }

/* B: a palette per series. */
[data-option="b"] .c-s0 { fill: #2f6fd6; stroke: #2f6fd6; background: #2f6fd6; }
[data-option="b"] .c-s1 { fill: #e08a2c; stroke: #e08a2c; background: #e08a2c; }
[data-option="b"] .c-line { fill: none; }

/* C: A's colors, thicker and filled. */
[data-option="c"] .c-s0 { fill: var(--ur-color-accent); stroke: var(--ur-color-accent); background: var(--ur-color-accent); }
[data-option="c"] .c-s1 { fill: color-mix(in oklab, var(--ur-color-text) 25%, transparent); stroke: color-mix(in oklab, var(--ur-color-text) 32%, transparent); background: color-mix(in oklab, var(--ur-color-text) 25%, transparent); }
[data-option="c"] .c-line { fill: none; stroke-width: 3; }
[data-option="c"] .c-area { fill: color-mix(in oklab, var(--ur-color-accent) 15%, transparent); }
[data-option="c"] .c-grid { stroke-opacity: .6; }
`;

const script = `
document.querySelectorAll('[data-set-pack]').forEach(b => b.addEventListener('click', () => { document.documentElement.dataset.pack = b.dataset.setPack; document.querySelectorAll('[data-set-pack]').forEach(o => o.setAttribute('aria-pressed', String(o === b))); }));
document.querySelectorAll('[data-set-theme]').forEach(b => b.addEventListener('click', () => { document.documentElement.dataset.theme = b.dataset.setTheme; document.querySelectorAll('[data-set-theme]').forEach(o => o.setAttribute('aria-pressed', String(o === b))); }));
`;

const css = (
  await Promise.all(["packages/react/styles/index.css", "packages/packs/generated/all.css"].map((p) => readFile(join(root, p), "utf8")))
).join("\n");

const review = `<div class="review" role="toolbar" aria-label="表示の切り替え">
  <b>Chart の比較</b>
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
<title>Chart の見た目 — 比較</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap">
<link rel="stylesheet" href="./chart.css">
</head>
<body>
${review}
${body}
<script src="./chart.js"></script>
</body>
</html>
`;

await mkdir(out, { recursive: true });
await writeFile(join(out, "chart.css"), `${css}\n${pageCss}`);
await writeFile(join(out, "chart.js"), script);
await writeFile(join(out, "chart.html"), html);
console.log("wrote apps/playground/public/proposals/chart.html");
