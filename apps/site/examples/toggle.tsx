"use client";
import { useState } from "react";
import { Toggle } from "@urushi/react";
export default function ToggleExample() {
  const [bold,setBold]=useState(false), [italic,setItalic]=useState(false), [highlight,setHighlight]=useState(false);
  return <div className="workflow-study">
    <header><span className="study-eyebrow">Make your point</span><h3>文章の書式を切り替える</h3></header>
    <div role="group" aria-label="書式" className="study-actions"><Toggle aria-label="太字" checked={bold} onChange={e => setBold(e.target.checked)}><b>B</b></Toggle><Toggle aria-label="斜体" checked={italic} onChange={e => setItalic(e.target.checked)}><i>I</i></Toggle><Toggle checked={highlight} onChange={e => setHighlight(e.target.checked)}>ハイライト</Toggle></div>
    <blockquote className="format-study"><span style={{fontWeight:bold ? 650 : 400,fontStyle:italic ? "italic" : "normal"}} data-highlight={highlight}>日々の気づきから<br/>アイデアを考える</span><footer>Notes on everyday design</footer></blockquote>
  </div>;
}
