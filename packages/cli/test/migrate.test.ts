import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { migrateShadcn, SHADCN } from "../src/migrate.ts";
import catalog from "../src/catalog.generated.json" with { type: "json" };

test("migrate shadcn maps each import to its Urushi component and skips the shadcn sources", async () => {
  const report = await migrateShadcn(join(import.meta.dirname, "fixtures/shadcn-app"));
  assert.equal(report.alias, "@/components/ui");
  assert.deepEqual(
    report.uses.map((u) => [u.line, u.shadcn, u.urushi]),
    [
      [1, "button", "button"],
      [2, "dialog", "dialog"],
      [3, "dropdown-menu", "menu"],
      [4, "label", "field"],
      [5, "fancy-thing", null],
    ],
  );
  assert.deepEqual(report.uses[1].names, ["Dialog", "DialogContent", "DialogTrigger"]);
  assert.deepEqual(report.add, ["button", "dialog", "field", "menu"]);
});

test("every Urushi target in the shadcn map is a real component", () => {
  const names = new Set(catalog.map((c: { name: string }) => c.name));
  for (const [shadcn, { urushi }] of Object.entries(SHADCN)) if (urushi) assert.ok(names.has(urushi), `${shadcn} → ${urushi}`);
});

test("the MCP registry entry names this package and its version", async () => {
  const { readFile } = await import("node:fs/promises");
  const { REGISTRY_VERSION } = await import("../src/build.ts");
  const server = JSON.parse(await readFile(join(import.meta.dirname, "../server.json"), "utf8"));
  const pkg = JSON.parse(await readFile(join(import.meta.dirname, "../package.json"), "utf8"));
  assert.equal(server.name, pkg.mcpName);
  assert.equal(server.version, REGISTRY_VERSION);
  assert.equal(server.packages[0].identifier, pkg.name);
  assert.equal(server.packages[0].version, REGISTRY_VERSION);
  assert.ok(server.description.length <= 100);
});
