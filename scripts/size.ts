/**
 * Measures minified + gzipped JavaScript (and the CSS) of yourlib and, when a
 * bench directory is given, the same component sets in other libraries.
 *   node scripts/size.ts [benchDir]
 * React itself is external in every case. In a Server Components app the
 * yourlib components ship no JavaScript at all; these numbers are for
 * client-rendered apps.
 */
import { readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { join } from "node:path";
import { build } from "esbuild";

const external = ["react", "react-dom", "react/jsx-runtime", "react-dom/client"];

async function measure(label: string, opts: { stdin?: string; entry?: string; nodePaths?: string[]; resolveDir?: string }) {
  const result = await build({
    ...(opts.entry
      ? { entryPoints: [opts.entry] }
      : { stdin: { contents: opts.stdin!, loader: "tsx", resolveDir: opts.resolveDir ?? process.cwd() } }),
    bundle: true,
    minify: true,
    format: "esm",
    write: false,
    jsx: "automatic",
    external,
    nodePaths: opts.nodePaths,
    define: { "process.env.NODE_ENV": '"production"' },
    logLevel: "silent",
  });
  const code = result.outputFiles[0].contents;
  return { label, min: code.byteLength, gzip: gzipSync(code).byteLength };
}

const KIT = "Dialog, Popover, Menu, Select, Tabs, Tooltip";
const rows = [
  await measure("yourlib: Button + Dialog + Popover", {
    stdin: `export { Button, Dialog, Popover } from "@yourlib/react";`,
  }),
  await measure(`yourlib: ${KIT} + runtime`, {
    stdin: `export { ${KIT} } from "@yourlib/react";\nexport { YourlibRuntime } from "@yourlib/react/runtime";`,
  }),
  await measure("yourlib: all 21 components", { stdin: `export * from "@yourlib/react";` }),
  await measure("yourlib: runtime (all behaviors)", { stdin: `export { YourlibRuntime } from "@yourlib/react/runtime";` }),
  await measure("  runtime: menu keyboard", { stdin: `export { installMenus } from "./menu.ts";`, resolveDir: "packages/core/src" }),
  await measure("  runtime: tabs", { stdin: `export { installTabs } from "./tabs.ts";`, resolveDir: "packages/core/src" }),
  await measure("  runtime: tooltip fallback", { stdin: `export { installTooltips } from "./tooltip.ts";`, resolveDir: "packages/core/src" }),
  await measure("  runtime: toast()", { stdin: `export { toast, installToasts } from "./toast.ts";`, resolveDir: "packages/core/src" }),
];

const bench = process.argv[2];
if (bench) {
  const nodePaths = [join(bench, "bench/node_modules")];
  rows.push(await measure("Radix (radix-ui): Dialog + Popover", { entry: join(bench, "benchsrc/radix-dp.jsx"), nodePaths }));
  rows.push(await measure("Base UI: Dialog + Popover", { entry: join(bench, "benchsrc/base-dp.jsx"), nodePaths }));
  for (const [name, file] of [
    ["Radix (radix-ui)", "radix-kit"],
    ["Base UI", "base-kit"],
    ["Ark UI", "ark-kit"],
    ["React Aria Components", "rac-kit"],
  ]) {
    rows.push(await measure(`${name}: ${KIT}`, { entry: join(bench, `benchsrc/${file}.jsx`), nodePaths }));
  }
}

for (const r of rows) {
  console.log(`${r.label.padEnd(64)} ${(r.min / 1024).toFixed(1).padStart(6)} KB min  ${(r.gzip / 1024).toFixed(2).padStart(6)} KB gzip`);
}

// CSS: the component styles and both packs, minified like the JavaScript.
for (const [label, path] of [
  ["CSS: component styles", "packages/react/styles/index.css"],
  ["CSS: Graphite pack", "packages/packs/generated/graphite.css"],
  ["CSS: Graphite + Lucent", "packages/packs/generated/all.css"],
]) {
  const { outputFiles } = await build({
    stdin: { contents: await readFile(path, "utf8"), loader: "css" },
    minify: true,
    write: false,
    logLevel: "silent",
  });
  const code = outputFiles[0].contents;
  console.log(`${label.padEnd(64)} ${(code.byteLength / 1024).toFixed(1).padStart(6)} KB min  ${(gzipSync(code).byteLength / 1024).toFixed(2).padStart(6)} KB gzip`);
}
