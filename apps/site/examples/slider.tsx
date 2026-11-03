"use client";
import { useState, type CSSProperties } from "react";
import { Button, Field, Slider } from "@urushi/react";
export default function SliderExample() {
  const [size, setSize] = useState(18);
  const [space, setSpace] = useState(50);
  return <div className="slider-study">
    <div className="experience-caption"><span>FIND YOUR RHYTHM</span><span>TYPE & SPACE</span></div>
    <h3>文字サイズと余白を調整する</h3>
    <div className="type-specimen" style={{ "--sample-size": `${size}px`, "--sample-space": `${14 + space * .16}px` } as CSSProperties}><span>FIELD NOTES / 01</span><p>日々の気づきから<br />アイデアを考える</p><span>気づいたことをこのノートに記録します。</span></div>
    <Field id="type-size" label="文字サイズ"><Slider min={14} max={22} step={1} value={size} onChange={event => setSize(Number(event.target.value))} showValue valueSuffix="px" aria-valuetext={`${size}ピクセル`} marks={[{ value: 14, label: "小さく" }, { value: 18, label: "標準" }, { value: 22, label: "大きく" }]} /></Field>
    <Field id="type-space" label="余白"><Slider min={0} max={100} value={space} onChange={event => setSpace(Number(event.target.value))} showValue valueSuffix="%" marks={[{ value: 0, label: "コンパクト" }, { value: 50, label: "標準" }, { value: 100, label: "ゆったり" }]} /></Field>
    <Button size="sm" variant="ghost" onClick={() => { setSize(18); setSpace(50); }}>初期値に戻す</Button>
  </div>;
}
