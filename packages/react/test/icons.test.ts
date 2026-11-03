import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { build } from "esbuild";
import { register } from "tsx/esm/api";
register();
const { CheckIcon, BookmarkSimpleIcon } = await import("../src/icons.tsx");

test("decorative icons stay out of control names; labelled icons expose an image", () => {
  const decorative = renderToStaticMarkup(h(CheckIcon, { size: 16 }));
  assert.match(decorative, /aria-hidden="true"/);
  assert.match(decorative, /focusable="false"/);
  assert.match(decorative, /width="16" height="16"/);
  assert.doesNotMatch(decorative, /role="img"/);
  const labelled = renderToStaticMarkup(h(CheckIcon, { "aria-label": "Complete" }));
  assert.match(labelled, /role="img"/);
  assert.match(labelled, /aria-label="Complete"/);
  assert.doesNotMatch(labelled, /aria-hidden/);
  assert.doesNotMatch(renderToStaticMarkup(h(CheckIcon, { "aria-labelledby": "status" })), /aria-hidden/);
});

test("regular and selected icons retain the same view box and inherited color", () => {
  const regular = renderToStaticMarkup(h(BookmarkSimpleIcon, { size: 24 }));
  const fill = renderToStaticMarkup(h(BookmarkSimpleIcon, { size: 24, weight: "fill" }));
  for (const markup of [regular, fill]) {
    assert.match(markup, /viewBox="0 0 256 256"/);
    assert.match(markup, /fill="currentColor"/);
    assert.match(markup, /width="24" height="24"/);
  }
  assert.notEqual(regular.match(/ d="([^"]+)"/)?.[1], fill.match(/ d="([^"]+)"/)?.[1]);
});

test("individual icon imports exclude the rest of the catalog and external icon runtimes", async () => {
  const result = await build({
    stdin: { contents: 'export { CheckIcon } from "@urushi/react/icons";', resolveDir: process.cwd(), loader: "tsx" },
    bundle: true, write: false, format: "esm", jsx: "automatic", minify: true,
    external: ["react", "react/jsx-runtime"], metafile: true,
  });
  const code = result.outputFiles[0].text;
  assert.match(code, /data-phosphor.*check/);
  assert.doesNotMatch(code, /bookmark-simple|calendar-blank|cloud-arrow-up/);
  const external = Object.values(result.metafile!.outputs).flatMap(output => output.imports.filter(x => x.external).map(x => x.path));
  assert.ok(external.every(path => path === "react" || path === "react/jsx-runtime"));
});
