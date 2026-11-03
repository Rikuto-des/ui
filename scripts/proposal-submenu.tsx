/**
 * Proposal: submenus in Menu. Three live prototypes of the same task menu,
 * side by side, written to apps/playground/public/proposals/submenu.html
 * (served by the dev server at /proposals/submenu.html). The library does not
 * change; the prototype markup, rules and keyboard handling live in this page.
 *   tsx scripts/proposal-submenu.tsx
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { build } from "esbuild";

const root = join(import.meta.dirname, "..");
const out = join(root, "apps/playground/public/proposals");

const more = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><circle cx="3.5" cy="8" r="1.25"/><circle cx="8" cy="8" r="1.25"/><circle cx="12.5" cy="8" r="1.25"/></svg>`;
const subs = [
  { key: "assign", label: "担当者を変える", items: ["佐藤 美咲", "鈴木 健太", "高橋 陽菜", "担当者なし"] },
  { key: "priority", label: "優先度", items: ["高", "中", "低"] },
];
const item = (label: string, attrs = "") =>
  `<button type="button" role="menuitem" data-slot="menu-item" data-variant="default" tabindex="-1"${attrs}><span data-slot="menu-item-label">${label}</span></button>`;
const chev = `<span class="s-chev" aria-hidden="true"></span>`;
const subTrigger = (label: string, attrs: string) =>
  `<button type="button" role="menuitem" data-slot="menu-item" data-variant="default" tabindex="-1" aria-haspopup="menu" aria-expanded="false"${attrs}><span data-slot="menu-item-label">${label}</span>${chev}</button>`;
const head = `${item("編集する")}${item("複製する")}`;
const tail = `<div role="separator" data-slot="menu-separator"></div>${item("削除する").replace('data-variant="default"', 'data-variant="danger"')}`;
const trigger = (k: string) =>
  `<div class="s-row"><span class="s-task">告知メールの文面を確定する</span><button type="button" data-slot="menu-trigger button" data-variant="ghost" data-size="sm" aria-haspopup="menu" aria-label="タスクの操作" popovertarget="${k}-menu" style="anchor-name:--${k}-menu">${more}</button></div>`;
const menu = (k: string, body: string, extra = "") =>
  `<div id="${k}-menu" popover="auto" role="menu" aria-label="タスクの操作" data-slot="menu" data-side="bottom" data-align="end" data-top style="position-anchor:--${k}-menu"${extra}>${body}</div>`;

// A: the submenu is its own popover beside the item (nested in the popover stack through its invoker).
const optionA =
  trigger("a") +
  menu(
    "a",
    head +
      subs.map((s) => subTrigger(s.label, ` data-flyout-for="a-${s.key}" popovertarget="a-${s.key}" style="anchor-name:--a-${s.key}"`)).join("") +
      tail,
  ) +
  subs
    .map(
      (s) =>
        `<div id="a-${s.key}" popover="auto" role="menu" aria-label="${s.label}" data-slot="menu" data-flyout style="position-anchor:--a-${s.key}">${s.items.map((l) => item(l)).join("")}</div>`,
    )
    .join("");

// B: the submenu opens in place, inside the same menu, as an indented group.
const optionB =
  trigger("b") +
  menu(
    "b",
    head +
      subs
        .map(
          (s) =>
            subTrigger(s.label, ` aria-controls="b-${s.key}" data-inline-for="b-${s.key}"`) +
            `<div id="b-${s.key}" role="group" aria-label="${s.label}" data-inline hidden>${s.items.map((l) => item(l)).join("")}</div>`,
        )
        .join("") +
      tail,
  );

// C: the submenu replaces the menu's content, with a back row at the top.
const optionC =
  trigger("c") +
  menu(
    "c",
    `<div data-page="main" data-current>${head}${subs.map((s) => subTrigger(s.label, ` data-page-for="${s.key}"`)).join("")}${tail}</div>` +
      subs
        .map(
          (s) =>
            `<div data-page="${s.key}" role="group" aria-label="${s.label}"><button type="button" role="menuitem" data-slot="menu-item" data-variant="default" tabindex="-1" data-back class="s-back"><span class="s-chev" aria-hidden="true"></span><span data-slot="menu-item-label">${s.label}</span></button><div role="separator" data-slot="menu-separator"></div>${s.items.map((l) => item(l)).join("")}</div>`,
        )
        .join(""),
    ' data-pages',
  );

const options = [
  {
    key: "a",
    title: "A 横に出す",
    good: "デスクトップの OS やアプリと同じ形で、迷わない。開いたまま親の項目も見えるので、いまどこを選んでいるかが分かる。NavigationMenu の入れ子と同じ動きにそろう。",
    concern: "横に場所が要る。画面の端では反対側に回るが、スマートフォンの幅では収まらない。",
    tech: "子のメニューも popover。親の項目を起点にアンカー配置で横に置き、場所がなければ反対側へ回る。クリックでは JavaScript なしで開く。ホバーと矢印キー（→ で開く、← で戻る）はランタイム。",
    body: optionA,
  },
  {
    key: "b",
    title: "B その場で開く",
    good: "場所を取らず、狭い画面やタッチでも同じように使える。開いた中身がそのまま下に並ぶので、位置がずれない。",
    concern: "メニューが縦に伸びる。項目が多い子メニューだと、親の項目が画面の外に押し出される。デスクトップでは見慣れない形。",
    tech: "同じメニューの中に、字下げしたグループとして開く。開閉と矢印キーにはランタイムが要る。",
    body: optionB,
  },
  {
    key: "c",
    title: "C 入れ替える",
    good: "メニューの大きさが変わらない。スマートフォンのアプリでよく見る形で、階層が深くても破綻しない。",
    concern: "親の項目が見えなくなる。戻る操作が 1 回増える。デスクトップでは遠回りに感じやすい。",
    tech: "同じメニューの中身を子の一覧に差し替え、先頭に「戻る」を置く。差し替えと矢印キーにはランタイムが要る。",
    body: optionC,
  },
];

const body = `<div class="site s">
<header class="s-head wrap">
  <h1>Menu のサブメニュー</h1>
  <p class="lede">同じメニューを 3 つの形で作りました。「…」を押して「担当者を変える」か「優先度」を開いてください。キーボードでは ↓ ↑ で移動、→ で開き、← で戻ります。</p>
  <p class="s-reco"><b>おすすめは A です。</b>デスクトップでは横に出し、狭い画面やタッチ操作では自動で B に切り替えます。NavigationMenu の入れ子と同じ方針です。</p>
</header>
<div class="s-grid wrap">
${options
  .map(
    (o) => `<section class="s-col" data-option="${o.key}" aria-labelledby="s-${o.key}-title">
  <h2 id="s-${o.key}-title">${o.title}</h2>
  <div class="s-stage">${o.body}</div>
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
body { margin: 0; background: var(--ur-color-bg); color: var(--ur-color-text); font-family: var(--font-sans, "Noto Sans JP", sans-serif); }
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
.s-stage { min-block-size: 420px; padding: 20px; box-sizing: border-box; border-radius: var(--ur-radius-panel); background: color-mix(in oklab, var(--ur-color-text) 2.5%, var(--ur-color-bg)); box-shadow: inset 0 0 0 1px var(--ur-color-border); }
.s-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; border-radius: var(--ur-radius-control); background: var(--ur-color-surface); box-shadow: var(--ur-shadow-panel); font-size: 14px; }
.s-notes { margin: 16px 0 0; display: grid; gap: 10px; font-size: 13.5px; line-height: 1.75; }
.s-notes div { display: grid; grid-template-columns: 6em 1fr; gap: 8px; }
.s-notes dt { color: var(--ur-color-text-muted); }
.s-notes dd { margin: 0; }
`;

const proposedCss = `
/* ===== Prototype rules (this page only) ===== */
.s-chev { flex: none; inline-size: 14px; block-size: 14px; margin-inline-start: auto; background-color: var(--ur-color-text-muted); mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 14'%3E%3Cpath d='m5.5 3.5 3.5 3.5-3.5 3.5' fill='none' stroke='black' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat; }
:dir(rtl) .s-chev { scale: -1 1; }
[data-slot~="menu-item"][aria-haspopup="menu"][aria-expanded="true"] { background-color: var(--ur-color-ghost-hover); }

/* A: beside the item, its first row level with the item; flips to the other side when there is no room. */
[data-slot="menu"][data-flyout] { position-area: inline-end span-block-end; margin: 0 0 0 2px; translate: 0 calc(-1 * var(--ur-space-2)); position-try-fallbacks: flip-inline; min-inline-size: 160px; }

/* B: an indented group under the item; the arrow points down and turns when open. */
[data-option="b"] .s-chev { rotate: 90deg; transition: rotate var(--ur-motion-duration-fast) var(--ur-motion-ease-out); }
[data-option="b"] [aria-expanded="true"] .s-chev { rotate: -90deg; }
[data-inline] { display: grid; margin-inline-start: calc(var(--ur-space-3) + 2px); padding-inline-start: var(--ur-space-2); border-inline-start: var(--ur-border-width) solid var(--ur-color-border); opacity: 1; transition: opacity var(--ur-motion-duration-overlay) var(--ur-motion-ease-out); }
[data-inline][hidden] { display: none; }
@starting-style { [data-inline] { opacity: 0; } }

/* C: one page at a time; the new page slides in from the side it came from. */
[data-pages] { min-inline-size: 200px; overflow: hidden; }
[data-page]:not([data-current]) { display: none; }
[data-page][data-current] { translate: 0; opacity: 1; transition: translate var(--ur-motion-duration-overlay) var(--ur-motion-ease-overlay), opacity var(--ur-motion-duration-fast) linear; }
@starting-style { [data-page][data-current] { translate: 16px 0; opacity: 0; } [data-page="main"][data-current] { translate: -16px 0; } }
.s-back { font-weight: 600; }
.s-back .s-chev { margin-inline-start: 0; scale: -1 1; }
@media (prefers-reduced-motion: reduce) { [data-page][data-current] { transition-property: opacity; } @starting-style { [data-page][data-current], [data-page="main"][data-current] { translate: 0; } } }
`;

const script = `
const html = document.documentElement;
const visible = (el) => el.offsetParent !== null || el.getClientRects().length > 0;
const itemsOf = (scope) => [...scope.querySelectorAll('[data-slot~="menu-item"]')].filter((el) => visible(el) && !el.closest('[data-slot="menu"]:not(:popover-open)') && el.closest('[data-slot="menu"]') === scope.closest('[data-slot="menu"]'));
const focusIn = (scope, index) => { const list = itemsOf(scope); const el = list[(index + list.length) % list.length]; el?.focus(); };
const topMenu = (el) => { let m = el.closest('[data-slot="menu"]'); while (m && !m.hasAttribute('data-top')) { const owner = document.querySelector('[data-flyout-for="' + m.id + '"]'); m = owner?.closest('[data-slot="menu"]'); } return m; };
const closeAll = (el) => topMenu(el)?.hidePopover();

// A: flyouts.
const openFlyout = (trigger, focus) => {
  const sub = document.getElementById(trigger.dataset.flyoutFor);
  for (const other of trigger.closest('[data-slot="menu"]').querySelectorAll('[data-flyout-for]')) if (other !== trigger) closeFlyout(other);
  if (!sub.matches(':popover-open')) sub.showPopover({ source: trigger });
  trigger.setAttribute('aria-expanded', 'true');
  if (focus) focusIn(sub, 0);
};
const closeFlyout = (trigger, focus) => {
  const sub = document.getElementById(trigger.dataset.flyoutFor);
  if (sub.matches(':popover-open')) sub.hidePopover();
  trigger.setAttribute('aria-expanded', 'false');
  if (focus) trigger.focus();
};
document.addEventListener('toggle', (e) => {
  const m = e.target;
  if (!(m instanceof HTMLElement) || m.dataset.slot !== 'menu') return;
  if (m.hasAttribute('data-flyout') && e.newState === 'closed') document.querySelector('[data-flyout-for="' + m.id + '"]')?.setAttribute('aria-expanded', 'false');
  if (!m.hasAttribute('data-top')) return;
  if (e.newState === 'open') { focusIn(m.querySelector('[data-page][data-current]') ?? m, 0); return; }
  // Closing resets B and C so the next open starts from the top level.
  for (const t of m.querySelectorAll('[data-inline-for]')) setInline(t, false);
  showPage(m, 'main');
}, true);
let hoverTimer;
document.addEventListener('pointerover', (e) => {
  if (e.pointerType !== 'mouse') return;
  const it = e.target.closest?.('[data-slot~="menu-item"]');
  if (!it) return;
  const menu = it.closest('[data-slot="menu"]');
  clearTimeout(hoverTimer);
  hoverTimer = setTimeout(() => {
    if (it.dataset.flyoutFor) openFlyout(it, false);
    else for (const t of menu.querySelectorAll('[data-flyout-for]')) closeFlyout(t);
  }, 120);
});

// B: in place.
const setInline = (t, open) => { t.setAttribute('aria-expanded', String(open)); document.getElementById(t.dataset.inlineFor).hidden = !open; };

// C: pages.
const showPage = (menu, key, focusIndex) => {
  if (!menu?.hasAttribute('data-pages')) return;
  for (const p of menu.querySelectorAll('[data-page]')) p.toggleAttribute('data-current', p.dataset.page === key);
  if (focusIndex !== undefined) focusIn(menu.querySelector('[data-page="' + key + '"]'), focusIndex);
};

document.addEventListener('click', (e) => {
  const set = e.target.closest('[data-set-pack], [data-set-theme]');
  if (set) {
    if (set.dataset.setPack) html.dataset.pack = set.dataset.setPack;
    if (set.dataset.setTheme) html.dataset.theme = set.dataset.setTheme;
    for (const b of set.parentElement.querySelectorAll('button')) b.setAttribute('aria-pressed', String(b === set));
    return;
  }
  const it = e.target.closest('[data-slot~="menu-item"]');
  if (!it) return;
  if (it.dataset.flyoutFor) { e.preventDefault(); return openFlyout(it, e.detail === 0); }
  if (it.dataset.inlineFor) return setInline(it, it.getAttribute('aria-expanded') !== 'true');
  if (it.dataset.pageFor) return showPage(it.closest('[data-slot="menu"]'), it.dataset.pageFor, 1);
  if (it.hasAttribute('data-back')) { const key = it.closest('[data-page]').dataset.page; const m = it.closest('[data-slot="menu"]'); showPage(m, 'main'); return m.querySelector('[data-page-for="' + key + '"]').focus(); }
  closeAll(it);
});

document.addEventListener('keydown', (e) => {
  const it = e.target.closest?.('[data-slot~="menu-item"]');
  if (!it) return;
  const menu = it.closest('[data-slot="menu"]');
  const scope = it.closest('[data-page]') ?? menu;
  const list = itemsOf(scope);
  const i = list.indexOf(it);
  const parentFlyout = menu.hasAttribute('data-flyout') ? document.querySelector('[data-flyout-for="' + menu.id + '"]') : null;
  const inlineGroup = it.closest('[data-inline]');
  const page = it.closest('[data-page]');
  switch (e.key) {
    case 'ArrowDown': e.preventDefault(); return focusIn(scope, i + 1);
    case 'ArrowUp': e.preventDefault(); return focusIn(scope, i - 1);
    case 'Home': e.preventDefault(); return focusIn(scope, 0);
    case 'End': e.preventDefault(); return focusIn(scope, list.length - 1);
    case 'ArrowRight':
      e.preventDefault();
      if (it.dataset.flyoutFor) return openFlyout(it, true);
      if (it.dataset.inlineFor) { setInline(it, true); return focusIn(scope, i + 1); }
      if (it.dataset.pageFor) return showPage(menu, it.dataset.pageFor, 1);
      return;
    case 'ArrowLeft':
      e.preventDefault();
      if (parentFlyout) return closeFlyout(parentFlyout, true);
      if (inlineGroup) { const t = document.querySelector('[data-inline-for="' + inlineGroup.id + '"]'); setInline(t, false); return t.focus(); }
      if (it.dataset.inlineFor) return setInline(it, false);
      if (page && page.dataset.page !== 'main') { showPage(menu, 'main'); return menu.querySelector('[data-page-for="' + page.dataset.page + '"]').focus(); }
      return;
    case 'Escape':
      // A: the browser closes only the topmost popover; put focus back on its item.
      if (parentFlyout) { e.preventDefault(); return closeFlyout(parentFlyout, true); }
      return;
    case 'Tab': return closeAll(it);
  }
});
`;

const css = (
  await Promise.all(
    ["packages/react/styles/index.css", "packages/packs/generated/all.css"].map((p) => readFile(join(root, p), "utf8")),
  )
).join("\n");
const bundled = await build({ stdin: { contents: script, loader: "js" }, bundle: false, minify: true, format: "iife", write: false });

const bar = `<div class="review" role="toolbar" aria-label="表示の切り替え">
  <b>サブメニューの比較</b>
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
<title>Menu のサブメニュー — 比較</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap">
<link rel="stylesheet" href="./submenu.css">
</head>
<body>
${bar}
${body}
<script src="./submenu.js"></script>
</body>
</html>
`;

await mkdir(out, { recursive: true });
await writeFile(join(out, "submenu.css"), `${css}\n${pageCss}\n${proposedCss}`);
await writeFile(join(out, "submenu.js"), bundled.outputFiles[0].text);
await writeFile(join(out, "submenu.html"), html);
console.log("wrote apps/playground/public/proposals/submenu.html");
