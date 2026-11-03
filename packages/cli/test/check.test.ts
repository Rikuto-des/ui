import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test, type TestContext } from "node:test";
import { check } from "../src/check.ts";
import { context, describe } from "../src/catalog.ts";

const root = resolve(import.meta.dirname, "../../..");
async function project(t: TestContext, source: string) {
  const cwd = await mkdtemp(join(tmpdir(), "urushi-check-"));
  t.after(() => rm(cwd, { recursive: true, force: true }));
  await symlink(join(root, "node_modules"), join(cwd, "node_modules"));
  await writeFile(join(cwd, "tsconfig.json"), JSON.stringify({
    compilerOptions: { strict: true, noEmit: true, skipLibCheck: true, jsx: "react-jsx", module: "ESNext", moduleResolution: "Bundler", allowImportingTsExtensions: true },
    include: ["screen.tsx"],
  }));
  await writeFile(join(cwd, "screen.tsx"), source);
  return cwd;
}

test("describe returns the same contract as the generated schema, including part queries", async () => {
  const schema = JSON.parse(await readFile(join(root, "generated/schema/dialog.json"), "utf8"));
  assert.deepEqual(describe("dialog"), schema);
  assert.deepEqual(describe("Dialog.Trigger"), schema);
  assert.throws(() => describe("DialogContent"), /Unknown component/);
});

test("context includes authoring rules and real tokens, and deduplicates parts of one component", () => {
  const result = context(["tabs", "Tabs.Activate", "button"]);
  assert.deepEqual(result.contracts.map((c) => c.name), ["tabs", "button"]);
  assert.ok(result.instructions.includes("No Tailwind palette colors"));
  assert.ok(result.tokens.some((t) => t.name === "--ur-color-border"));
  assert.ok(result.contracts[0].parts.some((p) => p.jsx === "Tabs.Activate"));
  assert.throws(() => context([]), /at least one/);
  assert.throws(() => context(["imaginary"]), /Unknown component/);
});

test("compact context retains complete contracts and real authoring tokens with less payload", () => {
  const full = context(['navigation-menu']);
  const compact = context(['navigation-menu'], {compact:true});
  assert.deepEqual(compact.contracts, full.contracts);
  assert.equal(compact.instructions, full.instructions);
  assert.ok(compact.tokens.every(t => full.tokens.some(token => token.name === t.name)));
  for (const name of full.contracts[0].tokens) assert.ok(compact.tokens.some(t => t.name === '--ur-' + name.replaceAll('.', '-')));
  assert.ok(JSON.stringify(compact).length < JSON.stringify(full).length * .85);
  assert.ok(!compact.tokens.some(t => t.group === 'dialog'));
});

test("check returns locations, repair advice and exact contracts, then passes corrected code", async (t) => {
  const cwd = await project(t, `import { Button, Dialog } from "@urushi/react";
export default function Screen() { return <><Button variant="destructive" className="rounded-xl">削除</Button><Dialog id="confirm" /></>; }`);
  const before = await check(cwd);
  assert.equal(before.status, "fail");
  assert.ok(before.issues.some((i) => i.code === "urushi/valid-props" && i.message.includes("danger")));
  assert.ok(before.issues.some((i) => i.code === "urushi/required-props" && i.message.includes("title")));
  assert.ok(before.issues.some((i) => i.source === "typescript"));
  assert.ok(before.issues.every((i) => i.file === "screen.tsx" && i.line && i.column));
  assert.ok(before.contracts.some((c) => c.name === "button"));
  assert.ok(before.contracts.some((c) => c.name === "dialog"));
  await writeFile(join(cwd, "screen.tsx"), `import { Button, Dialog } from "@urushi/react";
export default function Screen() { return <><Button variant="danger">削除</Button><Dialog id="confirm" title="削除しますか？" /></>; }`);
  const after = await check(cwd);
  assert.equal(after.status, "pass");
  assert.deepEqual(after.issues, []);
  assert.equal(after.summary.lintedFiles, 1);
  assert.equal(after.summary.typechecked, true);
  assert.ok(after.notChecked.includes("browser interaction"));
});

test("check cannot be silenced by application ESLint settings or disable comments", async (t) => {
  const cwd = await project(t, `/* eslint-disable */
import { Button } from "@urushi/react";
export default function Screen() { return <Button variant="destructive">削除</Button>; }`);
  await writeFile(join(cwd, "eslint.config.js"), 'throw new Error("must not execute project config");');
  const result = await check(cwd);
  assert.equal(result.status, "fail");
  assert.ok(result.issues.some((i) => i.code === "urushi/valid-props"));
});

test("check fails on a missing or empty project instead of returning a false pass", async (t) => {
  const cwd = await project(t, "export {};");
  const missing = await check(cwd, { project: "missing.json" });
  assert.equal(missing.status, "fail");
  assert.equal(missing.summary.typechecked, false);
  await rm(join(cwd, "screen.tsx"));
  const empty = await check(cwd);
  assert.equal(empty.status, "fail");
  assert.equal(empty.summary.lintedFiles, 0);
});

test("check --json has a machine-readable result and a failing process exit code", async (t) => {
  const cwd = await project(t, 'import { Button } from "@urushi/react"; export const bad = <Button variant="invented" />;');
  const run = spawnSync(process.execPath, [join(root, "packages/cli/src/bin.ts"), "check", "--cwd", cwd, "--json"], { encoding: "utf8" });
  assert.equal(run.status, 1, run.stderr);
  const report = JSON.parse(run.stdout);
  assert.equal(report.schemaVersion, 1);
  assert.equal(report.status, "fail");
  assert.ok(report.issues.length);
});

test("strict mode rejects unresolved references that ordinary checks report as warnings", async (t) => {
  const cwd = await project(t, 'import { Dialog } from "@urushi/react"; export const trigger = <Dialog.Trigger dialog="missing">Open</Dialog.Trigger>;');
  const normal = await check(cwd);
  assert.equal(normal.status, "pass");
  assert.equal(normal.summary.errors, 0);
  assert.ok(normal.issues.some((i) => i.code === "urushi/valid-idref"));
  assert.equal((await check(cwd, { strict: true })).status, "fail");
});

test("check inspects included generated UI and fails if a source is outside the lint scope", async (t) => {
  const cwd = await project(t, 'export {};');
  await mkdir(join(cwd, "generated"));
  await writeFile(join(cwd, "generated/screen.tsx"), 'import { Button } from "@urushi/react"; export const bad = <Button className="rounded-xl">Save</Button>;');
  const config = JSON.parse(await readFile(join(cwd, "tsconfig.json"), "utf8"));
  config.include = ["screen.tsx", "generated/screen.tsx"];
  await writeFile(join(cwd, "tsconfig.json"), JSON.stringify(config));
  const generated = await check(cwd);
  assert.equal(generated.status, "fail");
  assert.equal(generated.summary.lintedFiles, 2);
  assert.ok(generated.issues.some((i) => i.code === "urushi/no-visual-override" && i.file === "generated/screen.tsx"));
  await mkdir(join(cwd, "config"));
  config.include = ["../generated/screen.tsx"];
  await writeFile(join(cwd, "config/tsconfig.json"), JSON.stringify(config));
  const outside = await check(cwd, { project: "config/tsconfig.json" });
  assert.equal(outside.status, "fail");
  assert.ok(outside.issues.some((i) => i.source === "configuration" && i.severity === "error"));
  assert.equal(outside.summary.lintedFiles, 0);
});


test("selected CSS exports are valid side-effect imports, while nonexistent components remain errors", async (t) => {
  const cwd = await project(t, 'import "@urushi/react/styles/dialog.css"; export {};');
  // Next/Vite provide CSS ambient types; model that normal app environment.
  await writeFile(join(cwd, "css.d.ts"), 'declare module "*.css";');
  const config = JSON.parse(await readFile(join(cwd, "tsconfig.json"), "utf8"));
  config.include.push("css.d.ts");
  await writeFile(join(cwd, "tsconfig.json"), JSON.stringify(config));
  assert.equal((await check(cwd, { strict: true })).status, "pass");
  await writeFile(join(cwd, "screen.tsx"), 'import "@urushi/react/styles/nonexistent.css"; export {};');
  assert.equal((await check(cwd, { strict: true })).status, "fail");
});
