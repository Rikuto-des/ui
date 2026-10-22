import { Badge, Card, Switch, Tabs } from "@yourlib/react";

const project = {
  name: "Webサイトリニューアル",
  status: "進行中",
  description:
    "コーポレートサイトの情報設計とデザインを見直し、採用ページとお知らせ機能を刷新するプロジェクトです。公開は来年 3 月を予定しています。",
  members: [
    { name: "山田 太郎", role: "プロジェクトリーダー" },
    { name: "佐藤 花子", role: "デザイナー" },
    { name: "鈴木 一郎", role: "エンジニア" },
    { name: "高橋 美咲", role: "コンテンツ編集" },
  ],
  activities: [
    {
      id: "a1",
      text: "佐藤 花子 さんがトップページのデザイン案を追加しました",
      date: "2026-10-21T16:20",
      label: "10月21日 16:20",
    },
    {
      id: "a2",
      text: "鈴木 一郎 さんがタスク「お知らせ一覧の実装」を完了にしました",
      date: "2026-10-20T11:05",
      label: "10月20日 11:05",
    },
    {
      id: "a3",
      text: "山田 太郎 さんが高橋 美咲 さんをメンバーに追加しました",
      date: "2026-10-18T09:40",
      label: "10月18日 9:40",
    },
  ],
};

export function ProjectDetailPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center gap-3">
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
          <Card title="概要" headingLevel="h2" className="mt-4">
            <p
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
            <ul className="flex flex-col">
              {project.members.map((member, index) => (
                <li
                  key={member.name}
                  className="flex items-center justify-between gap-3 py-3"
                  style={
                    index > 0
                      ? {
                          borderTop:
                            "var(--yl-border-width) solid var(--yl-color-border)",
                        }
                      : undefined
                  }
                >
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
            <ol className="flex flex-col">
              {project.activities.map((activity, index) => (
                <li
                  key={activity.id}
                  className="flex flex-col gap-1 py-3"
                  style={
                    index > 0
                      ? {
                          borderTop:
                            "var(--yl-border-width) solid var(--yl-color-border)",
                        }
                      : undefined
                  }
                >
                  <span style={{ color: "var(--yl-color-text)" }}>
                    {activity.text}
                  </span>
                  <time
                    dateTime={activity.date}
                    style={{
                      color: "var(--yl-color-text-subtle)",
                      fontSize: "var(--yl-font-size-small)",
                      fontVariantNumeric: "var(--yl-font-numeric)",
                    }}
                  >
                    {activity.label}
                  </time>
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
            <div className="flex flex-col gap-2">
              <Switch name="archived">プロジェクトをアーカイブする</Switch>
              <p
                style={{
                  color: "var(--yl-color-text-muted)",
                  fontSize: "var(--yl-font-size-small)",
                }}
              >
                アーカイブするとプロジェクトは読み取り専用になり、一覧に表示されなくなります。
              </p>
            </div>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </main>
  );
}
