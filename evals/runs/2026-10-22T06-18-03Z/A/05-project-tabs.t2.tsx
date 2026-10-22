import { Badge, Switch, Tabs } from "@yourlib/react";

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
    "コーポレートサイトのデザインと情報設計を見直し、スマートフォンでも読みやすいサイトに作り直すプロジェクトです。公開は来年 3 月を予定しています。",
};

const members: Member[] = [
  { id: "m1", name: "山田 太郎", role: "プロジェクトマネージャー" },
  { id: "m2", name: "佐藤 花子", role: "デザイナー" },
  { id: "m3", name: "鈴木 一郎", role: "エンジニア" },
  { id: "m4", name: "高橋 美咲", role: "ライター" },
];

const activities: Activity[] = [
  {
    id: "a1",
    date: "2026-10-21",
    dateLabel: "10月21日",
    text: "佐藤 花子さんがトップページのデザイン案をアップロードしました。",
  },
  {
    id: "a2",
    date: "2026-10-19",
    dateLabel: "10月19日",
    text: "鈴木 一郎さんがお問い合わせフォームの実装を完了しました。",
  },
  {
    id: "a3",
    date: "2026-10-17",
    dateLabel: "10月17日",
    text: "山田 太郎さんが高橋 美咲さんをメンバーに追加しました。",
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
          <section className="flex flex-col gap-2 pt-4">
            <h2 className="text-lg font-semibold">概要</h2>
            <p>{project.description}</p>
          </section>
        </Tabs.Panel>

        <Tabs.Panel value="members">
          <section className="flex flex-col gap-2 pt-4">
            <h2 className="text-lg font-semibold">メンバー</h2>
            <ul className="flex flex-col gap-2">
              {members.map((member) => (
                <li key={member.id}>
                  {member.name}
                  <span className="ms-2 text-sm">（{member.role}）</span>
                </li>
              ))}
            </ul>
          </section>
        </Tabs.Panel>

        <Tabs.Panel value="activity">
          <section className="flex flex-col gap-2 pt-4">
            <h2 className="text-lg font-semibold">最近のアクティビティ</h2>
            <ol className="flex flex-col gap-3">
              {activities.map((activity) => (
                <li key={activity.id} className="flex flex-col gap-1">
                  <time dateTime={activity.date} className="text-sm">
                    {activity.dateLabel}
                  </time>
                  <span>{activity.text}</span>
                </li>
              ))}
            </ol>
          </section>
        </Tabs.Panel>

        <Tabs.Panel value="settings">
          <section className="flex flex-col gap-3 pt-4">
            <h2 className="text-lg font-semibold">設定</h2>
            <Switch name="archive">プロジェクトをアーカイブする</Switch>
          </section>
        </Tabs.Panel>
      </Tabs>
    </main>
  );
}
