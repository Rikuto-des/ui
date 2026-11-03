"use client";

import { useState, useSyncExternalStore } from "react";
import { Button, Field, Input, Select } from "@urushi/react";
import * as Icons from "@urushi/react/icons";

// This catalog intentionally shows all exports. App code imports individual icons.
const entries = Object.entries(Icons).filter(([name]) => name.endsWith("Icon")) as [string, React.ComponentType<Icons.IconProps>][];
const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function IconGallery() {
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  const [query, setQuery] = useState("");
  const [size, setSize] = useState<16 | 20 | 24>(20);
  const [saved, setSaved] = useState(false);
  const [selected, setSelected] = useState("BookmarkSimpleIcon");
  const matches = entries.filter(([name]) => name.toLowerCase().includes(query.trim().toLowerCase()));
  return <fieldset className="icon-explorer demo-interaction-boundary" disabled={!ready} aria-busy={!ready}>
    <div className="icon-state-demo">
      <div><span className="icon-eyebrow">REGULAR → FILL</span><h2>保存状態に合わせて形を変える</h2><p>保存ボタンを押すとアイコンが塗りつぶされます。もう一度押すと線画に戻ります。</p></div>
      <Button aria-pressed={saved} onClick={() => setSaved(!saved)}>
        <Icons.BookmarkSimpleIcon size={24} weight={saved ? "fill" : "regular"} />
        {saved ? "保存済み" : "保存"}
      </Button>
    </div>
    <div className="icon-tools">
      <Field id="icon-search" label="アイコンを検索"><Input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="search, arrow, bookmark…" /></Field>
      <Field id="icon-size" label="サイズ"><Select value={size} onChange={e => setSize(Number(e.target.value) as 16 | 20 | 24)}><option value={16}>16px</option><option value={20}>20px</option><option value={24}>24px</option></Select></Field>
    </div>
    <p className="icon-count" role="status">{matches.length} / {entries.length} icons</p>
    <div className="icon-grid" role="group" aria-label="同梱アイコン">
      {matches.map(([name, Icon]) => <button type="button" key={name} aria-pressed={selected === name} onClick={() => setSelected(name)}><Icon size={size} /><span>{name.replace(/Icon$/, "")}</span></button>)}
    </div>
    {!matches.length && <p className="icon-empty">一致するアイコンがありません。英語の名前で検索してください。</p>}
    <div className="icon-code" aria-live="polite"><code>{`import { ${selected} } from "@urushi/react/icons";\n\n<${selected} size={${size}} />`}</code></div>
  </fieldset>;
}
