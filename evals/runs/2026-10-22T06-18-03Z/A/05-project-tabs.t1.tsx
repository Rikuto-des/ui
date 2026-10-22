import { Badge, Card, Switch, Tabs } from "@yourlib/react";

type Member = {
  id: string;
  name: string;
  role: string;
};

type Activity = {
  id: string;
  date: string;
  dateLabel: string;
  text: string;
};

const project = {
  name: "Webサイトリニューアル",
  status: "進行中",
  description:
    "コーポレートサイトのデザインと情報設計を見直し、スマートフォンでも読みやすいサイトに作り替えるプロジェクトです。第 1 フェーズでは、トップページと製品紹介ページを公開します。",
};

const members: Member[] = [
  { id: "m1", name: "山田 花子", role: "プロジェクトリーダー" },
  { id: "m2", name: "佐藤 太郎", role: "デザイナー" },
  { id: "m3", name: "鈴木 一郎", role: "エンジニア" },
  { id: "m4", name: "高橋 美咲", role: "ライター" },
];

const activities: Activity[] = [
  {
    id: "a1",
    date: "2026-10-21",
    dateLabel: "10月21日",
    text: "佐藤 太郎さんがトップページのデザイン案を追加しました。",
  },
  {
    id: "a2",
    date: "2026-10-19",
    dateLabel: "10月19日",
    text: "鈴木 一郎さんが「製品紹介ページの実装」を完了にしました。",
  },
  {
    id: "a3",
    date: "2026-10-17",
    dateLabel: "10月17日",
    text: "山田 花子さんが高橋 美咲さんをメンバーに追加しました。",
  },
];

export function ProjectDetailPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <Badge tone="accent" dot>
          {project.status}
        </Badge>
      </header>

      <Tabs id="project-detail" label="プロジェクトの詳細" defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab value="overview">概要</Tabs.Tab>
          <Tabs.Tab value="members">メンバー</Tabs.Tab>
          <Tabs.Tab value="activity">アクティビティ</Tabs.Tab>
          <Tabs.Tab value="settings">設定</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <Card title="概要" headingLevel="h2" className="mt-4">
            <p>{project.description}</p>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="members">
          <Card
            title="メンバー"
            description={`${members.length} 人が参加しています。`}
            headingLevel="h2"
            className="mt-4"
          >
            <ul className="flex flex-col gap-3">
              {members.map((member) => (
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
            title="最近のアクティビティ"
            headingLevel="h2"
            className="mt-4"
          >
            <ol className="flex flex-col gap-4">
              {activities.map((activity) => (
                <li key={activity.id} className="flex flex-col gap-1">
                  <time dateTime={activity.date} className="text-sm">
                    {activity.dateLabel}
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
            description="変更はすぐに反映されます。"
            headingLevel="h2"
            className="mt-4"
          >
            <Switch name="archived">プロジェクトをアーカイブする</Switch>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </main>
  );
}
