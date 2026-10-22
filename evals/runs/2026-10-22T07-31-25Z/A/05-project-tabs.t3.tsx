import { Badge, Separator, Switch, Tabs } from "@yourlib/react";

const project = {
  name: "Webサイトリニューアル",
  status: "進行中",
  description:
    "コーポレートサイトのデザインと情報設計を全面的に見直し、スマートフォンでも読みやすく、問い合わせまでの導線が分かりやすいサイトに作り直すプロジェクトです。2026 年 12 月末の公開を目標に進めています。",
};

const members = [
  { id: "m1", name: "山田 太郎", role: "プロジェクトリーダー" },
  { id: "m2", name: "佐藤 花子", role: "デザイナー" },
  { id: "m3", name: "鈴木 一郎", role: "エンジニア" },
  { id: "m4", name: "高橋 美咲", role: "ライター" },
];

const activities = [
  {
    id: "a1",
    text: "佐藤 花子さんがトップページのデザイン案を更新しました",
    date: "2026-10-21",
    label: "10月21日",
  },
  {
    id: "a2",
    text: "鈴木 一郎さんがお問い合わせフォームの実装を完了しました",
    date: "2026-10-19",
    label: "10月19日",
  },
  {
    id: "a3",
    text: "山田 太郎さんが高橋 美咲さんをメンバーに追加しました",
    date: "2026-10-17",
    label: "10月17日",
  },
];

export function ProjectDetailPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center gap-3">
        <h1
          style={{
            color: "var(--yl-color-text)",
            fontSize: "var(--yl-font-size-title)",
            fontWeight: "var(--yl-font-weight-title)",
            lineHeight: "var(--yl-font-line-height-title)",
            letterSpacing: "var(--yl-font-tracking-title)",
          }}
        >
          {project.name}
        </h1>
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
          <div className="pt-6">
            <p
              style={{
                color: "var(--yl-color-text)",
                fontSize: "var(--yl-font-size-body)",
                lineHeight: "var(--yl-font-line-height-body)",
              }}
            >
              {project.description}
            </p>
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="members">
          <ul className="pt-4">
            {members.map((member, index) => (
              <li key={member.id}>
                {index > 0 && <Separator decorative />}
                <div className="flex items-baseline justify-between gap-3 py-3">
                  <span style={{ color: "var(--yl-color-text)" }}>
                    {member.name}
                  </span>
                  <span
                    style={{
                      color: "var(--yl-color-text-muted)",
                      fontSize: "var(--yl-font-size-small)",
                    }}
                  >
                    {member.role}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Tabs.Panel>

        <Tabs.Panel value="activity">
          <ol className="pt-4">
            {activities.map((activity, index) => (
              <li key={activity.id}>
                {index > 0 && <Separator decorative />}
                <div className="flex flex-col gap-1 py-3">
                  <span style={{ color: "var(--yl-color-text)" }}>
                    {activity.text}
                  </span>
                  <time
                    dateTime={activity.date}
                    style={{
                      color: "var(--yl-color-text-subtle)",
                      fontSize: "var(--yl-font-size-small)",
                    }}
                  >
                    {activity.label}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        </Tabs.Panel>

        <Tabs.Panel value="settings">
          <div className="flex flex-col gap-2 pt-6">
            <Switch name="archived">プロジェクトをアーカイブする</Switch>
            <p
              style={{
                color: "var(--yl-color-text-muted)",
                fontSize: "var(--yl-font-size-small)",
              }}
            >
              アーカイブすると、プロジェクトは一覧に表示されなくなり、内容は読み取り専用になります。
            </p>
          </div>
        </Tabs.Panel>
      </Tabs>
    </main>
  );
}
