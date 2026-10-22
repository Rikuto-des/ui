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

type ProjectStatus = "active" | "archived";

const project = {
  name: "Webサイトリニューアル",
  description:
    "コーポレートサイトのデザインと情報設計を刷新するプロジェクトです。アクセシビリティとパフォーマンスの改善を重点目標とし、年度内の公開を目指しています。",
  members: ["佐藤 花子", "鈴木 一郎", "高橋 美咲", "田中 健太"],
  activities: [
    { id: 1, text: "佐藤 花子 がデザインカンプを更新しました", time: "2時間前" },
    { id: 2, text: "鈴木 一郎 がタスク「トップページ実装」を完了しました", time: "昨日" },
    { id: 3, text: "高橋 美咲 がメンバーに追加されました", time: "3日前" },
  ],
};

const statusLabel: Record<ProjectStatus, string> = {
  active: "進行中",
  archived: "アーカイブ済み",
};

export function ProjectDetailScreen() {
  const [archived, setArchived] = useState(false);
  const status: ProjectStatus = archived ? "archived" : "active";

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center gap-3">
        <Heading level={1}>{project.name}</Heading>
        <Badge variant={archived ? "neutral" : "success"}>
          {statusLabel[status]}
        </Badge>
      </header>

      <Tabs defaultValue="overview">
        <TabsList aria-label="プロジェクトの詳細">
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
                <li
                  key={activity.id}
                  className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                >
                  <Text>{activity.text}</Text>
                  <Text size="sm" color="muted">
                    {activity.time}
                  </Text>
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
