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
  name: "Webサイト リニューアル",
  status: "進行中",
  description:
    "コーポレートサイトのデザインと情報設計を刷新するプロジェクトです。表示速度とアクセシビリティを改善し、採用情報や製品紹介のページを見つけやすくします。公開は来年の第 1 四半期を予定しています。",
};

const members: Member[] = [
  { id: "m1", name: "佐藤 美咲", role: "プロジェクトマネージャー" },
  { id: "m2", name: "鈴木 健太", role: "デザイナー" },
  { id: "m3", name: "高橋 翔", role: "フロントエンドエンジニア" },
  { id: "m4", name: "田中 愛", role: "コンテンツ担当" },
];

const activities: Activity[] = [
  {
    id: "a1",
    description: "鈴木 健太 さんがトップページのデザイン案をアップロードしました",
    timestamp: "2 時間前",
  },
  {
    id: "a2",
    description: "高橋 翔 さんがナビゲーションの実装を完了しました",
    timestamp: "昨日",
  },
  {
    id: "a3",
    description: "佐藤 美咲 さんがマイルストーン「デザイン確定」を作成しました",
    timestamp: "3 日前",
  },
];

export function ProjectDetailScreen() {
  const [isArchived, setIsArchived] = useState(false);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <Badge tone={isArchived ? "neutral" : "ok"}>
          {isArchived ? "アーカイブ済み" : project.status}
        </Badge>
      </header>

      <Tabs id="project-detail-tabs" label="プロジェクトの詳細" defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab value="overview">概要</Tabs.Tab>
          <Tabs.Tab value="members">メンバー</Tabs.Tab>
          <Tabs.Tab value="activity">アクティビティ</Tabs.Tab>
          <Tabs.Tab value="settings">設定</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <Card padding="md" className="mt-4">
            <p className="leading-relaxed">{project.description}</p>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="members">
          <Card padding="md" className="mt-4">
            <ul className="flex flex-col divide-y">
              {members.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <span className="font-medium">{member.name}</span>
                  <span className="text-sm text-gray-500">{member.role}</span>
                </li>
              ))}
            </ul>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="activity">
          <Card padding="md" className="mt-4">
            <ol className="flex flex-col divide-y">
              {activities.map((activity) => (
                <li
                  key={activity.id}
                  className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0"
                >
                  <p>{activity.description}</p>
                  <p className="text-sm text-gray-500">{activity.timestamp}</p>
                </li>
              ))}
            </ol>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="settings">
          <Card padding="md" className="mt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <p className="font-medium">プロジェクトをアーカイブする</p>
                <p className="text-sm text-gray-500">
                  アーカイブすると、プロジェクトは読み取り専用になります。
                </p>
              </div>
              <Switch
                aria-label="プロジェクトをアーカイブする"
                checked={isArchived}
                onChange={(e) => setIsArchived(e.currentTarget.checked)}
              />
            </div>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </main>
  );
}
