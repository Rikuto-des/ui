import { Badge, Switch, Tabs } from "@yourlib/react";

const project = {
  name: "Webサイトリニューアル",
  status: "進行中",
  description:
    "コーポレートサイトのデザインと構成を全面的に見直し、スマートフォンでの読みやすさと問い合わせ導線を改善するプロジェクトです。2026年12月末の公開を目指しています。",
  members: [
    { name: "山田 太郎", role: "プロジェクトリーダー" },
    { name: "佐藤 花子", role: "デザイナー" },
    { name: "鈴木 一郎", role: "エンジニア" },
    { name: "高橋 美咲", role: "コンテンツ編集" },
  ],
  activities: [
    {
      id: "a1",
      text: "佐藤 花子 がトップページのデザイン案を更新しました",
      date: "2026-10-21",
      label: "10月21日",
    },
    {
      id: "a2",
      text: "鈴木 一郎 が問い合わせフォームの実装を完了しました",
      date: "2026-10-19",
      label: "10月19日",
    },
    {
      id: "a3",
      text: "山田 太郎 が公開スケジュールを変更しました",
      date: "2026-10-16",
      label: "10月16日",
    },
  ],
};

export function ProjectDetailPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center gap-3">
        <h1
          className="text-2xl"
          style={{
            color: "var(--yl-color-text)",
            fontWeight: "var(--yl-font-weight-title)",
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
          <div className="flex flex-col gap-3 pt-4">
            <h2
              style={{
                color: "var(--yl-color-text)",
                fontSize: "var(--yl-font-size-title)",
                fontWeight: "var(--yl-font-weight-title)",
              }}
            >
              概要
            </h2>
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
          <div className="flex flex-col gap-3 pt-4">
            <h2
              style={{
                color: "var(--yl-color-text)",
                fontSize: "var(--yl-font-size-title)",
                fontWeight: "var(--yl-font-weight-title)",
              }}
            >
              メンバー（{project.members.length}人）
            </h2>
            <ul className="flex flex-col">
              {project.members.map((member) => (
                <li
                  key={member.name}
                  className="flex items-center justify-between gap-3 py-3"
                  style={{
                    borderBottom:
                      "var(--yl-border-width) solid var(--yl-color-border)",
                  }}
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
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="activity">
          <div className="flex flex-col gap-3 pt-4">
            <h2
              style={{
                color: "var(--yl-color-text)",
                fontSize: "var(--yl-font-size-title)",
                fontWeight: "var(--yl-font-weight-title)",
              }}
            >
              最近のアクティビティ
            </h2>
            <ol className="flex flex-col">
              {project.activities.map((activity) => (
                <li
                  key={activity.id}
                  className="flex flex-col gap-1 py-3"
                  style={{
                    borderBottom:
                      "var(--yl-border-width) solid var(--yl-color-border)",
                  }}
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
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="settings">
          <div className="flex flex-col gap-3 pt-4">
            <h2
              style={{
                color: "var(--yl-color-text)",
                fontSize: "var(--yl-font-size-title)",
                fontWeight: "var(--yl-font-weight-title)",
              }}
            >
              設定
            </h2>
            <Switch name="archived">プロジェクトをアーカイブする</Switch>
            <p
              style={{
                color: "var(--yl-color-text-muted)",
                fontSize: "var(--yl-font-size-small)",
              }}
            >
              アーカイブすると、プロジェクトは一覧に表示されなくなり、編集できなくなります。
            </p>
          </div>
        </Tabs.Panel>
      </Tabs>
    </main>
  );
}
