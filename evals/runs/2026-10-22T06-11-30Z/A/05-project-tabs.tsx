import { Badge, Switch, Tabs } from "@yourlib/react";

const project = {
  name: "ウェブサイトリニューアル",
  status: { label: "進行中", tone: "accent" as const },
  description:
    "コーポレートサイトのデザインと情報設計を見直し、スマートフォンでも読みやすいサイトに作り替えるプロジェクトです。2026 年度末の公開を目指しています。",
  members: ["山田 太郎", "佐藤 花子", "鈴木 一郎", "高橋 美咲"],
  activities: [
    {
      id: "a1",
      date: "2026-10-21",
      dateLabel: "10月21日",
      text: "佐藤 花子 さんがトップページのデザイン案を公開しました。",
    },
    {
      id: "a2",
      date: "2026-10-19",
      dateLabel: "10月19日",
      text: "鈴木 一郎 さんがサイトマップを更新しました。",
    },
    {
      id: "a3",
      date: "2026-10-16",
      dateLabel: "10月16日",
      text: "高橋 美咲 さんがプロジェクトに参加しました。",
    },
  ],
};

export function ProjectDetailPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <Badge tone={project.status.tone}>{project.status.label}</Badge>
      </header>

      <Tabs id="project-detail" label="プロジェクトの詳細" defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab value="overview">概要</Tabs.Tab>
          <Tabs.Tab value="members">メンバー</Tabs.Tab>
          <Tabs.Tab value="activity">アクティビティ</Tabs.Tab>
          <Tabs.Tab value="settings">設定</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <div className="flex flex-col gap-2 pt-4">
            <h2 className="text-lg font-semibold">概要</h2>
            <p>{project.description}</p>
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="members">
          <div className="flex flex-col gap-2 pt-4">
            <h2 className="text-lg font-semibold">メンバー</h2>
            <ul className="flex flex-col gap-1">
              {project.members.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="activity">
          <div className="flex flex-col gap-2 pt-4">
            <h2 className="text-lg font-semibold">最近のアクティビティ</h2>
            <ul className="flex flex-col gap-3">
              {project.activities.map((activity) => (
                <li key={activity.id} className="flex flex-col gap-1">
                  <time dateTime={activity.date} className="text-sm">
                    {activity.dateLabel}
                  </time>
                  <span>{activity.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="settings">
          <div className="flex flex-col gap-2 pt-4">
            <h2 className="text-lg font-semibold">設定</h2>
            <Switch name="archived">プロジェクトをアーカイブする</Switch>
          </div>
        </Tabs.Panel>
      </Tabs>
    </main>
  );
}
