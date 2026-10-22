/**
 * Builds the published Design System (files under dist/design-system/project/)
 * from the repository's own sources, so the system never drifts from the code:
 *
 *   packs/<pack>/tokens.json (DTCG)  → tokens.json (four themes) + bundle.css
 *   contracts/*.contract.ts          → component props tables + index.d.ts
 *   design-system/*.md               → README and further sections
 *   @yourlib/react components        → static previews and bundle.js
 *
 *   tsx scripts/design-system.tsx
 */
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { build } from "esbuild";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as Yl from "@yourlib/react";
import {
  Accordion,
  Badge,
  Button,
  Card,
  Checkbox,
  Dialog,
  Field,
  Input,
  Link,
  Menu,
  Popover,
  RadioGroup,
  Select,
  Separator,
  Skeleton,
  Spinner,
  Switch,
  Tabs,
  Textarea,
  Tooltip,
} from "@yourlib/react";
import { z, type Contract } from "@yourlib/contract";
import { flatten, toCss, type Token } from "@yourlib/tokens";
import { loadContracts } from "../packages/cli/src/build.ts";

const root = join(import.meta.dirname, "..");
const out = join(root, "dist/design-system/project");
const TITLE = "yourlib Design System";
const NAMESPACE = "Yourlib";
const PACKS = ["graphite", "lucent"] as const;
type Pack = (typeof PACKS)[number];
const THEMES = [
  { id: "graphite-light", name: "Graphite ライト", pack: "graphite", dark: false },
  { id: "graphite-dark", name: "Graphite ダーク", pack: "graphite", dark: true },
  { id: "lucent-light", name: "Lucent ライト", pack: "lucent", dark: false },
  { id: "lucent-dark", name: "Lucent ダーク", pack: "lucent", dark: true },
] as const;

async function write(path: string, content: string) {
  const abs = join(out, path);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, content);
}

// --- tokens -------------------------------------------------------------------

type Json = Parameters<typeof flatten>[0];
const packs = Object.fromEntries(
  await Promise.all(
    PACKS.map(async (p) => [p, JSON.parse(await readFile(join(root, `packages/packs/${p}/tokens.json`), "utf8")) as Json]),
  ),
) as Record<Pack, Json>;
const flat = Object.fromEntries(PACKS.map((p) => [p, flatten(packs[p])])) as Record<Pack, Token[]>;
const find = (pack: Pack, path: string) => flat[pack].find((t) => t.path.join(".") === path);

type Srgb = { colorSpace: string; components: number[]; alpha?: number; hex?: string };
function hex(v: unknown): string {
  if (typeof v === "string") {
    const m = /^\{([^}]+)\}$/.exec(v);
    if (!m) throw new Error(`unsupported color ${v}`);
    return `{yl-${m[1].replace(/\./g, "-")}}`;
  }
  const c = v as Srgb;
  if (c.colorSpace !== "srgb" || !c.hex) throw new Error("design system export expects srgb colors with hex");
  if (c.alpha === undefined || c.alpha === 1) return c.hex;
  return c.hex + Math.round(c.alpha * 255).toString(16).padStart(2, "0");
}
function shadowString(layers: unknown): string {
  return (layers as { color: Srgb; offsetX: { value: number }; offsetY: { value: number }; blur: { value: number }; spread: { value: number }; inset?: boolean }[])
    .map((l) => {
      const [r, g, b] = l.color.components.map((x) => Math.round(x * 255));
      const a = l.color.alpha ?? 1;
      return `${l.inset ? "inset " : ""}${l.offsetX.value}px ${l.offsetY.value}px ${l.blur.value}px ${l.spread.value}px rgba(${r}, ${g}, ${b}, ${a})`;
    })
    .join(", ");
}

const colorUsage: Record<string, string> = {
  bg: "ページの背景。",
  surface: "パネル・カード・表の面。Lucent では半透明で、背後の色が透ける。",
  "surface-overlay": "ダイアログとポップオーバーの面。",
  field: "入力欄とチェックボックスの地。",
  text: "本文と見出し。yl-color-bg と yl-color-surface の上で 4.5:1 以上。",
  "text-muted": "補足の文章、表の見出し、説明文。yl-color-bg と yl-color-surface の上で 4.5:1 以上。",
  "text-subtle": "日付・件数・注記。yl-color-bg と yl-color-surface の上で 4.5:1 以上。",
  border: "面の区切りと表の罫線（1px）。",
  "border-strong": "入力欄のホバー時の枠、未着手を示す点。",
  "border-control": "secondary ボタンの枠。Lucent ではガラスの縁の光。",
  secondary: "secondary ボタンの地。",
  "secondary-hover": "secondary ボタンのホバー。",
  "on-secondary": "secondary ボタンの文字。",
  "ghost-hover": "ghost ボタンとナビゲーションのホバー。",
  action: "primary ボタンの地。1 画面に 1 つ。",
  "action-hover": "primary ボタンのホバー。",
  "on-action": "primary ボタンの文字。yl-color-action の上で 4.5:1 以上。",
  danger: "danger ボタンの地と、期限切れなど危険を示す文字。",
  "danger-hover": "danger ボタンのホバー。",
  "on-danger": "danger ボタンの文字。yl-color-danger の上で 4.5:1 以上。",
  accent: "フォーカス・選択・進行中の状態。装飾には使わない。すべての面に対して 3:1 以上。",
  "focus-ring": "フォーカスリング（2px の実線）。yl-color-accent と同じ。",
  ok: "完了を示す点。必ず文字のラベルと一緒に使う。",
  backdrop: "モーダルダイアログの背後を覆う色。",
  link: "文中のリンクの文字。Graphite は文字色のまま下線で示し、Lucent は action の色。",
  "border-field": "入力欄・セレクト・チェックボックス・ラジオの枠。",
  track: "オフのスイッチのトラック。",
  thumb: "オフのスイッチのつまみ（オンのときは yl-color-on-action）。",
  skeleton: "読み込み中の場所取り（Skeleton）の地。",
  tooltip: "ツールチップの地。ページと反転した色。",
  "on-tooltip": "ツールチップの文字。",
};

const colorNames = flat.graphite.filter((t) => t.path[0] === "color").map((t) => t.path.slice(1).join("-"));
const colorTokens = colorNames.map((name) => {
  const value: Record<string, string> = {};
  for (const theme of THEMES) {
    const t = find(theme.pack, `color.${name}`)!;
    value[theme.id] = hex(theme.dark && t.dark !== undefined ? t.dark : t.value);
  }
  return { name: `yl-color-${name}`, value, usage: colorUsage[name] ?? "" };
});
// Identity colours for the cover and brand marks (the packs' own action/accent values).
colorTokens.push(
  { name: "yl-brand-graphite", value: { "graphite-light": "#1c1c1f", "graphite-dark": "#ededef", "lucent-light": "#1c1c1f", "lucent-dark": "#ededef" }, usage: "表紙とブランドの識別に使う墨。Graphite の yl-color-action と同じ。UI では使わない。" },
  { name: "yl-brand-lagoon", value: { "graphite-light": "#0c817d", "graphite-dark": "#2bbdb5", "lucent-light": "#0c817d", "lucent-dark": "#2bbdb5" }, usage: "表紙とブランドの識別に使うラグーン。Lucent の yl-color-action と同じ。UI では使わない。" },
  { name: "yl-brand-signal", value: { "graphite-light": "#2b59ff", "graphite-dark": "#6b8cff", "lucent-light": "#2b59ff", "lucent-dark": "#6b8cff" }, usage: "表紙とブランドの識別に使う信号の青。Graphite の yl-color-accent と同じ。UI では使わない。" },
);

const shadowUsage: Record<string, string> = {
  control: "secondary ボタンの落ち影。",
  action: "primary ボタンの上辺のハイライトと落ち影。",
  danger: "danger ボタンの上辺のハイライトと落ち影。",
  panel: "パネルとカードの縁（Graphite は 1px の輪、Lucent は上辺の光と輪と落ち影）。",
  overlay: "ポップオーバーの縁と落ち影。",
  dialog: "ダイアログの縁と落ち影。",
};
const shadowTokens = Object.keys(shadowUsage).map((name) => {
  const value: Record<string, string> = {};
  for (const theme of THEMES) {
    const t = find(theme.pack, `shadow.${name}`)!;
    // Dark shadows keep the light geometry; only colours change (see @yourlib/tokens).
    const layers = (t.value as unknown[]).map((layer, i) =>
      theme.dark && t.dark ? { ...(layer as object), color: (t.dark as { color: Srgb }[])[i].color } : layer,
    );
    value[theme.id] = shadowString(layers);
  }
  return { name: `yl-shadow-${name}`, value, usage: shadowUsage[name] };
});

const px = (pack: Pack, path: string) => toCss(find(pack, path)!);
const spacingTokens = [1, 2, 3, 4, 5, 6].map((n) => ({
  name: `yl-space-${n}`,
  value: px("graphite", `space.${n}`),
  usage: ["アイコンと文字の間。", "密な行の内側。", "ボタンどうしの間、ラベルと入力欄の間。", "パネルの見出しと本文の間。", "フォームの項目どうしの間。", "ダイアログのボタン列の上、セクションの内側。"][n - 1],
}));
const radiusUsage: Record<string, string> = {
  control: "ボタンと入力欄。",
  panel: "パネルとカード。",
  overlay: "ポップオーバー。",
  dialog: "ダイアログ。",
  checkbox: "チェックボックス。",
  badge: "バッジ（Graphite は小さな角、Lucent は丸）。",
};
const radiusTokens = PACKS.flatMap((pack) =>
  Object.keys(radiusUsage).map((name) => ({
    name: `${pack}-radius-${name}`,
    value: px(pack, `radius.${name}`),
    usage: `${pack === "graphite" ? "Graphite" : "Lucent"}：${radiusUsage[name]}コードでは data-pack="${pack}" の中の --yl-radius-${name}。`,
  })),
);
const squircleTokens = PACKS.flatMap((pack) =>
  ["control", "panel", "overlay", "dialog"].map((name) => ({
    name: `${pack}-radius-squircle-${name}`,
    value: px(pack, `radius.squircle.${name}`),
    usage: `${pack === "graphite" ? "Graphite" : "Lucent"}：corner-shape に対応したブラウザでの${radiusUsage[name].replace("。", "")}の半径。`,
  })),
);
const controlTokens = PACKS.flatMap((pack) =>
  (["sm", "md", "lg"] as const).flatMap((size) => [
    { name: `${pack}-control-${size}`, value: px(pack, `control.${size}`), usage: `${pack === "graphite" ? "Graphite" : "Lucent"}：size="${size}" のボタンの高さ。` },
    { name: `${pack}-control-padding-${size}`, value: px(pack, `control.padding.${size}`), usage: `${pack === "graphite" ? "Graphite" : "Lucent"}：size="${size}" のボタンの左右の余白。` },
  ]),
);
const materialTokens = PACKS.flatMap((pack) => [
  { name: `${pack}-material-overlay`, value: px(pack, "material.overlay"), usage: `${pack === "graphite" ? "Graphite" : "Lucent"}：面とオーバーレイの backdrop-filter。none は不透明。` },
  { name: `${pack}-material-backdrop`, value: px(pack, "material.backdrop"), usage: `${pack === "graphite" ? "Graphite" : "Lucent"}：モーダルの背後の backdrop-filter。` },
]);

const tokensJson = {
  name: TITLE,
  version: 1,
  meta: {
    source: "code",
    repo: "yourlib (local repository)",
    paths: {
      tokens: ["packages/packs/graphite/tokens.json", "packages/packs/lucent/tokens.json"],
      docs: ["design-system/"],
      components: ["contracts/", "packages/react/src/"],
    },
    generator: "scripts/design-system.tsx",
    synced: new Date().toISOString().slice(0, 10),
  },
  color: { themes: THEMES.map(({ id, name }) => ({ id, name })), tokens: colorTokens },
  type: {
    fonts: [],
    families: { sans: '"Noto Sans JP", "Hiragino Sans", "Hiragino Kaku Gothic ProN", system-ui, sans-serif' },
    groups: [
      {
        name: "見出し",
        family: "sans",
        styles: [
          { name: "display", fontSize: "58px", lineHeight: 1.22, fontWeight: 700, sample: "動きはブラウザに、見た目はパックに。", usage: "ページの大見出し。palt と auto-phrase を付ける。" },
          { name: "heading", fontSize: "26px", lineHeight: 1.4, fontWeight: 700, sample: "同じコードのまま、着せ替える", usage: "セクションの見出し。" },
          { name: "title", fontSize: "17px", lineHeight: 1.5, fontWeight: 700, sample: "「秋のキャンペーン」を削除しますか？", usage: "ダイアログとパネルの見出し（Lucent は 18px）。" },
        ],
      },
      {
        name: "本文と UI",
        family: "sans",
        styles: [
          { name: "body", fontSize: "14px", lineHeight: 1.75, fontWeight: 400, letterSpacing: "0.01em", sample: "タスク 5 件とコメントがすべて消えます。この操作は取り消せません。", usage: "本文（Lucent は 14.5px）。palt は付けない。" },
          { name: "control", fontSize: "13.5px", lineHeight: 1, fontWeight: 500, sample: "タスクを追加", usage: "ボタンとラベル（Lucent は 14px・600）。" },
          { name: "small", fontSize: "12.5px", lineHeight: 1.6, fontWeight: 400, sample: "10/24　対応中", usage: "日付・状態・注記。数字は tabular-nums。" },
        ],
      },
    ],
  },
  spacing: { tokens: spacingTokens },
  radius: { tokens: [...radiusTokens, ...squircleTokens] },
  shadow: { tokens: shadowTokens },
  control: { note: "コントロールの高さと左右の余白。パックごとに密度が違う。", tokens: controlTokens },
  material: { note: "面の素材。Graphite は不透明、Lucent はすりガラス。", tokens: materialTokens },
};

// --- bundle.css: map the page's tokens onto the names the components read -------

const inTokensJson = (path: string[]) => ["color", "shadow", "space", "radius", "control", "material"].includes(path[0]);
function packBlock(pack: Pack): string {
  const decls: string[] = [];
  for (const t of flat[pack]) {
    if (inTokensJson(t.path)) continue;
    if (t.path.join(".") === "font.family.ui") {
      decls.push(`  --yl-font-family-ui: var(--font-sans);`);
      continue;
    }
    decls.push(`  --yl-${t.path.join("-")}: ${toCss(t)};`);
  }
  for (const name of Object.keys(radiusUsage)) decls.push(`  --yl-radius-${name}: var(--${pack}-radius-${name});`);
  for (const name of ["control", "panel", "overlay", "dialog"]) decls.push(`  --yl-radius-squircle-${name}: var(--${pack}-radius-squircle-${name});`);
  for (const size of ["sm", "md", "lg"]) {
    decls.push(`  --yl-control-${size}: var(--${pack}-control-${size});`);
    decls.push(`  --yl-control-padding-${size}: var(--${pack}-control-padding-${size});`);
  }
  decls.push(`  --yl-material-overlay: var(--${pack}-material-overlay);`, `  --yl-material-backdrop: var(--${pack}-material-backdrop);`);
  const ids = THEMES.filter((t) => t.pack === pack).map((t) => `[data-theme="${t.id}"]`);
  const selector = pack === "graphite" ? [":root:not([data-theme])", ...ids].join(", ") : ids.join(", ");
  return `${selector} {\n${decls.join("\n")}\n}`;
}
const schemes = THEMES.map((t) => `[data-theme="${t.id}"] { color-scheme: ${t.dark ? "dark" : "light"}; }`).join("\n");
const reduced = `@media (prefers-reduced-motion: reduce) {\n  [data-theme] { --yl-motion-enter-scale: 1; --yl-motion-press-scale: 1; }\n}`;
const componentCss = await readFile(join(root, "packages/react/styles/index.css"), "utf8");
const bundleCss = [
  "/* yourlib — component styles. Colours, shadows, spacing, radii, control sizes and materials come from tokens.json; the rest is the packs' own values. */",
  packBlock("graphite"),
  packBlock("lucent"),
  schemes,
  reduced,
  componentCss,
].join("\n\n");

// --- bundle.js ----------------------------------------------------------------------

// Components are the exports that render (functions starting with a capital letter).
const componentNames = Object.keys(Yl)
  .filter((k) => /^[A-Z]/.test(k) && typeof (Yl as Record<string, unknown>)[k] === "function")
  .sort();
const header = `/* @ds-bundle: ${JSON.stringify({ format: 4, namespace: NAMESPACE, components: componentNames.map((name) => ({ name })) })} */`;
const bundled = await build({
  stdin: {
    // The runtime too, so previews can add menu and tab keyboard behavior: Yourlib.installRuntime().
    contents: `export { ${componentNames.join(", ")}, toast, dismiss } from "@yourlib/react";\nexport { installRuntime } from "@yourlib/core/runtime";`,
    resolveDir: root,
    loader: "ts",
  },
  bundle: true,
  minify: true,
  format: "iife",
  globalName: NAMESPACE,
  write: false,
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  plugins: [
    {
      name: "react-globals",
      setup(b) {
        b.onResolve({ filter: /^react(\/jsx-runtime)?$/ }, (args) => ({ path: args.path, namespace: "react-global" }));
        b.onLoad({ filter: /.*/, namespace: "react-global" }, (args) =>
          args.path === "react"
            ? { contents: "module.exports = window.React;", loader: "js" }
            : {
                contents:
                  "var R = window.React; function jsx(t, p, k) { return R.createElement(t, k === undefined ? p : Object.assign({}, p, { key: k })); } module.exports = { jsx: jsx, jsxs: jsx, Fragment: R.Fragment };",
                loader: "js",
              },
        );
      },
    },
  ],
});
const bundleBody = bundled.outputFiles[0].text.replace(/^var Yourlib\s*=/, "window.Yourlib =");
if (/<\/script|<!--/i.test(bundleBody)) throw new Error("bundle.js contains </script or <!--");
const bundleJs = `${header}\n${bundleBody}`;

// --- contracts → props tables and index.d.ts ----------------------------------------------

const contracts = await loadContracts(join(root, "contracts"));
type Prop = { type?: string; enum?: string[]; default?: unknown; description?: string; "x-ts-type"?: string };
const schemaOf = (props: z.ZodObject) =>
  z.toJSONSchema(props, { unrepresentable: "any", io: "input" }) as unknown as { properties?: Record<string, Prop>; required?: string[] };
const tsType = (p: Prop) => p["x-ts-type"] ?? (p.enum ? p.enum.map((v) => JSON.stringify(v)).join(" | ") : p.type === "integer" ? "number" : (p.type ?? "unknown"));

function propsSection(contract: Contract): string {
  const lines = ["## props（契約から生成）", ""];
  for (const part of contract.parts) {
    const schema = schemaOf(part.props);
    const required = new Set(schema.required ?? []);
    lines.push(`### \`<${part.jsx}>\``, "", `\`<${part.element} data-slot="${part.slot}">\` を描画します。`, "");
    const entries = Object.entries(schema.properties ?? {});
    if (entries.length) {
      lines.push("| prop | 型 | 既定値 | 説明 |", "|---|---|---|---|");
      for (const [key, p] of entries) {
        const def = p.default !== undefined ? `\`${JSON.stringify(p.default)}\`` : required.has(key) ? "必須" : "—";
        lines.push(`| \`${key}\` | \`${tsType(p).replace(/\|/g, "\\|")}\` | ${def} | ${(p.description ?? "").replace(/\|/g, "\\|")} |`);
      }
      lines.push("");
    }
    lines.push(`className で変えてよいもの：${part.overrides.length ? part.overrides.join("、") : "なし（見た目はパックが決める）"}。`, "");
  }
  if (contract.a11y.keyboard) {
    lines.push("## キーボード", "", "| キー | 動作 |", "|---|---|");
    for (const [k, v] of Object.entries(contract.a11y.keyboard)) lines.push(`| ${k} | ${v} |`);
    lines.push("");
  }
  return lines.join("\n");
}

const dts: string[] = ['import type * as React from "react";', ""];
for (const contract of contracts) {
  for (const part of contract.parts) {
    const schema = schemaOf(part.props);
    const required = new Set(schema.required ?? []);
    const name = part.jsx.replace(/\./g, "");
    const native = /^[a-z]+$/.test(part.element) ? part.element : "div";
    dts.push(`/** ${part.description} */`, `export interface ${name}Props extends Omit<React.ComponentProps<"${native}">, ${Object.keys(schema.properties ?? {}).map((k) => JSON.stringify(k)).join(" | ") || "never"}> {`);
    for (const [key, p] of Object.entries(schema.properties ?? {})) {
      if (p.description) dts.push(`  /** ${p.description} */`);
      dts.push(`  ${key}${required.has(key) ? "" : "?"}: ${tsType(p)};`);
    }
    dts.push("}", "");
  }
}
for (const contract of contracts) {
  const [root, ...subparts] = contract.parts;
  const name = (jsx: string) => `${jsx.replace(/\./g, "")}Props`;
  if (subparts.length === 0) {
    dts.push(`export declare function ${root.jsx}(props: ${name(root.jsx)}): React.JSX.Element;`);
  } else {
    dts.push(`export declare const ${root.jsx}: ((props: ${name(root.jsx)}) => React.JSX.Element) & {`);
    for (const part of subparts) dts.push(`  ${part.jsx.split(".")[1]}: (props: ${name(part.jsx)}) => React.JSX.Element;`);
    dts.push("};");
  }
}
dts.push(
  "export interface ToastOptions { description?: string; tone?: \"neutral\" | \"ok\" | \"danger\"; duration?: number; action?: { label: string; onClick: () => void }; dismissLabel?: string }",
  "/** Shows a toast in the page's Toaster; returns its id. */",
  "export declare function toast(message: string, options?: ToastOptions): string;",
  "export declare function dismiss(id: string): void;",
  "/** Adds menu and tab keyboard behavior, tooltip and dialog fallbacks. Returns a cleanup function. */",
  "export declare function installRuntime(): () => void;",
  "",
);

// --- previews ---------------------------------------------------------------------

const previewStyle = `<style>
  body { margin: 0; }
  .ds-root { box-sizing: border-box; min-height: 100vh; padding: 20px 24px; display: grid; gap: 14px; align-content: start; }
  .ds-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
  .ds-note { margin: 0; font-size: 12px; color: var(--yl-color-text-subtle); }
  #ds-confirm-inline[open] { position: static; margin: 0; }
  .ds-stack { display: grid; justify-items: start; gap: 12px; }
  .ds-form { display: grid; gap: 16px; max-width: 340px; }
  .ds-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .ds-p { margin: 0; font-size: 14px; line-height: 1.8; }
  .ds-toolbar { display: flex; align-items: center; gap: 2px; }
  .ds-toasts { display: grid; gap: 8px; max-width: 360px; margin: 0; padding: 0; list-style: none; }
  .ds-skeleton { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 14px; max-width: 340px; font-size: 14px; line-height: 1.8; }
</style>`;
function preview(marker: string, body: ReactElement | string, script = ""): string {
  const markup = typeof body === "string" ? body : renderToStaticMarkup(body);
  return `${marker}
<!doctype html>
<html lang="ja">
<head><meta charset="utf-8"><title>preview</title>${previewStyle}</head>
<body>
<div class="ds-root" data-pack>${markup}</div>${script ? `\n<script>${script}</script>` : ""}
</body>
</html>
`;
}

const buttonPreview = preview(
  `<!-- @dsCard group="操作" height=150 subtitle="primary・secondary・ghost・danger、3 つの大きさ、処理中と無効" -->`,
  <>
    <div className="ds-row">
      <Button variant="primary">保存</Button>
      <Button>下書き</Button>
      <Button variant="ghost">あとで</Button>
      <Button variant="danger">削除する</Button>
    </div>
    <div className="ds-row">
      <Button size="sm">小</Button>
      <Button>中</Button>
      <Button size="lg">大</Button>
      <Button variant="primary" loading>
        送信中
      </Button>
      <Button disabled>選択できません</Button>
    </div>
  </>,
);

const dialogPreview = preview(
  `<!-- @dsCard group="オーバーレイ" height=330 subtitle="ボタンを押すとモーダルで開きます（JavaScript なし）" -->`,
  <>
    <div className="ds-row">
      <Dialog.Trigger dialog="ds-confirm" variant="danger">
        プロジェクトを削除
      </Dialog.Trigger>
      <p className="ds-note">下は開いた状態の見本です。</p>
    </div>
    <Dialog
      id="ds-confirm-inline"
      title="「秋のキャンペーン」を削除しますか？"
      description="タスク 5 件とコメントがすべて消えます。この操作は取り消せません。"
      size="sm"
    >
      <Dialog.Actions>
        <Dialog.Close dialog="ds-confirm-inline" variant="ghost">
          キャンセル
        </Dialog.Close>
        <Dialog.Close dialog="ds-confirm-inline" variant="danger">
          削除する
        </Dialog.Close>
      </Dialog.Actions>
    </Dialog>
    <Dialog
      id="ds-confirm"
      title="「秋のキャンペーン」を削除しますか？"
      description="タスク 5 件とコメントがすべて消えます。この操作は取り消せません。"
      size="sm"
    >
      <Dialog.Actions>
        <Dialog.Close dialog="ds-confirm" variant="ghost" autoFocus>
          キャンセル
        </Dialog.Close>
        <Dialog.Close dialog="ds-confirm" variant="danger">
          削除する
        </Dialog.Close>
      </Dialog.Actions>
    </Dialog>
  </>,
).replace(/<dialog([^>]*id="ds-confirm-inline")/, "<dialog open$1");

const popoverPreview = preview(
  `<!-- @dsCard group="オーバーレイ" height=290 subtitle="トリガーの下に揃えて開き、画面の端では反対側に回ります" -->`,
  <>
    <div className="ds-row">
      <Popover.Trigger popover="ds-filters">フィルタ</Popover.Trigger>
    </div>
    <Popover id="ds-filters" title="状態で絞り込む">
      <div className="ds-stack">
        <Checkbox defaultChecked>未着手</Checkbox>
        <Checkbox defaultChecked>対応中</Checkbox>
        <Checkbox>完了</Checkbox>
        <Popover.Close popover="ds-filters" variant="ghost" size="sm">
          閉じる
        </Popover.Close>
      </div>
    </Popover>
  </>,
  // Show the open state in the card; in an app the trigger does this without script.
  `document.getElementById("ds-filters").showPopover();`,
);


const moreIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <circle cx="3.5" cy="8" r="1.25" />
    <circle cx="8" cy="8" r="1.25" />
    <circle cx="12.5" cy="8" r="1.25" />
  </svg>
);
const copyIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="5.25" y="5.25" width="8" height="8" rx="1.75" />
    <path d="M10.75 2.75h-6a2 2 0 0 0-2 2v6" />
  </svg>
);

/** One static preview per component, keyed by the contract's root part. */
const previews: Record<string, string> = {
  Button: buttonPreview,
  Dialog: dialogPreview,
  Popover: popoverPreview,
  Link: preview(
    `<!-- @dsCard group="操作" height=150 subtitle="文中・単独・外部（新しいタブ）" -->`,
    <>
      <p className="ds-p">
        公開前に<Link href="#">入力欄の書き方</Link>を確認してください。
      </p>
      <div className="ds-row">
        <Link variant="standalone" href="#">
          すべてのタスクを見る
        </Link>
        <Link external href="https://developer.mozilla.org/ja/">
          MDN Web Docs
        </Link>
      </div>
    </>,
  ),
  Menu: preview(
    `<!-- @dsCard group="操作" height=260 subtitle="popover=auto の中の menu。危険な操作は区切って最後に" -->`,
    <>
      <div className="ds-row">
        <Menu.Trigger menu="ds-menu" variant="ghost" aria-label="その他の操作">
          {moreIcon}
        </Menu.Trigger>
      </div>
      <Menu id="ds-menu" label="タスクの操作">
        <Menu.Item>編集する</Menu.Item>
        <Menu.Item>複製する</Menu.Item>
        <Menu.Link href="#">履歴を見る</Menu.Link>
        <Menu.Separator />
        <Menu.Item variant="danger">削除する</Menu.Item>
      </Menu>
    </>,
    `document.getElementById("ds-menu").showPopover();`,
  ),
  Field: preview(
    `<!-- @dsCard group="入力" height=290 subtitle="ラベル・説明・エラーを入力欄に自動で結びつける" -->`,
    <div className="ds-form">
      <Field id="ds-email" label="メールアドレス" description="受付完了のお知らせを送ります。" required>
        <Input type="email" placeholder="hanako@example.jp" />
      </Field>
      <Field id="ds-code" label="招待コード" error="コードが見つかりません。メールに書かれた 8 桁を入れてください。">
        <Input defaultValue="AB12" />
      </Field>
    </div>,
  ),
  Input: preview(
    `<!-- @dsCard group="入力" height=170 subtitle="Button と同じ 3 つの高さ" -->`,
    <div className="ds-form">
      <Field id="ds-in-sm" label="小" hideLabel>
        <Input size="sm" placeholder="小（sm）" />
      </Field>
      <Field id="ds-in-md" label="中" hideLabel>
        <Input placeholder="中（md）" />
      </Field>
      <Field id="ds-in-lg" label="大" hideLabel>
        <Input size="lg" placeholder="大（lg）" />
      </Field>
    </div>,
  ),
  Textarea: preview(
    `<!-- @dsCard group="入力" height=190 subtitle="入力に合わせて伸びる（field-sizing、スクリプトなし）" -->`,
    <div className="ds-form">
      <Field id="ds-notes" label="備考">
        <Textarea defaultValue={"集合は 9:30、本館 3 階のロビーです。\n雨の場合は 2 階の大会議室に変わります。"} />
      </Field>
    </div>,
  ),
  Select: preview(
    `<!-- @dsCard group="入力" height=130 subtitle="ネイティブの select。base-select では一覧もパックの見た目" -->`,
    <div className="ds-form">
      <Field id="ds-assignee" label="担当者">
        <Select placeholder="選んでください">
          <option value="sato">佐藤 美咲</option>
          <option value="suzuki">鈴木 健太</option>
        </Select>
      </Field>
    </div>,
  ),
  Checkbox: preview(
    `<!-- @dsCard group="入力" height=170 subtitle="ラベル全体が押せる。説明は名前ではなく説明として読み上げ" -->`,
    <div className="ds-stack">
      <Checkbox>利用規約に同意する</Checkbox>
      <Checkbox defaultChecked description="締め切りの 1 日前にお知らせします。">
        リマインダーを受け取る
      </Checkbox>
      <Checkbox disabled>管理者だけが変更できます</Checkbox>
    </div>,
  ),
  Switch: preview(
    `<!-- @dsCard group="入力" height=140 subtitle="押した瞬間に反映される設定" -->`,
    <div className="ds-stack">
      <Switch defaultChecked description="新しいコメントが付いたときに届きます。">
        メール通知
      </Switch>
      <Switch>週末も通知する</Switch>
    </div>,
  ),
  RadioGroup: preview(
    `<!-- @dsCard group="入力" height=240 subtitle="fieldset と legend。矢印キーで移動（ブラウザ標準）" -->`,
    <>
      <RadioGroup name="ds-visibility" legend="公開範囲" defaultValue="team">
        <RadioGroup.Item value="all" description="URL を知っている人なら誰でも見られます。">
          全員
        </RadioGroup.Item>
        <RadioGroup.Item value="team">チーム内</RadioGroup.Item>
        <RadioGroup.Item value="me">自分のみ</RadioGroup.Item>
      </RadioGroup>
      <RadioGroup name="ds-priority" legend="優先度" orientation="horizontal" defaultValue="mid">
        <RadioGroup.Item value="high">高</RadioGroup.Item>
        <RadioGroup.Item value="mid">中</RadioGroup.Item>
        <RadioGroup.Item value="low">低</RadioGroup.Item>
      </RadioGroup>
    </>,
  ),
  Card: preview(
    `<!-- @dsCard group="表示" height=220 subtitle="見出しレベルを選べる面。操作は footer に右寄せ" -->`,
    <div className="ds-grid">
      <Card
        title="秋のオープンキャンパス"
        description="10 月 26 日（日）本館 3 階"
        footer={
          <>
            <Button variant="ghost" size="sm">
              あとで
            </Button>
            <Button variant="primary" size="sm">
              参加する
            </Button>
          </>
        }
      >
        <p className="ds-p">模擬授業と在学生の座談会があります。</p>
      </Card>
      <Card title="今週の進み具合" padding="lg">
        <p className="ds-p">12 / 18 件</p>
      </Card>
    </div>,
  ),
  Badge: preview(
    `<!-- @dsCard group="表示" height=90 subtitle="neutral・accent・ok・danger。色だけでなく言葉で" -->`,
    <div className="ds-row">
      <Badge>下書き</Badge>
      <Badge tone="accent">新着</Badge>
      <Badge tone="ok" dot>
        公開中
      </Badge>
      <Badge tone="danger" dot>
        期限切れ
      </Badge>
    </div>,
  ),
  Tabs: preview(
    `<!-- @dsCard group="表示" height=150 subtitle="選ばれたタブはサーバーで決まる。切り替えはランタイム" -->`,
    <Tabs id="ds-tabs" label="プロジェクト" defaultValue="overview">
      <Tabs.List>
        <Tabs.Tab value="overview">概要</Tabs.Tab>
        <Tabs.Tab value="tasks">タスク</Tabs.Tab>
        <Tabs.Tab value="members">メンバー</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="overview">
        <p className="ds-p">秋のキャンペーンの告知から受付までをまとめたプロジェクトです。</p>
      </Tabs.Panel>
      <Tabs.Panel value="tasks">
        <p className="ds-p">未完了のタスクが 4 件あります。</p>
      </Tabs.Panel>
      <Tabs.Panel value="members">
        <p className="ds-p">3 人が参加しています。</p>
      </Tabs.Panel>
    </Tabs>,
  ),
  Accordion: preview(
    `<!-- @dsCard group="表示" height=230 subtitle="details name で 1 つだけ開く（スクリプトなし）" -->`,
    <Accordion name="ds-faq">
      <Accordion.Item title="JavaScript を切っても動きますか？" defaultOpen>
        動きます。開閉はブラウザの details 要素がしています。
      </Accordion.Item>
      <Accordion.Item title="1 つだけ開くようにするには？">Accordion に name を渡します。</Accordion.Item>
      <Accordion.Item title="開くときに動きはありますか？">対応するブラウザでは高さがなめらかに変わります。</Accordion.Item>
    </Accordion>,
  ),
  Separator: preview(
    `<!-- @dsCard group="表示" height=140 subtitle="横は hr、縦はツールバーの区切り" -->`,
    <>
      <p className="ds-p">締め切りが近いタスク</p>
      <Separator decorative />
      <div className="ds-toolbar">
        <Button variant="ghost" size="sm">
          太字
        </Button>
        <Button variant="ghost" size="sm">
          箇条書き
        </Button>
        <Separator orientation="vertical" />
        <Button variant="ghost" size="sm">
          元に戻す
        </Button>
      </div>
    </>,
  ),
  Skeleton: preview(
    `<!-- @dsCard group="表示" height=120 subtitle="読み込み中の場所取り。読み上げからは外れる" -->`,
    <div className="ds-skeleton">
      <Skeleton shape="circle" />
      <Skeleton shape="text" lines={3} />
    </div>,
  ),
  Spinner: preview(
    `<!-- @dsCard group="表示" height=90 subtitle="role=status。label の文言が読み上げられる" -->`,
    <div className="ds-row">
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" label="アップロード中" />
    </div>,
  ),
  Tooltip: preview(
    `<!-- @dsCard group="オーバーレイ" height=140 subtitle="popover=hint と interestfor。名前ではなく説明として読み上げ" -->`,
    <>
      <div className="ds-row" style={{ paddingBlockStart: 44, paddingInlineStart: 120 }}>
        <Tooltip.Trigger tooltip="ds-tip" variant="ghost" aria-label="リンクをコピー">
          {copyIcon}
        </Tooltip.Trigger>
      </div>
      <Tooltip id="ds-tip">共有用の URL をクリップボードに入れます</Tooltip>
    </>,
    `document.getElementById("ds-tip").showPopover();`,
  ),
  Toaster: preview(
    `<!-- @dsCard group="オーバーレイ" height=230 subtitle="toast() で出す通知。モーダルの中では、そのダイアログの中に出る" -->`,
    // The real region is a popover filled by toast(); this is its markup, shown in place.
    `<ol class="ds-toasts">${[
      ["neutral", "下書きを保存しました", ""],
      ["neutral", "タスクを削除しました", "元に戻す"],
      ["danger", "送信できませんでした", "", "通信状態を確かめて、もう一度送ってください。"],
    ]
      .map(
        ([tone, title, action, description]) =>
          `<li data-slot="toast" data-tone="${tone}"><div data-slot="toast-body"><p data-slot="toast-title">${title}</p>${description ? `<p data-slot="toast-description">${description}</p>` : ""}</div>${action ? `<button type="button" data-slot="toast-action button" data-variant="ghost" data-size="sm">${action}</button>` : ""}<button type="button" data-slot="toast-close" aria-label="通知を閉じる"></button></li>`,
      )
      .join("")}</ol>`,
  ),
};

// --- cover ------------------------------------------------------------------------------

const cover = `<!-- @dsCard height=288 -->
<!doctype html>
<html lang="ja">
<head><meta charset="utf-8"><title>cover</title>
<style>
  html, body { margin: 0; height: 100%; }
  body { background: var(--yl-color-bg); font-family: var(--font-sans); }
  .stage { position: relative; width: 960px; height: 288px; overflow: hidden; }
  svg { position: absolute; inset: 0; }
  .ink { fill: var(--yl-brand-graphite); }
  .lagoon { fill: var(--yl-brand-lagoon); }
  .signal { fill: var(--yl-brand-signal); }
  .paper { fill: var(--yl-color-surface); stroke: var(--yl-color-border-strong); stroke-width: 1; }
  .g-panel { rx: var(--graphite-radius-panel); }
  .g-control { rx: var(--graphite-radius-control); }
  .l-panel { rx: var(--lucent-radius-squircle-panel); }
  .l-control { rx: var(--lucent-radius-control); }
  .tile-ink { fill: var(--yl-brand-graphite); opacity: 0.88; }
  .tile-lagoon { fill: var(--yl-brand-lagoon); opacity: 0.88; }
  .text { position: absolute; left: 40px; bottom: 36px; width: 420px; }
  .name { margin: 0; font-size: 100px; line-height: 0.95; font-weight: 700; letter-spacing: -0.02em; color: var(--yl-color-text); }
  .tagline { margin: 28px 0 0; font-size: 14px; color: var(--yl-color-text-muted); }
</style></head>
<body>
<div class="stage">
  <svg width="960" height="288" viewBox="0 0 960 288" aria-hidden="true">
    <!--
      blocks: yl-brand-graphite slab 168x248 (graphite-radius-panel) · yl-brand-lagoon slab 168x248 (lucent-radius-squircle-panel) · yl-brand-signal 48x48 (graphite-radius-control) · yl-color-surface 120x96
      arrangement: two equal slabs side by side bleeding off the top — the same shape under two packs, differing only in corner radius
      pattern row: geometric, modular, dense UI → a 3x4 run of control tiles cut by each pack's control radius (yl-space-6 = 24px pitch rhythm)
      steps and radii: 24px gutters, tiles 32x32; graphite-radius-control 8px vs lucent-radius-control 12px
    -->
    <rect class="ink g-panel" x="512" y="-24" width="168" height="248"/>
    <rect class="lagoon l-panel" x="704" y="-24" width="168" height="248"/>
    <rect class="paper g-panel" x="512" y="232" width="120" height="96"/>
    <rect class="signal g-control" x="896" y="200" width="48" height="48"/>
    <g>
      <rect class="tile-ink g-control" x="656" y="240" width="32" height="32"/>
      <rect class="tile-ink g-control" x="696" y="240" width="32" height="32"/>
      <rect class="tile-lagoon l-control" x="752" y="240" width="32" height="32"/>
      <rect class="tile-lagoon l-control" x="792" y="240" width="32" height="32"/>
      <rect class="tile-lagoon l-control" x="832" y="240" width="32" height="32"/>
    </g>
  </svg>
  <div class="text">
    <p class="name">yourlib</p>
    <p class="tagline">動きはブラウザに、見た目はパックに。</p>
  </div>
</div>
</body>
</html>
`;

// --- write everything -------------------------------------------------------------------

await rm(join(root, "dist/design-system"), { recursive: true, force: true });
await write("tokens.json", JSON.stringify(tokensJson, null, 2) + "\n");
await write("README.md", await readFile(join(root, "design-system/README.md"), "utf8"));
await write("packs.md", await readFile(join(root, "design-system/packs.md"), "utf8"));
await write("typesetting.md", await readFile(join(root, "design-system/typesetting.md"), "utf8"));
await write("components/bundle.css", bundleCss);
await write("components/bundle.js", bundleJs);
await write("components/index.d.ts", dts.join("\n"));
for (const contract of contracts) {
  const comp = contract.parts[0].jsx;
  const guide = await readFile(join(root, `design-system/components/${comp}.md`), "utf8");
  await write(`components/${comp}/README.md`, `${guide.trim()}\n\n${propsSection(contract)}`);
}
for (const contract of contracts) {
  const comp = contract.parts[0].jsx;
  if (!previews[comp]) throw new Error(`no design-system preview for ${comp}`);
  await write(`components/${comp}/preview.html`, previews[comp]);
}
await write("components/Cover/preview.html", cover);

// The creation record is fixed once the system exists; only lastChange moves.
const record = JSON.parse(await readFile(join(root, "design-system/index.json"), "utf8")) as {
  createdOnFiles: { v: number; at: string };
};
const now = new Date().toISOString();
const note = process.env.DS_NOTE ?? "コードから再生成";
await write(
  "design-system.json",
  JSON.stringify(
    {
      v: 3,
      layout: "files",
      createdOnFiles: record.createdOnFiles,
      title: TITLE,
      namespace: NAMESPACE,
      libraries: [
        { name: "react", version: "18" },
        { name: "react-dom", version: "18" },
      ],
      sections: {},
      groups: [],
      assetGroups: {},
      blobs: {},
      docs: { readme: "project/README.md", sections: [] },
      lastChange: { by: "Claude", at: now, via: "Claude Code", note },
    },
    null,
    2,
  ) + "\n",
);
console.log(`design system written to ${out}`);
console.log(`  colors ${colorTokens.length} × ${THEMES.length} themes, shadows ${shadowTokens.length}, bundle.js ${(bundleJs.length / 1024).toFixed(1)} KB`);
