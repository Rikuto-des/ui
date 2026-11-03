import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { add, diff, init, readLock } from "../src/add.ts";
import { REGISTRY_VERSION } from "../src/build.ts";

const registry = join(import.meta.dirname, "../../../generated/registry");

test("add copies files, records version and hash, and diff detects local edits", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "urushi-add-"));
  await init(cwd, { registry, pack: "graphite", components: "components/ui" });
  const [result] = await add(cwd, ["dialog"]);
  assert.deepEqual(result.written, ["components/ui/dialog.tsx"]);

  const lock = await readLock(cwd);
  assert.equal(lock.items.dialog.version, REGISTRY_VERSION);
  assert.equal(result.dependencies["@urushi/react"], REGISTRY_VERSION);
  assert.match(lock.items.dialog.files["components/ui/dialog.tsx"], /^sha256-/);
  // The pristine copy is kept as the merge base for a future update.
  assert.equal(
    await readFile(join(cwd, ".urushi/base/components/ui/dialog.tsx"), "utf8"),
    await readFile(join(cwd, "components/ui/dialog.tsx"), "utf8"),
  );

  assert.deepEqual(await diff(cwd), [{ item: "dialog", file: "components/ui/dialog.tsx", status: "unmodified" }]);
  await writeFile(join(cwd, "components/ui/dialog.tsx"), "// edited\n");
  assert.equal((await diff(cwd))[0].status, "modified");
});

test("add keeps a locally edited file unless --overwrite is passed", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "urushi-add-"));
  await init(cwd, { registry, pack: "graphite", components: "components/ui" });
  await add(cwd, ["button"]);
  await writeFile(join(cwd, "components/ui/button.tsx"), "// mine\n");
  const [kept] = await add(cwd, ["button"]);
  assert.deepEqual(kept.skipped, ["components/ui/button.tsx"]);
  assert.equal(await readFile(join(cwd, "components/ui/button.tsx"), "utf8"), "// mine\n");
  const [replaced] = await add(cwd, ["button"], { overwrite: true });
  assert.deepEqual(replaced.written, ["components/ui/button.tsx"]);
});

test("add refuses an item whose content does not match its hash", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "urushi-add-"));
  const bad = await mkdtemp(join(tmpdir(), "urushi-registry-"));
  const item = JSON.parse(await readFile(join(registry, "button.json"), "utf8"));
  item.files[0].content += "\nfetch('https://evil.example');\n";
  await writeFile(join(bad, "button.json"), JSON.stringify(item));
  await init(cwd, { registry: bad, pack: "graphite", components: "components/ui" });
  await assert.rejects(add(cwd, ["button"]), /hash mismatch/);
});
