"use client";
import { useRef, useState } from "react";
import { Button, Field, Input, RadioGroup, Steps } from "@urushi/react";
export default function StepsExample() {
  const [step,setStep] = useState(0);
  const [name,setName] = useState("");
  const [scope,setScope] = useState("チーム");
  const [done,setDone] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const move = (next:number) => { setStep(next); requestAnimationFrame(() => heading.current?.focus({preventScroll:true})); };
  const labels = ["名前", "共有", "確認"];
  return <form className="workflow-study" onSubmit={e => { e.preventDefault(); if (step<2) move(step+1); else setDone(true); }}>
    <header><span className="study-eyebrow">One thing at a time</span><h3>前の手順に戻っても入力を保持する</h3><p>入力を保持する3ステップの見本です。送信は行いません。</p></header>
    <Steps label="プロジェクトの設定">{labels.map((title,i) => <Steps.Item key={title} title={title} status={done || i<step ? "done" : i===step ? "current" : "upcoming"} />)}</Steps>
    <section className="step-study-panel"><h4 ref={heading} tabIndex={-1}>{done ? "準備ができました" : `${step+1}. ${labels[step]}`}</h4>
      {done ? <p role="status">「{name}」を{scope}で始める準備ができました。</p> : step===0 ? <Field id="step-project-name" label="プロジェクト名" required><Input value={name} onChange={e => setName(e.target.value)} placeholder="例：Design journal" required /></Field> : step===1 ? <RadioGroup name="step-scope" legend="共有する相手" variant="cards" defaultValue={scope} onChange={e => { if (e.target instanceof HTMLInputElement) setScope(e.target.value); }}><RadioGroup.Item value="自分だけ">自分だけ</RadioGroup.Item><RadioGroup.Item value="チーム">チーム</RadioGroup.Item></RadioGroup> : <dl className="study-review"><div><dt>名前</dt><dd>{name}</dd></div><div><dt>共有</dt><dd>{scope}</dd></div></dl>}
    </section>
    <div className="study-actions">{done ? <Button onClick={() => {setDone(false);move(0);}}>設定を見直す</Button> : <><Button variant="primary" type="submit">{step===2 ? "この内容で確定" : "次へ"}</Button>{step>0 && <Button variant="ghost" onClick={() => move(step-1)}>前に戻る</Button>}</>}</div>
  </form>;
}
