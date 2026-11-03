import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { add, diff, init, readLock } from "../src/add.ts";
import { sha256, REGISTRY_VERSION } from "../src/build.ts";
import { update } from "../src/update.ts";

const registry = join(import.meta.dirname, "../../../generated/registry");
const FILE = "components/ui/badge.tsx";

/** A copy of the registry where `name` is at `version` with its first file edited by `edit`. */
async function newerRegistry(name: string, version: string, edit: (content: string) => string) {
  const dir = await mkdtemp(join(tmpdir(), "urushi-registry-"));
  await cp(registry, dir, { recursive: true });
  const path = join(dir, `${name}.json`);
  const item = JSON.parse(await readFile(path, "utf8"));
  item.version = version;
  item.files[0].content = edit(item.files[0].content);
  item.files[0].hash = sha256(item.files[0].content);
  await writeFile(path, JSON.stringify(item));
  return dir;
}

async function project() {
  const cwd = await mkdtemp(join(tmpdir(), "urushi-update-"));
  await init(cwd, { registry, pack: "graphite", components: "components/ui" });
  await add(cwd, ["badge"]);
  return cwd;
}

async function pointAt(cwd: string, registryDir: string) {
  const config = JSON.parse(await readFile(join(cwd, "urushi.json"), "utf8"));
  config.registry = registryDir;
  await writeFile(join(cwd, "urushi.json"), JSON.stringify(config));
}

// Registry files are short re-exports: upstream adds a line at the top, local edits go at the end.
const upstreamEdit = (c: string) => `// Upstream doc comment.\n${c}`;
const EXPORT = 'export { Badge, type BadgeProps } from "@urushi/react/badge";';

test("update reports unchanged when the registry ships the installed version", async () => {
  const cwd = await project();
  assert.deepEqual(
    (await update(cwd)).map((e) => e.status),
    ["unchanged"],
  );
});

test("update replaces an unedited file and moves the lock and base forward", async () => {
  const cwd = await project();
  await pointAt(cwd, await newerRegistry("badge", "0.2.0", upstreamEdit));
  const [entry] = await update(cwd);
  assert.equal(entry.status, "updated");
  const content = await readFile(join(cwd, FILE), "utf8");
  assert.match(content, /Upstream doc comment/);
  assert.equal((await readLock(cwd)).items.badge.version, "0.2.0");
  assert.equal(await readFile(join(cwd, ".urushi/base", FILE), "utf8"), content);
  assert.equal((await diff(cwd))[0].status, "unmodified");
});

test("update merges a local edit that does not overlap the upstream change", async () => {
  const cwd = await project();
  const mine = (await readFile(join(cwd, FILE), "utf8")) + "\n// my local note\n";
  await writeFile(join(cwd, FILE), mine);
  await pointAt(cwd, await newerRegistry("badge", "0.2.0", upstreamEdit));
  const [entry] = await update(cwd);
  assert.equal(entry.status, "merged");
  const merged = await readFile(join(cwd, FILE), "utf8");
  assert.match(merged, /Upstream doc comment/);
  assert.match(merged, /my local note/);
  assert.doesNotMatch(merged, /<{7}/);
  assert.equal((await diff(cwd))[0].status, "modified");
});

test("update writes diff3 conflict markers when both sides change the same lines", async () => {
  const cwd = await project();
  const original = await readFile(join(cwd, FILE), "utf8");
  assert.ok(original.includes(EXPORT));
  await writeFile(join(cwd, FILE), original.replace(EXPORT, EXPORT.replace("{ Badge,", "{ Badge as MyBadge,")));
  await pointAt(cwd, await newerRegistry("badge", "0.2.0", (c) => c.replace(EXPORT, EXPORT.replace("@urushi/react/badge", "@urushi/react/badge-v2"))));
  const [entry] = await update(cwd);
  assert.equal(entry.status, "conflict");
  const text = await readFile(join(cwd, FILE), "utf8");
  assert.match(text, /^<{7} yours$/m);
  assert.match(text, /^\|{7} base$/m);
  assert.match(text, /^>{7} urushi badge@0\.2\.0$/m);
  assert.match(text, /MyBadge/);
  assert.match(text, /badge-v2/);
  // The lock and base move to the new version, so a resolved file is a plain local edit.
  assert.equal((await readLock(cwd)).items.badge.version, "0.2.0");
  assert.equal((await diff(cwd))[0].status, "conflict");
});

test("update --dry-run reports without writing", async () => {
  const cwd = await project();
  const before = await readFile(join(cwd, FILE), "utf8");
  await pointAt(cwd, await newerRegistry("badge", "0.2.0", upstreamEdit));
  const [entry] = await update(cwd, [], { dryRun: true });
  assert.equal(entry.status, "updated");
  assert.equal(await readFile(join(cwd, FILE), "utf8"), before);
  assert.equal((await readLock(cwd)).items.badge.version, REGISTRY_VERSION);
});

test("update refuses a tampered item and an item that is not installed", async () => {
  const cwd = await project();
  const dir = await newerRegistry("badge", "0.2.0", upstreamEdit);
  const item = JSON.parse(await readFile(join(dir, "badge.json"), "utf8"));
  item.files[0].content += "\nfetch('https://evil.example');\n";
  await writeFile(join(dir, "badge.json"), JSON.stringify(item));
  await pointAt(cwd, dir);
  await assert.rejects(update(cwd), /hash mismatch/);
  await assert.rejects(update(cwd, ["tabs"]), /not installed/);
});
