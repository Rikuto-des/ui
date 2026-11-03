/** Replay an actual model repair through the public CLI, without another AI request. */
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, join, extname, sep } from "node:path";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";

const root = resolve(import.meta.dirname, "../..");
const fixture = join(root, "evals/competition/runs/product-luna-v1");
const out = join(import.meta.dirname, "review/ai-replay");
await mkdir(out, { recursive: true });
const scenario = {
  version: 1, name: "Escape restores focus after editing another project",
  steps: [
    { action: "click", target: { role: "button", name: "Edit Beacon" } },
    { action: "fill", target: { role: "textbox", name: "Project name" }, value: "Discard" },
    { action: "press", target: { role: "textbox", name: "Project name" }, key: "Escape" },
    { action: "expect", target: { role: "dialog", name: "Edit project" }, visible: false },
    { action: "expect", target: { role: "button", name: "Edit Beacon" }, focused: true },
  ],
};
const scenarioPath = join(out, "scenario.json");
await writeFile(scenarioPath, JSON.stringify(scenario, null, 2) + "\n");
const rows = [
  { id: "p1", name: "Atlas", status: "active", owner: "Mika", archived: false },
  { id: "p2", name: "Beacon", status: "done", owner: "Kai", archived: false },
  { id: "p3", name: "Cedar", status: "active", owner: "Alex", archived: false },
  { id: "p4", name: "Delta", status: "done", owner: "Ren", archived: true },
];
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url!, "http://localhost").pathname);
    if (pathname === "/api/projects" && req.method === "GET") {
      res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(rows));
      return;
    }
    if (req.method !== "GET") { res.writeHead(405).end(); return; }
    const path = resolve(fixture, "." + pathname, ...(pathname.endsWith("/") ? ["index.html"] : []));
    if (!path.startsWith(fixture + sep)) { res.writeHead(403).end(); return; }
    const body = await readFile(path);
    const type = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" }[extname(path)] ?? "application/octet-stream";
    res.writeHead(200, { "content-type": type }).end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise<void>(resolve => server.listen(4490, "127.0.0.1", resolve));
const records = [];
try {
  for (const stage of ["update", "update-repair"]) {
    const url = `http://127.0.0.1:4490/radix-dialog-2/${stage}/dist/`;
    const destination = join(out, stage);
    const exitCode = await new Promise<number | null>((done, reject) => {
      const child = spawn(process.execPath, ["packages/cli/src/bin.ts", "verify", "--url", url, "--scenario", scenarioPath, "--out", destination, "--json"], { cwd: root, stdio: ["ignore", "pipe", "inherit"] });
      let stdout = "";
      child.stdout.on("data", chunk => stdout += chunk);
      child.on("error", reject);
      child.on("close", async code => { await writeFile(join(out, stage + ".log"), stdout); done(code); });
    });
    const report = JSON.parse(await readFile(join(destination, "report.json"), "utf8"));
    const code = await readFile(join(fixture, "radix-dialog-2", stage, "App.tsx"));
    records.push({ stage, status: report.status, exitCode, sourceSha256: createHash("sha256").update(code).digest("hex"), report: join(destination, "report.json") });
  }
  const result = { model: "gpt-6-luna", library: "radix", sample: "radix-dialog-2", newModelRequests: 0, repairDiagnostics: "Original common Playwright harness; CLI independently replays the recorded model correction.", scenarioUnchanged: true, records };
  await writeFile(join(out, "result.json"), JSON.stringify(result, null, 2) + "\n");
  if (records[0].status !== "fail" || records[1].status !== "pass") throw Error("Expected recorded failure then successful AI repair");
  console.log(JSON.stringify(result, null, 2));
} finally { server.close(); }
