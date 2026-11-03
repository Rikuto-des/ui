"use client";
import { useState } from "react";
import { Badge, Button } from "@urushi/react";
const items = [
  { name: "画面設計", state: "進行中", tone: "accent" as const },
  { name: "文字の整理", state: "完了", tone: "ok" as const },
  { name: "色の検証", state: "進行中", tone: "accent" as const },
];
export default function BadgeExample() {
  const [filter, setFilter] = useState("すべて");
  const visible = items.filter(
    (x) => filter === "すべて" || x.state === filter,
  );
  return (
    <div className="interaction-study">
      <header>
        <small>STATUS / FILTER</small>
        <h3>状態で一覧を絞り込む</h3>
      </header>
      <div className="study-actions" role="group" aria-label="状態で絞り込む">
        {["すべて", "進行中", "完了"].map((value) => (
          <Button
            key={value}
            variant="ghost"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {value}
            <Badge>
              {value === "すべて"
                ? 3
                : items.filter((x) => x.state === value).length}
            </Badge>
          </Button>
        ))}
      </div>
      <ul className="study-list">
        {visible.map((item) => (
          <li key={item.name}>
            <strong>{item.name}</strong>
            <Badge tone={item.tone} dot>
              {item.state}
            </Badge>
          </li>
        ))}
      </ul>
      <p className="study-caption" role="status">
        {visible.length}件を表示
      </p>
    </div>
  );
}
