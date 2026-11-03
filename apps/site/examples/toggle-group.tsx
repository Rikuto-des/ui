"use client";
import { useState } from "react";
import { ToggleGroup } from "@urushi/react";
const notes = [{ title:"余白をつくる", category:"Composition" }, { title:"色を絞る", category:"Color study" }, { title:"流れをつなぐ", category:"Interaction" }];
export default function ToggleGroupExample() {
  const [view, setView] = useState("list");
  return <div className="workflow-study">
    <header><span className="study-eyebrow">A different perspective</span><h3>ノートの表示方法を切り替える</h3></header>
    <ToggleGroup legend="ノートの表示方法" name="study-view" defaultValue="list" onChange={e => { if (e.target instanceof HTMLInputElement) setView(e.target.value); }}>
      <ToggleGroup.Item value="list">リスト</ToggleGroup.Item><ToggleGroup.Item value="grid">グリッド</ToggleGroup.Item><ToggleGroup.Item value="compact">コンパクト</ToggleGroup.Item>
    </ToggleGroup>
    <div className="view-study-notes" data-view={view}>{notes.map((note,index) => <article key={note.title}><span className="view-study-art" data-art={index} aria-hidden="true"/><div><small>{note.category}</small><h4>{note.title}</h4></div><span className="view-study-number">0{index+1}</span></article>)}</div>
    <p className="study-status" role="status">{view === "list" ? "リスト" : view === "grid" ? "グリッド" : "コンパクト"}表示・3件のノート</p>
  </div>;
}
