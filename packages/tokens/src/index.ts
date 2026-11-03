/**
 * Minimal DTCG 2025.10 → CSS custom properties converter.
 *
 * Supported $type values: color, dimension, duration, cubicBezier, fontFamily,
 * fontWeight, number, shadow. Tokens without $type are emitted verbatim
 * (used for CSS-only values such as `corner-shape`).
 *
 * Dark-mode values live in `$extensions["dev.urushi.dark"]` and are emitted
 * through `light-dark()`, so a pack switches with `color-scheme` alone.
 * `light-dark()` only accepts colors, so a dark shadow must keep the light
 * shadow's geometry: only its layer colors switch.
 */

export const PREFIX = "ur";
export const DARK_EXTENSION = "dev.urushi.dark";

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export interface Token {
  path: string[];
  type: string | undefined;
  value: Json;
  dark?: Json;
}

export function flatten(tree: { [key: string]: Json }, inheritedType?: string, path: string[] = []): Token[] {
  const groupType = typeof tree.$type === "string" ? tree.$type : inheritedType;
  if ("$value" in tree) {
    const ext = tree.$extensions as { [key: string]: Json } | undefined;
    return [{ path, type: groupType, value: tree.$value, dark: ext?.[DARK_EXTENSION] }];
  }
  const out: Token[] = [];
  for (const [key, child] of Object.entries(tree)) {
    if (key.startsWith("$")) continue;
    if (child && typeof child === "object" && !Array.isArray(child)) {
      out.push(...flatten(child, groupType, [...path, key]));
    }
  }
  return out;
}

export function varName(path: string[]): string {
  return `--${PREFIX}-${path.join("-")}`;
}

/** Resolves `{group.token}` aliases to `var(--ur-group-token)`. */
function alias(value: string): string | undefined {
  const match = /^\{([^}]+)\}$/.exec(value);
  return match ? `var(${varName(match[1].split("."))})` : undefined;
}

function num(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(4)));
}

function color(value: Json): string {
  if (typeof value === "string") return alias(value) ?? value;
  const v = value as { colorSpace: string; components: (number | "none")[]; alpha?: number; hex?: string };
  if (v.colorSpace === "srgb" && v.hex && (v.alpha === undefined || v.alpha === 1)) return v.hex;
  if (v.colorSpace === "srgb" && v.hex) {
    const [r, g, b] = v.components.map((c) => Math.round(Number(c) * 255));
    return `rgb(${r} ${g} ${b} / ${num(v.alpha!)})`;
  }
  const parts = v.components.map((c) => (c === "none" ? "none" : num(c))).join(" ");
  const alpha = v.alpha !== undefined && v.alpha !== 1 ? ` / ${num(v.alpha)}` : "";
  switch (v.colorSpace) {
    case "oklch":
    case "oklab":
    case "lab":
    case "lch":
      return `${v.colorSpace}(${parts}${alpha})`;
    case "srgb":
    case "display-p3":
      return `color(${v.colorSpace} ${parts}${alpha})`;
    default:
      throw new Error(`unsupported colorSpace: ${v.colorSpace}`);
  }
}

function dimension(value: Json): string {
  if (typeof value === "string") return alias(value) ?? value;
  const v = value as { value: number; unit: string };
  return `${num(v.value)}${v.unit}`;
}

export function toCss(token: Token): string {
  const { type, value } = token;
  if (typeof value === "string" && alias(value)) return alias(value)!;
  switch (type) {
    case "color":
      return color(value);
    case "dimension":
    case "duration":
      return dimension(value);
    case "cubicBezier":
      return `cubic-bezier(${(value as number[]).map(num).join(", ")})`;
    case "fontFamily":
      return (Array.isArray(value) ? value : [value])
        .map((f) => (/^[a-z-]+$/.test(String(f)) ? String(f) : `"${f}"`))
        .join(", ");
    case "fontWeight":
    case "number":
      return typeof value === "number" ? num(value) : String(value);
    case "shadow": {
      const layers = Array.isArray(value) ? value : [value];
      return layers
        .map((l) => {
          const s = l as { color: Json; offsetX: Json; offsetY: Json; blur: Json; spread: Json; inset?: boolean };
          return `${s.inset ? "inset " : ""}${dimension(s.offsetX)} ${dimension(s.offsetY)} ${dimension(s.blur)} ${dimension(s.spread)} ${color(s.color)}`;
        })
        .join(", ");
    }
    default:
      return typeof value === "string" ? value : JSON.stringify(value);
  }
}

type ShadowLayer = { color: Json; offsetX: Json; offsetY: Json; blur: Json; spread: Json; inset?: boolean };

/** A shadow whose layer colors are `light-dark(light, dark)`; geometry comes from the light value. */
function themedShadow(light: Json, dark: Json): string {
  const lights = (Array.isArray(light) ? light : [light]) as ShadowLayer[];
  const darks = (Array.isArray(dark) ? dark : [dark]) as ShadowLayer[];
  if (lights.length !== darks.length) throw new Error("dark shadow must have the same number of layers");
  return lights
    .map((l, i) => {
      const c = `light-dark(${color(l.color)}, ${color(darks[i].color)})`;
      return `${l.inset ? "inset " : ""}${dimension(l.offsetX)} ${dimension(l.offsetY)} ${dimension(l.blur)} ${dimension(l.spread)} ${c}`;
    })
    .join(", ");
}

export function declarations(tree: { [key: string]: Json }): string[] {
  return flatten(tree).map((token) => {
    const light = toCss(token);
    if (token.dark === undefined) return `${varName(token.path)}: ${light};`;
    if (token.type === "shadow") return `${varName(token.path)}: ${themedShadow(token.value, token.dark)};`;
    const dark = toCss({ ...token, value: token.dark, dark: undefined });
    return `${varName(token.path)}: light-dark(${light}, ${dark});`;
  });
}

/** Emits a pack as a CSS rule scoped to `[data-pack="<name>"]`. */
export function packCss(name: string, tree: { [key: string]: Json }, opts: { isDefault?: boolean } = {}): string {
  const selector = opts.isDefault ? `:root:not([data-pack]), [data-pack="${name}"]` : `[data-pack="${name}"]`;
  const body = declarations(tree)
    .map((d) => `  ${d}`)
    .join("\n");
  // Reduced motion keeps fades but drops scale/press movement for every pack.
  const reduced = `@media (prefers-reduced-motion: reduce) {\n  ${selector} {\n    --${PREFIX}-motion-enter-scale: 1;\n    --${PREFIX}-motion-press-scale: 1;\n  }\n}\n`;
  return `/* generated from packs/${name}/tokens.json — do not edit */\n${selector} {\n${body}\n}\n${reduced}`;
}
