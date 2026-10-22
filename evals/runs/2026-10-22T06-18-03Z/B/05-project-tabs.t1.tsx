"use client";

import { useState } from "react";
import {
  Badge,
  Card,
  Heading,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from "@yourlib/react";

type ProjectStatus = "active" | "paused" | "archived";

type Activity = {
  id: string;
  date: string;
  description: string;
};

const project = {
  name: "ウェブサイトリニューアル",
  status: "active" as ProjectStatus,
  description:
    "コーポレートサイトのデザインと情報設計を見直し、表示速度とアクセシビリティを改善するプロジェクトです。2026 年度内の公開を目指して進めています。",
  members: ["佐藤 花子", "鈴木 一郎", "高橋 美咲", "田中 健太"],
  activities: [
    {
      id: "a1",
      date: "2026-10-21",
      description: "鈴木 一郎がトップページのデザイン案をアップロードしました",
    },
    {
      id: "a2",
      date: "2026-10-19",
      description: "高橋 美咲がタスク「サイトマップの作成」を完了しました",
    },
    {
      id: "a3",
      date: "2026-10-17",
      description: "田中 健太がプロジェクトに参加しました",
    },
  ] satisfies Activity[],
};

const statusLabel: Record<ProjectStatus, string> = {
  active: "進行中",
  paused: "一時停止",
  archived: "アーカイブ済み",
};

export function ProjectDetailScreen() {
  const [tab, setTab] = useState("overview");
  const [archived, setArchived] = useState(project.status === "archived");

  const status: ProjectStatus = archived ? "archived" : project.status;

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center gap-3">
        <Heading level={1}>{project.name}</Heading>
        <Badge>{statusLabel[status]}</Badge>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList aria-label="プロジェクト情報">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="members">メンバー</TabsTrigger>
          <TabsTrigger value="activity">アクティビティ</TabsTrigger>
          <TabsTrigger value="settings">設定</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="mt-4 p-4">
            <Text>{project.description}</Text>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card className="mt-4 p-4">
            <ul className="flex flex-col gap-2">
              {project.members.map((name) => (
                <li key={name}>
                  <Text>{name}</Text>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="mt-4 p-4">
            <ol className="flex flex-col gap-3">
              {project.activities.map((activity) => (
                <li key={activity.id} className="flex flex-col gap-1">
                  <Text size="sm" className="text-gray-500">
                    <time dateTime={activity.date}>{activity.date}</time>
                  </Text>
                  <Text>{activity.description}</Text>
                </li>
              ))}
            </ol>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="mt-4 p-4">
            <Switch checked={archived} onCheckedChange={setArchived}>
              プロジェクトをアーカイブする
            </Switch>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
