import assert from "node:assert/strict";
import { test } from "node:test";
import { declarations, packCss } from "../src/index.ts";

const srgb = (hex: string, alpha?: number) => {
  const h = hex.slice(1);
  return { colorSpace: "srgb", components: [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255), hex, ...(alpha ? { alpha } : {}) };
};

test("colors with a dark value become light-dark()", () => {
  const [decl] = declarations({ color: { $type: "color", bg: { $value: srgb("#f3f3f1"), $extensions: { "dev.yourlib.dark": srgb("#151517") } } } });
  assert.equal(decl, "--yl-color-bg: light-dark(#f3f3f1, #151517);");
});

test("aliases resolve to custom properties and alpha colors to rgb()", () => {
  const out = declarations({
    color: { $type: "color", text: { $value: srgb("#1c1c1f") }, "on-secondary": { $value: "{color.text}" }, line: { $value: srgb("#1c1c1f", 0.08) } },
  });
  assert.deepEqual(out, ["--yl-color-text: #1c1c1f;", "--yl-color-on-secondary: var(--yl-color-text);", "--yl-color-line: rgb(28 28 31 / 0.08);"]);
});

test("a dark shadow keeps the light geometry and switches only its colors", () => {
  const layer = (hex: string, alpha: number) => ({
    color: srgb(hex, alpha),
    offsetX: { value: 0, unit: "px" },
    offsetY: { value: 1, unit: "px" },
    blur: { value: 2, unit: "px" },
    spread: { value: 0, unit: "px" },
  });
  const [decl] = declarations({ shadow: { $type: "shadow", panel: { $value: [layer("#000000", 0.1)], $extensions: { "dev.yourlib.dark": [layer("#ffffff", 0.2)] } } } });
  assert.equal(decl, "--yl-shadow-panel: 0px 1px 2px 0px light-dark(rgb(0 0 0 / 0.1), rgb(255 255 255 / 0.2));");
});

test("packCss scopes a pack and adds the reduced-motion overrides", () => {
  const css = packCss("lucent", { radius: { $type: "dimension", control: { $value: { value: 12, unit: "px" } } } });
  assert.match(css, /\[data-pack="lucent"\] \{\n  --yl-radius-control: 12px;\n\}/);
  assert.match(css, /prefers-reduced-motion: reduce[\s\S]*--yl-motion-enter-scale: 1;/);
});
