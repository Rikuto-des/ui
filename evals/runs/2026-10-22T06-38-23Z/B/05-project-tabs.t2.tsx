"use client";

import { useState } from "react";
import {
  Badge,
  Heading,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
} from "@yourlib/react";

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
        <Heading level={1}>{project.name}</Heading>
        <Badge>{archived ? "アーカイブ済み" : project.status}</Badge>
      </header>

      <Tabs defaultValue="overview">
        <TabList aria-label="プロジェクトの詳細">
          <Tab value="overview">概要</Tab>
          <Tab value="members">メンバー</Tab>
          <Tab value="activity">アクティビティ</Tab>
          <Tab value="settings">設定</Tab>
        </TabList>

        <TabPanel value="overview" className="pt-4">
          <Text>{project.description}</Text>
        </TabPanel>

        <TabPanel value="members" className="pt-4">
          <ul className="flex flex-col gap-2">
            {project.members.map((member) => (
              <li key={member}>
                <Text>{member}</Text>
              </li>
            ))}
          </ul>
        </TabPanel>

        <TabPanel value="activity" className="pt-4">
          <ul className="flex flex-col gap-3">
            {project.activities.map((activity) => (
              <li key={activity.id} className="flex flex-col gap-1">
                <Text size="sm" color="muted">
                  <time dateTime={activity.date}>{activity.date}</time>
                </Text>
                <Text>{activity.text}</Text>
              </li>
            ))}
          </ul>
        </TabPanel>

        <TabPanel value="settings" className="pt-4">
          <Switch checked={archived} onCheckedChange={setArchived}>
            プロジェクトをアーカイブする
          </Switch>
        </TabPanel>
      </Tabs>
    </main>
  );
}
