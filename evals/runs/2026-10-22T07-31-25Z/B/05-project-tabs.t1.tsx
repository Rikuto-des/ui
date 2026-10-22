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
        <Heading level={1}>{project.name}</Heading>
        <Badge variant={isArchived ? "neutral" : "success"}>
          {isArchived ? "アーカイブ済み" : project.status}
        </Badge>
      </header>

      <Tabs defaultValue="overview">
        <TabsList aria-label="プロジェクトの詳細">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="members">メンバー</TabsTrigger>
          <TabsTrigger value="activity">アクティビティ</TabsTrigger>
          <TabsTrigger value="settings">設定</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <Card className="p-4">
            <Text>{project.description}</Text>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="pt-4">
          <Card className="p-4">
            <ul className="flex flex-col divide-y">
              {members.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <Text weight="medium">{member.name}</Text>
                  <Text size="sm" tone="muted">
                    {member.role}
                  </Text>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="pt-4">
          <Card className="p-4">
            <ol className="flex flex-col divide-y">
              {activities.map((activity) => (
                <li
                  key={activity.id}
                  className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0"
                >
                  <Text>{activity.description}</Text>
                  <Text size="sm" tone="muted">
                    {activity.timestamp}
                  </Text>
                </li>
              ))}
            </ol>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="pt-4">
          <Card className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <Text weight="medium">プロジェクトをアーカイブする</Text>
                <Text size="sm" tone="muted">
                  アーカイブすると、プロジェクトは読み取り専用になります。
                </Text>
              </div>
              <Switch
                aria-label="プロジェクトをアーカイブする"
                checked={isArchived}
                onCheckedChange={setIsArchived}
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
