"use client";
import { useState } from "react";
import { Button, Empty, Field, Input } from "@urushi/react";
export default function EmptyExample() {
  const [items,setItems] = useState<string[]>([]);
  const [query,setQuery] = useState("");
  const matches = items.filter(item => item.includes(query));
  return <div className="workflow-study">
    <header><span className="study-eyebrow">A useful starting point</span><h3>空の一覧からノートを作る</h3></header>
    {items.length>0 && <Field id="empty-search" label="ノートを検索"><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="タイトルで絞り込む" /></Field>}
    {!items.length ? <Empty title="最初のノートを作りましょう" description="白紙のノートを作成するか、見本を選んで始められます。" action={<div className="study-actions"><Button variant="primary" onClick={() => setItems(["無題のノート"])}>白紙から始める</Button><Button onClick={() => setItems(["今日の発見", "次に試すこと"])}>見本を使う</Button></div>} /> : !matches.length ? <Empty title="一致するノートがありません" description={`「${query}」を含むノートは見つかりませんでした。`} action={<Button onClick={() => setQuery("")}>検索を解除</Button>} /> : <ul className="note-study-list">{matches.map((item,i) => <li key={item}><span aria-hidden="true">0{i+1}</span><strong>{item}</strong><span>下書き</span></li>)}</ul>}
    {items.length>0 && <Button variant="ghost" onClick={() => {setItems([]);setQuery("");}}>空の状態に戻す</Button>}
    <p className="study-status" role="status">{items.length ? `${items.length}件のノート・このページ内の見本です。` : "ここで作った内容はページを離れると消えます。"}</p>
  </div>;
}
