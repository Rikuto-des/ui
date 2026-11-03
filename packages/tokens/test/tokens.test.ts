import assert from "node:assert/strict";
import { test } from "node:test";
import { declarations, packCss } from "../src/index.ts";

const srgb = (hex: string, alpha?: number) => {
  const h = hex.slice(1);
  return { colorSpace: "srgb", components: [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255), hex, ...(alpha ? { alpha } : {}) };
};

test("colors with a dark value become light-dark()", () => {
  const [decl] = declarations({ color: { $type: "color", bg: { $value: srgb("#f3f3f1"), $extensions: { "dev.urushi.dark": srgb("#151517") } } } });
  assert.equal(decl, "--ur-color-bg: light-dark(#f3f3f1, #151517);");
});

test("aliases resolve to custom properties and alpha colors to rgb()", () => {
  const out = declarations({
    color: { $type: "color", text: { $value: srgb("#1c1c1f") }, "on-secondary": { $value: "{color.text}" }, line: { $value: srgb("#1c1c1f", 0.08) } },
  });
  assert.deepEqual(out, ["--ur-color-text: #1c1c1f;", "--ur-color-on-secondary: var(--ur-color-text);", "--ur-color-line: rgb(28 28 31 / 0.08);"]);
});

test("a dark shadow keeps the light geometry and switches only its colors", () => {
  const layer = (hex: string, alpha: number) => ({
    color: srgb(hex, alpha),
    offsetX: { value: 0, unit: "px" },
    offsetY: { value: 1, unit: "px" },
    blur: { value: 2, unit: "px" },
    spread: { value: 0, unit: "px" },
  });
  const [decl] = declarations({ shadow: { $type: "shadow", panel: { $value: [layer("#000000", 0.1)], $extensions: { "dev.urushi.dark": [layer("#ffffff", 0.2)] } } } });
  assert.equal(decl, "--ur-shadow-panel: 0px 1px 2px 0px light-dark(rgb(0 0 0 / 0.1), rgb(255 255 255 / 0.2));");
});

test("packCss scopes a pack and adds the reduced-motion overrides", () => {
  const css = packCss("lucent", { radius: { $type: "dimension", control: { $value: { value: 12, unit: "px" } } } });
  assert.match(css, /\[data-pack="lucent"\] \{\n  --ur-radius-control: 12px;\n\}/);
  assert.match(css, /prefers-reduced-motion: reduce[\s\S]*--ur-motion-enter-scale: 1;/);
});

test("pack colors keep form boundaries, focus and selection marks distinguishable", async () => {
  const { readFile } = await import("node:fs/promises");
  type Color = { components: number[]; alpha?: number };
  const luminance = (c: number[]) => c.map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4).reduce((n,v,i) => n + v * [0.2126,0.7152,0.0722][i]!,0);
  const ratio = (a: Color,b: Color) => { const over = a.components.map((v,i) => v * (a.alpha ?? 1) + b.components[i]! * (1-(a.alpha ?? 1)));const values=[luminance(over),luminance(b.components)].sort((x,y)=>x-y);return (values[1]!+.05)/(values[0]!+.05); };
  for (const pack of ["graphite","lucent"]) {
    const tokens = JSON.parse(await readFile(new URL(`../../packs/${pack}/tokens.json`,import.meta.url),'utf8'));
    for (const theme of ['light','dark']) {
      const color = (name:string): Color => theme === 'dark' ? tokens.color[name].$extensions?.['dev.urushi.dark'] ?? tokens.color[name].$value : tokens.color[name].$value;
      for (const surface of ['bg','field','surface','surface-overlay']) for (const cue of ['border-field','focus-ring']) assert.ok(ratio(color(cue),color(surface)) >= 3, `${pack}/${theme}: ${cue} on ${surface}`);
      assert.ok(ratio(color('on-action'),color('accent')) >= 3,`${pack}/${theme}: selection mark`);
      assert.ok(ratio(color('text-subtle'),color('field')) >= 4.5,`${pack}/${theme}: placeholder text`);
    }
  }
});
