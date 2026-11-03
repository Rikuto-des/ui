import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * The site reads the library's own sources at build time — contracts (as the
 * generated JSON schema), the design-system guides and the brand book — so the
 * documentation cannot drift from the code.
 */
export const ROOT = join(process.cwd(), "../..");

export interface PropSchema {
  type?: string;
  enum?: string[];
  const?: string | number | boolean | null;
  anyOf?: PropSchema[];
  default?: unknown;
  description?: string;
  "x-ts-type"?: string;
}
export interface Part {
  jsx: string;
  slot: string;
  element: string;
  description: string;
  props: { properties?: Record<string, PropSchema>; required?: string[] };
  overrides: string[];
}
export interface Schema {
  name: string;
  summary: string;
  rendering: string;
  parts: Part[];
  a11y: { apg?: string; keyboard?: Record<string, string>; rules: string[] };
  tokens: string[];
}

export async function schema(name: string): Promise<Schema> {
  return JSON.parse(await readFile(join(ROOT, "generated/schema", `${name}.json`), "utf8")) as Schema;
}

/** A file under the repository, e.g. "design-system/packs.md". */
export function repoFile(path: string): Promise<string> {
  return readFile(join(ROOT, path), "utf8");
}

/** A guide's first paragraph is its one-line summary; the rest is the body. */
export function splitGuide(md: string): { summary: string; body: string } {
  const [summary, ...rest] = md.trim().split(/\n\s*\n/);
  return { summary: summary.trim(), body: rest.join("\n\n") };
}

export interface Features {
  browser: string;
  version: string;
  [feature: string]: string | boolean;
}

export async function features(): Promise<Features[]> {
  return Promise.all(
    ["chromium", "firefox", "webkit"].map(async (b) =>
      JSON.parse(await readFile(join(ROOT, "docs/phase0/features", `${b}.json`), "utf8")) as Features,
    ),
  );
}
