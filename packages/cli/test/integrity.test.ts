import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, type TestContext } from "node:test";
import { add, diff, init, readLock, type RegistryItem } from "../src/add.ts";
import { sha256 } from "../src/build.ts";
import { update } from "../src/update.ts";

async function fixture(t: TestContext) {
  const root = await mkdtemp(join(tmpdir(), "urushi-integrity-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const cwd = join(root, "project");
  const registry = join(root, "registry");
  await mkdir(cwd);
  await mkdir(registry);
  await init(cwd, { registry, pack: "graphite", components: "components/ui" });
  const publish = async (name: string, paths: string[], version = "1") => {
    const item: RegistryItem = {
      name, version, dependencies: {}, css: [],
      files: paths.map((path) => ({ path, target: "components", content: `// ${path} v${version}\n`, hash: sha256(`// ${path} v${version}\n`) })),
    };
    await writeFile(join(registry, `${name}.json`), JSON.stringify(item));
    return item;
  };
  return { root, cwd, registry, publish };
}

for (const operation of ["add", "update"] as const) {
  test(`${operation} validates the whole request before changing files or merge bases`, async (t) => {
    const { cwd, registry, publish } = await fixture(t);
    await publish("one", ["one.tsx"]);
    await publish("two", ["two.tsx"]);
    if (operation === "update") await add(cwd, ["one", "two"]);
    const before = await readLock(cwd);
    await publish("one", ["one.tsx"], "2");
    const bad = await publish("two", ["two.tsx"], "2");
    bad.files[0].content = "corrupt";
    await writeFile(join(registry, "two.json"), JSON.stringify(bad));
    await assert.rejects(operation === "add" ? add(cwd, ["one", "two"]) : update(cwd), /hash mismatch/);
    assert.deepEqual(await readLock(cwd), before);
    for (const prefix of ["", ".urushi/base/"]) {
      const path = join(cwd, prefix, "components/ui/one.tsx");
      if (operation === "add") assert.equal(existsSync(path), false);
      else assert.equal(await readFile(path, "utf8"), "// one.tsx v1\n");
    }
  });

  test(`${operation} refuses paths outside the component directory`, async (t) => {
    const { cwd, publish } = await fixture(t);
    await publish("one", ["one.tsx"]);
    if (operation === "update") await add(cwd, ["one"]);
    await publish("one", ["../../escaped.tsx"], "2");
    await assert.rejects(operation === "add" ? add(cwd, ["one"]) : update(cwd), /unsafe|relative/i);
    assert.equal(existsSync(join(cwd, "escaped.tsx")), false);
  });
}

test("add refuses a symlink destination before writing", async (t) => {
  const { root, cwd, publish } = await fixture(t);
  await publish("one", ["one.tsx"]);
  const outside = join(root, "outside");
  await mkdir(outside);
  await symlink(outside, join(cwd, "components"));
  await assert.rejects(add(cwd, ["one"]), /symbolic|symlink/i);
  assert.equal(existsSync(join(outside, "ui/one.tsx")), false);
});

test("adding a multi-file item again retains tracking and the merge base of skipped edits", async (t) => {
  const { cwd, publish } = await fixture(t);
  await publish("one", ["one.tsx", "helper.tsx"]);
  await add(cwd, ["one"]);
  const before = await readLock(cwd);
  await writeFile(join(cwd, "components/ui/one.tsx"), "// local edit\n");
  await add(cwd, ["one"]);
  assert.deepEqual(await readLock(cwd), before);
  assert.equal((await diff(cwd)).find((e) => e.file.endsWith("/one.tsx"))?.status, "modified");
  assert.equal(await readFile(join(cwd, ".urushi/base/components/ui/one.tsx"), "utf8"), "// one.tsx v1\n");
});

test("update continues to report unresolved conflicts on a repeated update", async (t) => {
  const { cwd, publish } = await fixture(t);
  await publish("one", ["one.tsx"]);
  await add(cwd, ["one"]);
  await writeFile(join(cwd, "components/ui/one.tsx"), "// local edit\n");
  await publish("one", ["one.tsx"], "2");
  assert.equal((await update(cwd))[0].status, "conflict");
  assert.equal((await update(cwd))[0].status, "conflict");
});
