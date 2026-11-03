import { highlight } from "@/lib/highlight";
import { CopyButton } from "./copy-button";

/** Highlighted at build time; only the copy button is a client component. */
export async function CodeBlock({ code, lang = "tsx", copy = true }: { code: string; lang?: "tsx" | "bash" | "css" | "json"; copy?: boolean }) {
  const html = await highlight(code, lang);
  return (
    <div className="code-block">
      {copy ? (
        <div className="code-copy">
          <span className="code-language">{lang}</span>
          <CopyButton text={code.trim()} />
        </div>
      ) : null}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
