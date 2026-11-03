"use client";
import { useState } from "react";
import { Button, Kbd } from "@urushi/react";
export default function KbdExample() {
  const [pressed, setPressed] = useState<string[]>([]),
    [mode, setMode] = useState(false);
  return (
    <div
      className="interaction-study"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPressed([]);
      }}
      onKeyDown={(e) => {
        if (e.nativeEvent.isComposing || e.key !== "Enter") return;
        setPressed(["Enter"]);
      }}
      onKeyUp={() => setPressed([])}
    >
      <header>
        <small>KEY FEEDBACK</small>
        <h3>押したキーを画面に表示する</h3>
      </header>
      <div className="study-keyboard">
        <Kbd pressed={pressed.includes("Enter")}>Enter ↵</Kbd>
      </div>
      <Button
        aria-pressed={mode}
        onPointerDown={() => setPressed(["Enter"])}
        onPointerUp={() => setPressed([])}
        onPointerCancel={() => setPressed([])}
        onClick={() => setMode(!mode)}
      >
        集中表示を切り替える
      </Button>
      <div className="study-result" data-ready={mode}>
        <strong>{mode ? "集中表示" : "標準表示"}</strong>
        <p role="status">
          ボタンにフォーカスして Enter を押すと、キーの沈み込みも確認できます。
        </p>
      </div>
    </div>
  );
}
