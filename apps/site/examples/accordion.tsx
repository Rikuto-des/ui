"use client";
import { useState } from "react";
import { Accordion, Checkbox, Field, Input, RadioGroup } from "@urushi/react";
export default function AccordionExample() {
  const [name,setName] = useState("Design journal");
  const [scope,setScope] = useState("チーム");
  const [notify,setNotify] = useState(true);
  return <div className="workflow-study">
    <header><span className="study-eyebrow">Less searching, more context</span><h3>閉じた状態でも設定を確認する</h3><p>見出しに現在の設定を表示します。開き直しても入力内容は残ります。</p></header>
    <Accordion name="study-settings">
      <Accordion.Item title="01　基本情報" description={name || "名前が未入力です"} defaultOpen><Field id="study-project" label="プロジェクト名"><Input value={name} onChange={e => setName(e.target.value)} /></Field></Accordion.Item>
      <Accordion.Item title="02　共有する相手" description={scope}><RadioGroup name="study-audience" legend="閲覧できる人" defaultValue="チーム" onChange={e => { if (e.target instanceof HTMLInputElement) setScope(e.target.value); }}><RadioGroup.Item value="自分だけ">自分だけ</RadioGroup.Item><RadioGroup.Item value="チーム">チーム</RadioGroup.Item></RadioGroup></Accordion.Item>
      <Accordion.Item title="03　通知" description={notify ? "更新をまとめて通知" : "通知しない"}><Checkbox checked={notify} onChange={e => setNotify(e.target.checked)}>更新をまとめて通知する</Checkbox></Accordion.Item>
    </Accordion>
  </div>;
}
