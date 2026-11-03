"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Input } from "@urushi/react/input";
import { Button } from "@urushi/react/button";

type Entry = { slug: string; name: string; group: string; summary: string; js: string; preview: ReactNode };
export function ComponentCatalog({ entries, groups }: { entries: Entry[]; groups: string[] }) {
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("すべて");
  useEffect(() => { setReady(true); }, []);
  const shown = entries.filter(entry => (group === "すべて" || entry.group === group) && `${entry.name} ${entry.summary}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return <div className="component-catalog">
    <div className="catalog-tools"><Input type="search" aria-label="コンポーネントを検索" placeholder="名前や使い道で探す…" disabled={!ready} value={query} onChange={e => setQuery(e.target.value)} /><span role="status">{shown.length} / {entries.length} COMPONENTS</span></div>
    <div className="catalog-filters" role="group" aria-label="コンポーネントの分類">{["すべて", ...groups].map(name => <Button key={name} disabled={!ready} size="sm" variant={group === name ? "secondary" : "ghost"} aria-pressed={group === name} onClick={() => setGroup(name)}>{name}</Button>)}</div>
    <ul className="catalog-grid">{entries.map(entry => <li key={entry.slug} hidden={!shown.includes(entry)} data-component={entry.slug}>
      <article aria-labelledby={`catalog-entry-${entry.slug}-title`}>
        <div className="catalog-preview"><div className="catalog-preview-content">{entry.preview}</div></div>
        <a className="catalog-details" href={`/components/${entry.slug}/`}><div><h2 id={`catalog-entry-${entry.slug}-title`}>{entry.name}</h2><span>{entry.group}</span></div><span aria-hidden="true">↗</span></a>
      </article>
    </li>)}</ul>
    {!shown.length && <div className="catalog-empty"><p>一致するコンポーネントがありません。</p><Button variant="secondary" onClick={() => { setQuery(""); setGroup("すべて"); }}>条件をリセット</Button></div>}
  </div>;
}
