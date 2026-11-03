/**
 * Serves a static export (default: apps/site/out) for previews and tests.
 *   node scripts/serve-static.ts [dir] [port]
 * Directories resolve to their index.html; unknown paths get 404.html.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(process.argv[2] ?? "apps/site/out");
const port = Number(process.argv[3] ?? 3200);
const types: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

async function file(path: string): Promise<string | null> {
  try {
    const s = await stat(path);
    if (s.isDirectory()) return file(join(path, "index.html"));
    return path;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  // Stay inside the root whatever the path says.
  const path = normalize(join(root, decodeURIComponent(url.pathname)));
  if (!path.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  const found = await file(path);
  const target = found ?? join(root, "404.html");
  try {
    const body = await readFile(target);
    res.writeHead(found ? 200 : 404, { "content-type": types[extname(target)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
}).listen(port, () => console.log(`serving ${root} on http://localhost:${port}`));
