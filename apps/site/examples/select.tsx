"use client";
import { useState } from "react";
import { Avatar, Badge, Field, Select } from "@urushi/react";
const people = [
  {
    id: "misaki",
    name: "佐藤 美咲",
    role: "デザイン",
    task: "画面の余白と文字をレビュー",
  },
  { id: "ren", name: "高橋 蓮", role: "開発", task: "キーボード操作を確認" },
  {
    id: "alex",
    name: "Alex Chen",
    role: "リサーチ",
    task: "利用者のフィードバックを整理",
  },
];
export default function SelectExample() {
  const [id, setId] = useState("misaki");
  const person = people.find((p) => p.id === id)!;
  return (
    <div className="interaction-study">
      <header>
        <small>HANDOFF</small>
        <h3>担当者と次の作業を選ぶ</h3>
      </header>
      <Field id="select-assignee" label="担当者">
        <Select value={id} onChange={(e) => setId(e.target.value)}>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </Field>
      <div className="study-person" key={id}>
        <Avatar
          name={person.name}
          size="lg"
          status="online"
          statusLabel="オンライン"
        />
        <div>
          <strong>{person.name}</strong>
          <p>{person.role}</p>
        </div>
        <Badge tone="ok">担当</Badge>
      </div>
      <div className="study-result" role="status">
        <small>NEXT ACTION</small>
        <strong>{person.task}</strong>
      </div>
    </div>
  );
}
