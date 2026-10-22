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

type Activity = {
  id: string;
  actor: string;
  action: string;
  time: string;
};

const project = {
  name: "Webサイトリニューアル",
  status: "進行中",
  description:
    "コーポレートサイトのデザインと情報設計を刷新するプロジェクトです。アクセシビリティの改善、表示速度の向上、CMS の移行を主な目標としています。リリースは 2026 年 12 月を予定しています。",
  members: ["佐藤 花子", "鈴木 一郎", "高橋 美咲", "田中 健太"],
  activities: [
    {
      id: "a1",
      actor: "佐藤 花子",
      action: "トップページのデザイン案をアップロードしました",
      time: "2 時間前",
    },
    {
      id: "a2",
      actor: "鈴木 一郎",
      action: "タスク「CMS の選定」を完了にしました",
      time: "昨日",
    },
    {
      id: "a3",
      actor: "高橋 美咲",
      action: "メンバーに田中 健太を追加しました",
      time: "3 日前",
    },
  ] satisfies Activity[],
};

export function ProjectDetailPage() {
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

        <TabPanel value="overview" className="pt-4">
          <Card className="p-4">
            <Heading level={2} className="mb-2">
              概要
            </Heading>
            <Text>{project.description}</Text>
          </Card>
        </TabPanel>

        <TabPanel value="members" className="pt-4">
          <Card className="p-4">
            <Heading level={2} className="mb-2">
              メンバー
            </Heading>
            <ul className="flex flex-col divide-y">
              {project.members.map((name) => (
                <li key={name} className="py-2">
                  <Text>{name}</Text>
                </li>
              ))}
            </ul>
          </Card>
        </TabPanel>

        <TabPanel value="activity" className="pt-4">
          <Card className="p-4">
            <Heading level={2} className="mb-2">
              最近のアクティビティ
            </Heading>
            <ul className="flex flex-col divide-y">
              {project.activities.map((activity) => (
                <li key={activity.id} className="flex flex-col gap-1 py-2">
                  <Text>
                    <strong>{activity.actor}</strong> が{activity.action}
                  </Text>
                  <Text className="text-sm opacity-70">{activity.time}</Text>
                </li>
              ))}
            </ul>
          </Card>
        </TabPanel>

        <TabPanel value="settings" className="pt-4">
          <Card className="p-4">
            <Heading level={2} className="mb-4">
              設定
            </Heading>
            <Switch checked={archived} onCheckedChange={setArchived}>
              プロジェクトをアーカイブする
            </Switch>
          </Card>
        </TabPanel>
      </Tabs>
    </main>
  );
}
