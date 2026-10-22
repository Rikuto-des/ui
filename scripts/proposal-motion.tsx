/**
 * Proposal: motion for state changes. Renders the current motion and the
 * candidates side by side, every control live, into
 * apps/playground/public/proposals/motion.html (served by the dev server at
 * /proposals/motion.html). The library CSS does not change; candidate rules
 * live in this page only, scoped to `[data-proposed]`.
 *   tsx scripts/proposal-motion.tsx
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { build } from "esbuild";
import { Accordion, Button, Checkbox, RadioGroup, Switch, Tabs } from "@yourlib/react";

const root = join(import.meta.dirname, "..");
const out = join(root, "apps/playground/public/proposals");

// --- demos: each renders twice, once per column; `k` keeps ids and names apart -----

const checkboxes = (k: string) => (
  <div className="m-stack">
    <Checkbox id={`${k}-c1`}>利用規約に同意する</Checkbox>
    <Checkbox id={`${k}-c2`} defaultChecked>
      リマインダーを受け取る
    </Checkbox>
    <Checkbox id={`${k}-c3`}>週次のまとめを受け取る</Checkbox>
  </div>
);

const switches = (k: string) => (
  <div className="m-stack">
    <Switch id={`${k}-s1`} defaultChecked>
      メール通知
    </Switch>
    <Switch id={`${k}-s2`}>週末も通知する</Switch>
  </div>
);

const radios = (k: string) => (
  <RadioGroup name={`${k}-priority`} legend="優先度" orientation="horizontal" defaultValue="mid">
    <RadioGroup.Item value="high">高</RadioGroup.Item>
    <RadioGroup.Item value="mid">中</RadioGroup.Item>
    <RadioGroup.Item value="low">低</RadioGroup.Item>
  </RadioGroup>
);

const tabs = (k: string) => (
  <Tabs id={`${k}-tabs`} label="プロジェクト" defaultValue="overview">
    <Tabs.List>
      <Tabs.Tab value="overview">概要</Tabs.Tab>
      <Tabs.Tab value="tasks">タスク一覧</Tabs.Tab>
      <Tabs.Tab value="members">メンバー</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="overview">
      <p className="m-p">告知から申し込み受付までをまとめたプロジェクトです。</p>
    </Tabs.Panel>
    <Tabs.Panel value="tasks">
      <p className="m-p">未完了のタスクが 4 件あります。</p>
    </Tabs.Panel>
    <Tabs.Panel value="members">
      <p className="m-p">3 人が参加しています。</p>
    </Tabs.Panel>
  </Tabs>
);

/** The toast DOM that toast() builds, rendered in place so both columns can be compared. */
const toasts = (k: string) => (
  <div className="m-stack m-toasts" data-toasts={k}>
    <ol data-slot="toast-list">
      {[
        ["下書きを保存しました", "neutral"],
        ["タスクを削除しました", "neutral"],
        ["送信できませんでした", "danger"],
      ].map(([title, tone], i) => (
        <li key={i} id={`${k}-t${i}`} data-slot="toast" data-tone={tone}>
          <div data-slot="toast-body">
            <p data-slot="toast-title">{title}</p>
          </div>
          <button type="button" data-slot="toast-close" aria-label="通知を閉じる" data-dismiss={`${k}-t${i}`} />
        </li>
      ))}
    </ol>
    <Button size="sm" variant="ghost" data-reset-toasts={k}>
      もう一度出す
    </Button>
  </div>
);

const loading = (k: string) => (
  <div className="m-row">
    <Button variant="primary" data-demo-loading={k}>
      保存する
    </Button>
    <span className="m-note">押すと 1.5 秒だけ処理中になります</span>
  </div>
);

const accordion = (k: string) => (
  <Accordion name={`${k}-faq`}>
    <Accordion.Item title="JavaScript を切っても動きますか？">動きます。開閉はブラウザの details 要素がしています。</Accordion.Item>
    <Accordion.Item title="1 つだけ開くようにするには？">
      Accordion に name を渡します。同じ name の項目は、ブラウザが 1 つだけ開いた状態に保ちます。
    </Accordion.Item>
  </Accordion>
);

interface Item {
  title: string;
  now: string[];
  proposal: string[];
  support: string;
  demo: (k: string) => ReactNode;
  wide?: boolean;
}

const items: Item[] = [
  {
    title: "1. Checkbox：印を書くように出す",
    now: ["チェックの印が、少し小さい状態から拡大しながら現れる。"],
    proposal: ["印が左から右へ、書くように現れる（clip-path）。外すときは、速く消える。"],
    support: "Chromium・Safari・Firefox のすべてで動く。",
    demo: checkboxes,
  },
  {
    title: "2. Switch：押している間、つまみが伸びる",
    now: ["つまみが滑って、トラックの色が変わる。"],
    proposal: ["押している間だけ、つまみが横に少し伸びる。指を離すと、伸びたまま滑ってから元の形に戻る。"],
    support: "すべてのブラウザで動く。マウスやタッチで押している間だけ伸びる（キーボードでは伸びない）。",
    demo: switches,
  },
  {
    title: "3. Radio：点が弾んで現れる",
    now: ["中の点が、少し小さい状態から拡大して現れる。"],
    proposal: [
      "点が 0 から現れ、前の選択の点は縮んで消える。",
      "弾み方はパックのイージングに従う。Graphite はすっと止まり、Lucent は少し行き過ぎて戻る。",
    ],
    support: "すべてのブラウザで動く。",
    demo: radios,
  },
  {
    title: "4. Tabs：選ばれたタブの下地が滑る",
    now: ["選ばれたタブの下地と文字の色が、その場で切り替わる。"],
    proposal: [
      "下地が、前のタブから新しいタブへ滑って移る。下地は 1 つの要素で、CSS のアンカー配置で選ばれたタブに重なる。",
      "部品に下地用の要素を 1 つ足す変更になる（このページでは、置き換えたあとの列にだけ足している）。",
    ],
    support: "Chromium と Safari は滑る。Firefox は滑らずに切り替わる（今と同じ見た目）。",
    demo: tabs,
  },
  {
    title: "5. Toast：消えたあと、残りが滑って詰まる",
    now: ["消えるトーストはフェードし、消えた瞬間に残りが詰まる。"],
    proposal: ["消えるトーストが横に抜けながら高さを畳み、残りが滑って詰まる。"],
    support: "高さの畳み込みは Chromium だけ（interpolate-size）。Safari と Firefox は横に抜けて消え、残りが詰まる動きは今と同じ。",
    demo: toasts,
    wide: true,
  },
  {
    title: "6. Button：処理中のスピナーをフェードで出す",
    now: ["処理中になると、スピナーがいきなり現れる。"],
    proposal: ["スピナーが、小さい状態からフェードしながら現れる（@starting-style）。"],
    support: "すべてのブラウザで動く。ボタンの幅は、今と同じく一瞬で変わる。",
    demo: loading,
  },
  {
    title: "おまけ. Accordion：中身をフェードさせる",
    now: ["Chromium は高さが滑らかに開く。Firefox と Safari は、一瞬で開く。"],
    proposal: ["高さの動きに、中身のフェードを足す。Safari では、高さは動かないが、フェードは付く。"],
    support: "フェードは Chromium と Safari。Firefox は今と同じく一瞬で開く。高さは Chromium だけ（今と同じ）。",
    demo: accordion,
  },
];

function Column({ label, proposed, children }: { label: string; proposed?: boolean; children: ReactNode }) {
  return (
    <figure className="m-col">
      <figcaption>{label}</figcaption>
      <div className="m-stage" data-proposed={proposed ? "" : undefined}>
        {children}
      </div>
    </figure>
  );
}

let body = renderToStaticMarkup(
  <div className="site m">
    <header className="m-head wrap">
      <h1>状態が変わるときの動き</h1>
      <p className="lede">
        左が今の動き、右が候補です。どちらも実際に操作できます。上のバーで、パック・テーマの切り替えと、ゆっくり再生ができます。動きはすべて CSS で、速さと動き方はパックのトークンに従います。
      </p>
    </header>
    {items.map((item, i) => (
      <section key={item.title} className="m-item wrap" aria-labelledby={`m-item-${i}`}>
        <h2 id={`m-item-${i}`}>{item.title}</h2>
        <dl className="m-notes">
          <div>
            <dt>今</dt>
            <dd>{item.now.join("")}</dd>
          </div>
          <div>
            <dt>候補</dt>
            <dd>{item.proposal.join("")}</dd>
          </div>
          <div>
            <dt>ブラウザ</dt>
            <dd>{item.support}</dd>
          </div>
        </dl>
        <div className="m-pair" data-wide={item.wide ? "" : undefined}>
          <Column label="今">{item.demo(`now${i}`)}</Column>
          <Column label="候補" proposed>
            {item.demo(`new${i}`)}
          </Column>
        </div>
      </section>
    ))}
  </div>,
);
// The sliding tab background is one extra element in the tab list (proposed column only).
body = body.replace(
  /(<div role="tablist"[^>]*data-slot="tabs-list"[^>]*>)(?=<button[^>]*id="new3-tabs-tab)/,
  '$1<span data-slot="tabs-indicator" aria-hidden="true"></span>',
);
if (!body.includes('data-slot="tabs-indicator"')) throw new Error("tabs indicator was not inserted");

const css = (
  await Promise.all(
    ["packages/react/styles/index.css", "packages/packs/generated/all.css", "apps/playground/src/app.css"].map((p) =>
      readFile(join(root, p), "utf8"),
    ),
  )
).join("\n");

const proposedCss = `
/* ===== Candidates. Each rule is scoped to the proposed column. ===== */

/* 1. Checkbox: the mark is revealed left to right, like a stroke being drawn. */
[data-proposed] [data-slot="checkbox-input"]::before {
  scale: 1;
  opacity: 1;
  clip-path: inset(0 100% 0 0);
  transition: clip-path var(--yl-motion-duration-fast) var(--yl-motion-ease-out);
}
[data-proposed] [data-slot="checkbox-input"]:is(:checked, :indeterminate)::before {
  clip-path: inset(0 0 0 0);
  transition-duration: calc(var(--yl-motion-duration-overlay) * 1.4);
  transition-delay: 40ms;
}

/* 2. Switch: the knob stretches while pressed. */
[data-proposed] [data-slot="switch-input"]::before {
  transition-property: translate, background-color, inline-size;
  transition-duration: var(--yl-motion-duration-overlay);
  transition-timing-function: var(--yl-motion-ease-overlay);
}
[data-proposed] [data-slot="switch"]:active [data-slot="switch-input"]::before {
  inline-size: calc(var(--_knob) + 5px);
}
[data-proposed] [data-slot="switch"]:active [data-slot="switch-input"]:checked::before {
  translate: 7px 0;
}

/* 3. Radio: the dot grows from nothing with the pack's easing (Lucent overshoots). */
[data-proposed] [data-slot="radio-input"]::before {
  scale: 0;
  opacity: 1;
  transition: scale var(--yl-motion-duration-overlay) var(--yl-motion-ease-overlay);
}
[data-proposed] [data-slot="radio-input"]:checked::before {
  scale: 1;
}

/* 4. Tabs: one background, anchored to the selected tab, slides between tabs. */
[data-proposed] [data-slot="tabs-list"] {
  position: relative;
  isolation: isolate;
  anchor-scope: --yl-selected-tab;
}
[data-proposed] [data-slot="tabs-tab"][aria-selected="true"] {
  anchor-name: --yl-selected-tab;
  background-color: transparent;
  box-shadow: none;
}
[data-proposed] [data-slot="tabs-indicator"] {
  position: absolute;
  position-anchor: --yl-selected-tab;
  top: anchor(top);
  right: anchor(right);
  bottom: anchor(bottom);
  left: anchor(left);
  z-index: -1;
  border-radius: calc(var(--yl-radius-control) - 3px);
  background-color: var(--yl-color-field);
  box-shadow: var(--yl-shadow-control);
  transition-property: top, right, bottom, left;
  transition-duration: var(--yl-motion-duration-overlay);
  transition-timing-function: var(--yl-motion-ease-overlay);
}

/* 5. Toast: the leaving toast slides out sideways; where heights can animate
   (interpolate-size), it also folds so the rest slide up. Elsewhere folding
   would snap to 0 at once, so it only slides and fades, as now. */
[data-proposed] [data-slot="toast"] {
  transition-property: opacity, translate;
}
[data-proposed] [data-slot="toast"][data-state="closing"] {
  opacity: 0;
  translate: 24px 0;
}
@supports (interpolate-size: allow-keywords) {
  [data-proposed] [data-slot="toast-list"] {
    interpolate-size: allow-keywords;
  }
  [data-proposed] [data-slot="toast"] {
    overflow: clip;
    overflow-clip-margin: 12px;
    transition-property: opacity, translate, block-size, padding-block, margin-block-start;
  }
  [data-proposed] [data-slot="toast"][data-state="closing"] {
    block-size: 0;
    padding-block: 0;
    margin-block-start: calc(-1 * var(--yl-space-3));
  }
}

/* 6. Button: the spinner fades and grows in. */
[data-proposed] [data-slot="button-spinner"] {
  transition-property: opacity, scale;
  transition-duration: var(--yl-motion-duration-overlay);
  transition-timing-function: var(--yl-motion-ease-overlay);
}
@starting-style {
  [data-proposed] [data-slot="button-spinner"] {
    opacity: 0;
    scale: 0.4;
  }
}

/* Extra. Accordion: the content fades along with the height. */
[data-proposed] [data-slot="accordion-item"]::details-content {
  opacity: 0;
  transition-property: block-size, content-visibility, opacity;
}
[data-proposed] [data-slot="accordion-item"][open]::details-content {
  opacity: 1;
}
/* Firefox recreates the content box on open, so give it a starting value. */
@starting-style {
  [data-proposed] [data-slot="accordion-item"][open]::details-content {
    opacity: 0;
  }
}

/* Reduced motion: no growing, sliding or stretching; fades only. */
@media (prefers-reduced-motion: reduce) {
  [data-proposed] [data-slot="checkbox-input"]::before,
  [data-proposed] [data-slot="radio-input"]::before {
    clip-path: none;
    scale: 1;
    opacity: 0;
    transition: opacity var(--yl-motion-duration-fast);
  }
  [data-proposed] :is([data-slot="checkbox-input"]:is(:checked, :indeterminate), [data-slot="radio-input"]:checked)::before {
    opacity: 1;
  }
  [data-proposed] [data-slot="switch"]:active [data-slot="switch-input"]::before {
    inline-size: var(--_knob);
  }
  [data-proposed] [data-slot="tabs-indicator"],
  [data-proposed] [data-slot="toast"] {
    transition-property: opacity;
  }
}
`;

const pageCss = `
/* Page layout. */
.m-head { padding-block: 40px 8px; }
.m-head h1 { margin: 0; font-size: 30px; font-weight: 700; font-feature-settings: "palt"; }
.m-head .lede { margin-block-start: 12px; font-size: 15px; }
.m-item { padding-block: 36px; border-block-start: 1px solid var(--yl-color-border); }
.m-item:first-of-type { border: 0; }
.m-item h2 { margin: 0; font-size: 19px; font-weight: 700; }
.m-notes { display: grid; gap: 4px; margin: 14px 0 20px; font-size: 14px; line-height: 1.75; max-inline-size: 48em; }
.m-notes div { display: grid; grid-template-columns: 5em 1fr; gap: 12px; }
.m-notes dt { color: var(--yl-color-text-muted); }
.m-notes dd { margin: 0; }
.m-pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.m-col { margin: 0; display: grid; gap: 8px; align-content: start; }
.m-col figcaption { font-size: 12.5px; font-weight: 500; color: var(--yl-color-text-muted); }
.m-stage {
  position: relative; isolation: isolate; padding: 24px; border-radius: var(--yl-radius-panel);
  background: color-mix(in oklab, var(--yl-color-text) 2.5%, var(--yl-color-bg));
  box-shadow: inset 0 0 0 1px var(--yl-color-border);
}
.m-stage[data-proposed] { box-shadow: inset 0 0 0 1px var(--yl-color-border-strong); }
:root[data-pack="lucent"] .m-stage::before {
  content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit;
  background:
    radial-gradient(60% 80% at 12% 0%, color-mix(in oklab, var(--yl-color-accent) 16%, transparent), transparent 70%),
    radial-gradient(50% 70% at 100% 100%, color-mix(in oklab, var(--yl-color-danger) 9%, transparent), transparent 70%);
}
.m-stack { display: grid; justify-items: start; gap: 14px; }
.m-row { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.m-note { font-size: 12.5px; color: var(--yl-color-text-muted); }
.m-p { margin: 0; font-size: 14px; line-height: 1.8; }
.m-toasts { justify-items: stretch; }
.m-toasts [data-slot="toast-list"] { min-block-size: 0; }
.m-toasts > [data-slot~="button"] { justify-self: start; }
@media (max-width: 860px) { .m-pair { grid-template-columns: minmax(0, 1fr); } }

/* Slow motion: every token duration, five times longer. */
:root[data-slow][data-pack="graphite"] { --yl-motion-duration-fast: 600ms; --yl-motion-duration-overlay: 700ms; }
:root[data-slow][data-pack="lucent"] { --yl-motion-duration-fast: 800ms; --yl-motion-duration-overlay: 1300ms; }
.review .seg span { padding: 5px 4px 5px 11px; color: #8e8e95; }
`;

// The page script: the library runtime (tabs) plus the demo controls.
const bundled = await build({
  stdin: {
    contents: `
import { installRuntime } from "@yourlib/core/runtime";
import { dismiss } from "@yourlib/core/toast";
installRuntime();
const html = document.documentElement;
const templates = new Map();
for (const list of document.querySelectorAll("[data-toasts]")) templates.set(list.dataset.toasts, list.querySelector("ol").cloneNode(true));
document.addEventListener("click", (e) => {
  const t = e.target;
  const set = t.closest("[data-set-pack], [data-set-theme], [data-set-slow]");
  if (set) {
    if (set.dataset.setPack) html.dataset.pack = set.dataset.setPack;
    if (set.dataset.setTheme) html.dataset.theme = set.dataset.setTheme;
    if (set.dataset.setSlow) set.dataset.setSlow === "on" ? (html.dataset.slow = "") : delete html.dataset.slow;
    for (const b of set.parentElement.querySelectorAll("button")) b.setAttribute("aria-pressed", String(b === set));
    return;
  }
  const close = t.closest("[data-dismiss]");
  if (close) return dismiss(close.dataset.dismiss);
  const reset = t.closest("[data-reset-toasts]");
  if (reset) {
    const k = reset.dataset.resetToasts;
    document.querySelector('[data-toasts="' + k + '"] ol').replaceWith(templates.get(k).cloneNode(true));
    return;
  }
  const button = t.closest("[data-demo-loading]");
  if (button && !button.hasAttribute("data-loading")) {
    const spinner = document.createElement("span");
    spinner.dataset.slot = "button-spinner";
    spinner.setAttribute("aria-hidden", "true");
    button.prepend(spinner);
    button.dataset.loading = "";
    button.setAttribute("aria-disabled", "true");
    button.setAttribute("aria-busy", "true");
    setTimeout(() => {
      spinner.remove();
      delete button.dataset.loading;
      button.removeAttribute("aria-disabled");
      button.removeAttribute("aria-busy");
    }, 1500);
  }
});
`,
    resolveDir: root,
    loader: "js",
  },
  bundle: true,
  minify: true,
  format: "iife",
  write: false,
});

const bar = `<div class="review" role="toolbar" aria-label="表示の切り替え">
  <b>動きの比較</b>
  <div class="seg" role="group" aria-label="パック">
    <button type="button" data-set-pack="graphite" aria-pressed="true">Graphite</button>
    <button type="button" data-set-pack="lucent" aria-pressed="false">Lucent</button>
  </div>
  <div class="seg" role="group" aria-label="テーマ">
    <button type="button" data-set-theme="light" aria-pressed="true">ライト</button>
    <button type="button" data-set-theme="dark" aria-pressed="false">ダーク</button>
  </div>
  <div class="seg" role="group" aria-label="再生の速さ">
    <span>速さ</span>
    <button type="button" data-set-slow="off" aria-pressed="true">ふつう</button>
    <button type="button" data-set-slow="on" aria-pressed="false">ゆっくり（5 倍）</button>
  </div>
</div>`;

const html = `<!doctype html>
<html lang="ja" data-pack="graphite" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>状態が変わるときの動き — 比較</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap">
<link rel="stylesheet" href="./motion.css">
</head>
<body>
${bar}
${body}
<script src="./motion.js"></script>
</body>
</html>
`;

await mkdir(out, { recursive: true });
await writeFile(join(out, "motion.css"), `${css}\n${pageCss}\n${proposedCss}`);
await writeFile(join(out, "motion.js"), bundled.outputFiles[0].text);
await writeFile(join(out, "motion.html"), html);
console.log("wrote apps/playground/public/proposals/motion.html");
