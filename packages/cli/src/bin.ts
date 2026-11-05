#!/usr/bin/env node
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { add, diff, init, readConfig, readLock } from "./add.ts";
import { build, defaultPaths, REGISTRY_VERSION } from "./build.ts";
import { conflictHelp, update } from "./update.ts";
import { migrateShadcn } from "./migrate.ts";

const HELP = `urushi <command>

  build                     generate types, docs, lint data, skills and registry from contracts/
  describe <component>      print its exact contract as JSON (offline)
  css <component...>        emit selected component CSS (import pack CSS separately)
  context <component...> [--compact]
                            print contracts, design rules and tokens for AI authoring
  check [--project <path>] [--json] [--strict]
                            check contracts and types; return repair context to agents
  verify --url <url> --scenario <json> --out <dir> [--browser chromium|firefox|webkit]
                            replay browser operations; emit screenshots and repair context
  workflow --config <json> --out <new-dir> [--repair]
                            check, build and replay; opt in to bounded source-only agent repairs
  init [--registry <dir|url>] [--pack <name>] [--components <dir>]
  add <name...> [--overwrite]
  update [name...] [--dry-run] [--json]
                            take new registry versions, merging your local edits (3-way)
  diff                      list installed files you changed, and unresolved conflicts
  info [--json]             show config and installed components
  migrate shadcn [--json]   list the shadcn/ui components this project imports, the Urushi
                            component for each and what changes (reads only)
  mcp                       serve these commands to AI agents over MCP (stdio)
`;

function findRepoRoot(from: string): string {
  let dir = from;
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, "pnpm-workspace.yaml")) && existsSync(join(dir, "contracts"))) return dir;
    dir = dirname(dir);
  }
  throw new Error("`urushi build` must run inside the urushi repository");
}

async function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      url: { type: "string" },
      scenario: { type: "string" },
      out: { type: "string" },
      browser: { type: "string" },
      config: { type: "string" },
      repair: { type: "boolean", default: false },
      registry: { type: "string" },
      pack: { type: "string", default: "graphite" },
      components: { type: "string", default: "components/ui" },
      overwrite: { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
      project: { type: "string" },
      strict: { type: "boolean", default: false },
      compact: { type: "boolean", default: false },
      json: { type: "boolean", default: false },
      cwd: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });
  const [command, ...rest] = positionals;
  const cwd = resolve(values.cwd ?? process.cwd());

  switch (command) {
    case "mcp": {
      const { serve } = await import("./mcp.ts");
      await serve(cwd);
      return;
    }
    case "workflow": {
      if(!values.config||!values.out)throw new Error("workflow requires --config and --out");
      const {workflow}=await import("./workflow.ts");
      const report=await workflow({cwd,config:values.config,out:values.out,repair:values.repair});
      console.log(JSON.stringify(report,null,2));if(report.status!=="pass")process.exitCode=1;return;
    }
    case "verify": {
      if (!values.url || !values.scenario || !values.out) throw new Error("verify requires --url, --scenario and --out");
      const { verify } = await import("./verify.ts");
      const report = await verify({url:values.url,scenario:resolve(cwd,values.scenario),out:resolve(cwd,values.out),browser:values.browser});
      console.log(JSON.stringify(report,null,2));
      if (report.status === "fail") process.exitCode = 1;
      return;
    }
    case "css": {
      const { readFile } = await import("node:fs/promises");
      const { selectStyles } = await import("./styles.ts");
      const { describe } = await import("./catalog.ts");
      const { default: contracts } = await import("./catalog.generated.json", { with: { type: "json" } });
      const source = await readFile(new URL("./styles.generated.css", import.meta.url), "utf8");
      process.stdout.write(selectStyles(source, rest.map(name => describe(name).name), contracts));
      return;
    }
    case "context": {
      const { context } = await import("./catalog.ts");
      console.log(JSON.stringify(context(rest, { compact: values.compact }), null, values.compact ? undefined : 2));
      return;
    }
    case "describe": {
      if (rest.length !== 1) throw new Error("describe needs one component name (e.g. dialog or Dialog.Trigger)");
      const { describe } = await import("./catalog.ts");
      console.log(JSON.stringify(describe(rest[0]), null, 2));
      return;
    }
    case "check": {
      if (rest.length) throw new Error("check reads a TypeScript project. Use --project <path>, not positional files.");
      const { check, formatCheck } = await import("./check.ts");
      const report = await check(cwd, { project: values.project, strict: values.strict });
      if (report.status === "fail") process.exitCode = 1;
      console.log(values.json ? JSON.stringify(report, null, 2) : formatCheck(report));
      return;
    }
    case "build": {
      const written = await build(defaultPaths(findRepoRoot(cwd)));
      console.log(`urushi build: wrote ${written.length} files`);
      for (const f of written) console.log(`  ${f}`);
      return;
    }
    case "init": {
      const bundled = fileURLToPath(new URL("../registry", import.meta.url));
      const registry = values.registry ?? (existsSync(bundled) ? bundled : join(findRepoRoot(cwd), "generated/registry"));
      const config = await init(cwd, { registry, pack: values.pack!, components: values.components! });
      console.log(`created urushi.json (pack: ${config.pack}, components: ${config.components})`);
      return;
    }
    case "add": {
      if (rest.length === 0) throw new Error("add needs at least one component name");
      const results = await add(cwd, rest, { overwrite: values.overwrite });
      const { pack } = await readConfig(cwd);
      const deps = new Map<string, string>([["@urushi/packs", REGISTRY_VERSION]]);
      const css = new Set<string>();
      for (const r of results) {
        for (const f of r.written) console.log(`  + ${f}  (${r.name}@${r.version})`);
        for (const f of r.skipped) console.log(`  ! ${f} exists and differs — kept yours (use --overwrite to replace)`);
        for (const [k, v] of Object.entries(r.dependencies)) deps.set(k, v);
        for (const c of r.css) css.add(c);
      }
      if (deps.size) console.log(`\nInstall: ${[...deps].map(([k, v]) => `${k}@${v}`).join(" ")}`);
      css.add(`@urushi/packs/${pack}.css`);
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
    case "migrate": {
      if (rest[0] !== "shadcn") throw new Error("migrate supports one source: `urushi migrate shadcn`");
      const report = await migrateShadcn(cwd);
      if (values.json) return console.log(JSON.stringify(report, null, 2));
      if (!report.uses.length) return console.log(`No imports from ${report.alias}/… were found.`);
      let file = "";
      for (const use of report.uses) {
        if (use.file !== file) console.log(`\n${(file = use.file)}`);
        console.log(`  ${use.line}: ${use.shadcn} (${use.names.join(", ")}) → ${use.urushi ?? "no equivalent"}\n      ${use.note}`);
      }
      console.log(`\n${report.uses.length} imports in ${new Set(report.uses.map((u) => u.file)).size} files.`);
      if (report.add.length) console.log(`Add the Urushi components: urushi add ${report.add.join(" ")}`);
      console.log("Move one screen at a time, then run `urushi check`.");
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
  console.error(`urushi: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
