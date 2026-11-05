"use client";
import { useState } from "react";
import { Calendar } from "@urushi/react/calendar";
const slots = ["午前（9時〜12時）", "午後（14時〜17時）", "夜（18時〜21時）"];
export default function CalendarExample({ compact = false }: { compact?: boolean }) {
  const [value, setValue] = useState("2026-11-12"),
    [slot, setSlot] = useState(0);
  const date = new Date(`${value}T12:00:00`);
  // Built from parts: engines join month, day and weekday differently ("12日木曜日" / "12日 木曜日"), which would break hydration.
  const words = `${date.getMonth() + 1}月${date.getDate()}日（${new Intl.DateTimeFormat("ja", { weekday: "short" }).format(date)}）`;
  return (
    <div className="interaction-study">
      {!compact && (
        <header>
          <small>PICK A DAY</small>
          <h3>月を見ながら配達日を選ぶ</h3>
        </header>
      )}
      <div className="study-delivery">
        <Calendar label="配達日" value={value} onValueChange={setValue} min="2026-11-05" max="2026-12-20" locale="ja" />
        {!compact && (
          <div className="study-delivery-slots">
            <p className="study-caption" role="status">
              {words}・{slots[slot]}に届けます。
            </p>
            <fieldset>
              <legend>時間帯</legend>
              {slots.map((label, i) => (
                <label key={label}>
                  <input type="radio" name="delivery-slot" checked={slot === i} onChange={() => setSlot(i)} />
                  {label}
                </label>
              ))}
            </fieldset>
          </div>
        )}
      </div>
    </div>
  );
}
