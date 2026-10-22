#!/usr/bin/env node
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { add, diff, init, readConfig, readLock } from "./add.ts";
import { build, defaultPaths } from "./build.ts";
import { conflictHelp, update } from "./update.ts";

const HELP = `yourlib <command>

  build                     generate types, docs, lint data, skills and registry from contracts/
  init [--registry <dir|url>] [--pack <name>] [--components <dir>]
  add <name...> [--overwrite]
  update [name...] [--dry-run] [--json]
                            take new registry versions, merging your local edits (3-way)
  diff                      list installed files you changed, and unresolved conflicts
  info [--json]             show config and installed components
`;

function findRepoRoot(from: string): string {
  let dir = from;
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, "pnpm-workspace.yaml")) && existsSync(join(dir, "contracts"))) return dir;
    dir = dirname(dir);
  }
  throw new Error("`yourlib build` must run inside the yourlib repository");
}

async function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      registry: { type: "string" },
      pack: { type: "string", default: "graphite" },
      components: { type: "string", default: "components/ui" },
      overwrite: { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
      json: { type: "boolean", default: false },
      cwd: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });
  const [command, ...rest] = positionals;
  const cwd = resolve(values.cwd ?? process.cwd());

  switch (command) {
    case "build": {
      const written = await build(defaultPaths(findRepoRoot(cwd)));
      console.log(`yourlib build: wrote ${written.length} files`);
      for (const f of written) console.log(`  ${f}`);
      return;
    }
    case "init": {
      if (!values.registry) throw new Error("init needs --registry <dir|url>");
      const config = await init(cwd, { registry: values.registry, pack: values.pack!, components: values.components! });
      console.log(`created yourlib.json (pack: ${config.pack}, components: ${config.components})`);
      return;
    }
    case "add": {
      if (rest.length === 0) throw new Error("add needs at least one component name");
      const results = await add(cwd, rest, { overwrite: values.overwrite });
      const { pack } = await readConfig(cwd);
      const deps = new Map<string, string>([["@yourlib/packs", "^0.1.0"]]);
      const css = new Set<string>();
      for (const r of results) {
        for (const f of r.written) console.log(`  + ${f}  (${r.name}@${r.version})`);
        for (const f of r.skipped) console.log(`  ! ${f} exists and differs — kept yours (use --overwrite to replace)`);
        for (const [k, v] of Object.entries(r.dependencies)) deps.set(k, v);
        for (const c of r.css) css.add(c);
      }
      if (deps.size) console.log(`\nInstall: ${[...deps].map(([k, v]) => `${k}@${v}`).join(" ")}`);
      css.add(`@yourlib/packs/${pack}.css`);
      console.log(`Import once: ${[...css].map((c) => `import "${c}"`).join("; ")}`);
      console.log(`Set the pack: <html data-pack="${pack}">`);
      return;
    }
    case "update": {
      const entries = await update(cwd, rest, { dryRun: values["dry-run"] });
      const conflicts = entries.some((e) => e.status === "conflict");
      if (conflicts) process.exitCode = 2;
      if (values.json) return console.log(JSON.stringify(entries, null, 2));
      const mark: Record<string, string> = {
        unchanged: " ",
        updated: "↑",
        merged: "M",
        conflict: "C",
        added: "+",
        missing: "-",
        "removed-upstream": "x",
      };
      for (const e of entries) {
        const version = e.from === e.to ? e.to : `${e.from} → ${e.to}`;
        console.log(`  ${mark[e.status]} ${e.status.padEnd(16)} ${e.file}  (${e.item} ${version})`);
      }
      if (values["dry-run"]) console.log("\n(dry run: nothing was written)");
      if (conflicts) console.log(`\n${conflictHelp(entries)}`);
      return;
    }
    case "diff": {
      const entries = await diff(cwd);
      if (values.json) return console.log(JSON.stringify(entries, null, 2));
      for (const e of entries) console.log(`${e.status.padEnd(10)} ${e.file} (${e.item})`);
      return;
    }
    case "info": {
      const config = await readConfig(cwd);
      const lock = await readLock(cwd);
      const info = { config, installed: lock.items };
      if (values.json) return console.log(JSON.stringify(info, null, 2));
      console.log(`pack: ${config.pack}\ncomponents: ${config.components}\nregistry: ${config.registry}`);
      for (const [name, item] of Object.entries(lock.items)) console.log(`  ${name}@${item.version}`);
      return;
    }
    default:
      console.log(HELP);
      if (command && !values.help) process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(`yourlib: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
