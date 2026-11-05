import graphite from "../../../packages/packs/graphite/tokens.json";
import lucent from "../../../packages/packs/lucent/tokens.json";

/** A DTCG token tree, as packs/<name>/tokens.json stores it. */
export type Tree = { [key: string]: unknown };
export const bases = { graphite: graphite as Tree, lucent: lucent as Tree };
export type Base = keyof typeof bases;

export type Pair = { light: string; dark: string };
export interface Choices {
  base: Base;
  accent: Pair;
  action: Pair;
  bg: Pair;
  surface: Pair;
  text: Pair;
  /** The control radius in px; the other radii follow it. */
  radius: number;
  density: "compact" | "regular" | "roomy";
  /** The body text size in px; titles and small text follow it. */
  fontSize: number;
  motion: "none" | "fast" | "regular";
  shadow: "none" | "soft" | "regular" | "strong";
}

const DARK = "dev.urushi.dark";
type Color = { colorSpace: "srgb"; components: number[]; hex: string; alpha?: number };
type Node = { $value: unknown; $extensions?: Record<string, unknown> };

const at = (tree: Tree, path: string) => path.split(".").reduce<any>((node, key) => node?.[key], tree) as Node;
const hexOf = (color: unknown) => (color as Color | undefined)?.hex ?? "#000000";

/** The colors and sizes a base pack starts the editor with. */
export function choicesFrom(base: Base): Choices {
  const tree = bases[base];
  const pair = (path: string): Pair => ({ light: hexOf(at(tree, path).$value), dark: hexOf(at(tree, path).$extensions?.[DARK] ?? at(tree, path).$value) });
  return {
    base,
    accent: pair("color.accent"),
    action: pair("color.action"),
    bg: pair("color.bg"),
    surface: pair("color.surface"),
    text: pair("color.text"),
    radius: (at(tree, "radius.control").$value as { value: number }).value,
    density: "regular",
    fontSize: (at(tree, "font.size.body").$value as { value: number }).value,
    motion: "regular",
    shadow: "regular",
  };
}

function rgb(hex: string) {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255);
}
function color(hex: string, alpha?: number): Color {
  return { colorSpace: "srgb", components: rgb(hex).map((c) => Math.round(c * 10000) / 10000), hex, ...(alpha === undefined ? {} : { alpha }) };
}
/** Mixes two colors in sRGB; t=0 is a. */
function mix(a: string, b: string, t: number) {
  const [x, y] = [rgb(a), rgb(b)];
  return "#" + x.map((c, i) => Math.round((c + (y[i] - c) * t) * 255).toString(16).padStart(2, "0")).join("");
}
function luminance(hex: string) {
  const [r, g, b] = rgb(hex).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
/** WCAG 2 contrast ratio of two opaque colors. */
export function contrast(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
/** White or near-black, whichever reads better on the color. */
const onColor = (hex: string) => (contrast(hex, "#ffffff") >= contrast(hex, "#1c1c1f") ? "#ffffff" : "#1c1c1f");

function setColor(tree: Tree, path: string, pair: Pair) {
  const node = at(tree, path);
  const alpha = (node.$value as Color).alpha;
  node.$value = color(pair.light, alpha);
  node.$extensions = { ...node.$extensions, [DARK]: color(pair.dark, (node.$extensions?.[DARK] as Color | undefined)?.alpha) };
}
function setPx(tree: Tree, path: string, value: number) {
  at(tree, path).$value = { value: Math.max(0, Math.round(value * 10) / 10), unit: "px" };
}
function setMs(tree: Tree, path: string, value: number) {
  at(tree, path).$value = { value, unit: "ms" };
}

/** A copy of the base pack with the editor's choices applied. */
export function applyChoices(choices: Choices): Tree {
  const tree = structuredClone(bases[choices.base]);
  const { accent, action, bg, surface, text } = choices;
  setColor(tree, "color.accent", accent);
  setColor(tree, "color.focus-ring", accent);
  setColor(tree, "color.action", action);
  setColor(tree, "color.action-hover", { light: mix(action.light, text.light, 0.18), dark: mix(action.dark, "#ffffff", 0.18) });
  setColor(tree, "color.on-action", { light: onColor(action.light), dark: onColor(action.dark) });
  setColor(tree, "color.bg", bg);
  for (const path of ["color.surface", "color.field", "color.surface-overlay", "color.secondary", "color.thumb"]) setColor(tree, path, surface);
  setColor(tree, "color.secondary-hover", { light: mix(surface.light, text.light, 0.04), dark: mix(surface.dark, text.dark, 0.06) });
  setColor(tree, "color.text", text);
  setColor(tree, "color.text-muted", { light: mix(text.light, surface.light, 0.3), dark: mix(text.dark, surface.dark, 0.3) });
  setColor(tree, "color.text-subtle", { light: mix(text.light, surface.light, 0.36), dark: mix(text.dark, surface.dark, 0.36) });

  const r = choices.radius;
  for (const [path, value] of [
    ["control", r],
    ["panel", r + 4],
    ["overlay", r + 2],
    ["dialog", r + 8],
  ] as const) {
    setPx(tree, `radius.${path}`, value);
    setPx(tree, `radius.squircle.${path}`, value);
  }
  setPx(tree, "radius.checkbox", Math.min(r, Math.max(2, r / 2)));
  setPx(tree, "radius.badge", Math.max(2, r * 0.6));

  const step = { compact: -4, regular: 0, roomy: 4 }[choices.density];
  for (const [size, height] of [
    ["sm", 30],
    ["md", 36],
    ["lg", 44],
  ] as const) {
    setPx(tree, `control.${size}`, height + step);
    setPx(tree, `control.padding.${size}`, { sm: 10, md: 14, lg: 18 }[size] + step / 2);
  }

  const f = choices.fontSize;
  setPx(tree, "font.size.body", f);
  setPx(tree, "font.size.control", f);
  setPx(tree, "font.size.small", f - 1);
  setPx(tree, "font.size.title", f + 2);

  const [fast, overlay] = { none: [0, 0], fast: [80, 110], regular: [120, 160] }[choices.motion];
  setMs(tree, "motion.duration.fast", fast);
  setMs(tree, "motion.duration.overlay", overlay);
  if (choices.motion === "none") {
    at(tree, "motion.enter-scale").$value = 1;
    at(tree, "motion.press-scale").$value = 1;
  }

  const strength = { none: 0, soft: 0.5, regular: 1, strong: 1.8 }[choices.shadow];
  for (const name of ["control", "action", "danger", "panel", "overlay", "dialog"]) {
    const node = at(tree, `shadow.${name}`);
    if (!node) continue;
    const scale = (layers: unknown) =>
      (layers as { color: Color }[]).map((layer) => ({ ...layer, color: { ...layer.color, alpha: Math.round(Math.min(1, (layer.color.alpha ?? 1) * strength) * 1000) / 1000 } }));
    node.$value = scale(node.$value);
    if (node.$extensions?.[DARK]) node.$extensions = { ...node.$extensions, [DARK]: scale(node.$extensions[DARK]) };
  }
  return tree;
}

/** Pairs that must stay readable, with the WCAG minimum for each. */
export function contrastChecks(choices: Choices) {
  const checks: { label: string; ratio: number; min: number }[] = [];
  for (const mode of ["light", "dark"] as const) {
    const name = mode === "light" ? "ライト" : "ダーク";
    const action = choices.action[mode];
    checks.push(
      { label: `${name}：背景の上の文字`, ratio: contrast(choices.text[mode], choices.bg[mode]), min: 4.5 },
      { label: `${name}：面の上の文字`, ratio: contrast(choices.text[mode], choices.surface[mode]), min: 4.5 },
      { label: `${name}：主ボタンの文字`, ratio: contrast(onColor(action), action), min: 4.5 },
      { label: `${name}：フォーカスの輪と背景`, ratio: contrast(choices.accent[mode], choices.bg[mode]), min: 3 },
      { label: `${name}：補足の文字`, ratio: contrast(mix(choices.text[mode], choices.surface[mode], 0.3), choices.surface[mode]), min: 4.5 },
    );
  }
  return checks;
}
