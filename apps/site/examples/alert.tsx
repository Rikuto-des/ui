"use client";
import { useEffect, useState } from "react";
import { Alert, Button } from "@urushi/react";
export default function AlertExample() {
  const [state,setState] = useState<"offline"|"retrying"|"connected">("offline");
  useEffect(() => { if (state!=="retrying") return; const timer=setTimeout(() => setState("connected"),900); return () => clearTimeout(timer); },[state]);
  return <div className="workflow-study">
    <header><span className="study-eyebrow">A way forward</span><h3>接続状況を確認して再試行する</h3><p>接続の復帰を再現したデモです。外部通信は行いません。</p></header>
    <div className="alert-study-scene" data-connected={state==="connected"}><span aria-hidden="true"/><strong>Design journal</strong><span>{state==="connected" ? "変更を反映済み" : "未反映の変更が3件"}</span></div>
    <Alert tone={state==="connected" ? "ok" : "warning"} title={state==="connected" ? "接続が戻りました" : "変更をまだ反映できていません"} action={<Button loading={state==="retrying"} onClick={() => setState(state==="connected" ? "offline" : "retrying")}>{state==="retrying" ? "確認中…" : state==="connected" ? "もう一度試す前に戻す" : "もう一度試す"}</Button>}>{state==="connected" ? "この画面の見本に3件の変更を反映しました。" : "入力内容は残っています。接続を確認して再試行できます。"}</Alert>
    <p className="study-status" role="status">{state==="connected" ? "3件の変更を反映しました。" : state==="retrying" ? "接続を確認しています。" : "再試行できます。"}</p>
  </div>;
}
