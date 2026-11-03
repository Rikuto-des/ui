import { ArrowRightIcon } from "@urushi/react/icons";
import { Avatar, Badge, Field, Input, Progress, Tabs } from "@urushi/react";

export default function TabsExample() {
  return <div className="motion-tabs-demo">
    <div className="experience-caption"><span>WORKSPACE</span><span>02 / 03</span></div>
    <h3>同じ場所で表示内容を切り替える</h3>
    <p className="experience-muted">切り替えても入力した内容はそのまま残ります。</p>
    <Tabs id="project" label="プロジェクト" defaultValue="overview">
      <Tabs.List><Tabs.Tab value="overview">概要</Tabs.Tab><Tabs.Tab value="tasks">タスク <span className="tab-count">4</span></Tabs.Tab><Tabs.Tab value="members">メンバー</Tabs.Tab></Tabs.List>
      <Tabs.Panel value="overview"><div className="motion-panel">
        <div className="motion-panel-heading"><Badge dot tone="ok">進行中</Badge><span>October 2026</span></div>
        <Field id="project-name" label="プロジェクト名"><Input defaultValue="秋のキャンペーン" name="projectName" autoComplete="off" /></Field>
        <Progress label="公開準備" value={72} />
        <Tabs.Activate tabs="project" value="tasks" variant="ghost" size="sm">残りのタスクを見る <ArrowRightIcon size={16} /></Tabs.Activate>
      </div></Tabs.Panel>
      <Tabs.Panel value="tasks"><div className="motion-panel"><div className="motion-panel-heading"><strong>公開までに残っている4つの作業</strong><Badge>Oct 30</Badge></div>
        <ul className="motion-task-list">{["告知ページのレビュー", "申し込みフォームの確認", "モバイル表示のチェック", "チームへの共有"].map((task, i) => <li key={task}><span className="motion-task-index">0{i + 1}</span><span>{task}</span><Badge tone={i === 0 ? "accent" : "neutral"}>{i === 0 ? "進行中" : "未着手"}</Badge></li>)}</ul>
      </div></Tabs.Panel>
      <Tabs.Panel value="members"><div className="motion-panel"><p className="experience-muted">このプロジェクトのチーム</p><div className="motion-members">{["Mika Sato", "Kai Ito", "Alex Morgan"].map(name => <div key={name}><Avatar name={name} /><span>{name}</span></div>)}</div></div></Tabs.Panel>
    </Tabs>
  </div>;
}
