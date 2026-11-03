"use client";
import { useState } from "react";
import { Avatar, Button } from "@urushi/react";
const people = [
  {
    name: "佐藤 美咲",
    role: "デザイン",
    status: "online" as const,
    label: "オンライン",
  },
  {
    name: "Alex Chen",
    role: "リサーチ",
    status: "away" as const,
    label: "離席中",
  },
  {
    name: "高橋 蓮",
    role: "開発",
    status: "busy" as const,
    label: "取り込み中",
  },
];
export default function AvatarExample() {
  const [active, setActive] = useState(0);
  const person = people[active];
  return (
    <div className="interaction-study">
      <header>
        <small>PEOPLE, NOT PLACEHOLDERS</small>
        <h3>名前と在席状態を確認する</h3>
      </header>
      <div
        className="study-avatar-picker"
        role="group"
        aria-label="メンバーを選択"
      >
        {people.map((p, i) => (
          <Button
            key={p.name}
            variant="ghost"
            aria-pressed={active === i}
            onClick={() => setActive(i)}
          >
            <Avatar
              aria-hidden="true"
              name={p.name}
              size="lg"
              status={p.status}
              statusLabel={p.label}
            />
            {p.name}
          </Button>
        ))}
      </div>
      <div className="study-person" key={person.name}>
        <Avatar
          name={person.name}
          size="lg"
          status={person.status}
          statusLabel={person.label}
        />
        <div>
          <strong>{person.name}</strong>
          <p>
            {person.role} / {person.label}
          </p>
        </div>
      </div>
      <p className="study-caption" role="status">
        {person.name}を表示しています。在席状態は文字でも確認できます。
      </p>
    </div>
  );
}
