import { Marked } from "marked";

const marked = new Marked({ gfm: true });

/**
 * Markdown from the repository (guides, the brand book) to HTML. The input is
 * our own files, never user content. Code spans and blocks are left plain.
 */
export function markdown(md: string): string {
  return marked.parse(md, { async: false });
}
