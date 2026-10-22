import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";
import { sha256 } from "./build.ts";

export interface Config {
  $schema?: string;
  components: string;
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
  files: { path: string; target: string; content: string; hash: string }[];
  dependencies: Record<string, string>;
  css: string[];
}

export const CONFIG_FILE = "yourlib.json";
export const LOCK_FILE = "yourlib.lock";
/** Pristine copies of installed files: the merge base for a future `yourlib update`. */
export const BASE_DIR = ".yourlib/base";

export async function readConfig(cwd: string): Promise<Config> {
  const path = join(cwd, CONFIG_FILE);
  if (!existsSync(path)) throw new Error(`${CONFIG_FILE} not found in ${cwd}. Run \`yourlib init\` first.`);
  return JSON.parse(await readFile(path, "utf8")) as Config;
}

export async function readLock(cwd: string): Promise<LockFile> {
  const path = join(cwd, LOCK_FILE);
  if (!existsSync(path)) return { lockfileVersion: 1, items: {} };
  return JSON.parse(await readFile(path, "utf8")) as LockFile;
}

export async function fetchItem(registry: string, name: string, cwd: string): Promise<RegistryItem> {
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
  const path = join(cwd, CONFIG_FILE);
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

export async function add(cwd: string, names: string[], opts: { overwrite?: boolean } = {}): Promise<AddResult[]> {
  const config = await readConfig(cwd);
  const lock = await readLock(cwd);
  const results: AddResult[] = [];
  for (const name of names) {
    const item = await fetchItem(config.registry, name, cwd);
    const result: AddResult = { name, version: item.version, written: [], skipped: [], dependencies: item.dependencies, css: item.css };
    const files: Record<string, string> = {};
    for (const file of item.files) {
      if (sha256(file.content) !== file.hash) throw new Error(`${name}/${file.path}: hash mismatch, refusing to install`);
      const target = join(config.components, file.path);
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
    if (Object.keys(files).length) lock.items[name] = { version: item.version, files };
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

/** Conflict markers left by `yourlib update`, at the start of a line. */
export const CONFLICT_MARKER = /^(<{7}|>{7}) /m;

/** Writes the lockfile with items sorted, so it diffs cleanly. */
export async function writeLock(cwd: string, lock: LockFile) {
  const sorted = Object.fromEntries(Object.entries(lock.items).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(join(cwd, LOCK_FILE), JSON.stringify({ lockfileVersion: 1, items: sorted }, null, 2) + "\n");
}

/** Saves the pristine registry copy of a file: the merge base of the next update. */
export async function writeBase(cwd: string, target: string, content: string) {
  const base = join(cwd, BASE_DIR, target);
  await mkdir(join(base, ".."), { recursive: true });
  await writeFile(base, content);
}

/** Reports which installed files the user has changed since `yourlib add` or `update`. */
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
