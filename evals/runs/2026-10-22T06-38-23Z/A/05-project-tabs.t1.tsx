import { Badge, Switch, Tabs } from "@yourlib/react";

type Activity = {
  id: string;
  date: string;
  dateLabel: string;
  text: string;
};

const project = {
  name: "Webサイトリニューアル",
  status: { label: "進行中", tone: "accent" as const },
  description:
    "コーポレートサイトのデザインと情報設計を見直し、スマートフォンでも読みやすいサイトに作り替えるプロジェクトです。2026 年 12 月の公開を目指しています。",
  members: ["山田 太郎", "佐藤 花子", "鈴木 一郎", "高橋 美咲"],
  activities: [
    {
      id: "a1",
      date: "2026-10-21",
      dateLabel: "10月21日",
      text: "佐藤 花子さんがトップページのデザイン案を追加しました。",
    },
    {
      id: "a2",
      date: "2026-10-19",
      dateLabel: "10月19日",
      text: "鈴木 一郎さんがタスク「お問い合わせフォームの改修」を完了しました。",
    },
    {
      id: "a3",
      date: "2026-10-17",
      dateLabel: "10月17日",
      text: "山田 太郎さんが高橋 美咲さんをメンバーに追加しました。",
    },
  ] satisfies Activity[],
};

export function ProjectDetailPage() {
  return (
    <main
      className="mx-auto max-w-3xl p-6"
      style={{
        color: "var(--yl-color-text)",
        fontFamily: "var(--yl-font-family-ui)",
      }}
    >
      <header className="mb-6 flex flex-wrap items-center gap-3">
        <h1
          className="m-0"
          style={{
            fontSize: "var(--yl-font-size-title)",
            fontWeight: "var(--yl-font-weight-title)",
            lineHeight: "var(--yl-font-line-height-title)",
            letterSpacing: "var(--yl-font-tracking-title)",
          }}
        >
          {project.name}
        </h1>
        <Badge tone={project.status.tone} dot>
          {project.status.label}
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
          <div className="pt-4">
            <p
              className="m-0"
              style={{
                fontSize: "var(--yl-font-size-body)",
                lineHeight: "var(--yl-font-line-height-body)",
                letterSpacing: "var(--yl-font-tracking-body)",
              }}
            >
              {project.description}
            </p>
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="members">
          <div className="pt-4">
            <ul className="m-0 flex list-none flex-col p-0">
              {project.members.map((name) => (
                <li
                  key={name}
                  className="py-3"
                  style={{
                    borderBottom:
                      "var(--yl-border-width) solid var(--yl-color-border)",
                    fontSize: "var(--yl-font-size-body)",
                  }}
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="activity">
          <div className="pt-4">
            <ol className="m-0 flex list-none flex-col p-0">
              {project.activities.map((activity) => (
                <li
                  key={activity.id}
                  className="flex flex-col gap-1 py-3"
                  style={{
                    borderBottom:
                      "var(--yl-border-width) solid var(--yl-color-border)",
                  }}
                >
                  <time
                    dateTime={activity.date}
                    style={{
                      color: "var(--yl-color-text-subtle)",
                      fontSize: "var(--yl-font-size-small)",
                      fontVariantNumeric: "var(--yl-font-numeric)",
                    }}
                  >
                    {activity.dateLabel}
                  </time>
                  <span
                    style={{
                      fontSize: "var(--yl-font-size-body)",
                      lineHeight: "var(--yl-font-line-height-body)",
                    }}
                  >
                    {activity.text}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="settings">
          <div className="flex flex-col gap-2 pt-4">
            <Switch name="archived">プロジェクトをアーカイブする</Switch>
            <p
              className="m-0"
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
