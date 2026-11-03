"use client";
import { useEffect, useState } from "react";
import { Button, Spinner } from "@urushi/react";
export default function SpinnerExample() {
  const [phase, setPhase] = useState("idle");
  useEffect(() => {
    if (phase !== "loading") return;
    const timer = setTimeout(() => setPhase("done"), 2400);
    return () => clearTimeout(timer);
  }, [phase]);
  return (
    <div className="interaction-study">
      <header>
        <small>WAIT WITH CONTROL</small>
        <h3>処理を待っている間も取り消す</h3>
      </header>
      <div className="study-loading-stage">
        {phase === "loading" ? (
          <Spinner showLabel label="ノートを準備しています" />
        ) : (
          <div className="study-result" key={phase}>
            <small>{phase === "done" ? "READY" : "NOTEBOOK"}</small>
            <strong>
              {phase === "done"
                ? "ノートの準備ができました"
                : "3冊のノートをまとめる"}
            </strong>
          </div>
        )}
      </div>
      <div className="study-actions">
        <Button
          aria-disabled={phase === "loading"}
          onClick={() => {
            if (phase !== "loading") setPhase("loading");
          }}
        >
          読み込みを試す
        </Button>
        <Button variant="ghost" onClick={() => setPhase("idle")}>
          {phase === "loading" ? "読み込みを取り消す" : "初期状態に戻す"}
        </Button>
      </div>
      <p className="study-caption" role="status">
        {phase === "done"
          ? "処理が完了しました。"
          : "約2秒のデモです。いつでも取り消せます。"}
      </p>
    </div>
  );
}
