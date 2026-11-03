/**
 * Renders the design-system previews the way the published page frames them:
 * a compiled tokens.css (approximating the page's compiler) + bundle.css, with
 * <html data-theme="…">. Writes screenshots to dist/ds-check/.
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const root = join(import.meta.dirname, "..");
const ds = join(root, "dist/design-system/project");
const outDir = join(root, "dist/ds-check");
await mkdir(outDir, { recursive: true });
const tokens = JSON.parse(await readFile(join(ds, "tokens.json"), "utf8"));
const themes: string[] = tokens.color.themes.map((t: { id: string }) => t.id);
const v = (val: string) => val.replace(/^\{(.+)\}$/, "var(--$1)");
const block = (theme: string, first: boolean) => {
  const decl: string[] = [];
  for (const t of [...tokens.color.tokens, ...tokens.shadow.tokens]) {
    const val = typeof t.value === "string" ? t.value : (t.value[theme] ?? t.value[themes[0]]);
    decl.push(`--${t.name}: ${v(val)};`);
  }
  return `${first ? `:root, ` : ""}[data-theme="${theme}"] { ${decl.join(" ")} }`;
};
const rootDecl: string[] = [];
for (const fam of ["spacing", "radius", "control", "material"]) for (const t of tokens[fam].tokens) rootDecl.push(`--${t.name}: ${t.value};`);
for (const [k, s] of Object.entries(tokens.type.families)) rootDecl.push(`--font-${k}: ${s};`);
const tokensCss = [themes.map((t, i) => block(t, i === 0)).join("\n"), `:root { ${rootDecl.join(" ")} }`].join("\n");
const bundleCss = await readFile(join(ds, "components/bundle.css"), "utf8");
const fonts = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap">`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 960, height: 400 }, deviceScaleFactor: 2 });
const comps = (await readdir(join(ds, "components"), { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name);
const errors: string[] = [];
page.on("pageerror", (e) => errors.push(e.message));
for (const comp of comps) {
  const html = await readFile(join(ds, `components/${comp}/preview.html`), "utf8");
  for (const theme of themes) {
    const doc = html
      .replace("<html", `<html data-theme="${theme}"`)
      .replace("<head>", `<head>${fonts}<style>${tokensCss}</style><style>${bundleCss}</style>`);
    const file = join(outDir, `${comp}-${theme}.html`);
    await writeFile(file, doc);
    await page.goto(`file://${file}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const h = Number(/height=(\d+)/.exec(html)?.[1] ?? 200);
    await page.setViewportSize({ width: 960, height: h });
    // An open dialog or popover must hold its own content (no clipped or spilling rows).
    const spilled = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("dialog[open], [popover]:popover-open")]
        .filter((el) => el.scrollHeight > el.clientHeight + 1)
        .map((el) => el.id || el.tagName),
    );
    for (const id of spilled) errors.push(`${comp} (${theme}): #${id} is shorter than its content`);
    await page.screenshot({ path: join(outDir, `${comp}-${theme}.png`) });
  }
}
await browser.close();
if (errors.length) throw new Error(`preview script errors:\n${errors.join("\n")}`);
console.log(`ok: ${comps.length} previews × ${themes.length} themes`);
