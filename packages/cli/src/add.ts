import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { sha256 } from "./build.ts";
import { projectPath, relativePath } from "./paths.ts";

export interface Config {
  $schema?: string;
  components: string;
  /** Where blocks (whole screens) go. Defaults to a blocks folder beside components. */
  blocks?: string;
  pack: string;
  registry: string;
}

export interface LockFile {
  lockfileVersion: 1;
  items: Record<string, { version: string; files: Record<string, string> }>;
}

export interface RegistryItem {
  name: string;
  version: string;
  /** "block" is a whole screen built from components; it installs into the blocks folder. */
  type?: "component" | "block";
  files: { path: string; target: string; content: string; hash: string }[];
  dependencies: Record<string, string>;
  css: string[];
}

export const CONFIG_FILE = "urushi.json";
export const LOCK_FILE = "urushi.lock";
/** Pristine copies of installed files: the merge base for a future `urushi update`. */
export const BASE_DIR = ".urushi/base";

export async function readConfig(cwd: string): Promise<Config> {
  const path = await projectPath(cwd, CONFIG_FILE);
  if (!existsSync(path)) throw new Error(`${CONFIG_FILE} not found in ${cwd}. Run \`urushi init\` first.`);
  const config = JSON.parse(await readFile(path, "utf8")) as Config;
  for (const dir of [config.components, config.blocks ?? config.components]) {
    relativePath(dir);
    if (dir.split("/")[0] === ".urushi") throw new Error("components and blocks must not use the reserved .urushi directory");
  }
  return config;
}

export async function readLock(cwd: string): Promise<LockFile> {
  const path = await projectPath(cwd, LOCK_FILE);
  if (!existsSync(path)) return { lockfileVersion: 1, items: {} };
  const lock = JSON.parse(await readFile(path, "utf8")) as LockFile;
  for (const entry of Object.values(lock.items)) {
    for (const file of Object.keys(entry.files)) {
      await projectPath(cwd, file);
      await projectPath(cwd, join(BASE_DIR, file));
    }
  }
  return lock;
}

/** The project path a registry file installs to: components, or blocks for a block's files. */
export function destination(config: Config, file: { path: string; target: string }) {
  if (file.target !== "blocks") return join(config.components, file.path);
  return join(config.blocks ?? join(dirname(config.components), "blocks"), file.path);
}

export async function fetchItem(registry: string, name: string, cwd: string): Promise<RegistryItem> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) throw new Error(`Invalid component name: ${name}`);
  if (/^https?:\/\//.test(registry)) {
    const res = await fetch(new URL(`${name}.json`, registry.endsWith("/") ? registry : `${registry}/`));
    if (!res.ok) throw new Error(`registry returned ${res.status} for ${name}`);
    return (await res.json()) as RegistryItem;
  }
  const dir = isAbsolute(registry) ? registry : resolve(cwd, registry);
  const path = join(dir, `${name}.json`);
  if (!existsSync(path)) throw new Error(`"${name}" is not in the registry (${dir})`);
  return JSON.parse(await readFile(path, "utf8")) as RegistryItem;
}

export async function init(cwd: string, opts: { registry: string; pack: string; components: string }) {
  relativePath(opts.components);
  if (opts.components.split("/")[0] === ".urushi") throw new Error("components must not use the reserved .urushi directory");
  const path = await projectPath(cwd, CONFIG_FILE);
  if (existsSync(path)) throw new Error(`${CONFIG_FILE} already exists`);
  const config: Config = { components: opts.components, pack: opts.pack, registry: opts.registry };
  await writeFile(path, JSON.stringify(config, null, 2) + "\n");
  return config;
}

export interface AddResult {
  name: string;
  version: string;
  written: string[];
  skipped: string[];
  dependencies: Record<string, string>;
  css: string[];
}

/** Preflight every item before a command changes any component, merge base or lock. */
export async function prepareItems(cwd: string, config: Config, names: string[]): Promise<RegistryItem[]> {
  const items: RegistryItem[] = [];
  const targets = new Set<string>();
  for (const name of new Set(names)) {
    const item = await fetchItem(config.registry, name, cwd);
    if (item.name !== name) throw new Error(`Registry item name mismatch: expected ${name}`);
    for (const file of item.files) {
      relativePath(file.path);
      if (sha256(file.content) !== file.hash) throw new Error(`${name}/${file.path}: hash mismatch, refusing to install or update`);
      const target = destination(config, file);
      if (targets.has(target)) throw new Error(`Duplicate registry destination: ${target}`);
      targets.add(target);
      await projectPath(cwd, target);
      await projectPath(cwd, join(BASE_DIR, target));
    }
    items.push(item);
  }
  return items;
}

export async function add(cwd: string, names: string[], opts: { overwrite?: boolean } = {}): Promise<AddResult[]> {
  const config = await readConfig(cwd);
  const lock = await readLock(cwd);
  const items = await prepareItems(cwd, config, names);
  const results: AddResult[] = [];
  for (const item of items) {
    const name = item.name;
    const result: AddResult = { name, version: item.version, written: [], skipped: [], dependencies: item.dependencies, css: item.css };
    const files: Record<string, string> = { ...lock.items[name]?.files };
    for (const file of item.files) {
      if (sha256(file.content) !== file.hash) throw new Error(`${name}/${file.path}: hash mismatch, refusing to install`);
      const target = destination(config, file);
      const abs = join(cwd, target);
      if (existsSync(abs) && !opts.overwrite) {
        const current = await readFile(abs, "utf8");
        if (current !== file.content) {
          result.skipped.push(target);
          continue;
        }
      }
      await mkdir(join(abs, ".."), { recursive: true });
      await writeFile(abs, file.content);
      await writeBase(cwd, target, file.content);
      files[target] = file.hash;
      result.written.push(target);
    }
    if (result.written.length) lock.items[name] = { version: item.version, files };
    results.push(result);
  }
  await writeLock(cwd, lock);
  return results;
}

export interface DiffEntry {
  item: string;
  file: string;
  status: "unmodified" | "modified" | "conflict" | "missing";
}

/** Conflict markers left by `urushi update`, at the start of a line. */
export const CONFLICT_MARKER = /^(<{7}|>{7}) /m;

/** Writes the lockfile with items sorted, so it diffs cleanly. */
export async function writeLock(cwd: string, lock: LockFile) {
  const sorted = Object.fromEntries(Object.entries(lock.items).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(await projectPath(cwd, LOCK_FILE), JSON.stringify({ lockfileVersion: 1, items: sorted }, null, 2) + "\n");
}

/** Saves the pristine registry copy of a file: the merge base of the next update. */
export async function writeBase(cwd: string, target: string, content: string) {
  const base = await projectPath(cwd, join(BASE_DIR, target));
  await mkdir(join(base, ".."), { recursive: true });
  await writeFile(base, content);
}

/** Reports which installed files the user has changed since `urushi add` or `update`. */
export async function diff(cwd: string): Promise<DiffEntry[]> {
  const lock = await readLock(cwd);
  const out: DiffEntry[] = [];
  for (const [item, entry] of Object.entries(lock.items)) {
    for (const [file, hash] of Object.entries(entry.files)) {
      const abs = join(cwd, file);
      if (!existsSync(abs)) {
        out.push({ item, file, status: "missing" });
        continue;
      }
      const current = await readFile(abs, "utf8");
      const status = sha256(current) === hash ? "unmodified" : CONFLICT_MARKER.test(current) ? "conflict" : "modified";
      out.push({ item, file, status });
    }
  }
  return out;
}
