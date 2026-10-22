import { Badge, Card, Switch, Tabs } from "@yourlib/react";

const project = {
  name: "モバイルアプリ刷新",
  status: { label: "進行中", tone: "accent" as const },
  description:
    "既存のモバイルアプリを全面的に作り直し、読み込み速度と操作性を改善するプロジェクトです。2026 年度第 4 四半期のリリースを目指し、デザイン刷新とバックエンド API の整理を並行して進めています。",
  members: [
    { id: "m1", name: "山田 太郎", role: "プロジェクトリーダー" },
    { id: "m2", name: "佐藤 花子", role: "デザイナー" },
    { id: "m3", name: "鈴木 一郎", role: "エンジニア" },
    { id: "m4", name: "高橋 美咲", role: "エンジニア" },
  ],
  activities: [
    {
      id: "a1",
      text: "佐藤 花子さんがホーム画面のデザイン案を更新しました",
      date: "2026-10-21",
      dateLabel: "2026年10月21日",
    },
    {
      id: "a2",
      text: "鈴木 一郎さんがタスク「ログイン API の改修」を完了しました",
      date: "2026-10-20",
      dateLabel: "2026年10月20日",
    },
    {
      id: "a3",
      text: "山田 太郎さんが高橋 美咲さんをメンバーに追加しました",
      date: "2026-10-18",
      dateLabel: "2026年10月18日",
    },
  ],
};

export function ProjectDetailPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center gap-3">
        <h1
          className="m-0"
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
          <Card title="概要" headingLevel="h2" className="mt-4">
            <p
              className="m-0"
              style={{
                color: "var(--yl-color-text)",
                fontSize: "var(--yl-font-size-body)",
                lineHeight: "var(--yl-font-line-height-body)",
              }}
            >
              {project.description}
            </p>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="members">
          <Card
            title="メンバー"
            description={`${project.members.length} 人が参加しています。`}
            headingLevel="h2"
            className="mt-4"
          >
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {project.members.map((member) => (
                <li key={member.id} className="flex flex-wrap items-baseline gap-2">
                  <span style={{ color: "var(--yl-color-text)" }}>{member.name}</span>
                  <span
                    style={{
                      color: "var(--yl-color-text-muted)",
                      fontSize: "var(--yl-font-size-small)",
                    }}
                  >
                    {member.role}
                  </span>
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
            <ol className="m-0 flex list-none flex-col gap-4 p-0">
              {project.activities.map((activity) => (
                <li key={activity.id} className="flex flex-col gap-1">
                  <span style={{ color: "var(--yl-color-text)" }}>{activity.text}</span>
                  <time
                    dateTime={activity.date}
                    style={{
                      color: "var(--yl-color-text-subtle)",
                      fontSize: "var(--yl-font-size-small)",
                    }}
                  >
                    {activity.dateLabel}
                  </time>
                </li>
              ))}
            </ol>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="settings">
          <Card
            title="設定"
            description="アーカイブすると、プロジェクトは読み取り専用になり一覧から非表示になります。"
            headingLevel="h2"
            className="mt-4"
          >
            <Switch name="archived">プロジェクトのアーカイブ</Switch>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </main>
  );
}
