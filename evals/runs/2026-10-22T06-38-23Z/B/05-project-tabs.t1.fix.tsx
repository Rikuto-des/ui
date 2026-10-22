"use client";

import { useState } from "react";
import { Badge, Card, Switch, Tabs } from "@yourlib/react";

type Member = {
  id: string;
  name: string;
  role: string;
};

type Activity = {
  id: string;
  description: string;
  timestamp: string;
};

const project = {
  name: "ウェブサイトリニューアル",
  status: "進行中",
  description:
    "コーポレートサイトのデザインと情報設計を刷新するプロジェクトです。アクセシビリティの改善、表示速度の向上、コンテンツ管理の効率化を目標とし、2026 年度第 4 四半期の公開を予定しています。",
};

const members: Member[] = [
  { id: "m1", name: "佐藤 花子", role: "プロジェクトマネージャー" },
  { id: "m2", name: "鈴木 一郎", role: "デザイナー" },
  { id: "m3", name: "高橋 健太", role: "フロントエンドエンジニア" },
  { id: "m4", name: "田中 美咲", role: "コンテンツ編集" },
];

const activities: Activity[] = [
  {
    id: "a1",
    description: "鈴木 一郎さんがトップページのデザイン案をアップロードしました",
    timestamp: "2026-10-21 16:42",
  },
  {
    id: "a2",
    description: "高橋 健太さんが「ナビゲーションの実装」を完了にしました",
    timestamp: "2026-10-20 11:05",
  },
  {
    id: "a3",
    description: "佐藤 花子さんがマイルストーン「β 公開」の期限を更新しました",
    timestamp: "2026-10-18 09:30",
  },
];

export function ProjectDetailScreen() {
  const [archived, setArchived] = useState(false);

  const tabItems = [
    {
      value: "overview",
      label: "概要",
      content: (
        <Card>
          <section className="flex flex-col gap-2 p-4">
            <h2 className="text-lg font-semibold">プロジェクトの説明</h2>
            <p className="leading-relaxed">{project.description}</p>
          </section>
        </Card>
      ),
    },
    {
      value: "members",
      label: "メンバー",
      content: (
        <Card>
          <section className="flex flex-col gap-3 p-4">
            <h2 className="text-lg font-semibold">
              メンバー（{members.length} 名）
            </h2>
            <ul className="flex flex-col divide-y">
              {members.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between py-2"
                >
                  <span>{member.name}</span>
                  <span className="text-sm opacity-70">{member.role}</span>
                </li>
              ))}
            </ul>
          </section>
        </Card>
      ),
    },
    {
      value: "activity",
      label: "アクティビティ",
      content: (
        <Card>
          <section className="flex flex-col gap-3 p-4">
            <h2 className="text-lg font-semibold">最近のアクティビティ</h2>
            <ol className="flex flex-col gap-3">
              {activities.map((activity) => (
                <li key={activity.id} className="flex flex-col gap-0.5">
                  <p>{activity.description}</p>
                  <time
                    className="text-sm opacity-70"
                    dateTime={activity.timestamp.replace(" ", "T")}
                  >
                    {activity.timestamp}
                  </time>
                </li>
              ))}
            </ol>
          </section>
        </Card>
      ),
    },
    {
      value: "settings",
      label: "設定",
      content: (
        <Card>
          <section className="flex flex-col gap-2 p-4">
            <h2 className="text-lg font-semibold">設定</h2>
            <Switch isSelected={archived} onChange={setArchived}>
              プロジェクトをアーカイブする
            </Switch>
            <p className="text-sm opacity-70">
              アーカイブすると、プロジェクトは読み取り専用になります。
            </p>
          </section>
        </Card>
      ),
    },
  ];

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <Badge>{archived ? "アーカイブ済み" : project.status}</Badge>
      </header>

      <Tabs
        id="project-detail-tabs"
        label="プロジェクトの詳細"
        defaultValue="overview"
        items={tabItems}
      />
    </main>
  );
}
