"use client";
import { useEffect, useRef, useState } from "react";
import { Button, Field, Input } from "@urushi/react";
export default function ButtonExample() {
  const [draft, setDraft] = useState("Field notes"),
    [saved, setSaved] = useState("Field notes"),
    [phase, setPhase] = useState("idle");
  const snapshot = useRef("");
  useEffect(() => {
    if (phase !== "saving") return;
    const timer = setTimeout(() => {
      setSaved(snapshot.current);
      setPhase("saved");
    }, 900);
    return () => clearTimeout(timer);
  }, [phase]);
  return (
    <div className="interaction-study">
      <header>
        <small>COMMIT / UNDO</small>
        <h3>保存中でも操作を取り消す</h3>
      </header>
      <Field id="button-title" label="ノートのタイトル">
        <Input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (phase !== "saving") setPhase("idle");
          }}
          disabled={phase === "saving"}
        />
      </Field>
      <div className="study-actions">
        <Button
          loading={phase === "saving"}
          onClick={() => {
            if (!draft.trim()) return;
            snapshot.current = draft;
            setPhase("saving");
          }}
        >
          {phase === "saving"
            ? "保存しています…"
            : phase === "saved"
              ? "保存しました"
              : "変更を保存"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setPhase("idle");
            setDraft(saved);
          }}
        >
          {phase === "saving" ? "保存を取り消す" : "変更を戻す"}
        </Button>
      </div>
      <div className="study-result" data-ready={phase === "saved"}>
        <small>SAVED IN THIS PREVIEW</small>
        <strong>{saved}</strong>
        <p role="status">
          {phase === "saving"
            ? "デモの処理中です。取消できます。"
            : phase === "saved"
              ? "このページに保存しました。再読み込みすると初期状態に戻ります。"
              : "タイトルを変えて保存を試せます。"}
        </p>
      </div>
    </div>
  );
}
