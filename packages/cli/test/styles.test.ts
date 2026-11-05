import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { selectStyles } from "../src/styles.ts";
import { loadContracts } from "../src/build.ts";
import { resolve } from "node:path";

test("selected styles retain conditional states, shared selectors and transitive component styles", () => {
  const contracts = [
    { name: "sheet", parts: [{ slot: "sheet" }], styleDependencies: ["dialog"] },
    { name: "dialog", parts: [{ slot: "dialog" }], styleDependencies: ["button"] },
    { name: "button", parts: [{ slot: "button" }] },
  ];
  const css = `@layer base, components; @layer base {
    :root { color-scheme: light dark; }
    [data-slot="visually-hidden"] { position: absolute; clip-path: inset(50%); }
    :root:has([data-slot~="dialog"]:modal) { overflow: hidden; }
    :is([data-slot="dialog"], [data-slot="tooltip"]) { opacity: 0; }
    @starting-style { [data-slot~="dialog"][open] { opacity: 0; } }
    @media (max-width: 40rem) { [data-slot="button-icon"] { width: 20px; } }
    [data-slot="button"]:disabled, [data-slot="input"]:disabled { opacity: .5; }
    @supports (display: grid) { [data-slot="table"] { display: grid; } }
  }`;
  const selected = selectStyles(css, ["sheet"], contracts);
  for (const expected of ["visually-hidden", "clip-path", "color-scheme", ":has(", ":is(", "@starting-style", "@media", "button-icon", ':disabled']) assert.ok(selected.includes(expected), expected);
  assert.ok(!selected.includes('table')); assert.ok(!selected.includes('@supports')); assert.ok(!selected.includes('[data-slot="input"]:disabled'));
  assert.throws(() => selectStyles(css, [], contracts), /at least one/);
  assert.throws(() => selectStyles(css, ['unknown'], contracts), /Unknown/);
});

test("every contract produces CSS and shared aliases are declared", async () => {
  const root = resolve(import.meta.dirname, "../../..");
  const contracts = await loadContracts(resolve(root, 'contracts'));
  const css = await readFile(resolve(root, 'packages/react/styles/index.css'), 'utf8');
  for (const contract of contracts) {
    const selected = selectStyles(css, [contract.name], contracts);
    assert.ok(selected.includes('@layer urushi.base, urushi.components'), contract.name);
    assert.ok(selected.length < css.length, contract.name);
  }
  assert.match(selectStyles(css, ['alert-dialog'], contracts), /dialog.*::backdrop/);
  assert.match(selectStyles(css, ['date-input'], contracts), /data-slot~?="input"/);
  const table = selectStyles(css, ['data-table'], contracts);
  assert.match(table, /data-slot="checkbox-input"/);
  assert.match(table, /data-slot="checkbox-indicator"/);
  assert.match(table, /data-slot="checkbox-mixed"/);
  assert.match(table, /stroke-dashoffset 180ms/);
});

test("the styles of elements the runtime creates ship with some component", async () => {
  const root = resolve(import.meta.dirname, "../../..");
  const contracts = await loadContracts(resolve(root, "contracts"));
  const css = await readFile(resolve(root, "packages/react/styles/index.css"), "utf8");
  const shipped = selectStyles(css, contracts.map((c) => c.name), contracts);
  const { readdir } = await import("node:fs/promises");
  const dir = resolve(root, "packages/core/src");
  for (const file of await readdir(dir)) {
    const source = await readFile(resolve(dir, file), "utf8");
    for (const [, value] of source.matchAll(/dataset\.slot = "([^"]+)"/g)) {
      for (const slot of value.split(" ")) {
        if (!css.includes(`"${slot}"`)) continue;
        // Each component's own CSS must carry it, not only the full stylesheet.
        const owner = contracts.find((c) => selectStyles(css, [c.name], contracts).includes(`"${slot}"`));
        assert.ok(owner, `${file}: no component's CSS styles data-slot="${slot}"`);
      }
    }
  }
  assert.ok(shipped.length > 0);
  const toast = selectStyles(css, ["toast"], contracts);
  for (const slot of ["toast", "toast-body", "toast-close", "toast-progress"]) assert.match(toast, new RegExp(`data-slot~?="${slot}"`));
});

test("standalone component CSS retains third-party license notices", async () => {
  const root = resolve(import.meta.dirname, "../../..");
  const css = await readFile(resolve(root, "packages/react/styles/index.css"), "utf8");
  const selected = selectStyles(css, ["alert"], [{ name: "alert", parts: [{ slot: "alert" }] }]);
  assert.match(selected, /Copyright \(c\) 2023 Phosphor Icons/);
  assert.match(selected, /Permission is hereby granted/);
  assert.match(selected, /THE SOFTWARE IS PROVIDED/);
  assert.match(selected, /mask.*data:image\/svg\+xml/);
});

test("no generated component prop is typed unknown (arrays and functions need x-ts-type)", async () => {
  const { readdir } = await import("node:fs/promises");
  const dir = resolve(import.meta.dirname, "../../react/src/generated");
  for (const file of await readdir(dir)) {
    const source = await readFile(resolve(dir, file), "utf8");
    assert.doesNotMatch(source, /^\s+\w+\??: unknown;$/m, file);
  }
});
