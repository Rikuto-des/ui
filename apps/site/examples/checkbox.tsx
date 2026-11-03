"use client";
import { useEffect, useRef, useState } from "react";
import { Badge, Button, Checkbox, Progress } from "@urushi/react";
const tasks = [
  { title: "内容を読み直す", description: "日付やリンク、表記を確認します。" },
  { title: "小さな画面で見る", description: "文字の読みやすさと操作のしやすさを確認します。" },
  { title: "チームに共有する", description: "気になる点を一緒に見つけます。" },
];
export default function CheckboxExample() {
  const [done, setDone] = useState([0]);
  const all = useRef<HTMLInputElement>(null);
  useEffect(() => { if (all.current) all.current.indeterminate = done.length > 0 && done.length < tasks.length; }, [done]);
  return <div className="selection-study">
    <div className="experience-caption"><span>READY TO SHIP</span><span>CHECKLIST</span></div>
    <h3>公開前の項目をチェックする</h3>
    <div className="selection-study-heading"><Checkbox ref={all} checked={done.length === tasks.length} onChange={event => setDone(event.target.checked ? tasks.map((_, i) => i) : [])}>すべて確認する</Checkbox><Badge tone={done.length === 3 ? "ok" : "neutral"}>{done.length} / 3</Badge></div>
    <div className="selection-study-items">{tasks.map((task, i) => <div key={task.title} data-done={done.includes(i) || undefined}><Checkbox checked={done.includes(i)} description={task.description} onChange={event => setDone(previous => event.target.checked ? [...previous, i] : previous.filter(value => value !== i))}>{task.title}</Checkbox></div>)}</div>
    <Progress label="公開前チェック" value={done.length / 3 * 100} />
    <div className="selection-study-footer"><p role="status">{done.length === 3 ? "準備が整いました。" : `残り${3 - done.length}項目です。いつでも選び直せます。`}</p><Button variant="ghost" size="sm" disabled={done.length === 0} onClick={() => setDone([])}>すべて解除</Button></div>
  </div>;
}
