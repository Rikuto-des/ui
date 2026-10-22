"use client";

import { useState } from "react";
import { Badge, Card, Switch, Tabs } from "@yourlib/react";

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
  const [archived, setArchived] = useState(false);

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold" style={{ color: "var(--yl-color-text)" }}>
          {project.name}
        </h1>
        <Badge tone={archived ? "neutral" : "ok"}>
          {archived ? "アーカイブ済み" : project.status}
        </Badge>
      </header>

      <Tabs id="project-detail-tabs" label="プロジェクトの詳細" defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab value="overview">概要</Tabs.Tab>
          <Tabs.Tab value="members">メンバー</Tabs.Tab>
          <Tabs.Tab value="activity">アクティビティ</Tabs.Tab>
          <Tabs.Tab value="settings">設定</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <Card padding="md" className="mt-4">
            <p style={{ color: "var(--yl-color-text)" }}>{project.description}</p>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="members">
          <Card padding="md" className="mt-4">
            <ul aria-label="メンバー一覧" className="flex flex-col gap-2">
              {project.members.map((name) => (
                <li key={name} style={{ color: "var(--yl-color-text)" }}>
                  {name}
                </li>
              ))}
            </ul>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="activity">
          <Card padding="md" className="mt-4">
            <ul aria-label="最近のアクティビティ" className="flex flex-col gap-4">
              {project.activities.map((activity) => (
                <li key={activity.id} className="flex flex-col gap-1">
                  <p style={{ color: "var(--yl-color-text)" }}>{activity.text}</p>
                  <p className="text-sm" style={{ color: "var(--yl-color-text-muted)" }}>
                    <time dateTime={activity.date}>{activity.date}</time>
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="settings">
          <Card padding="md" className="mt-4">
            <Switch
              checked={archived}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setArchived(event.currentTarget.checked)
              }
            >
              プロジェクトをアーカイブする
            </Switch>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </main>
  );
}
