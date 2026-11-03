"use client";
import { useState } from "react";
import { Meter, ToggleGroup } from "@urushi/react";
const amounts:Record<string,number> = {compact:3.2,standard:6.4,original:9.2};
export default function MeterExample() {
  const [mode,setMode] = useState("standard");
  const value=amounts[mode];
  return <div className="workflow-study">
    <header><span className="study-eyebrow">Room for what comes next</span><h3>保存形式ごとの残り容量を比べる</h3><p>保存形式ごとの容量の見本です。上限に近づくと色も変わります。</p></header>
    <div className="capacity-study"><strong>{(10-value).toFixed(1)}<span> GB</span></strong><p>残りの容量</p><div className="capacity-blocks" aria-hidden="true">{Array.from({length:20},(_,i) => <span key={i} data-filled={i<Math.round(value*2)} data-level={value>8 ? "high" : value>5 ? "medium" : "low"}/>)}</div></div>
    <ToggleGroup name="capacity-mode" legend="保存形式" hideLegend={false} defaultValue="standard" onChange={e => { if (e.target instanceof HTMLInputElement) setMode(e.target.value); }}><ToggleGroup.Item value="compact">軽量</ToggleGroup.Item><ToggleGroup.Item value="standard">標準</ToggleGroup.Item><ToggleGroup.Item value="original">元の画質</ToggleGroup.Item></ToggleGroup>
    <Meter label="使用容量" value={value} max={10} low={5} high={8} optimum={0} valueText={`${value} GB / 10 GB`} />
    <p className="study-status" role="status">{value>8 ? "残り1 GBを切っています。軽量にすると容量を抑えられます。" : `あと${(10-value).toFixed(1)} GB使えます。`}</p>
  </div>;
}
