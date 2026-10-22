import { Badge, Card, Switch, Tabs } from "@yourlib/react";

const project = {
  name: "Webサイトリニューアル",
  status: "進行中",
  description:
    "コーポレートサイトのデザインと情報設計を見直し、スマートフォンでも読みやすいサイトに作り替えるプロジェクトです。2026 年度内の公開を目指しています。",
  members: [
    { id: "m1", name: "山田 太郎", role: "プロジェクトマネージャー" },
    { id: "m2", name: "佐藤 花子", role: "デザイナー" },
    { id: "m3", name: "鈴木 一郎", role: "エンジニア" },
    { id: "m4", name: "高橋 美咲", role: "ライター" },
  ],
  activities: [
    {
      id: "a1",
      datetime: "2026-10-21T15:30",
      label: "10月21日 15:30",
      text: "佐藤 花子さんがトップページのデザイン案を追加しました。",
    },
    {
      id: "a2",
      datetime: "2026-10-20T11:00",
      label: "10月20日 11:00",
      text: "鈴木 一郎さんが「お問い合わせフォームの実装」を完了にしました。",
    },
    {
      id: "a3",
      datetime: "2026-10-18T09:45",
      label: "10月18日 9:45",
      text: "山田 太郎さんが高橋 美咲さんをメンバーに追加しました。",
    },
  ],
};

export function ProjectDetailPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <Badge tone="accent" dot>
          {project.status}
        </Badge>
      </header>

      <Tabs id="project" label="プロジェクト" defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab value="overview">概要</Tabs.Tab>
          <Tabs.Tab value="members">メンバー</Tabs.Tab>
          <Tabs.Tab value="activity">アクティビティ</Tabs.Tab>
          <Tabs.Tab value="settings">設定</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <Card title="概要" headingLevel="h2" className="mt-6">
            <p>{project.description}</p>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="members">
          <Card
            title="メンバー"
            description={`${project.members.length} 人が参加しています。`}
            headingLevel="h2"
            className="mt-6"
          >
            <ul className="flex flex-col gap-3">
              {project.members.map((member) => (
                <li key={member.id} className="flex flex-col">
                  <span className="font-medium">{member.name}</span>
                  <span className="text-sm">{member.role}</span>
                </li>
              ))}
            </ul>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="activity">
          <Card
            title="アクティビティ"
            description="最近の出来事"
            headingLevel="h2"
            className="mt-6"
          >
            <ol className="flex flex-col gap-4">
              {project.activities.map((activity) => (
                <li key={activity.id} className="flex flex-col gap-1">
                  <time dateTime={activity.datetime} className="text-sm">
                    {activity.label}
                  </time>
                  <p>{activity.text}</p>
                </li>
              ))}
            </ol>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="settings">
          <Card
            title="設定"
            description="アーカイブすると、プロジェクトは読み取り専用になります。"
            headingLevel="h2"
            className="mt-6"
          >
            <Switch name="archive">プロジェクトをアーカイブする</Switch>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </main>
  );
}
