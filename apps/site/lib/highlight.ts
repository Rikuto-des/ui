import { createHighlighter, type Highlighter } from "shiki";

let highlighter: Promise<Highlighter> | undefined;

/**
 * Syntax highlighting at build time. Both themes are emitted as CSS variables
 * (--shiki-light / --shiki-dark); site.css picks one with light-dark(), so the
 * code follows the page's theme without JavaScript.
 */
export async function highlight(code: string, lang: "tsx" | "bash" | "css" | "json" = "tsx"): Promise<string> {
  highlighter ??= createHighlighter({ themes: ["github-light-default", "github-dark-default"], langs: ["tsx", "bash", "css", "json"] });
  return (await highlighter).codeToHtml(code.trim(), {
    lang,
    themes: { light: "github-light-default", dark: "github-dark-default" },
    defaultColor: false,
    // GitHub comments need more contrast on Lucent's translucent light fields.
    colorReplacements: { "#6e7781": "#59616b" },
  });
}
