import type { ESLint, Linter, Rule } from "eslint";
import data from "./contracts.generated.json" with { type: "json" };
import library from "./library.generated.json" with { type: "json" };

/**
 * @yourlib/eslint-plugin — enforces the component contracts.
 *
 * Every message says what is wrong and what to write instead, so a coding
 * agent can fix its own output from the lint report alone.
 */

interface Part {
  contract: string;
  slot: string;
  element: string;
  overrides: string[];
  enums: Record<string, string[]>;
  idrefs: Record<string, string | null>;
  provides: string | null;
  required: string[];
  props: string[];
  /** HTML attributes the part takes besides `Library.attributes`, read from its type. */
  attributes: string[];
  /** Names in `Library.attributes` the part does not take. */
  omits: string[];
}

interface Library {
  /** Every custom property the packs define (`--yl-color-text`, …). */
  tokens: string[];
  /** Module specifier → the names it exports, values and types. */
  modules: Record<string, string[]>;
  /** The attributes every HTML element takes in React's types (`className`, `onClick`, `key`, …). */
  attributes: string[];
}

const PARTS = data as Record<string, Part>;
const LIBRARY = library as Library;
const TOKENS = new Set(LIBRARY.tokens);
const CATEGORY_LABEL: Record<string, string> = {
  margin: "外側の余白（m-*）",
  width: "幅（w-*）",
  height: "高さ（h-*）",
  layout: "並びの中の配置（self-*・col-span-* など）",
  position: "位置（relative・absolute・inset-* など）",
};

// ----------------------------------------------------------------------------
// JSX helpers (typed loosely: the AST comes from espree or typescript-eslint)

// eslint-disable-next-line -- the AST shape differs between parsers
type Node = any;

function jsxName(name: Node): string | null {
  if (!name) return null;
  if (name.type === "JSXIdentifier") return name.name;
  if (name.type === "JSXMemberExpression") {
    const object = jsxName(name.object);
    return object ? `${object}.${name.property.name}` : null;
  }
  return null;
}

function attr(opening: Node, name: string): Node | undefined {
  return opening.attributes.find((a: Node) => a.type === "JSXAttribute" && a.name?.name === name);
}

function hasSpread(opening: Node): boolean {
  return opening.attributes.some((a: Node) => a.type === "JSXSpreadAttribute");
}

/** The value of a string attribute when it is static (`"x"`, `{"x"}`, `{`x`}`). */
function staticString(value: Node): string | null {
  if (!value) return null;
  if (value.type === "Literal" && typeof value.value === "string") return value.value;
  if (value.type === "JSXExpressionContainer") return staticString(value.expression);
  if (value.type === "TemplateLiteral" && value.expressions.length === 0) return value.quasis[0].value.cooked;
  return null;
}

const CLASS_HELPERS = new Set(["cn", "clsx", "cx", "classnames", "classNames", "twMerge", "twJoin"]);
/** `[...].join(" ")`, `[...].filter(Boolean).join(" ")`, `"a".concat(…)` keep the strings they are called on. */
const CLASS_METHODS = new Set(["join", "filter", "concat"]);

/**
 * Every static class string inside a className value: cn()/clsx() arguments,
 * arrays joined with `.join(" ")`, conditionals and template literals.
 */
function classStrings(value: Node, out: { text: string; node: Node }[] = []): { text: string; node: Node }[] {
  if (!value) return out;
  switch (value.type) {
    case "Literal":
      if (typeof value.value === "string") out.push({ text: value.value, node: value });
      break;
    case "TemplateLiteral":
      for (const q of value.quasis) out.push({ text: q.value.cooked ?? "", node: value });
      for (const e of value.expressions) classStrings(e, out);
      break;
    case "JSXExpressionContainer":
      classStrings(value.expression, out);
      break;
    case "ConditionalExpression":
      classStrings(value.consequent, out);
      classStrings(value.alternate, out);
      break;
    case "LogicalExpression":
      classStrings(value.right, out);
      break;
    case "CallExpression": {
      const callee = value.callee;
      if (callee.type === "Identifier" && CLASS_HELPERS.has(callee.name)) {
        for (const arg of value.arguments) classStrings(arg, out);
      } else if (callee.type === "MemberExpression" && !callee.computed && CLASS_METHODS.has(callee.property.name)) {
        classStrings(callee.object, out);
        if (callee.property.name === "concat") for (const arg of value.arguments) classStrings(arg, out);
      }
      break;
    }
    case "ArrayExpression":
      for (const el of value.elements) classStrings(el, out);
      break;
    case "ObjectExpression":
      for (const p of value.properties) {
        if (p.type === "Property") classStrings(p.key.type === "Literal" ? p.key : null, out);
      }
      break;
  }
  return out;
}

function tokens(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/** `md:hover:!bg-red-500` → `bg-red-500`; a `:` inside `[…]` or `(…)` (`[color:red]`) is part of the value. */
function baseClass(cls: string): string {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < cls.length; i++) {
    const c = cls[i];
    if (c === "[" || c === "(") depth++;
    else if (c === "]" || c === ")") depth--;
    else if (c === ":" && depth === 0) start = i + 1;
  }
  return cls.slice(start).replace(/^!/, "").replace(/!$/, "");
}

// ----------------------------------------------------------------------------
// Classification

const CLASS_CATEGORIES: [string, RegExp][] = [
  ["margin", /^-?m[trblxyse]?-/],
  ["width", /^-?(w|min-w|max-w)-/],
  ["height", /^-?(h|min-h|max-h)-/],
  ["layout", /^(self|justify-self|place-self|order|col|row|grow|shrink|basis|flex-(1|auto|initial|none)|hidden|sr-only|not-sr-only)($|-)/],
  ["position", /^-?(static|fixed|absolute|relative|sticky|inset|top|right|bottom|left|start|end|z)($|-)/],
];

function classCategories(cls: string): string[] | null {
  const base = baseClass(cls);
  if (/^size-/.test(base)) return ["width", "height"];
  for (const [category, re] of CLASS_CATEGORIES) if (re.test(base)) return [category];
  return null;
}

const STYLE_CATEGORIES: [string, RegExp][] = [
  ["margin", /^margin/],
  ["width", /^(width|minWidth|maxWidth|inlineSize|minInlineSize|maxInlineSize)$/],
  ["height", /^(height|minHeight|maxHeight|blockSize|minBlockSize|maxBlockSize)$/],
  ["layout", /^(alignSelf|justifySelf|placeSelf|order|flex|flexGrow|flexShrink|flexBasis|gridArea|gridColumn|gridColumnStart|gridColumnEnd|gridRow|gridRowStart|gridRowEnd)$/],
  ["position", /^(position|inset|insetBlock|insetInline|insetBlockStart|insetBlockEnd|insetInlineStart|insetInlineEnd|top|right|bottom|left|zIndex)$/],
];

function styleCategory(prop: string): string | null {
  for (const [category, re] of STYLE_CATEGORIES) if (re.test(prop)) return category;
  return null;
}

/** What a class or style property changes, to pick the prop that changes it instead. */
type Look = "color" | "shadow" | "spacing" | "inner" | "size" | "radius" | "font" | "placement" | "other";

function classLook(cls: string): Look {
  const base = baseClass(cls);
  if (/^(bg|border|ring|outline|fill|stroke|from|via|to|divide|decoration|accent|caret|placeholder)(-|$)/.test(base)) return "color";
  if (/^text-(?!(xs|sm|base|lg|\d?xl|left|center|right|justify|start|end|wrap|nowrap|balance|pretty|ellipsis|clip)$)/.test(base)) return "color";
  if (/^shadow/.test(base)) return "shadow";
  if (/^rounded/.test(base)) return "radius";
  if (/^(font|tracking|leading)-/.test(base)) return "font";
  // How the children are laid out (`flex flex-col gap-6` on a Card), not how the part looks.
  if (/^(flex|inline-flex|grid|inline-grid|flex-(row|col|wrap|nowrap)(-reverse)?|items-.+|justify-(?!self).+|content-.+|place-(items|content)-.+|gap(-[xy])?-.+|space-[xy]-.+|grid-(cols|rows|flow)-.+)$/.test(base)) return "inner";
  if (/^p[trblxyse]?-/.test(base)) return "spacing";
  if (/^((min-|max-)?h-|text-(xs|sm|base|lg|\d?xl)$)/.test(base)) return "size";
  return classCategories(cls) ? "placement" : "other";
}

function styleLook(key: string): Look {
  if (/^border.*Radius$/.test(key)) return "radius";
  if (/colou?r$|^background|^border|^outline|^fill$|^stroke$/i.test(key)) return "color";
  if (key === "boxShadow") return "shadow";
  if (/^(display|flexDirection|flexWrap|alignItems|justifyContent|gap|rowGap|columnGap|gridTemplateColumns|gridTemplateRows)$/.test(key)) return "inner";
  if (/^padding/.test(key)) return "spacing";
  if (/^(height|minHeight|maxHeight|fontSize)$/.test(key)) return "size";
  if (/^(fontWeight|fontFamily|letterSpacing|lineHeight)$/.test(key)) return "font";
  return styleCategory(key) ? "placement" : "other";
}

/** Enum props that pick a look, in the order they are offered. */
const LOOK_PROPS = ["variant", "tone", "size", "padding", "shape"];

function choice(part: Part, prop: string): string {
  return `${prop}（${part.enums[prop].join(" | ")}）`;
}

/** The prop to use instead of a class or style property of this look, or null when the part has none. */
function lookHint(look: Look, part: Part): string | null {
  const color = ["variant", "tone"].find((p) => part.enums[p]);
  switch (look) {
    case "color":
      return color ? `色は ${choice(part, color)}で選んでください。` : null;
    case "spacing":
      if (part.enums.padding) return `余白は ${choice(part, "padding")}で選んでください。`;
      return part.enums.size ? `大きさは ${choice(part, "size")}で選んでください。余白と高さはパックが決めます。` : null;
    case "size":
      return part.enums.size ? `大きさは ${choice(part, "size")}で選んでください。` : null;
    case "inner":
      return "中身の並び（flex・gap など）は、子要素に自分の要素（div や span）を置いて、そこに書いてください。";
    case "radius":
      return "角の丸みはパックが決めます。別の形が必要なら、パックを切り替えてください。";
    case "font":
      return "文字の太さや字間はパックが決めます。";
    case "placement":
      return ""; // the message already lists the categories it may change
    default:
      return null;
  }
}

/**
 * The fix for each look that was changed, from the props this part has. A look the part
 * has no prop for is never sent to a variant that does not exist: the message lists what
 * the part offers and says to leave the look to the pack.
 */
function hintFor(name: string, part: Part, changed: { text: string; look: Look }[], from: "className" | "style"): string {
  const hints = new Set<string>();
  const unmatched: string[] = [];
  for (const { text, look } of changed) {
    const hint = lookHint(look, part);
    if (hint === null) unmatched.push(text);
    else if (hint) hints.add(hint);
  }
  if (unmatched.length) {
    const offered = LOOK_PROPS.filter((p) => part.enums[p]);
    const props = offered.length ? `<${name}> で選べる見た目は ${offered.map((p) => choice(part, p)).join("・")}だけです` : `<${name}> に見た目を選ぶ props はありません`;
    hints.add(
      `${unmatched.join("・")} にあたる props はありません（${props}）。${from} から外してパックに任せ、` +
        "どうしても別の見た目が必要なら、そのことを利用者に伝えてください（新しいバリアントかパックで対応します）。",
    );
  }
  return [...hints].join("");
}

// ----------------------------------------------------------------------------
// Rules

const noVisualOverride: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: { description: "Disallow restyling yourlib components through className or style; visuals come from packs and variants." },
    schema: [
      {
        type: "object",
        properties: {
          allowUnknownClasses: { type: "boolean" },
          components: { type: "object", additionalProperties: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      className:
        "<{{component}}> の見た目は className では変えられません（{{classes}}）。className で変えてよいのは {{allowed}} だけです。{{hint}}",
      style: "<{{component}}> の見た目は style では変えられません（{{props}}）。style で変えてよいのは {{allowed}} だけです。{{hint}}",
    },
  },
  create(context) {
    const options = (context.options[0] ?? {}) as { allowUnknownClasses?: boolean; components?: Record<string, string> };
    const aliases = options.components ?? {};
    return {
      JSXOpeningElement(node: Node) {
        const name = jsxName(node.name);
        if (!name) return;
        const part = PARTS[aliases[name] ?? name];
        if (!part) return;
        const allowed = part.overrides.length ? part.overrides.map((c) => CATEGORY_LABEL[c]).join("・") : "なし";

        const className = attr(node, "className");
        if (className?.value) {
          const bad: string[] = [];
          for (const { text } of classStrings(className.value)) {
            for (const cls of tokens(text)) {
              const categories = classCategories(cls);
              if (categories === null) {
                if (!options.allowUnknownClasses) bad.push(cls);
              } else if (!categories.every((c) => part.overrides.includes(c))) {
                bad.push(cls);
              }
            }
          }
          if (bad.length) {
            const changed = bad.map((text) => ({ text, look: classLook(text) }));
            context.report({
              node: className,
              messageId: "className",
              data: { component: name, classes: bad.join(" "), allowed, hint: hintFor(name, part, changed, "className") },
            });
          }
        }

        const style = attr(node, "style");
        const expression = style?.value?.type === "JSXExpressionContainer" ? style.value.expression : null;
        if (expression?.type === "ObjectExpression") {
          const bad: string[] = [];
          for (const p of expression.properties) {
            if (p.type !== "Property") continue;
            const key = p.key.type === "Identifier" ? p.key.name : typeof p.key.value === "string" ? p.key.value : null;
            if (!key) continue;
            const category = styleCategory(key);
            if (!category || !part.overrides.includes(category)) bad.push(key);
          }
          if (bad.length) {
            const changed = bad.map((text) => ({ text, look: styleLook(text) }));
            context.report({
              node: style,
              messageId: "style",
              data: { component: name, props: bad.join(", "), allowed, hint: hintFor(name, part, changed, "style") },
            });
          }
        }
      },
    };
  },
};

const PALETTE =
  /^(bg|text|border(-[trblxyse])?|ring|outline|fill|stroke|from|via|to|decoration|accent|caret|shadow|divide|placeholder)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white)(-\d{2,3})?(\/\d+)?$/;
const RAW_COLOR = /#[0-9a-f]{3,8}\b|\b(rgba?|hsla?|oklch|oklab|lab|lch|color|hwb)\(/i;
/** `p-[13px]`, `bg-[var(--x)]`, `[color:red]`, and Tailwind v4's `bg-(--x)`. */
const ARBITRARY = /\[[^\]]+\]|\((?:[\w-]+:)?--[\w-]+\)/;
const TOKEN_REF = /--yl-[\w-]+/;

/** `--yl-color-text-muted` → `color` */
function tokenGroup(name: string): string {
  return name.slice("--yl-".length).split("-")[0];
}

function camel(property: string): string {
  return property.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

const SIDES: Record<string, string> = { t: "top", r: "right", b: "bottom", l: "left", x: "inline", y: "block", s: "inline-start", e: "inline-end" };
const UTILITY_PROPERTIES: Record<string, string> = {
  gap: "gap",
  "gap-x": "column-gap",
  "gap-y": "row-gap",
  w: "width",
  h: "height",
  "min-w": "min-width",
  "max-w": "max-width",
  "min-h": "min-height",
  "max-h": "max-height",
  rounded: "border-radius",
  shadow: "box-shadow",
  leading: "line-height",
  tracking: "letter-spacing",
  fill: "fill",
  stroke: "stroke",
  accent: "accent-color",
  caret: "caret-color",
  decoration: "text-decoration-color",
  inset: "inset",
  top: "top",
  right: "right",
  bottom: "bottom",
  left: "left",
  duration: "transition-duration",
  ease: "transition-timing-function",
};

/** The CSS property a Tailwind utility sets when given this token; null when it is not a single property. */
function utilityProperty(utility: string, token: string): string | null {
  const group = tokenGroup(token);
  const spacing = /^(p|m)([trblxyse])?$/.exec(utility);
  if (spacing) return `${spacing[1] === "p" ? "padding" : "margin"}${spacing[2] ? `-${SIDES[spacing[2]]}` : ""}`;
  const border = /^border(?:-([trblxyse]))?$/.exec(utility);
  if (border) {
    const side = border[1] ? `-${SIDES[border[1]]}` : "";
    return group === "color" ? `border${side}-color` : token === "--yl-border-width" ? `border${side}-width` : null;
  }
  switch (utility) {
    case "bg":
      return group === "color" ? "background-color" : null;
    case "text":
      return group === "color" ? "color" : token.startsWith("--yl-font-size-") ? "font-size" : null;
    case "outline":
      return group === "color" ? "outline-color" : token === "--yl-focus-ring-width" ? "outline-width" : null;
    case "font":
      return token.startsWith("--yl-font-family-") ? "font-family" : token.startsWith("--yl-font-weight-") ? "font-weight" : null;
  }
  return UTILITY_PROPERTIES[utility] ?? null;
}

/** `text-[var(--x)]` → `text`; `border-t-(--x)` → `border-t`; `[color:red]` → `` */
function utilityOf(base: string): string {
  return /^-?([a-z][\w-]*?)-[[(]/.exec(base)?.[1] ?? "";
}

/** The one form that always works: the token as a value in `style` or in the app's own CSS. */
function tokenAdvice(property: string | null, token: string): string {
  const value = `var(${token})`;
  if (!property) return `トークンは、style の値か自分の CSS の値として ${value} と書いてください。`;
  return `style={{ ${camel(property)}: "${value}" }} のように style で指定するか、自分の CSS で ${property}: ${value} と書いてください。`;
}

/** Utilities (`bg`), CSS properties (`background-color`) and style keys (`backgroundColor`) → fitting color tokens. */
const COLOR_CANDIDATES: [RegExp, string[]][] = [
  [/^(text|fill|stroke|decoration|caret|placeholder|color)$/, ["text", "text-muted", "text-subtle"]],
  [/^(bg|from|via|to)$|^background/, ["bg", "surface", "secondary"]],
  [/^(border(-[trblxyse])?|divide|outline|ring)$|^(border|outline).*colou?r$/i, ["border", "border-strong"]],
];
/*
 * Hues → the tokens that carry the same meaning, the closest first.
 *
 * Blue and purple (and the hues next to them) are what screens use for emphasis: the
 * selected plan's border, the current step, a highlighted row. They get --yl-color-accent
 * first and --yl-color-action second. SKILL.md gives accent to "Focus, selection and
 * in-progress state" and action to "Fill of the primary action (one per screen)". This
 * advice is for the app's own elements (on a part it is the variant), and the primary
 * action's fill already comes from <Button variant="primary">, so a blue or purple element
 * marks a selection or a current state far more often than it is a second primary action;
 * leading with action would put two primary-looking things on one screen. accent is "Not
 * for decoration", so the message says what it is for (ACCENT_NOTE).
 */
const HUE_TOKENS: [RegExp, string[]][] = [
  [/^(red|rose)$/, ["danger"]],
  [/^(green|emerald)$/, ["ok"]],
  [/^(sky|blue|indigo|violet|purple|fuchsia|cyan)$/, ["accent", "action"]],
];
const ACCENT_NOTE =
  "--yl-color-accent は選択中・フォーカス・進行中を示す色で、飾りには使いません（目立たせたいだけなら --yl-color-text や --yl-color-border-strong）。主な操作の色なら --yl-color-action です（1 画面に 1 つ）。";

/** A light tint behind content (`bg-purple-50`) is a surface, not the signal: its hue's tokens go after the surfaces. */
function isTint(utility: string, shade?: string): boolean {
  return /^(bg|from|via|to)$|^background/.test(utility) && shade !== undefined && Number(shade) <= 200;
}

/** A few color tokens that fit a utility (`bg`) or style key (`backgroundColor`), the closest first. */
function colorCandidates(utility: string, hue = "", shade?: string): string[] {
  const hueNames = HUE_TOKENS.filter(([re]) => re.test(hue)).flatMap(([, n]) => n);
  const general = COLOR_CANDIDATES.find(([re]) => re.test(utility))?.[1] ?? ["text", "surface", "border"];
  const names = isTint(utility, shade) ? [...general, ...hueNames] : [...hueNames, ...general];
  return [...new Set(names)].map((n) => `--yl-color-${n}`).filter((n) => TOKENS.has(n));
}

/** `property`: set for an arbitrary property (`[color:#fff]`), which names the CSS property itself. `shade`: `500` of `bg-blue-500`. */
function colorAdvice(utility: string, hue?: string, property?: string, shade?: string): string {
  const candidates = colorCandidates(property ?? utility, hue, shade);
  const token = candidates[0];
  const arbitrary = property ? `[${property}:var(${token})]` : `${utility}-[var(${token})]`;
  return (
    `パックの色のトークンを使ってください。${tokenAdvice(property ?? utilityProperty(utility, token), token)}` +
    `候補: ${candidates.join("・")}（ほかの色も --yl-color-* から選びます）。` +
    (candidates.includes("--yl-color-accent") ? ACCENT_NOTE : "") +
    `Tailwind の任意値（${arbitrary}）にはしないでください。`
  );
}

const SCALES: [RegExp, string, string | null][] = [
  [/^(p|m)[trblxyse]?$|^gap(-[xy])?$|^space-[xy]$/, "p-4・gap-3", "--yl-space-4"],
  [/^(min-|max-)?(w|h)$|^size$/, "w-96・max-w-md・h-10", null],
  [/^text$/, "text-sm・text-base", "--yl-font-size-small"],
  [/^rounded/, "rounded-md", "--yl-radius-panel"],
  [/^shadow$/, "shadow-sm", "--yl-shadow-panel"],
  [/^(grid-cols|grid-rows|col-span|row-span)$/, "grid-cols-3・col-span-2", null],
  [/^(leading|tracking)$/, "leading-6・tracking-wide", null],
];

function arbitraryAdvice(base: string): string {
  const utility = utilityOf(base);
  if (RAW_COLOR.test(base)) return colorAdvice(utility, undefined, /^\[([a-z-]+):/.exec(base)?.[1]);
  const scale = SCALES.find(([re]) => re.test(utility));
  if (!scale) {
    return `Tailwind の決められた段階（p-4・w-96・text-sm など）を使うか、パックのトークンを style か自分の CSS で使ってください（例: style={{ padding: "var(--yl-space-4)" }}）。`;
  }
  const [, examples, token] = scale;
  return `Tailwind の決められた段階（${examples} など）を使ってください。${token ? `パックの値に合わせるなら、${tokenAdvice(utilityProperty(utility, token), token)}` : ""}`;
}

/** On a yourlib component, colors are not the element's to set: point at the variant instead. */
function partAdvice(name: string, part: Part): string {
  const prop = ["variant", "tone"].find((p) => part.enums[p]);
  if (!prop) return `<${name}> の色はパックが決めます（<${name}> に色を選ぶ props はありません）。className と style からは外してください。`;
  return `<${name}> の見た目はパックとバリアントが決めます。色は ${choice(part, prop)}で選び、className と style からは外してください。`;
}

type ColorMessage = "palette" | "arbitraryToken" | "arbitrary";

/** What no-raw-color reports in one class string; `onPart` replaces the fix when the classes go on a yourlib part. */
function classProblems(text: string, onPart: string | null): { messageId: ColorMessage; data: Record<string, string> }[] {
  const out: { messageId: ColorMessage; data: Record<string, string> }[] = [];
  for (const cls of tokens(text)) {
    const base = baseClass(cls);
    const palette = PALETTE.exec(base);
    if (palette) {
      out.push({ messageId: "palette", data: { cls, fix: onPart ?? colorAdvice(palette[1], palette[3], undefined, palette[4]?.slice(1)) } });
    } else if (ARBITRARY.test(base)) {
      const token = TOKEN_REF.exec(base)?.[0];
      if (token) {
        const property = /^\[([a-z-]+):/.exec(base)?.[1] ?? utilityProperty(utilityOf(base), token);
        out.push({ messageId: "arbitraryToken", data: { cls, fix: onPart ?? tokenAdvice(property, token) } });
      } else {
        out.push({ messageId: "arbitrary", data: { cls, fix: onPart ?? arbitraryAdvice(base) } });
      }
    }
  }
  return out;
}

/** Tailwind utilities without a `-`; every other utility has one (`bg-green-100`, `p-4`, `w-full`). */
const BARE_UTILITIES = new Set(
  "flex grid block inline hidden contents table relative absolute fixed sticky static border rounded shadow ring outline underline italic truncate uppercase lowercase capitalize grow shrink transition container visible invisible isolate group peer antialiased".split(" "),
);

/**
 * Does a string read as a list of Tailwind classes (`"bg-green-100 text-green-700"`)? Every
 * word has to look like a utility (lowercase with a `-`, `[prop:value]`, or a bare one such as
 * `flex`), so prose (`"set the color"`), CSS values (`"1px solid red"`, `"var(--x)"`) and
 * selectors (`"[data-state=open]"`) do not.
 */
function isClassList(text: string): boolean {
  const words = tokens(text);
  return (
    words.length > 0 &&
    words.every((word) => {
      const base = baseClass(word);
      return BARE_UTILITIES.has(base) || /^-?[a-z][a-z0-9]*-\S+$/.test(base) || /^\[[a-z-]+:.+\]$/.test(base);
    })
  );
}

/*
 * A token inside a Tailwind arbitrary value (`text-[var(--yl-color-text-muted)]`,
 * `bg-(--yl-color-surface)`) is reported too, although it names a real token:
 * - Tailwind cannot tell what a var() holds, so for `text-`, `border-` and the like
 *   it needs a type hint (`text-[length:var(--yl-font-size-small)]`). Without one the
 *   class can set the wrong property and silently do nothing.
 * - The Tailwind integration planned in the design draft (§3, `@yourlib/tailwind`)
 *   maps the tokens into `@theme`. Allowing arbitrary values now would leave two ways
 *   to write the same thing once it ships.
 * - `style` and the app's own CSS work with or without Tailwind.
 * So every message names that one form, with the property and token already filled in.
 *
 * Outside className, a string that reads as a class list (isClassList) is checked too: a
 * function or variable that holds the classes (`return "bg-green-100 text-green-700"`,
 * `const tone = ok ? "bg-green-100" : "bg-red-100"`). When the file passes that function
 * or variable to the className of a yourlib part (`<Badge className={changeClass(n)}>`),
 * the fix is the part's variant, as on the part itself.
 */
const CLASS_ATTRIBUTE = /^(className|class)$/;

const noRawColor: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: { description: "Disallow palette colors, raw color values and arbitrary values; use the pack's tokens in style or CSS." },
    schema: [],
    messages: {
      palette: "パレットの色（{{cls}}）は使えません。{{fix}}",
      arbitraryToken: "Tailwind の任意値に入れたトークン（{{cls}}）も使えません。{{fix}}",
      arbitrary: "任意の値（{{cls}}）は使えません。{{fix}}",
      rawStyle: "生の色の値（{{value}}）は使えません。{{fix}}",
    },
  },
  create(context) {
    /** Class lists outside className, with the names of the functions and variables they sit in, innermost first. */
    const outside: { node: Node; text: string; owners: string[] }[] = [];
    /** A name used in the className of a yourlib part → that part. */
    const feeds = new Map<string, string>();
    const inClassName = (node: Node) =>
      context.sourceCode.getAncestors(node).some((a: Node) => a.type === "JSXAttribute" && CLASS_ATTRIBUTE.test(a.name?.name ?? ""));
    const collect = (node: Node, text: string, whole: string) => {
      if (!isClassList(whole) || inClassName(node)) return;
      const owners = context.sourceCode
        .getAncestors(node)
        .reverse()
        .map((a: Node) => (a.type === "VariableDeclarator" || a.type === "FunctionDeclaration") && a.id?.type === "Identifier" ? a.id.name : null)
        .filter((n: string | null): n is string => n !== null);
      outside.push({ node, text, owners });
    };
    return {
      Literal(node: Node) {
        if (typeof node.value === "string") collect(node, node.value, node.value);
      },
      TemplateElement(node: Node) {
        collect(node, node.value.cooked ?? node.value.raw, node.parent.quasis.map((q: Node) => q.value.cooked ?? q.value.raw).join(" "));
      },
      JSXAttribute(node: Node) {
        const name = node.name?.name;
        const element = jsxName(node.parent?.name);
        const part = element ? PARTS[element] : undefined;
        const onPart = part ? partAdvice(element!, part) : null;
        if (CLASS_ATTRIBUTE.test(name ?? "")) {
          for (const { text } of classStrings(node.value)) {
            for (const problem of classProblems(text, onPart)) context.report({ node, ...problem });
          }
        }
        if (name === "style" && node.value?.type === "JSXExpressionContainer" && node.value.expression.type === "ObjectExpression") {
          for (const p of node.value.expression.properties) {
            if (p.type !== "Property") continue;
            const value = staticString(p.value);
            if (!value || !RAW_COLOR.test(value)) continue;
            const key = p.key.type === "Identifier" ? p.key.name : String(p.key.value ?? "");
            const token = colorCandidates(key)[0];
            const fix = onPart ?? `パックの色のトークンを使ってください（例: style={{ ${key}: "var(${token})" }}）。候補: ${colorCandidates(key).join("・")}。`;
            context.report({ node: p, messageId: "rawStyle", data: { value, fix } });
          }
        }
      },
      "JSXAttribute Identifier"(node: Node) {
        const attribute: Node = context.sourceCode.getAncestors(node).findLast((a: Node) => a.type === "JSXAttribute");
        if (!CLASS_ATTRIBUTE.test(attribute?.name?.name ?? "")) return;
        const element = jsxName(attribute.parent?.name);
        if (element && PARTS[element] && !feeds.has(node.name)) feeds.set(node.name, element);
      },
      "Program:exit"() {
        for (const { node, text, owners } of outside) {
          const owner = owners.find((n) => feeds.has(n));
          const part = owner ? feeds.get(owner)! : null;
          const onPart = part ? `${owner} は <${part}> の className に使われています。${partAdvice(part, PARTS[part])}` : null;
          for (const problem of classProblems(text, onPart)) context.report({ node, ...problem });
        }
      },
    };
  },
};

const validIdref: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: { description: "Check that triggers and close buttons reference an element that exists in the same file." },
    schema: [],
    messages: {
      missing: "{{prop}}=\"{{id}}\" に対応する {{expected}} がこのファイルにありません。id の綴りを確認してください（別のファイルにある場合は、この警告を無視してかまいません）。",
      wrongKind: "{{prop}}=\"{{id}}\" は <{{found}}> を指しています。<{{component}}> が開閉できるのは {{expected}} だけです。",
      commandWithoutTarget: "command を付けたボタンには、操作する要素の id を commandfor で指定してください。",
      targetWithoutCommand: "commandfor を付けたボタンには、command（show-modal・close・toggle-popover など）も指定してください。",
    },
  },
  create(context) {
    const provided = new Map<string, string>(); // id → contract
    const anyIds = new Map<string, string>(); // id → element name
    const refs: { node: Node; component: string; prop: string; id: string; target: string | null }[] = [];
    return {
      JSXOpeningElement(node: Node) {
        const name = jsxName(node.name);
        if (!name) return;
        const id = staticString(attr(node, "id")?.value);
        const part = PARTS[name];
        if (id) {
          anyIds.set(id, name);
          if (part?.provides) provided.set(id, part.provides);
        }
        if (!part) return;
        for (const [prop, target] of Object.entries(part.idrefs)) {
          const value = staticString(attr(node, prop)?.value);
          if (value) refs.push({ node, component: name, prop, id: value, target });
        }
        if (name === "Button" && !hasSpread(node)) {
          const hasCommand = Boolean(attr(node, "command"));
          const hasTarget = Boolean(attr(node, "commandfor"));
          if (hasCommand && !hasTarget) context.report({ node, messageId: "commandWithoutTarget" });
          if (hasTarget && !hasCommand) context.report({ node, messageId: "targetWithoutCommand" });
        }
      },
      "Program:exit"() {
        for (const ref of refs) {
          const expected = ref.target ? `<${ref.target[0].toUpperCase()}${ref.target.slice(1)} id="${ref.id}">` : `id="${ref.id}" の要素`;
          if (ref.target) {
            const kind = provided.get(ref.id);
            if (kind === ref.target) continue;
            const found = anyIds.get(ref.id);
            if (found) {
              context.report({ node: ref.node, messageId: "wrongKind", data: { prop: ref.prop, id: ref.id, found, component: ref.component, expected } });
            } else {
              context.report({ node: ref.node, messageId: "missing", data: { prop: ref.prop, id: ref.id, expected } });
            }
          } else if (!anyIds.has(ref.id)) {
            context.report({ node: ref.node, messageId: "missing", data: { prop: ref.prop, id: ref.id, expected } });
          }
        }
      },
    };
  },
};

const requiredProps: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: { description: "Require the props a component's contract marks as required." },
    schema: [],
    messages: {
      missing: "<{{component}}> には {{prop}} が必要です。{{why}}",
    },
  },
  create(context) {
    const why: Record<string, string> = {
      id: "トリガーや閉じるボタンが、この id で参照します。",
      title: "見出しになり、スクリーンリーダーで読み上げられる名前になります。",
      dialog: "開閉するダイアログの id を指定してください。",
      popover: "開閉するポップオーバーの id を指定してください。",
      menu: "開閉するメニューの id を指定してください。",
      tooltip: "表示するツールチップの id を指定してください。",
      label: "入力欄やタブ一覧の名前として読み上げられます。",
      legend: "選択肢のグループの名前として読み上げられます。",
      name: "同じ name の選択肢が 1 つのグループになります。",
      value: "Tabs.Tab と Tabs.Panel、RadioGroup.Item を結びつける値です。",
      defaultValue: "最初に選ばれているタブの value です。",
    };
    return {
      JSXOpeningElement(node: Node) {
        const name = jsxName(node.name);
        const part = name ? PARTS[name] : undefined;
        if (!part || hasSpread(node)) return;
        for (const prop of part.required) {
          if (!attr(node, prop)) context.report({ node, messageId: "missing", data: { component: name!, prop, why: why[prop] ?? "" } });
        }
      },
    };
  },
};

const BUTTON_LIKE = new Set(Object.entries(PARTS).filter(([, p]) => p.element === "button").map(([n]) => n));

function hasText(children: Node[]): boolean {
  return children.some(
    (c: Node) =>
      (c.type === "JSXText" && c.value.trim() !== "") ||
      (c.type === "JSXExpressionContainer" && c.expression.type !== "JSXEmptyExpression" && c.expression.type !== "JSXElement"),
  );
}

const accessibleName: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: { description: "Require an accessible name on popovers and icon-only buttons." },
    schema: [],
    messages: {
      popover: "<Popover> には title か aria-label を付けてください。パネルの名前として読み上げられます。",
      iconOnly: "アイコンだけの <{{component}}> には aria-label を付けてください（例：aria-label=\"閉じる\"）。",
    },
  },
  create(context) {
    return {
      JSXElement(node: Node) {
        const opening = node.openingElement;
        const name = jsxName(opening.name);
        if (!name || hasSpread(opening)) return;
        const named = attr(opening, "aria-label") || attr(opening, "aria-labelledby");
        if (name === "Popover" && !named && !attr(opening, "title")) context.report({ node: opening, messageId: "popover" });
        if (BUTTON_LIKE.has(name) && !named && node.children.length > 0 && !hasText(node.children)) {
          context.report({ node: opening, messageId: "iconOnly", data: { component: name } });
        }
      },
    };
  },
};

const preferNative: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: { description: "Prefer native interactive elements over clickable divs and spans." },
    schema: [],
    messages: {
      clickable: "<{{element}}> に onClick を付けて操作できる部品を作らないでください。キーボードで操作できる <Button> を使ってください。",
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node: Node) {
        const name = jsxName(node.name);
        if ((name === "div" || name === "span") && attr(node, "onClick") && !attr(node, "role")) {
          context.report({ node, messageId: "clickable", data: { element: name } });
        }
      },
    };
  },
};

/** Collects the static values of Tabs.Tab and Tabs.Panel under a <Tabs>; null if any is dynamic. */
function tabValues(children: Node[]): { tabs: Map<string, Node>; panels: Map<string, Node> } | null {
  const tabs = new Map<string, Node>();
  const panels = new Map<string, Node>();
  const visit = (nodes: Node[]): boolean => {
    for (const child of nodes) {
      if (child.type === "JSXExpressionContainer" && child.expression.type !== "JSXEmptyExpression") return false;
      if (child.type === "JSXFragment") {
        if (!visit(child.children)) return false;
        continue;
      }
      if (child.type !== "JSXElement") continue;
      const opening = child.openingElement;
      const name = jsxName(opening.name);
      if (name === "Tabs.Tab" || name === "Tabs.Panel") {
        const value = staticString(attr(opening, "value")?.value);
        if (value === null || hasSpread(opening)) return false;
        (name === "Tabs.Tab" ? tabs : panels).set(value, opening);
      }
      if (!visit(child.children)) return false;
    }
    return true;
  };
  return visit(children) ? { tabs, panels } : null;
}

const tabsMatch: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: { description: "Every Tabs.Tab needs a Tabs.Panel with the same value, and defaultValue must name a tab." },
    schema: [],
    messages: {
      noPanel: "<Tabs.Tab value=\"{{value}}\"> に対応する <Tabs.Panel value=\"{{value}}\"> がありません。このタブを選ぶと何も表示されません。",
      noTab: "<Tabs.Panel value=\"{{value}}\"> に対応する <Tabs.Tab value=\"{{value}}\"> がありません。このパネルを表示する方法がありません。",
      badDefault: "defaultValue=\"{{value}}\" に一致する <Tabs.Tab> がありません。どのタブも選ばれず、パネルが 1 つも表示されません。value の綴りを確認してください（候補: {{candidates}}）。",
    },
  },
  create(context) {
    return {
      JSXElement(node: Node) {
        const opening = node.openingElement;
        if (jsxName(opening.name) !== "Tabs" || hasSpread(opening)) return;
        const found = tabValues(node.children);
        if (!found) return;
        for (const [value, tab] of found.tabs) {
          if (!found.panels.has(value)) context.report({ node: tab, messageId: "noPanel", data: { value } });
        }
        for (const [value, panel] of found.panels) {
          if (!found.tabs.has(value)) context.report({ node: panel, messageId: "noTab", data: { value } });
        }
        const initial = staticString(attr(opening, "defaultValue")?.value);
        if (initial !== null && found.tabs.size > 0 && !found.tabs.has(initial)) {
          context.report({ node: opening, messageId: "badDefault", data: { value: initial, candidates: [...found.tabs.keys()].join("・") } });
        }
      },
    };
  },
};

/** Edit distance, for "did you mean" suggestions. */
function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return row[b.length];
}

const TOKEN_GROUPS = new Map<string, string[]>();
for (const name of LIBRARY.tokens) TOKEN_GROUPS.set(tokenGroup(name), [...(TOKEN_GROUPS.get(tokenGroup(name)) ?? []), name]);

/** Token names from other libraries (shadcn, Material, Radix) → the yourlib tokens that play the part. */
const TOKEN_SYNONYMS: Record<string, string[]> = {
  "color-primary": ["color-action"],
  "color-primary-foreground": ["color-on-action"],
  "color-on-primary": ["color-on-action"],
  "color-brand": ["color-action", "color-accent"],
  "color-on-brand": ["color-on-action"],
  "color-foreground": ["color-text"],
  "color-background": ["color-bg"],
  "color-muted": ["color-text-muted", "color-secondary"],
  "color-muted-foreground": ["color-text-muted"],
  "color-card": ["color-surface"],
  "color-popover": ["color-surface-overlay"],
  "color-destructive": ["color-danger"],
  "color-error": ["color-danger"],
  "color-success": ["color-ok"],
  "color-input": ["color-border-field", "color-field"],
  "color-ring": ["color-focus-ring"],
  "color-text-primary": ["color-text"],
  "color-text-secondary": ["color-text-muted"],
  "color-text-tertiary": ["color-text-subtle"],
};
const GROUP_SYNONYMS: Record<string, string> = { colors: "color", spacing: "space", spaces: "space", radii: "radius", rounded: "radius", shadows: "shadow", elevation: "shadow" };

/** Up to three real tokens close to an unknown name. */
function nearTokens(name: string): string[] {
  let rest = name.slice("--yl-".length);
  let group = tokenGroup(name);
  if (!TOKEN_GROUPS.has(group) && GROUP_SYNONYMS[group]) {
    rest = GROUP_SYNONYMS[group] + rest.slice(group.length);
    group = GROUP_SYNONYMS[group];
    if (TOKENS.has(`--yl-${rest}`)) return [`--yl-${rest}`];
  }
  const known = TOKEN_GROUPS.has(group);
  const words = rest.split("-").slice(known ? 1 : 0);
  const synonyms = (TOKEN_SYNONYMS[rest] ?? []).map((n) => `--yl-${n}`).filter((n) => TOKENS.has(n));
  const scored = (TOKEN_GROUPS.get(group) ?? LIBRARY.tokens)
    .map((token) => {
      const other = token.slice("--yl-".length);
      const otherWords = other.split("-").slice(known ? 1 : 0);
      return { token, shared: words.filter((w) => otherWords.includes(w)).length, d: distance(rest, other) };
    })
    .filter(({ shared, d }) => shared > 0 || d <= 2)
    .sort((a, b) => b.shared - a.shared || a.d - b.d)
    .map(({ token }) => token);
  return [...new Set([...synonyms, ...scored])].slice(0, 3);
}

/** `var(--yl-x`, and Tailwind v4's `bg-(--yl-x)` / `text-(color:--yl-x)`: places that read a token. */
const TOKEN_READ = /(?:var\(|-\((?:[\w-]+:)?)\s*(--yl-[\w-]*)/g;

/**
 * Checks the tokens a screen reads: every string in JSX (className, style and other
 * attribute values, `<style>{`…`}</style>`), and outside JSX every string that is a
 * single CSS value (`return "var(--yl-color-ok)"`, `{ color: "var(--yl-color-text)" }`).
 * A stylesheet outside JSX (text with `{` or `;`) is skipped: a file may define its own
 * custom properties there, as scripts/design-system.tsx does. Only reads are checked:
 * defining a custom property (`--yl-x: …`) or naming an anchor (`anchor-name: --yl-x`)
 * is not a token reference.
 */
const validToken: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: { description: "Report var(--yl-*) references to tokens that no pack defines." },
    schema: [],
    messages: {
      unknown: "{{name}} というトークンはありません。{{near}}{{group}} のトークン（--yl-{{group}}-*）は {{list}} です。",
      unknownGroup: "{{name}} というトークンはありません。{{near}}トークンの名前は --yl-{{groups}} のどれかで始まります。",
      unknownPrefix: "{{name}} で始まるトークンはありません。トークンの名前は --yl-{{groups}} のどれかで始まります。",
    },
  },
  create(context) {
    const groups = [...TOKEN_GROUPS.keys()].join("・--yl-");
    const inJsx = (node: Node) => context.sourceCode.getAncestors(node).some((a: Node) => a.type === "JSXAttribute" || a.type === "JSXExpressionContainer");
    const cssValue = (text: string) => !/[{};]/.test(text);
    /** `open`: a template literal part that an expression continues (`var(--yl-color-${tone})`). */
    const check = (node: Node, text: string, open: boolean) => {
      for (const m of text.matchAll(TOKEN_READ)) {
        const name = m[1];
        const end = m.index + m[0].length;
        const prefix = name.endsWith("-") || text[end] === "*" || text[end] === "…" || (open && end === text.length);
        if (prefix) {
          if (!LIBRARY.tokens.some((t) => t.startsWith(name))) context.report({ node, messageId: "unknownPrefix", data: { name, groups } });
          continue;
        }
        if (TOKENS.has(name)) continue;
        const near = nearTokens(name);
        const nearText = near.length ? `${near.join("・")} のことですか。` : "";
        const group = tokenGroup(name);
        const members = TOKEN_GROUPS.get(group);
        if (members) {
          const list = members.map((t) => t.slice(`--yl-${group}-`.length)).join("・");
          context.report({ node, messageId: "unknown", data: { name, near: nearText, group, list } });
        } else {
          context.report({ node, messageId: "unknownGroup", data: { name, near: nearText, groups } });
        }
      }
    };
    return {
      Literal(node: Node) {
        if (typeof node.value === "string" && (cssValue(node.value) || inJsx(node))) check(node, node.value, false);
      },
      TemplateElement(node: Node) {
        const whole = node.parent.quasis.map((q: Node) => q.value.raw).join("");
        if (cssValue(whole) || inJsx(node)) check(node, node.value.cooked ?? node.value.raw, !node.tail);
      },
    };
  },
};

const REACT = "@yourlib/react";
const ROOTS = Object.keys(PARTS).filter((n) => !n.includes("."));

function members(root: string): string[] {
  return Object.keys(PARTS)
    .filter((n) => n.startsWith(`${root}.`))
    .map((n) => n.slice(root.length + 1));
}

/**
 * A part as it has to be written, with the props its contract requires and any `extra`
 * ones: `<Menu.Trigger menu="…">`, `<Field id="…" label="…">`. Suggestions name the
 * required props so that following one does not trade this error for required-props.
 */
function tag(name: string, extra: string[] = []): string {
  const props = [...new Set([...(PARTS[name]?.required ?? []), ...extra])];
  return `<${name}${props.map((p) => ` ${p}="…"`).join("")}>`;
}

/** Whole components other libraries have → what to write with yourlib. */
const LAYOUT = "yourlib にはない部品です。HTML の要素（p・h2・div・section など）と Tailwind のレイアウトのクラスで組んでください。";
const dialogAlias = `${tag("Dialog")} を使ってください。開くボタンは ${tag("Dialog.Trigger")} です。`;
const IMPORT_ALIASES: Record<string, string> = {
  TextField: `${tag("Field")} の中に <Input> を置いてください。`,
  TextInput: `${tag("Field")} の中に <Input> を置いてください。`,
  FormField: `${tag("Field")} を使ってください。`,
  FormItem: `${tag("Field")} を使ってください。`,
  Label: `ラベルは ${tag("Field")} の label で指定してください。`,
  Radio: `${tag("RadioGroup")} の中に ${tag("RadioGroup.Item")} を置いてください（RadioGroup を import すると使えます）。`,
  IconButton: '<Button aria-label="…"> の子要素にアイコンを置いてください。',
  Toast: "通知は toast()（関数）で出します。<Toaster /> はルートのレイアウトに 1 つ置きます。",
  useToast: "通知は toast()（関数）で出します。フックはありません。",
  Toggle: "<Switch> を使ってください。",
  Tab: `<Tabs.List> の中で ${tag("Tabs.Tab")} を使ってください（Tabs を import すると使えます）。`,
  Divider: "<Separator> を使ってください。",
  Loader: "<Spinner> を使ってください。",
  Modal: dialogAlias,
  AlertDialog: dialogAlias,
  Sheet: dialogAlias,
  DropdownMenu: `${tag("Menu")} を使ってください。開くボタンは ${tag("Menu.Trigger")} です。`,
  TooltipProvider: "Tooltip に Provider は要りません。import から外してください。",
  ...Object.fromEntries(
    ["Text", "Heading", "Title", "Paragraph", "Typography", "Stack", "HStack", "VStack", "Box", "Flex", "Grid", "Container", "Section", "Page", "Layout", "Spacer"].map((n) => [n, LAYOUT]),
  ),
};
/** Prefixes other libraries use for what yourlib names differently (`DropdownMenuItem` → Menu + Item). */
const ROOT_ALIASES: Record<string, string> = { Tab: "Tabs", DropdownMenu: "Menu", ContextMenu: "Menu", AlertDialog: "Dialog", Sheet: "Dialog", Modal: "Dialog", Collapsible: "Accordion" };
/** Part names in other libraries → the yourlib part that plays the role. */
const MEMBER_SYNONYMS: Record<string, string[]> = { Trigger: ["Tab"], Content: ["Panel"], Footer: ["Actions"] };
/** The IMPORT_ALIASES that stand for one yourlib part, whose props are checked against it (not TextField: its props split between Field and Input). */
const IMPORT_PARTS: Record<string, string> = {
  Toggle: "Switch",
  Divider: "Separator",
  Loader: "Spinner",
  IconButton: "Button",
  Radio: "RadioGroup.Item",
  Tab: "Tabs.Tab",
  Modal: "Dialog",
  AlertDialog: "Dialog",
  Sheet: "Dialog",
  DropdownMenu: "Menu",
};

/** What to write instead, and `part` when that is one yourlib part to put in the element's place. */
interface Advice {
  fix: string;
  part?: string;
}

/** What to write instead of `<root>.<rest>` (or `<root><rest>`), from the contract's parts and props. */
function memberAdvice(root: string, rest: string): Advice {
  const own = members(root);
  const use = (m: string): Advice => ({ fix: `${tag(`${root}.${m}`)} を使ってください。`, part: `${root}.${m}` });
  if (own.includes(rest)) return use(rest);
  const synonym = (MEMBER_SYNONYMS[rest] ?? []).find((m) => own.includes(m));
  if (synonym) return use(synonym);
  const props = PARTS[root]?.props ?? [];
  const titled = own.find((m) => PARTS[`${root}.${m}`].props.includes("title"));
  if (/^(Title|Header|Heading|Trigger|Summary)$/.test(rest)) {
    if (props.includes("title")) return { fix: `見出しは ${tag(root, ["title"])} の title で指定してください。` };
    if (titled) return { fix: `見出しは ${tag(`${root}.${titled}`, ["title"])} の title で指定してください。` };
  }
  if (/^(Description|Subtitle)$/.test(rest) && props.includes("description")) {
    return { fix: `説明文は ${tag(root, ["description"])} の description で指定してください。` };
  }
  if (/^(Footer|Actions)$/.test(rest) && props.includes("footer")) return { fix: `フッターは <${root} footer={…}> の footer で指定してください。` };
  if (/^(Item|Option)$/.test(rest) && PARTS[root]?.element === "select") return { fix: `選択肢は <${root}> の子要素に <option> で書いてください。` };
  if (/^(Content|Body|Panel|Main)$/.test(rest)) {
    if (titled) return { fix: `中身は ${tag(`${root}.${titled}`)} の子要素に書いてください。` };
    // `<PopoverContent align="end">` becomes the <Popover> itself, so its props go there.
    return { fix: `${tag(root)} そのものが入れ物です。中身は <${root}> の子要素に書いてください。`, part: root };
  }
  if (own.length === 0) return { fix: `<${root}> は 1 つの部品で、${rest} にあたる部品はありません。` };
  return { fix: `${root} の部品は ${[root, ...own.map((m) => `${root}.${m}`)].map((n) => tag(n)).join("・")} です。` };
}

function exportAdvice(name: string, source: string): Advice {
  const elsewhere = Object.keys(LIBRARY.modules).find((m) => m !== source && LIBRARY.modules[m].includes(name));
  if (elsewhere) return { fix: `"${elsewhere}" から import してください。` };
  if (IMPORT_ALIASES[name]) return { fix: IMPORT_ALIASES[name], part: IMPORT_PARTS[name] };
  const names = LIBRARY.modules[source] ?? [];
  const sameCase = names.find((n) => n.toLowerCase() === name.toLowerCase());
  if (sameCase) return { fix: `${sameCase} のことですか（大文字と小文字が違います）。`, part: PARTS[sameCase] ? sameCase : undefined };
  const prefix = [...ROOTS, ...Object.keys(ROOT_ALIASES)]
    .sort((a, b) => b.length - a.length)
    .find((r) => name.startsWith(r) && /^[A-Z]/.test(name.slice(r.length)));
  if (prefix) {
    const root = ROOT_ALIASES[prefix] ?? prefix;
    const advice = memberAdvice(root, name.slice(prefix.length));
    return { fix: `${advice.fix}import するのは ${root} です。`, part: advice.part };
  }
  const near = names.filter((n) => distance(n.toLowerCase(), name.toLowerCase()) <= 2);
  if (near.length) return { fix: `${near.join("・")} のことですか。`, part: near.length === 1 && PARTS[near[0]] ? near[0] : undefined };
  return { fix: `部品は ${ROOTS.join("・")} です。` };
}

/**
 * When the advice puts one part in place of the element (`DropdownMenuItem` → `<Menu.Item>`),
 * the props written on that element in this file are checked against the part as valid-props
 * would, and the same report says how to write them (replacementAdvice).
 */
const validImport: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: { description: "Report names that @yourlib/react does not export, and suggest the yourlib part to use instead." },
    schema: [],
    messages: {
      unknownName: "{{name}} は \"{{source}}\" にありません。{{fix}}",
      unknownMember: "<{{name}}> はありません。{{fix}}",
      unknownPath: "\"{{source}}\" というモジュールはありません。部品は \"" + REACT + "\" から import してください。",
      noDefault: "\"{{source}}\" には default export がありません。import { Button } from \"" + REACT + "\" のように、名前で import してください。",
    },
  },
  create(context) {
    const imported = new Map<string, string>(); // local name → exported name
    /** Names @yourlib/react does not export, reported once the file's elements are known. */
    const unknown: { spec: Node; name: string; source: string; local: string; advice: Advice }[] = [];
    /** Element name as written (`DropdownMenuItem`) → its opening elements. */
    const elements = new Map<string, Node[]>();
    return {
      ImportDeclaration(node: Node) {
        const source = node.source.value;
        if (typeof source !== "string" || (source !== REACT && !source.startsWith(`${REACT}/`))) return;
        const names = LIBRARY.modules[source];
        if (!names) {
          context.report({ node: node.source, messageId: "unknownPath", data: { source } });
          return;
        }
        for (const spec of node.specifiers) {
          if (spec.type === "ImportNamespaceSpecifier") continue;
          if (spec.type === "ImportDefaultSpecifier") {
            if (!names.includes("default")) context.report({ node: spec, messageId: "noDefault", data: { source } });
            continue;
          }
          const name = spec.imported.type === "Identifier" ? spec.imported.name : String(spec.imported.value);
          if (names.includes(name)) imported.set(spec.local.name, name);
          else unknown.push({ spec, name, source, local: spec.local.name, advice: exportAdvice(name, source) });
        }
      },
      JSXOpeningElement(node: Node) {
        const written = jsxName(node.name);
        if (written) elements.set(written, [...(elements.get(written) ?? []), node]);
        if (node.name.type !== "JSXMemberExpression" || node.name.object.type !== "JSXIdentifier") return;
        const root = imported.get(node.name.object.name);
        if (!root || !PARTS[root]) return;
        const member = node.name.property.name;
        if (PARTS[`${root}.${member}`]) return;
        const { fix, part } = memberAdvice(root, member);
        const props = part ? replacementAdvice(part, written!, [node]) : "";
        context.report({ node: node.name, messageId: "unknownMember", data: { name: written!, fix: fix + props } });
      },
      "Program:exit"() {
        for (const { spec, name, source, local, advice } of unknown) {
          const props = advice.part ? replacementAdvice(advice.part, local, elements.get(local) ?? []) : "";
          context.report({ node: spec, messageId: "unknownName", data: { name, source, fix: advice.fix + props } });
        }
      },
    };
  },
};

/** Everything a part takes: its contract props, the HTML attributes its type accepts, `key` and `ref`. */
const ACCEPTED = new Map(
  Object.entries(PARTS).map(([name, part]) => [name, new Set([...part.props, ...part.attributes, ...LIBRARY.attributes.filter((n) => !part.omits.includes(n))])]),
);

const ID_KIND: Record<string, string> = { dialog: "ダイアログ", menu: "メニュー", popover: "ポップオーバー", tooltip: "ツールチップ" };
const FIELD_CONTROLS = new Set(["Input", "Textarea", "Select"]);
const CHECKS = new Set(["Checkbox", "Switch", "RadioGroup.Item"]);
const OVERLAYS = new Set(["Popover", "Menu", "Tooltip"]);

/** What the part's own props are, for a prop that has no closer advice. */
function ownProps(name: string): string {
  const part = PARTS[name];
  if (!part.props.length) return `<${name}> に独自の props はありません。使えるのは HTML の属性だけです。`;
  const list = part.props.map((p) => (part.enums[p] ? choice(part, p) : p)).join("・");
  return `<${name}> にある props は ${list}${list.endsWith("）") ? "" : " "}です（ほかは HTML の属性）。`;
}

function openAdvice(name: string, prop: string): string | null {
  const root = name.split(".")[0];
  if (root === "Dialog") {
    if (/^(onDismiss|onEscapeKeyDown|onInteractOutside|onPointerDownOutside)$/.test(prop)) {
      return `外側のクリックや Escape で閉じるかどうかは、<Dialog> の ${choice(PARTS.Dialog, "dismissible")}で選びます。閉じたあとの処理は onClose に書きます。`;
    }
    if (prop === "modal") return "<Dialog> はいつもモーダルです。";
    return `開閉は ${tag("Dialog.Trigger")} と ${tag("Dialog.Close")} がブラウザの機能でします。open・onOpenChange と useState は要りません。閉じたあとの処理は <Dialog> の onClose に書きます。`;
  }
  if (OVERLAYS.has(root)) {
    if (/^(onDismiss|onEscapeKeyDown|onInteractOutside|onPointerDownOutside|modal)$/.test(prop) && PARTS[root].enums.mode) {
      return `外側のクリックで閉じるかどうかは、<${root}> の ${choice(PARTS[root], "mode")}で選びます。`;
    }
    return `開閉は ${tag(`${root}.Trigger`)} がブラウザの機能（popover）でします。open・onOpenChange と useState は要りません。開いたか閉じたかは <${root}> の onToggle で受け取れます（event.newState が "open" か "closed"）。`;
  }
  if (root === "Accordion") {
    return "開閉は <details> がします。最初から開いておくなら <Accordion.Item defaultOpen> を付け、開いたか閉じたかは Accordion.Item の onToggle で受け取ります。";
  }
  return null;
}

function valueAdvice(name: string): string | null {
  if (CHECKS.has(name) && name !== "RadioGroup.Item") {
    return '<input type="checkbox"> と同じく onChange で受け取り、event.currentTarget.checked を読みます（onChange={(e) => setChecked(e.currentTarget.checked)}）。';
  }
  if (FIELD_CONTROLS.has(name)) return `<${PARTS[name].element}> と同じく onChange で受け取り、event.currentTarget.value を読みます。`;
  if (name === "RadioGroup" || name === "RadioGroup.Item") {
    return "最初に選ぶ値は <RadioGroup> の defaultValue で指定します。選ばれたことは、それぞれの <RadioGroup.Item> の onChange で受け取り、event.currentTarget.value を読みます（<input type=\"radio\"> と同じ）。";
  }
  if (name === "Tabs") {
    return "タブの切り替えは部品がします。最初に選ぶタブは defaultValue で指定します。切り替わったことは、Tabs の要素に届く yl-tabs-change イベント（event.detail.value）で知ります（ref で要素を受け取り、addEventListener します）。";
  }
  if (name === "Accordion" || name === "Accordion.Item") return openAdvice(name, "value");
  if (name.startsWith("Menu")) return "項目を押したときの処理は、それぞれの <Menu.Item> の onClick に書きます。";
  return null;
}

function itemsAdvice(name: string): string | null {
  if (name === "Select") return '選択肢は子要素に <option value="…">…</option> で書きます。';
  if (name === "Tabs") return `<Tabs.List> の中に ${tag("Tabs.Tab")} を並べ、同じ value の ${tag("Tabs.Panel")} を続けます。`;
  const own = members(name);
  return own.length ? `中身は子要素に ${own.map((m) => tag(`${name}.${m}`)).join("・")} で書きます。` : null;
}

/**
 * Props from other libraries (shadcn/Radix, MUI, Chakra, React Aria) → how yourlib does
 * the same thing. Each returns null when it has nothing to say for this part.
 */
const PROP_ADVICE: [RegExp, (name: string, prop: string) => string | null][] = [
  [/^(isSelected|isChecked|selected)$/, (name) => (CHECKS.has(name) ? "オンかどうかは checked で指定します（最初の状態だけなら defaultChecked）。" : null)],
  [/^(open|defaultOpen|onOpenChange|visible|show|opened|onOpen|onDismiss|onEscapeKeyDown|onInteractOutside|onPointerDownOutside|modal)$/, openAdvice],
  [/^(onCheckedChange|onValueChange|onSelectionChange|onChangeValue|onAction|value|selectedKey|selected|activeTab)$/, (name) => valueAdvice(name)],
  [/^(defaultSelectedKey|defaultTab|initialValue)$/, (name) => (ACCEPTED.get(name)!.has("defaultValue") ? "defaultValue で指定します。" : null)],
  [/^(onPress)$/, () => "押したときの処理は onClick に書きます。"],
  [/^type$/, (name) => (name === "Accordion" ? 'type="single" にあたるのは <Accordion name="…"> です（同じ name の項目は 1 つずつしか開きません）。いくつでも開けるなら name を付けません。' : null)],
  [/^collapsible$/, (name) => (name === "Accordion" ? "collapsible は要りません。開いた項目は、見出しを押せば閉じます。" : null)],
  [/^multiple$/, (name) => (name === "Accordion" ? '項目はいくつでも開けるのが既定です。1 つずつにするなら <Accordion name="…"> にします。' : null)],
  [
    /^label$/,
    (name) => {
      if (CHECKS.has(name)) return `ラベルは子要素に書きます（<${name}>…</${name}>）。`;
      if (FIELD_CONTROLS.has(name)) return `ラベルは ${tag("Field")} で付け、その中に <${name} /> を置きます。`;
      if (name === "Tooltip") return `中身は子要素に書きます（${tag("Tooltip")}…</Tooltip>）。`;
      if (PARTS[name].element === "button") return "ボタンの文字は子要素に書きます。";
      return null;
    },
  ],
  [
    /^(error|errorMessage|errorText|invalid|isInvalid|hasError)$/,
    (name) => {
      if (FIELD_CONTROLS.has(name)) return `エラー文は ${tag("Field", ["error"])} で付けます。Field が入力欄に aria-invalid を付けます。`;
      if (name === "Field") return 'エラー文は error="…" で指定します。';
      if (PARTS[name].props.includes("invalid")) return "エラーの状態は invalid で示し、エラー文はそばに書きます。";
      return null;
    },
  ],
  [
    /^(description|helperText|helpText|hint|caption|subtitle|subTitle|subheading|subheader)$/,
    (name) => {
      if (PARTS[name].props.includes("description")) return "説明は description で指定します。";
      if (FIELD_CONTROLS.has(name)) return `説明は ${tag("Field", ["description"])} で付けます。`;
      return null;
    },
  ],
  [/^(heading|header|headline|headerTitle)$/, (name) => (PARTS[name].props.includes("title") ? "見出しは title で指定します。" : null)],
  [/^(options|items|data|tabs|choices)$/, itemsAdvice],
  [
    /^(asChild|as|component|render)$/,
    (name, prop) => {
      const part = PARTS[name];
      const look = ["variant", "size"].filter((p) => part.enums[p]);
      return (
        `${prop} はありません。<${name}> はそれ自体が <${part.element}> を描きます。` +
        (part.element === "button" ? `子要素に <Button> を入れず、${tag(name)} に直接文字を書きます。リンクにするなら <Link href="…"> を使います。` : "") +
        (look.length ? `見た目は ${look.join(" と ")} で選びます。` : "")
      );
    },
  ],
  [/^href$/, (name) => (PARTS[name].element === "button" ? '移動するなら <Link href="…"> を使います。' : null)],
  [/^(radius|rounded|corner|corners)$/, () => "角の丸みはパックが決めます。"],
  [
    /^(variant|tone|colorScheme|intent|appearance|theme|kind|severity|status|emphasis|shadow|elevation)$/,
    (name) => {
      const part = PARTS[name];
      const color = ["variant", "tone"].find((p) => part.enums[p]);
      return color ? `色や見た目は ${choice(part, color)}で選びます。` : `<${name}> の見た目はパックが決めます。${ownProps(name)}`;
    },
  ],
  [
    /^size$/,
    (name) => {
      const part = PARTS[name];
      return part.enums.padding ? `余白は ${choice(part, "padding")}で選びます。` : `<${name}> の大きさはパックが決めます。`;
    },
  ],
  [
    /^(placement|position|anchor)$/,
    (name) => {
      const part = PARTS[name];
      if (!part.enums.side) return null;
      return `位置は ${choice(part, "side")}と ${choice(part, "align")}で選びます（"bottom-start" なら side="bottom" align="start"）。`;
    },
  ],
  [/^(sideOffset|alignOffset|offset|gutter)$/, () => "トリガーとの間隔はパックが決めます。"],
  [/^(delayDuration|delay|openDelay|closeDelay|skipDelayDuration)$/, () => "表示するまでの時間は部品が決めます。"],
  [
    /^(icon|leftIcon|rightIcon|startIcon|endIcon|iconLeft|iconRight|startContent|endContent|leftSection|rightSection|prefixIcon|suffixIcon)$/,
    (name) => `アイコンは子要素に書きます（<${name}><PlusIcon aria-hidden="true" /> 追加</${name}>）。`,
  ],
  [
    /^(footer|actions|buttons)$/,
    (name) => {
      if (name === "Dialog") return `ボタンは子要素の <Dialog.Actions> の中に置きます。閉じるボタンは ${tag("Dialog.Close")} です。`;
      return PARTS[name].props.includes("footer") ? "ボタンは footer={…} に置きます。" : null;
    },
  ],
  [
    /^(showCloseButton|closeButton|hideCloseButton|withCloseButton|closable)$/,
    (name) => {
      const root = name.split(".")[0];
      return PARTS[`${root}.Close`] ? `閉じるボタンは、子要素に ${tag(`${root}.Close`)} を置きます。` : null;
    },
  ],
  [/^(fullWidth|block|stretch)$/, (name) => (PARTS[name].overrides.includes("width") ? "幅は className の w-full で変えます。" : null)],
  [/^(htmlFor|for)$/, (name) => (name === "Field" ? "入力欄との結びつけは Field が id でします。htmlFor は要りません。" : null)],
];

/** Props a part's type accepts that mean something else here than in other libraries. */
const MISLEADING: Record<string, Record<string, string>> = {
  "Menu.Item": { onSelect: "onSelect は文字を選んだときに起きるイベントで、項目を押しても呼ばれません。押したときの処理は onClick に書きます。" },
  Accordion: { defaultValue: "開く項目を選ぶ働きはありません。最初から開いておく項目には <Accordion.Item defaultOpen> を付けます。" },
};

function propAdvice(name: string, prop: string): string {
  const accepted = ACCEPTED.get(name)!;
  for (const [re, advise] of PROP_ADVICE) {
    if (!re.test(prop)) continue;
    const advice = advise(name, prop);
    if (advice) return advice;
  }
  const lower = prop.toLowerCase();
  const sameCase = [...accepted].find((n) => n.toLowerCase() === lower);
  if (sameCase) return `${sameCase} と書きます（大文字と小文字が違います）。`;
  // isDisabled → disabled, isLoading → loading, isOpen → open
  const unprefixed = /^is[A-Z]/.test(prop) ? prop[2].toLowerCase() + prop.slice(3) : null;
  if (unprefixed && accepted.has(unprefixed)) return `${unprefixed} と書きます。`;
  if (unprefixed && unprefixed !== prop) {
    const advice = PROP_ADVICE.find(([re]) => re.test(unprefixed))?.[1](name, unprefixed);
    if (advice) return advice;
  }
  // dialogId, target, controls → the idref prop (dialog, menu, …)
  const [idref] = Object.keys(PARTS[name].idrefs);
  if (idref && /^(target|targetId|controls|[a-z]+Id)$/.test(prop)) {
    return `${ID_KIND[idref] ? `開く${ID_KIND[idref]}の` : "対象の"} id は ${idref} で指定します（${tag(name)}）。`;
  }
  const own = [...PARTS[name].props, ...PARTS[name].attributes];
  const near = own.filter((n) => n.length >= 4 && distance(n.toLowerCase(), lower) <= 2);
  if (near.length) return `${near.join("・")} のことですか。${ownProps(name)}`;
  return ownProps(name);
}

/** Values from other libraries, and other spellings, → the contract's values (whichever the prop has). */
const VALUE_SYNONYMS: Record<string, string[]> = {
  destructive: ["danger"],
  error: ["danger"],
  critical: ["danger"],
  negative: ["danger"],
  red: ["danger"],
  default: ["primary", "md", "neutral", "inline", "default"],
  solid: ["primary"],
  filled: ["primary"],
  contained: ["primary"],
  brand: ["primary", "accent"],
  outline: ["secondary", "neutral"],
  outlined: ["secondary", "neutral"],
  bordered: ["secondary"],
  subtle: ["ghost", "neutral"],
  soft: ["ghost", "neutral"],
  light: ["ghost", "neutral"],
  plain: ["ghost"],
  text: ["ghost", "text"],
  link: ["ghost", "inline"],
  tertiary: ["ghost"],
  minimal: ["ghost"],
  success: ["ok"],
  positive: ["ok"],
  done: ["ok"],
  complete: ["ok"],
  green: ["ok"],
  info: ["accent"],
  primary: ["accent"],
  blue: ["accent"],
  secondary: ["neutral"],
  muted: ["neutral"],
  gray: ["neutral"],
  grey: ["neutral"],
  xs: ["sm"],
  small: ["sm"],
  medium: ["md"],
  base: ["md"],
  normal: ["md"],
  large: ["lg"],
  xl: ["lg"],
  none: ["sm"],
  middle: ["center"],
  bottom: ["bottom-center", "bottom"],
  row: ["horizontal"],
  column: ["vertical"],
  rect: ["block"],
  rectangle: ["block"],
  square: ["block"],
  rectangular: ["block"],
  circular: ["circle"],
  round: ["circle"],
  avatar: ["circle"],
  line: ["text"],
  true: ["any"],
  false: ["none"],
};

/** A value the contract has, close to one it does not have. */
function nearValue(value: string | number | boolean, values: string[]): string | null {
  const text = String(value);
  if (typeof value === "number" && values.includes(`h${value}`)) return `h${value}`;
  const lower = text.toLowerCase();
  const found =
    values.find((v) => v.toLowerCase() === lower) ??
    (VALUE_SYNONYMS[lower] ?? []).find((v) => values.includes(v)) ??
    values.find((v) => v === lower.replace(/\bleft\b/g, "start").replace(/\bright\b/g, "end")) ??
    (typeof value === "string" && lower.length > 2 ? values.find((v) => distance(v, lower) <= 2) : undefined);
  return found ?? null;
}

/** The values an attribute can take that are known without running it: `"x"`, `{a ? "x" : "y"}`, `{2}`; a bare attribute is `true`. */
function staticValues(value: Node): (string | number | boolean)[] {
  if (value === null) return [true];
  if (value.type === "JSXExpressionContainer") return staticValues(value.expression);
  switch (value.type) {
    case "Literal":
      return ["string", "number", "boolean"].includes(typeof value.value) ? [value.value] : [];
    case "TemplateLiteral":
      return value.expressions.length === 0 ? [value.quasis[0].value.cooked] : [];
    case "ConditionalExpression":
      return [...staticValues(value.consequent), ...staticValues(value.alternate)];
    case "LogicalExpression":
      return staticValues(value.right);
    case "TSAsExpression":
    case "TSSatisfiesExpression":
      return staticValues(value.expression);
  }
  return [];
}

/** Is a module specifier another package (`@radix-ui/react-dialog`), rather than yourlib or a path (`./ui/button`, `@/components/ui/button`)? */
function otherPackage(source: string): boolean {
  return source !== REACT && !source.startsWith(`${REACT}/`) && !/^(\.|\/|@\/|~\/|#)/.test(source);
}

const PROP_MESSAGES = {
  unknownProp: "<{{component}}> に {{prop}} という props はありません。{{fix}}",
  unknownValue: "<{{component}}> の {{prop}} に {{value}} はありません。{{prop}} は {{values}} のどれかです。{{near}}",
  misleading: "<{{component}}> の {{prop}} は使えません。{{fix}}",
  noChildren: "<{{component}}> は子要素を取りません。{{fix}}",
};
const NO_CHILDREN_FIX: Record<string, string> = {
  Spinner: '読み上げる文は label で指定します（<Spinner label="読み込み中" />）。',
  Toaster: "通知は toast()（関数）で出します。",
};

interface PropProblem {
  node: Node;
  messageId: keyof typeof PROP_MESSAGES;
  data: Record<string, string>;
}

/** What valid-props reports on one element of the part `name`, written as `<written>` (an alias or a namespace member). */
function propProblems(name: string, written: string, opening: Node): PropProblem[] {
  const part = PARTS[name];
  const accepted = ACCEPTED.get(name)!;
  const out: PropProblem[] = [];
  for (const a of opening.attributes) {
    if (a.type !== "JSXAttribute" || a.name.type !== "JSXIdentifier") continue;
    const prop: string = a.name.name;
    if (prop.includes("-")) continue; // aria-* and data-*: TypeScript does not check these either
    const misleading = MISLEADING[name]?.[prop];
    if (misleading) {
      out.push({ node: a, messageId: "misleading", data: { component: written, prop, fix: misleading } });
    } else if (!accepted.has(prop)) {
      out.push({ node: a, messageId: "unknownProp", data: { component: written, prop, fix: propAdvice(name, prop) } });
    } else if (part.enums[prop]) {
      const values = part.enums[prop];
      for (const value of staticValues(a.value)) {
        if (typeof value === "string" && values.includes(value)) continue;
        const near = nearValue(value, values);
        out.push({
          node: a,
          messageId: "unknownValue",
          data: {
            component: written,
            prop,
            value: typeof value === "string" ? `"${value}"` : `{${value}}`,
            values: values.map((v) => `"${v}"`).join(" | "),
            near: near ? `${prop}="${near}" のことですか。` : "",
          },
        });
      }
    }
  }
  const children = opening.parent.children ?? [];
  const hasChildren = children.some((c: Node) => c.type !== "JSXText" || c.value.trim() !== "");
  if (part.omits.includes("children") && hasChildren) {
    out.push({ node: opening, messageId: "noChildren", data: { component: written, fix: NO_CHILDREN_FIX[name] ?? "" } });
  }
  return out;
}

/**
 * The props written on `<written>` (a name yourlib does not have), checked as the part that
 * replaces it, so that following valid-import's advice does not keep a prop that does not
 * work there: `<DropdownMenuItem onSelect>` → `<Menu.Item>`, where onSelect is never called.
 */
function replacementAdvice(part: string, written: string, openings: Node[]): string {
  const problems = new Set<string>();
  for (const opening of openings) {
    for (const { messageId, data } of propProblems(part, part, opening)) {
      problems.add(PROP_MESSAGES[messageId].replace(/\{\{(\w+)\}\}/g, (_, key: string) => data[key]));
    }
  }
  return problems.size ? `<${written}> に書いた props も直してください。${[...problems].join("")}` : "";
}

/**
 * Checks each prop of a yourlib part against what its type accepts (the contract's props
 * and the HTML attributes of the element it renders, from contracts.generated.json), and
 * enum values against the contract. Names other libraries use (`onOpenChange`,
 * `onCheckedChange`, `asChild`, `items`) get the yourlib way of doing the same thing.
 *
 * A name imported from another package, or declared in the file, is not a yourlib part
 * and is skipped. A name imported from a path counts as the part when the file is named
 * after its contract (`@/components/ui/button` — a component installed by `yourlib add`).
 */
const validProps: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: { description: "Report props a yourlib part does not take and values its contract does not list, with the yourlib way to write them." },
    schema: [],
    messages: PROP_MESSAGES,
  },
  create(context) {
    /** Local name → the yourlib name it stands for; null for another package's or the file's own; "*" for a namespace import. */
    const bound = new Map<string, string | null>();
    return {
      Program(program: Node) {
        for (const statement of program.body) {
          const exported = statement.type === "ExportNamedDeclaration" || statement.type === "ExportDefaultDeclaration";
          const s = exported && statement.declaration ? statement.declaration : statement;
          if (s.type === "ImportDeclaration") {
            const source = String(s.source.value);
            const base = source.split("/").pop()!.replace(/\.[jt]sx?$/, "");
            for (const spec of s.specifiers) {
              if (spec.type === "ImportNamespaceSpecifier") bound.set(spec.local.name, otherPackage(source) ? null : "*");
              else if (spec.type === "ImportDefaultSpecifier") bound.set(spec.local.name, null);
              else {
                const name = spec.imported.type === "Identifier" ? spec.imported.name : String(spec.imported.value);
                const yours = source === REACT || source.startsWith(`${REACT}/`) || (!otherPackage(source) && PARTS[name]?.contract === base);
                bound.set(spec.local.name, yours ? name : null);
              }
            }
          } else if ((s.type === "FunctionDeclaration" || s.type === "ClassDeclaration") && s.id) {
            bound.set(s.id.name, null);
          } else if (s.type === "VariableDeclaration") {
            for (const d of s.declarations) if (d.id.type === "Identifier") bound.set(d.id.name, null);
          }
        }
      },
      JSXOpeningElement(node: Node) {
        const written = jsxName(node.name);
        if (!written) return;
        const [first, ...rest] = written.split(".");
        const target = bound.has(first) ? bound.get(first) : first;
        if (target === null || target === undefined) return;
        const name = target === "*" ? rest.join(".") : [target, ...rest].join(".");
        if (!PARTS[name]) return;
        for (const problem of propProblems(name, written, node)) context.report(problem);
      },
    };
  },
};

const plugin = {
  meta: { name: "@yourlib/eslint-plugin", version: "0.1.0" },
  rules: {
    "no-visual-override": noVisualOverride,
    "no-raw-color": noRawColor,
    "valid-idref": validIdref,
    "required-props": requiredProps,
    "accessible-name": accessibleName,
    "prefer-native": preferNative,
    "tabs-match": tabsMatch,
    "valid-token": validToken,
    "valid-import": validImport,
    "valid-props": validProps,
  },
  configs: {} as Record<string, Linter.Config>,
} satisfies ESLint.Plugin;

plugin.configs.recommended = {
  plugins: { yourlib: plugin },
  rules: {
    "yourlib/no-visual-override": "error",
    "yourlib/no-raw-color": "error",
    "yourlib/valid-idref": "warn",
    "yourlib/required-props": "error",
    "yourlib/accessible-name": "error",
    "yourlib/prefer-native": "warn",
    "yourlib/tabs-match": "error",
    "yourlib/valid-token": "error",
    "yourlib/valid-import": "error",
    "yourlib/valid-props": "error",
  },
};

export default plugin;
