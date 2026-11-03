"use client";

import { useState } from "react";
import { Avatar, Badge } from "@urushi/react";
import { Combobox, type ComboboxOption } from "@urushi/react/combobox";

const people = [
  { value: "mika", label: "Mika Sato", description: "Design", keywords: ["デザイン", "designer", "佐藤"], place: "Tokyo", work: "ブランドをプロダクトのデザインに反映し、情報設計から細部の仕上げまで担当します。", skills: ["Brand", "UI design"], project: "ブランドサイトのリニューアル" },
  { value: "kai", label: "Kai Ito", description: "Engineering", keywords: ["開発", "engineer", "伊藤"], place: "Kyoto", work: "使い心地のよいインターフェースを実装します。アクセシビリティとパフォーマンスを大切にしています。", skills: ["React", "Motion"], project: "コンポーネントの設計と実装" },
  { value: "alex", label: "Alex Morgan", description: "Product", keywords: ["企画", "research", "リサーチ"], place: "London", work: "利用者の声から次につくるものを見つけます。リサーチとプロジェクトの進行を担当します。", skills: ["Research", "Strategy"], project: "新しいオンボーディング" },
  { value: "ren", label: "Ren Aoki", description: "休暇中", disabled: true, keywords: ["青木"], place: "Osaka", work: "", skills: [], project: "" },
];
const options: ComboboxOption[] = people.map(person => ({ ...person, icon: <Avatar name={person.label} size="sm" /> }));

export default function ComboboxExample() {
  const [value, setValue] = useState("mika");
  const selected = people.find(person => person.value === value)!;
  return <div className="choice-demo">
    <div className="experience-caption"><span>TEAM</span><span>01 / 03</span></div>
    <h3>専門分野を確認して担当者を選ぶ</h3>
    <p className="experience-muted">名前のほか、「開発」「リサーチ」でも探せます。</p>
    <Combobox label="担当者" placeholder="名前や専門分野で検索…" value={value} onValueChange={setValue} options={options} emptyText="該当する担当者がいません。" previewLabel="担当者のプロフィール" previewActionLabel="この人を担当者にする" renderPreview={option => {
      const person = people.find(person => person.value === option.value)!;
      return <div className="person-preview">
        <div className="person-preview-top"><Avatar name={person.label} size="lg" /><span>{person.place}</span></div>
        <strong>{person.label}</strong><span className="experience-muted">{person.description}</span>
        <p>{person.work}</p>
        <div className="person-skills">{person.skills.map(skill => <Badge key={skill}>{skill}</Badge>)}</div>
        <div className="person-project"><span>現在のプロジェクト</span><strong>{person.project}</strong></div>
      </div>;
    }} />
    <div className="choice-committed" role="status"><Avatar name={selected.label} size="sm" /><div><strong>{selected.label}</strong><span>プロジェクトの担当者</span></div><Badge dot tone="ok">選択済み</Badge></div>
    <p className="experience-footnote">候補を比較してから確定できます。Escapeで元の選択に戻れます。</p>
  </div>;
}
