"use client";

import { useState } from "react";
import {
  Badge,
  Card,
  Heading,
  List,
  ListItem,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
} from "@yourlib/react";

type TabKey = "overview" | "members" | "activity" | "settings";

const project = {
  name: "Webサイトリニューアル",
  status: "進行中",
  description:
    "コーポレートサイトのデザインと情報設計を刷新し、アクセシビリティとパフォーマンスを向上させるプロジェクトです。2026年度第4四半期の公開を目標としています。",
  members: ["佐藤 花子", "鈴木 一郎", "高橋 美咲", "田中 健太"],
  activities: [
    { id: 1, text: "鈴木 一郎 がトップページのデザイン案をアップロードしました", date: "2026-10-21" },
    { id: 2, text: "高橋 美咲 がタスク「お問い合わせフォームの改修」を完了しました", date: "2026-10-20" },
    { id: 3, text: "佐藤 花子 がマイルストーン「ベータ公開」を追加しました", date: "2026-10-18" },
  ],
};

export function ProjectDetailScreen() {
  const [selectedTab, setSelectedTab] = useState<TabKey>("overview");
  const [archived, setArchived] = useState(false);

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="flex flex-wrap items-center gap-3">
        <Heading level={1}>{project.name}</Heading>
        <Badge variant={archived ? "neutral" : "success"}>
          {archived ? "アーカイブ済み" : project.status}
        </Badge>
      </header>

      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key: string) => setSelectedTab(key as TabKey)}
      >
        <TabList aria-label="プロジェクトの詳細">
          <Tab id="overview">概要</Tab>
          <Tab id="members">メンバー</Tab>
          <Tab id="activity">アクティビティ</Tab>
          <Tab id="settings">設定</Tab>
        </TabList>

        <TabPanel id="overview">
          <Card className="p-4">
            <Text>{project.description}</Text>
          </Card>
        </TabPanel>

        <TabPanel id="members">
          <Card className="p-4">
            <List aria-label="メンバー一覧">
              {project.members.map((name) => (
                <ListItem key={name}>{name}</ListItem>
              ))}
            </List>
          </Card>
        </TabPanel>

        <TabPanel id="activity">
          <Card className="p-4">
            <List aria-label="最近のアクティビティ">
              {project.activities.map((activity) => (
                <ListItem key={activity.id}>
                  <div className="flex flex-col gap-1">
                    <Text>{activity.text}</Text>
                    <Text size="sm" className="text-gray-500">
                      <time dateTime={activity.date}>{activity.date}</time>
                    </Text>
                  </div>
                </ListItem>
              ))}
            </List>
          </Card>
        </TabPanel>

        <TabPanel id="settings">
          <Card className="p-4">
            <Switch isSelected={archived} onChange={setArchived}>
              プロジェクトをアーカイブする
            </Switch>
          </Card>
        </TabPanel>
      </Tabs>
    </main>
  );
}
