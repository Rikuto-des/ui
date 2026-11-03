"use client";
import { useState } from "react";
import { Button, Field, Textarea } from "@urushi/react";

export default function TextareaExample() {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState("");
  return <div className="workflow-study writing-study">
    <header><span className="study-eyebrow">A little note</span><h3>チームへのメモを書く</h3><p>入力に合わせて欄の高さが変わり、右下に文字数を表示します。</p></header>
    <Field id="study-note" label="チームへのメモ" description="160文字まで入力できます。入力内容はこのページ内でだけ保持します。"><Textarea value={text} onChange={e => setText(e.target.value)} rows={3} maxLength={160} showCount placeholder="今日の発見や次に試したいことを書いてください" /></Field>
    <div className="study-actions"><Button variant="primary" disabled={!text.trim() || text === saved} onClick={() => setSaved(text)}>メモを確定</Button><Button variant="ghost" onClick={() => { setText("気になった箇所を見直そう。\n明日ははじめて使う人の目線で画面を見直してみよう。"); }}>見本を入れる</Button></div>
    <p className="study-status" role="status">{saved && saved === text ? "このページのメモに反映しました。" : saved ? "未反映の変更があります。" : "まだ確定していません。"}</p>
  </div>;
}
