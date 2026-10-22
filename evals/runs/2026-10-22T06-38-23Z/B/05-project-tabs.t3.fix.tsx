"use client";

import { useState } from "react";
import { Badge, Card, Switch, Tabs } from "@yourlib/react";

type Member = {
  id: string;
  name: string;
};

type Activity = {
  id: string;
  description: string;
  date: string;
};

const project = {
  name: "Webサイトリニューアル",
  status: "進行中",
  description:
    "コーポレートサイトのデザインと構成を全面的に見直し、モバイル対応とページ表示速度の改善を行うプロジェクトです。2026年12月末の公開を目標に進めています。",
};

const members: Member[] = [
  { id: "m1", name: "佐藤 花子" },
  { id: "m2", name: "鈴木 一郎" },
  { id: "m3", name: "高橋 美咲" },
  { id: "m4", name: "田中 健太" },
];

const activities: Activity[] = [
  {
    id: "a1",
    description: "佐藤 花子 がトップページのデザイン案をアップロードしました",
    date: "2026-10-21",
  },
  {
    id: "a2",
    description: "鈴木 一郎 が「お問い合わせフォーム改修」タスクを完了しました",
    date: "2026-10-20",
  },
  {
    id: "a3",
    description: "高橋 美咲 がプロジェクトに参加しました",
    date: "2026-10-18",
  },
];

export function ProjectDetailScreen() {
  const [archived, setArchived] = useState(false);

  const tabItems = [
    {
      value: "overview",
      label: "概要",
      content: (
        <Card className="mt-4">
          <div className="p-4">
            <p>{project.description}</p>
          </div>
        </Card>
      ),
    },
    {
      value: "members",
      label: "メンバー",
      content: (
        <Card className="mt-4">
          <div className="p-4">
            <ul className="flex flex-col gap-2">
              {members.map((member) => (
                <li key={member.id}>{member.name}</li>
              ))}
            </ul>
          </div>
        </Card>
      ),
    },
    {
      value: "activity",
      label: "アクティビティ",
      content: (
        <Card className="mt-4">
          <div className="p-4">
            <ul className="flex flex-col gap-3">
              {activities.map((activity) => (
                <li key={activity.id} className="flex flex-col gap-1">
                  <p>{activity.description}</p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--yl-color-text-muted)" }}
                  >
                    <time dateTime={activity.date}>{activity.date}</time>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      ),
    },
    {
      value: "settings",
      label: "設定",
      content: (
        <Card className="mt-4">
          <div className="p-4">
            <Switch
              id="project-archive-switch"
              label="プロジェクトをアーカイブする"
              checked={archived}
              onCheckedChange={setArchived}
            />
          </div>
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
