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
  actor: string;
  action: string;
  date: string;
  dateTime: string;
};

const project = {
  name: "Webサイトリニューアル",
  status: "進行中",
  description:
    "コーポレートサイトのデザインと情報設計を刷新するプロジェクトです。アクセシビリティとページ表示速度の改善を主な目標とし、2026年12月末の公開を予定しています。",
};

const members: Member[] = [
  { id: "m1", name: "佐藤 花子", role: "プロジェクトマネージャー" },
  { id: "m2", name: "鈴木 一郎", role: "デザイナー" },
  { id: "m3", name: "高橋 健太", role: "フロントエンドエンジニア" },
  { id: "m4", name: "田中 美咲", role: "コンテンツ担当" },
];

const activities: Activity[] = [
  {
    id: "a1",
    actor: "鈴木 一郎",
    action: "トップページのデザイン案を更新しました",
    date: "2026年10月21日",
    dateTime: "2026-10-21",
  },
  {
    id: "a2",
    actor: "高橋 健太",
    action: "ナビゲーションの実装をレビューに出しました",
    date: "2026年10月20日",
    dateTime: "2026-10-20",
  },
  {
    id: "a3",
    actor: "佐藤 花子",
    action: "公開スケジュールを確定しました",
    date: "2026年10月18日",
    dateTime: "2026-10-18",
  },
];

export function ProjectDetailPage() {
  const [archived, setArchived] = useState(false);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <Badge>{archived ? "アーカイブ済み" : project.status}</Badge>
      </header>

      <Tabs id="project-detail-tabs" label="プロジェクトの詳細" defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab value="overview">概要</Tabs.Tab>
          <Tabs.Tab value="members">メンバー</Tabs.Tab>
          <Tabs.Tab value="activity">アクティビティ</Tabs.Tab>
          <Tabs.Tab value="settings">設定</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <Card padding="lg" className="mt-4">
            <h2 className="mb-2 text-lg font-semibold">概要</h2>
            <p className="leading-relaxed">{project.description}</p>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="members">
          <Card padding="lg" className="mt-4">
            <h2 className="mb-4 text-lg font-semibold">メンバー</h2>
            <ul className="divide-y">
              {members.map((member) => (
                <li
                  key={member.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <span className="font-medium">{member.name}</span>
                  <span className="text-sm opacity-75">{member.role}</span>
                </li>
              ))}
            </ul>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="activity">
          <Card padding="lg" className="mt-4">
            <h2 className="mb-4 text-lg font-semibold">最近のアクティビティ</h2>
            <ol className="space-y-4">
              {activities.map((activity) => (
                <li key={activity.id}>
                  <p>
                    <span className="font-medium">{activity.actor}</span> が
                    {activity.action}
                  </p>
                  <time
                    dateTime={activity.dateTime}
                    className="text-sm opacity-75"
                  >
                    {activity.date}
                  </time>
                </li>
              ))}
            </ol>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="settings">
          <Card padding="lg" className="mt-4">
            <h2 className="mb-4 text-lg font-semibold">設定</h2>
            <div className="flex items-center justify-between gap-4">
              <div>
                <label htmlFor="archive-project" className="font-medium">
                  プロジェクトをアーカイブする
                </label>
                <p id="archive-project-description" className="text-sm opacity-75">
                  アーカイブすると、プロジェクトは読み取り専用になります。
                </p>
              </div>
              <Switch
                id="archive-project"
                checked={archived}
                onChange={(e) => setArchived(e.currentTarget.checked)}
                aria-describedby="archive-project-description"
              />
            </div>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </main>
  );
}
