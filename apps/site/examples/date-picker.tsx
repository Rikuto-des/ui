"use client";
import { useState } from "react";
import { DatePicker } from "@urushi/react/date-picker";
export default function DatePickerExample({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [value, setValue] = useState("2026-10-30");
  const date = value ? new Date(`${value}T12:00:00`) : undefined;
  return (
    <div className="interaction-study">
      {!compact && (
        <header>
          <small>MAKE A DATE</small>
          <h3>入力欄やカレンダーから日付を選ぶ</h3>
        </header>
      )}
      <DatePicker
        label="公開日"
        value={value}
        onValueChange={setValue}
        min="2026-01-01"
        max="2027-12-31"
        locale="ja"
        presets={[
          { label: "11月2日", value: "2026-11-02" },
          { label: "11月9日", value: "2026-11-09" },
          { label: "11月16日", value: "2026-11-16" },
        ]}
      />
      {!compact && (
        <div className="study-calendar-slip" role="status">
          <div>
            <small>
              {date
                ? [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ][date.getMonth()]
                : "DATE"}
            </small>
            <strong>{date?.getDate() ?? "—"}</strong>
          </div>
          <section>
            <strong>Field notes</strong>
            <p>
              {date
                ? `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${["日", "月", "火", "水", "木", "金", "土"][date.getDay()]}曜日）`
                : "公開日を選んでください"}
            </p>
            <span>このプレビューの公開予定日</span>
          </section>
        </div>
      )}
    </div>
  );
}
