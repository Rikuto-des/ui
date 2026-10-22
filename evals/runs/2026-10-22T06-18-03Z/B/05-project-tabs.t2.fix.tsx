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
  role: string;
};

type Activity = {
  id: string;
  description: string;
  timestamp: string;
};

const project = {
  name: "Webサイトリニューアル",
  status: "進行中",
  description:
    "コーポレートサイトのデザインと情報設計を刷新し、モバイル対応とページ表示速度の改善を行うプロジェクトです。2026年12月の公開を目標に、デザイン・開発・コンテンツ制作を並行して進めています。",
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
    description: "鈴木 一郎 さんがトップページのデザイン案を更新しました",
    timestamp: "2026年10月21日 16:42",
  },
  {
    id: "a2",
    description: "高橋 健太 さんがタスク「ヘッダーの実装」を完了しました",
    timestamp: "2026年10月20日 11:05",
  },
  {
    id: "a3",
    description: "田中 美咲 さんが会社概要ページの原稿を追加しました",
    timestamp: "2026年10月18日 09:30",
  },
];

export function ProjectDetailScreen() {
  const [archived, setArchived] = useState(false);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center gap-3">
        <Heading level={1}>{project.name}</Heading>
        <Badge>{archived ? "アーカイブ済み" : project.status}</Badge>
      </header>

      <Tabs id="project-detail-tabs" label="プロジェクトの詳細" defaultValue="overview">
        <TabList>
          <Tab value="overview">概要</Tab>
          <Tab value="members">メンバー</Tab>
          <Tab value="activity">アクティビティ</Tab>
          <Tab value="settings">設定</Tab>
        </TabList>

        <TabPanel value="overview">
          <Card className="mt-4">
            <Text>{project.description}</Text>
          </Card>
        </TabPanel>

        <TabPanel value="members">
          <Card className="mt-4">
            <ul className="flex flex-col divide-y">
              {members.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between py-3"
                >
                  <Text>{member.name}</Text>
                  <Text className="text-sm opacity-70">{member.role}</Text>
                </li>
              ))}
            </ul>
          </Card>
        </TabPanel>

        <TabPanel value="activity">
          <Card className="mt-4">
            <ol className="flex flex-col divide-y">
              {activities.map((activity) => (
                <li key={activity.id} className="flex flex-col gap-1 py-3">
                  <Text>{activity.description}</Text>
                  <Text className="text-sm opacity-70">
                    <time>{activity.timestamp}</time>
                  </Text>
                </li>
              ))}
            </ol>
          </Card>
        </TabPanel>

        <TabPanel value="settings">
          <Card className="mt-4">
            <Switch checked={archived} onChange={setArchived}>
              プロジェクトをアーカイブする
            </Switch>
          </Card>
        </TabPanel>
      </Tabs>
    </main>
  );
}
