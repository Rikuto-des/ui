import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { BASE_DIR, CONFLICT_MARKER, prepareItems, readConfig, readLock, writeBase, writeLock } from "./add.ts";
import { sha256 } from "./build.ts";

export type UpdateStatus =
  /** Already at the registry's version. */
  | "unchanged"
  /** Not edited locally: replaced with the new version. */
  | "updated"
  /** Edited locally: your changes and the new version were merged cleanly. */
  | "merged"
  /** Edited locally and the changes overlap: conflict markers were written. */
  | "conflict"
  /** New in this version: written. */
  | "added"
  /** Deleted locally: left deleted. */
  | "missing"
  /** No longer shipped by the registry: left in place, no longer tracked. */
  | "removed-upstream";

export interface UpdateEntry {
  item: string;
  file: string;
  from: string;
  to: string;
  status: UpdateStatus;
}

/** Three-way merge with `git merge-file`; returns the merged text and the number of conflicts. */
async function merge3(ours: string, base: string, theirs: string, theirsLabel: string): Promise<{ text: string; conflicts: number }> {
  const dir = await mkdtemp(join(tmpdir(), "urushi-merge-"));
  try {
    const [o, b, t] = ["ours", "base", "theirs"].map((n) => join(dir, n));
    await Promise.all([writeFile(o, ours), writeFile(b, base), writeFile(t, theirs)]);
    const run = spawnSync("git", ["merge-file", "-p", "--diff3", "-L", "yours", "-L", "base", "-L", theirsLabel, o, b, t], {
      encoding: "utf8",
    });
    if (run.error) throw new Error(`urushi update needs git for merging local edits (${run.error.message})`);
    if (run.status === null || run.status < 0 || run.status > 127) throw new Error(`git merge-file failed: ${run.stderr}`);
    return { text: run.stdout, conflicts: run.status };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/**
 * Brings installed components up to the registry's version without losing
 * local edits. Each file is merged three ways: the pristine copy from the
 * last add/update (`.urushi/base`) is the base, your file is "yours", and the
 * registry's file is "theirs". Untouched files are simply replaced.
 */
export async function update(cwd: string, names: string[] = [], opts: { dryRun?: boolean } = {}): Promise<UpdateEntry[]> {
  const config = await readConfig(cwd);
  const lock = await readLock(cwd);
  const targets = names.length ? names : Object.keys(lock.items);
  const out: UpdateEntry[] = [];
  for (const name of targets) {
    if (!lock.items[name]) throw new Error(`"${name}" is not installed. Use \`urushi add ${name}\`.`);
  }
  const items = await prepareItems(cwd, config, targets);
  for (const item of items) {
    const name = item.name;
    const installed = lock.items[name];
    const files: Record<string, string> = {};
    const shipped = new Set<string>();

    for (const file of item.files) {
      if (sha256(file.content) !== file.hash) throw new Error(`${name}/${file.path}: hash mismatch, refusing to update`);
      const target = join(config.components, file.path);
      shipped.add(target);
      const abs = join(cwd, target);
      const lockedHash = installed.files[target];
      const entry = { item: name, file: target, from: installed.version, to: item.version };
      files[target] = file.hash;

      if (!lockedHash && !existsSync(abs)) {
        // A file this version adds.
        if (!opts.dryRun) {
          await mkdir(dirname(abs), { recursive: true });
          await writeFile(abs, file.content);
          await writeBase(cwd, target, file.content);
        }
        out.push({ ...entry, status: "added" });
        continue;
      }
      if (!existsSync(abs)) {
        if (!opts.dryRun) await writeBase(cwd, target, file.content);
        out.push({ ...entry, status: "missing" });
        continue;
      }
      const ours = await readFile(abs, "utf8");
      if (CONFLICT_MARKER.test(ours)) {
        // Never merge into unresolved markers or report them as a successful update.
        if (lockedHash) files[target] = lockedHash;
        else delete files[target];
        out.push({ ...entry, status: "conflict" });
        continue;
      }
      if (lockedHash === file.hash) {
        // The registry ships what is installed; local edits stay as they are.
        out.push({ ...entry, status: "unchanged" });
        continue;
      }
      if (ours === file.content || sha256(ours) === lockedHash) {
        // Already identical, or not edited since it was installed: take the new version.
        if (!opts.dryRun) {
          await writeFile(abs, file.content);
          await writeBase(cwd, target, file.content);
        }
        out.push({ ...entry, status: "updated" });
        continue;
      }
      const basePath = join(cwd, BASE_DIR, target);
      // Without the pristine copy there is no merge base; an empty one turns
      // every difference into a conflict, which is the safe answer.
      const base = existsSync(basePath) ? await readFile(basePath, "utf8") : "";
      const merged = await merge3(ours, base, file.content, `urushi ${name}@${item.version}`);
      if (!opts.dryRun) {
        await writeFile(abs, merged.text);
        await writeBase(cwd, target, file.content);
      }
      out.push({ ...entry, status: merged.conflicts ? "conflict" : "merged" });
    }

    for (const target of Object.keys(installed.files)) {
      if (!shipped.has(target)) out.push({ item: name, file: target, from: installed.version, to: item.version, status: "removed-upstream" });
    }
    lock.items[name] = { version: item.version, files };
  }

  if (!opts.dryRun) await writeLock(cwd, lock);
  return out;
}

/** What to tell a person or an agent after an update with conflicts. */
export function conflictHelp(entries: UpdateEntry[]): string {
  const files = entries.filter((e) => e.status === "conflict").map((e) => `  ${e.file}`);
  return [
    `${files.length} file(s) have conflicts:`,
    ...files,
    "",
    "Each conflict shows three parts:",
    "  <<<<<<< yours                 your local version",
    "  ||||||| base                  the version you last installed",
    "  =======",
    "  >>>>>>> urushi <name>@<ver>  the new version",
    "Keep the new version's structure and re-apply your change on top of it,",
    "then delete the markers. `urushi diff` lists files that still have markers.",
  ].join("\n");
}
