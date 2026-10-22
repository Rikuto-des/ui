"use client";

import { useState } from "react";
import { Badge, Switch, Tabs } from "@yourlib/react";

type Project = {
  name: string;
  status: string;
  description: string;
  members: string[];
  activities: { id: string; date: string; text: string }[];
};

const project: Project = {
  name: "Webサイトリニューアル",
  status: "進行中",
  description:
    "コーポレートサイトのデザインと情報設計を刷新し、モバイル対応とページ表示速度の改善を行うプロジェクトです。2026 年 12 月の公開を目標に進めています。",
  members: ["山田 太郎", "佐藤 花子", "鈴木 一郎", "高橋 美咲"],
  activities: [
    {
      id: "a1",
      date: "2026-10-21",
      text: "佐藤 花子がトップページのデザイン案をアップロードしました",
    },
    {
      id: "a2",
      date: "2026-10-20",
      text: "鈴木 一郎が「お問い合わせフォーム実装」を完了にしました",
    },
    {
      id: "a3",
      date: "2026-10-18",
      text: "山田 太郎がプロジェクトのマイルストーンを更新しました",
    },
  ],
};

export function ProjectDetailScreen() {
  const [archived, setArchived] = useState(false);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <Badge>{archived ? "アーカイブ済み" : project.status}</Badge>
      </header>

      <Tabs
        id="project-detail-tabs"
        label="プロジェクトの詳細"
        defaultValue="overview"
      >
        <Tabs.List>
          <Tabs.Tab value="overview">概要</Tabs.Tab>
          <Tabs.Tab value="members">メンバー</Tabs.Tab>
          <Tabs.Tab value="activity">アクティビティ</Tabs.Tab>
          <Tabs.Tab value="settings">設定</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <section className="pt-4">
            <p className="leading-relaxed">{project.description}</p>
          </section>
        </Tabs.Panel>

        <Tabs.Panel value="members">
          <section className="pt-4">
            <ul className="flex flex-col gap-2">
              {project.members.map((member) => (
                <li key={member}>{member}</li>
              ))}
            </ul>
          </section>
        </Tabs.Panel>

        <Tabs.Panel value="activity">
          <section className="pt-4">
            <ul className="flex flex-col gap-3">
              {project.activities.map((activity) => (
                <li key={activity.id} className="flex flex-col gap-1">
                  <time
                    dateTime={activity.date}
                    className="text-sm text-gray-500"
                  >
                    {activity.date}
                  </time>
                  <p>{activity.text}</p>
                </li>
              ))}
            </ul>
          </section>
        </Tabs.Panel>

        <Tabs.Panel value="settings">
          <section className="pt-4">
            <Switch checked={archived} onCheckedChange={setArchived}>
              プロジェクトをアーカイブする
            </Switch>
          </section>
        </Tabs.Panel>
      </Tabs>
    </main>
  );
}
