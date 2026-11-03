"use client";
import { useState } from "react";
import { Checkbox, Collapsible, Field, Slider } from "@urushi/react";
export default function CollapsibleExample() {
  const [quality,setQuality] = useState(80);
  const [metadata,setMetadata] = useState(false);
  return <div className="workflow-study">
    <header><span className="study-eyebrow">Details, when you need them</span><h3>必要なときに詳細設定を開く</h3></header>
    <div className="export-summary"><span className="export-paper" aria-hidden="true">Aa</span><div><strong>Design journal.pdf</strong><p>書き出し設定のプレビュー</p></div></div>
    <Collapsible title="書き出しの詳細" description={`画質 ${quality}%・${metadata ? "メタデータを含める" : "メタデータなし"}`}>
      <div className="study-field-stack"><Field id="study-quality" label="画質"><Slider min={20} max={100} step={10} value={quality} onChange={e => setQuality(Number(e.target.value))} showValue valueSuffix="%" /></Field><Checkbox checked={metadata} onChange={e => setMetadata(e.target.checked)}>メタデータを含める</Checkbox></div>
    </Collapsible>
  </div>;
}
