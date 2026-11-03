"use client";
import { useEffect, useState } from "react";
import { Button, Progress } from "@urushi/react";
export default function ProgressExample() {
  const [page,setPage] = useState(0);
  const [running,setRunning] = useState(false);
  useEffect(() => { if (!running || page === 6) return; const timer = setTimeout(() => setPage(n => n+1),800); return () => clearTimeout(timer); },[page,running]);
  const done = page === 6;
  return <div className="workflow-study">
    <header><span className="study-eyebrow">Every step, visible</span><h3>書き出しの進み具合を確認する</h3><p>6ページの書き出しを再現したデモです。一時停止して、続きから再開できます。</p></header>
    <div className="export-pages" aria-hidden="true">{Array.from({length:6},(_,i) => <span key={i} data-done={i<page} data-active={i===page && running}>0{i+1}</span>)}</div>
    <Progress label="ノートの書き出し" value={page} max={6} valueText={`${page} / 6ページ`} milestones={[{value:2,label:"画像"},{value:4,label:"レイアウト"},{value:6,label:"完了"}]} />
    <div className="study-actions"><Button variant="primary" aria-disabled={done || undefined} onClick={() => { if (!done) setRunning(!running); }}>{done ? "完了" : running ? "一時停止" : page ? "続きから再開" : "書き出しを試す"}</Button><Button variant="ghost" onClick={() => {setPage(0);setRunning(false);}}>最初から</Button></div>
    <p className="study-status" role="status">{done ? "6ページの準備ができました。" : running ? "ページを組み立てています。" : page ? "一時停止中です。進捗は保持しています。" : "開始するとページごとに進みます。"}</p>
  </div>;
}
