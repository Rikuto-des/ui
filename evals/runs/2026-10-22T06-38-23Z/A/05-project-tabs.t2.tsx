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
  status: { label: "進行中", tone: "accent" as const },
  description:
    "コーポレートサイトのデザインと情報設計を見直し、スマートフォンでも読みやすいサイトに作り替えるプロジェクトです。2026 年 12 月の公開を目指して、デザイン・実装・コンテンツ移行を並行して進めています。",
};

const members: Member[] = [
  { id: "m1", name: "山田 太郎", role: "プロジェクトリーダー" },
  { id: "m2", name: "佐藤 花子", role: "デザイナー" },
  { id: "m3", name: "鈴木 一郎", role: "エンジニア" },
  { id: "m4", name: "高橋 美咲", role: "ライター" },
];

const activities: Activity[] = [
  {
    id: "a1",
    date: "2026-10-21",
    dateLabel: "10月21日",
    text: "佐藤 花子 がトップページのデザイン案を更新しました。",
  },
  {
    id: "a2",
    date: "2026-10-19",
    dateLabel: "10月19日",
    text: "鈴木 一郎 がお問い合わせフォームの実装を完了しました。",
  },
  {
    id: "a3",
    date: "2026-10-17",
    dateLabel: "10月17日",
    text: "高橋 美咲 がメンバーに参加しました。",
  },
];

export function ProjectDetailPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-6 flex flex-wrap items-center gap-3">
        <h1
          style={{
            margin: 0,
            color: "var(--yl-color-text)",
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

      <Tabs id="project" label="プロジェクト" defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab value="overview">概要</Tabs.Tab>
          <Tabs.Tab value="members">メンバー</Tabs.Tab>
          <Tabs.Tab value="activity">アクティビティ</Tabs.Tab>
          <Tabs.Tab value="settings">設定</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <p
            className="pt-4"
            style={{
              margin: 0,
              color: "var(--yl-color-text)",
              fontSize: "var(--yl-font-size-body)",
              lineHeight: "var(--yl-font-line-height-body)",
            }}
          >
            {project.description}
          </p>
        </Tabs.Panel>

        <Tabs.Panel value="members">
          <ul className="flex flex-col gap-3 pt-4" style={{ margin: 0, paddingInlineStart: 0, listStyle: "none" }}>
            {members.map((member) => (
              <li key={member.id} className="flex flex-col gap-1">
                <span style={{ color: "var(--yl-color-text)", fontSize: "var(--yl-font-size-body)" }}>
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
        </Tabs.Panel>

        <Tabs.Panel value="activity">
          <ol className="flex flex-col gap-4 pt-4" style={{ margin: 0, paddingInlineStart: 0, listStyle: "none" }}>
            {activities.map((activity) => (
              <li key={activity.id} className="flex flex-col gap-1">
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
                    color: "var(--yl-color-text)",
                    fontSize: "var(--yl-font-size-body)",
                    lineHeight: "var(--yl-font-line-height-body)",
                  }}
                >
                  {activity.text}
                </span>
              </li>
            ))}
          </ol>
        </Tabs.Panel>

        <Tabs.Panel value="settings">
          <div className="pt-4">
            <Switch name="archived">プロジェクトをアーカイブする</Switch>
          </div>
        </Tabs.Panel>
      </Tabs>
    </main>
  );
}
