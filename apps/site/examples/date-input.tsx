"use client";
import { useState } from "react";
import { Button, DateInput, Field } from "@urushi/react";
export default function DateInputExample() {
  const [start, setStart] = useState("2026-11-02"),
    [end, setEnd] = useState("2026-11-06");
  const days = Math.round((Date.parse(end) - Date.parse(start)) / 86400000) + 1;
  const valid = Number.isFinite(days) && days > 0;
  return (
    <div className="interaction-study">
      <header>
        <small>TIME WINDOW</small>
        <h3>開始日と終了日を指定する</h3>
      </header>
      <div className="study-columns">
        <Field id="date-start" label="開始日">
          <DateInput value={start} onChange={(e) => setStart(e.target.value)} />
        </Field>
        <Field
          id="date-end"
          label="終了日"
          error={!valid ? "開始日以降の日付を選んでください。" : undefined}
        >
          <DateInput
            value={end}
            min={start}
            onChange={(e) => setEnd(e.target.value)}
          />
        </Field>
      </div>
      <div className="study-date-window" role="status">
        <strong>
          {valid ? days : "—"}
          <small>日間</small>
        </strong>
        <p>{valid ? `${start} → ${end}` : "期間を確認してください"}</p>
        <div aria-hidden="true">
          {Array.from({ length: Math.min(valid ? days : 0, 14) }, (_, i) => (
            <span key={i} />
          ))}
        </div>
      </div>
      <Button
        variant="ghost"
        onClick={() => {
          setStart("2026-11-02");
          setEnd("2026-11-06");
        }}
      >
        5日間に戻す
      </Button>
    </div>
  );
}
