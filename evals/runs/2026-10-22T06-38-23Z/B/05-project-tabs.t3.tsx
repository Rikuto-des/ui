"use client";

import { useState } from "react";
import {
  Badge,
  Card,
  Heading,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
} from "@yourlib/react";

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

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center gap-3">
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

        <TabPanel value="overview">
          <Card className="mt-4 p-4">
            <Text>{project.description}</Text>
          </Card>
        </TabPanel>

        <TabPanel value="members">
          <Card className="mt-4 p-4">
            <ul className="flex flex-col gap-2">
              {members.map((member) => (
                <li key={member.id}>
                  <Text>{member.name}</Text>
                </li>
              ))}
            </ul>
          </Card>
        </TabPanel>

        <TabPanel value="activity">
          <Card className="mt-4 p-4">
            <ul className="flex flex-col gap-3">
              {activities.map((activity) => (
                <li key={activity.id} className="flex flex-col gap-1">
                  <Text>{activity.description}</Text>
                  <Text size="sm" className="text-gray-500">
                    <time dateTime={activity.date}>{activity.date}</time>
                  </Text>
                </li>
              ))}
            </ul>
          </Card>
        </TabPanel>

        <TabPanel value="settings">
          <Card className="mt-4 p-4">
            <Switch checked={archived} onCheckedChange={setArchived}>
              プロジェクトをアーカイブする
            </Switch>
          </Card>
        </TabPanel>
      </Tabs>
    </main>
  );
}
