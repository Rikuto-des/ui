"use client";
import { useState } from "react";
import { RadioGroup } from "@urushi/react";
const choices = [{ value:"private", title:"自分だけ", description:"まだ形になっていないアイデアを自分だけで記録します。" }, { value:"team", title:"チーム", description:"一緒に考えるメンバーと共有します。" }, { value:"link", title:"リンクを知る人", description:"リンクを使って外部の人にレビューを依頼できます。" }];
export default function RadioGroupExample() {
  const [scope, setScope] = useState("team");
  return <div className="workflow-study">
    <header><span className="study-eyebrow">The right audience</span><h3>公開範囲を選んで確認する</h3><p>公開範囲の見本です。実際の共有設定は変更しません。</p></header>
    <RadioGroup name="study-scope" legend="公開範囲" variant="cards" onChange={e => { if (e.target instanceof HTMLInputElement) setScope(e.target.value); }}>
      {choices.map(choice => <RadioGroup.Item key={choice.value} value={choice.value} checked={scope === choice.value} onChange={() => setScope(choice.value)} description={choice.description}>{choice.title}</RadioGroup.Item>)}
    </RadioGroup>
    <div className="audience-preview" data-scope={scope}><div className="audience-people" aria-hidden="true"><span>A</span><span>B</span><span>C</span></div><div><strong>Design journal</strong><p role="status"><span>{scope === "private" ? "自分だけが" : scope === "team" ? "3人のメンバーが" : "リンクを知る人が"}</span><span>閲覧できます</span></p></div></div>
  </div>;
}
