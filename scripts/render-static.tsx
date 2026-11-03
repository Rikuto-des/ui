/**
 * Renders the playground pages to plain HTML with no scripts at all, to prove
 * the components work with JavaScript disabled.
 * Output: apps/playground/public/static/{index.html,components.html,styles.css}
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Gallery } from "../apps/playground/src/Gallery.tsx";
import { Showcase } from "../apps/playground/src/Showcase.tsx";

const root = join(import.meta.dirname, "..");
const out = join(root, "apps/playground/public/static");

const css = (
  await Promise.all(
    [
      "packages/react/styles/index.css",
      "packages/packs/generated/all.css",
      "apps/playground/src/app.css",
      "apps/playground/src/gallery.css",
    ].map((p) => readFile(join(root, p), "utf8")),
  )
).join("\n");

function page(title: string, tree: ReactNode) {
  return `<!doctype html>
<html lang="ja" data-pack="graphite">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap">
<link rel="stylesheet" href="./styles.css">
</head>
<body>
${renderToStaticMarkup(tree)}
</body>
</html>
`;
}

const pages = {
  "index.html": page("Urushi — no JavaScript", <Showcase />),
  "components.html": page(
    "Urushi コンポーネント — no JavaScript",
    <Gallery toastDemo={<p className="g-prose">トーストはスクリプトから呼び出すコンポーネントなので、この静的ページでは表示しません。</p>} />,
  ),
};

await mkdir(out, { recursive: true });
await writeFile(join(out, "styles.css"), css);
for (const [name, html] of Object.entries(pages)) {
  await writeFile(join(out, name), html);
  console.log(`wrote apps/playground/public/static/${name} (${html.length} bytes, 0 scripts)`);
}
