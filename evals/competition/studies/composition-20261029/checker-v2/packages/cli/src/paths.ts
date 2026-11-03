import { lstat } from "node:fs/promises";
import { join, win32 } from "node:path";

/** Registry and lock paths are data, never permission to leave the project. */
export function relativePath(path: string): string {
  if (typeof path !== "string" || !path || path.includes("\\") || path.includes("\0") ||
      win32.isAbsolute(path) || path.split("/").some((part) => !part || part === "." || part === ".." || part === ".git")) {
    throw new Error(`Unsafe path ${JSON.stringify(path)}: use a relative path without parent segments.`);
  }
  return path;
}

/** Reject links, including dangling links, before reading or replacing managed files. */
export async function projectPath(cwd: string, target: string): Promise<string> {
  relativePath(target);
  let path = cwd;
  for (const part of target.split("/")) {
    path = join(path, part);
    try {
      if ((await lstat(path)).isSymbolicLink()) throw new Error(`Refusing symbolic link in managed path: ${target}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  return join(cwd, target);
}
