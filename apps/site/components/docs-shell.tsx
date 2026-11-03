import type { ReactNode } from "react";
import { DocsNavigation } from "./docs-navigation";

export function DocsShell({ current, children, toc }: { current: string; children: ReactNode; toc?: {id: string; label: string}[] }) {
  return (
    <div className={`docs wrap${toc ? " docs-with-toc" : ""}`}>
      <noscript><style>{".docs-nav-search { display: none; }"}</style></noscript>
      <DocsNavigation current={current} />
      <main className="docs-main" id="main">
        {children}
      </main>
      {toc && <nav className="page-toc" aria-label="このページの内容"><p>On this page</p>{toc.map(item => <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}</nav>}
    </div>
  );
}

export function Prose({ html }: { html: string }) {
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
